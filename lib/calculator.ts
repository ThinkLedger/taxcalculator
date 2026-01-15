import { Decimal } from "decimal.js";
import { getTaxRatesForYear, SSNIT_EMPLOYEE_RATE, SSNIT_EMPLOYER_RATE } from "./rates";

export interface ComputationBreakdown {
  taxRate: number;
  taxAmount: string;
  amountTaxed: string;
}

export interface SSNITBreakdown {
  employeeContribution: string;
  employerContribution: string;
  totalContribution: string;
  employeeRate: number;
  employerRate: number;
  baseAmount: string;
  tier1Payable: string;
  tier2Payable: string;
}

export interface TaxCalculationResult {
  incomeTax: string;
  ssnit: string;
  netIncome: string;
  computationBreakdown: ComputationBreakdown[];
  ssnitBreakdown: SSNITBreakdown;
  totalDeductions: string;
  totalTaxableAllowances: string;
  absenteeismDeduction: string;
}

export interface TaxCalculationError {
  errorMessage: string;
}

export type TaxCalculationResponse = TaxCalculationResult | TaxCalculationError;

function isPositiveNumber(number: string | number): boolean {
  const numStr = typeof number === "number" ? number.toString() : number;
  const positiveNumberRegex = /^[+]?([0-9]+(?:[.][0-9]*)?|\.[0-9]+)$/;
  return positiveNumberRegex.test(numStr);
}

function isValidNumber(val: string | number): boolean {
  if (val === "") return false;
  return isPositiveNumber(val);
}

export interface DeductionItem {
  id: string;
  label: string;
  value: string;
  taxable: boolean;
}

export interface AllowanceItem {
  id: string;
  label: string;
  value: string;
  taxable: boolean;
}

interface ComputeTaxesParams {
  grossIncome: Decimal;
  allowances: Decimal;
  taxRelief: Decimal;
  taxRates: [number, number][];
  ssnitEnabled?: boolean;
  deductions?: DeductionItem[];
  allowanceItems?: AllowanceItem[];
  workingDays?: string;
  missedDays?: string;
}

function computeTaxes({
  grossIncome,
  allowances,
  taxRelief,
  taxRates,
  ssnitEnabled = true,
  deductions = [],
  allowanceItems = [],
  workingDays = "",
  missedDays = "",
}: ComputeTaxesParams): TaxCalculationResult {
  let totalTax = new Decimal(0);
  const employeeSsnitContribution = ssnitEnabled
    ? new Decimal(grossIncome).times(SSNIT_EMPLOYEE_RATE).dividedBy(100)
    : new Decimal(0);
  const employerSsnitContribution = ssnitEnabled
    ? new Decimal(grossIncome).times(SSNIT_EMPLOYER_RATE).dividedBy(100)
    : new Decimal(0);
  const totalSsnitContribution = employeeSsnitContribution.plus(employerSsnitContribution);

  // Calculate SSNIT tier 1 and tier 2
  // Tier 1 = 13.5/18.5 * total SSNIT
  const tier1Payable = totalSsnitContribution.times(13.5).dividedBy(18.5);
  // Tier 2 = total SSNIT - tier 1
  const tier2Payable = totalSsnitContribution.minus(tier1Payable);

  // Calculate total deductions (deductions are NOT taxable)
  const totalDeductions = deductions.reduce((sum, d) => {
    const valueStr = d.value.replace(/,/g, "");
    const value = parseFloat(valueStr);
    return sum.plus(isNaN(value) ? 0 : value);
  }, new Decimal(0));

  // Calculate taxable allowances (only those marked as taxable)
  const totalTaxableAllowances = allowanceItems.reduce((sum, a) => {
    if (!a.taxable) return sum;
    const valueStr = a.value.replace(/,/g, "");
    const value = parseFloat(valueStr);
    return sum.plus(isNaN(value) ? 0 : value);
  }, new Decimal(0));

  // Add the old allowances input to taxable allowances for backward compatibility
  const totalTaxableAllowancesWithOld = totalTaxableAllowances.plus(allowances);

  const totalTaxRelief = employeeSsnitContribution.plus(taxRelief);

  // Taxable income = basic income - tax relief + taxable allowances
  let taxableRemaining = new Decimal(grossIncome)
    .minus(totalTaxRelief)
    .plus(totalTaxableAllowancesWithOld);

  const computationBreakdown: ComputationBreakdown[] = [];

  for (let i = 0; i < taxRates.length; i++) {
    if (taxableRemaining.gt(0)) {
      const [taxRate, taxableAmount] = taxRates[i];
      const actualTaxableAmount = taxableRemaining.gt(taxableAmount)
        ? new Decimal(taxableAmount)
        : taxableRemaining;

      const trancheTax = new Decimal(taxRate)
        .times(actualTaxableAmount)
        .dividedBy(100);

      totalTax = totalTax.plus(trancheTax);

      computationBreakdown[i] = {
        taxRate,
        taxAmount: trancheTax.toFixed(2),
        amountTaxed: actualTaxableAmount.toFixed(0),
      };

      taxableRemaining = taxableRemaining.minus(actualTaxableAmount);
    }
  }

  // Calculate total allowances (both taxable and non-taxable)
  const totalAllowancesAmount = allowanceItems.reduce((sum, a) => {
    const valueStr = a.value.replace(/,/g, "");
    const value = parseFloat(valueStr);
    return sum.plus(isNaN(value) ? 0 : value);
  }, new Decimal(0));
  const totalAllowancesWithOld = totalAllowancesAmount.plus(allowances);

  // Calculate absenteeism deduction
  // Absenteeism = (net income before deductions / working days) * missed days
  let absenteeismDeduction = new Decimal(0);
  if (workingDays && missedDays) {
    const workingDaysNum = parseFloat(workingDays.replace(/,/g, ""));
    const missedDaysNum = parseFloat(missedDays.replace(/,/g, ""));
    if (!isNaN(workingDaysNum) && !isNaN(missedDaysNum) && workingDaysNum > 0 && missedDaysNum > 0) {
      // Net income before deductions = gross + allowances - tax - SSNIT employee
      const netBeforeDeductions = grossIncome
        .plus(totalAllowancesWithOld)
        .minus(totalTax)
        .minus(employeeSsnitContribution);
      const salaryPerDay = netBeforeDeductions.dividedBy(workingDaysNum);
      absenteeismDeduction = salaryPerDay.times(missedDaysNum);
    }
  }

  // Net income = gross income + allowances - income tax - SSNIT employee - total deductions - absenteeism
  const netIncome = grossIncome
    .plus(totalAllowancesWithOld)
    .minus(totalTax)
    .minus(employeeSsnitContribution)
    .minus(totalDeductions)
    .minus(absenteeismDeduction);

  return {
    incomeTax: totalTax.toFixed(2),
    ssnit: employeeSsnitContribution.toFixed(2),
    netIncome: netIncome.toFixed(2),
    computationBreakdown,
    ssnitBreakdown: {
      employeeContribution: employeeSsnitContribution.toFixed(2),
      employerContribution: employerSsnitContribution.toFixed(2),
      totalContribution: totalSsnitContribution.toFixed(2),
      employeeRate: SSNIT_EMPLOYEE_RATE,
      employerRate: SSNIT_EMPLOYER_RATE,
      baseAmount: grossIncome.toFixed(2),
      tier1Payable: tier1Payable.toFixed(2),
      tier2Payable: tier2Payable.toFixed(2),
    },
    totalDeductions: totalDeductions.toFixed(2),
    totalTaxableAllowances: totalTaxableAllowancesWithOld.toFixed(2),
    absenteeismDeduction: absenteeismDeduction.toFixed(2),
  };
}

export function calculate(
  grossInput: string | number,
  allowancesInput: string | number,
  taxReliefInput: string | number,
  ssnitEnabled: boolean = true,
  year: string = "2024",
  deductions: DeductionItem[] = [],
  allowanceItems: AllowanceItem[] = [],
  workingDays: string = "",
  missedDays: string = ""
): TaxCalculationResponse {
  let gross = grossInput;
  let allowances = allowancesInput;
  let taxRelief = taxReliefInput;

  if (gross === "") {
    gross = 0;
  }
  if (allowances === "") {
    allowances = 0;
  }
  if (taxRelief === "") {
    taxRelief = 0;
  }

  if (
    !isValidNumber(gross) ||
    !isValidNumber(allowances) ||
    !isValidNumber(taxRelief)
  ) {
    return { errorMessage: "Please input valid amounts" };
  }

  const taxRates = getTaxRatesForYear(year);

  return computeTaxes({
    grossIncome: new Decimal(gross),
    allowances: new Decimal(allowances),
    taxRelief: new Decimal(taxRelief),
    taxRates: taxRates.rates,
    ssnitEnabled,
    deductions,
    allowanceItems,
    workingDays,
    missedDays,
  });
}


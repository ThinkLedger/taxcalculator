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
  tier1: string;
  tier2: string;
}

export interface TaxCalculationResult {
  incomeTax: string;
  ssnit: string;
  netIncome: string;
  computationBreakdown: ComputationBreakdown[];
  ssnitBreakdown: SSNITBreakdown;
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

export interface AllowanceItem {
  id: string;
  label: string;
  value: string;
  taxable: boolean;
}

export interface DeductionItem {
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
  taxableAllowances?: AllowanceItem[];
  deductions?: DeductionItem[];
  workingDays?: number;
  missedDays?: number;
}

function computeTaxes({
  grossIncome,
  allowances,
  taxRelief,
  taxRates,
  ssnitEnabled = true,
  taxableAllowances = [],
  deductions = [],
  workingDays,
  missedDays,
}: ComputeTaxesParams): TaxCalculationResult {
  let totalTax = new Decimal(0);
  const employeeSsnitContribution = ssnitEnabled
    ? new Decimal(grossIncome).times(SSNIT_EMPLOYEE_RATE).dividedBy(100)
    : new Decimal(0);
  const employerSsnitContribution = ssnitEnabled
    ? new Decimal(grossIncome).times(SSNIT_EMPLOYER_RATE).dividedBy(100)
    : new Decimal(0);
  const totalSsnitContribution = employeeSsnitContribution.plus(employerSsnitContribution);

  // Calculate SSNIT tiers
  // Tier 1 = 13.5/18.5 * total SSNIT
  const tier1 = totalSsnitContribution.times(13.5).dividedBy(18.5);
  // Tier 2 = total SSNIT - tier 1
  const tier2 = totalSsnitContribution.minus(tier1);

  // Calculate taxable and non-taxable allowances separately
  const allowancesArray = Array.isArray(taxableAllowances) ? taxableAllowances : [];
  
  const taxableAllowancesTotal = allowancesArray
    .filter((allowance) => allowance.taxable)
    .reduce((sum, allowance) => {
      const value = new Decimal(allowance.value.replace(/,/g, "") || "0");
      return sum.plus(value);
    }, new Decimal(0));

  const nonTaxableAllowancesTotal = allowancesArray
    .filter((allowance) => !allowance.taxable)
    .reduce((sum, allowance) => {
      const value = new Decimal(allowance.value.replace(/,/g, "") || "0");
      return sum.plus(value);
    }, new Decimal(0));

  // Taxable income calculation: basic income - SSNIT (5.5%) + taxable allowances
  const taxableBase = grossIncome.minus(employeeSsnitContribution).plus(taxableAllowancesTotal);

  const totalTaxRelief = employeeSsnitContribution.plus(taxRelief);

  // Add legacy allowances (from the old input field) - these are treated as taxable
  let taxableRemaining = taxableBase
    .minus(totalTaxRelief)
    .plus(allowances);

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

  // Calculate net income (take home) before deductions
  // Include: gross income + all allowances (taxable + non-taxable) - tax - SSNIT
  let netIncome = grossIncome
    .plus(allowances)
    .plus(taxableAllowancesTotal)
    .plus(nonTaxableAllowancesTotal)
    .minus(totalTax)
    .minus(employeeSsnitContribution);

  // Calculate total deductions (all deductions are not taxable, so subtract from net income)
  const totalDeductions = deductions.reduce((sum, deduction) => {
    const value = new Decimal(deduction.value.replace(/,/g, "") || "0");
    return sum.plus(value);
  }, new Decimal(0));

  // Calculate absenteeism deduction if applicable
  let absenteeismDeduction = new Decimal(0);
  if (workingDays && missedDays && missedDays > 0 && workingDays > 0) {
    // Daily salary = net income / working days
    const dailySalary = netIncome.dividedBy(workingDays);
    // Absenteeism deduction = daily salary * missed days
    absenteeismDeduction = dailySalary.times(missedDays);
  }

  // Final net income = net income - total deductions - absenteeism
  netIncome = netIncome.minus(totalDeductions).minus(absenteeismDeduction);

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
      tier1: tier1.toFixed(2),
      tier2: tier2.toFixed(2),
    },
  };
}

export function calculate(
  grossInput: string | number,
  allowancesInput: string | number,
  taxReliefInput: string | number,
  ssnitEnabled: boolean = true,
  year: string = "2024",
  taxableAllowances: AllowanceItem[] = [],
  deductions: DeductionItem[] = [],
  workingDays?: number,
  missedDays?: number
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
    taxableAllowances: taxableAllowances,
    deductions,
    workingDays,
    missedDays,
  });
}


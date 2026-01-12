import { Decimal } from "decimal.js";
import { monthlyTaxRates, SSNIT_RATE } from "./rates";

export interface ComputationBreakdown {
  taxRate: number;
  taxAmount: string;
  amountTaxed: string;
}

export interface TaxCalculationResult {
  incomeTax: string;
  ssnit: string;
  netIncome: string;
  computationBreakdown: ComputationBreakdown[];
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

interface ComputeTaxesParams {
  grossIncome: Decimal;
  allowances: Decimal;
  taxRelief: Decimal;
  taxRates: [number, number][];
  ssnitEnabled?: boolean;
}

function computeTaxes({
  grossIncome,
  allowances,
  taxRelief,
  taxRates,
  ssnitEnabled = true,
}: ComputeTaxesParams): TaxCalculationResult {
  let totalTax = new Decimal(0);
  const ssnitContribution = ssnitEnabled
    ? new Decimal(grossIncome).times(SSNIT_RATE).dividedBy(100)
    : new Decimal(0);

  const totalTaxRelief = ssnitContribution.plus(taxRelief);

  let taxableRemaining = new Decimal(grossIncome)
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

  const netIncome = grossIncome
    .plus(allowances)
    .minus(totalTax)
    .minus(ssnitContribution);

  return {
    incomeTax: totalTax.toFixed(2),
    ssnit: ssnitContribution.toFixed(2),
    netIncome: netIncome.toFixed(2),
    computationBreakdown,
  };
}

export function calculate(
  grossInput: string | number,
  allowancesInput: string | number,
  taxReliefInput: string | number,
  ssnitEnabled: boolean = true
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

  return computeTaxes({
    grossIncome: new Decimal(gross),
    allowances: new Decimal(allowances),
    taxRelief: new Decimal(taxRelief),
    taxRates: monthlyTaxRates.rates,
    ssnitEnabled,
  });
}


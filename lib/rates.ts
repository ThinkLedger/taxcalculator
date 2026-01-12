// SSNIT Contribution Rates
// Total mandatory social security contribution: 18.5% of basic salary
// Employee contribution: 5.5% (deducted from salary)
// Employer contribution: 13% (paid by employer, not deducted from employee salary)
export const SSNIT_EMPLOYEE_RATE = 5.5; // Employee contribution rate
export const SSNIT_EMPLOYER_RATE = 13.0; // Employer contribution rate
export const SSNIT_TOTAL_RATE = 18.5; // Total contribution rate

// Legacy export for backward compatibility
export const SSNIT_RATE = SSNIT_EMPLOYEE_RATE;

export interface TaxRates {
  effectiveFrom: string;
  rates: [number, number][];
}

export const taxRatesByYear: Record<string, TaxRates> = {
  "2024": {
    effectiveFrom: "01/01/2024",
    rates: [
      [0, 490],
      [5, 110],
      [10, 130],
      [17.5, 3166.67],
      [25, 16000],
      [30, 30520],
      [35, Number.POSITIVE_INFINITY], // anything above GHC 50,000
    ] as [number, number][],
  },
  "2023": {
    effectiveFrom: "02/04/2023",
    rates: [
      [0, 402],
      [5, 110],
      [10, 130],
      [17.5, 3000],
      [25, 16395],
      [30, 29963],
      [35, Number.POSITIVE_INFINITY], // anything above GHC 50,000
    ] as [number, number][],
  },
  "2022": {
    effectiveFrom: "02/04/2022",
    rates: [
      [0, 365],
      [5, 110],
      [10, 130],
      [17.5, 3000],
      [25, 16395],
      [30, Number.POSITIVE_INFINITY], // anything above GHC 20,000
    ] as [number, number][],
  },
};

// Legacy export for backward compatibility
export const monthlyTaxRates = taxRatesByYear["2024"];

export function getTaxRatesForYear(year: string): TaxRates {
  return taxRatesByYear[year] || taxRatesByYear["2024"];
}

// Effective until 01/01/2024
// export const monthlyTaxRates = {
//   effectiveFrom: '02/04/2023',
//   rates: [
//     [0, 402],
//     [5, 110],
//     [10, 130],
//     [17.5, 3000],
//     [25, 16395],
//     [30, 29963],
//     [35, Number.POSITIVE_INFINITY] // anything above GHC 50,000
//   ]
// }

// Effective until 02/04/2023
// export const monthlyTaxRates = [
//   [0, 365],
//   [5, 110],
//   [10, 130],
//   [17.5, 3000],
//   [25, 16395],
//   [30, Number.POSITIVE_INFINITY] // anything above GHC 20,000
// ];

// Effective until 31/12/2021
// export const monthlyTaxRates = [
//   [0, 319],
//   [5, 100],
//   [10, 120],
//   [17.5, 3000],
//   [25, 16461],
//   [30, Number.POSITIVE_INFINITY] // anything above GHC 20,000
// ];

// OLD
// export const monthlyTaxRates = [
//   [0, 288],
//   [5, 100],
//   [10, 140],
//   [17.5, 3000],
//   [25, 16472],
//   [30, Number.POSITIVE_INFINITY] // anything above GHC 20,000
// ];


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

// Monthly PAYE bands as [rate %, band width], keyed by PAYE period. These
// mirror the Finance Oracle rule packs the calculator computes with: the 2024
// bands (v1) until 31 August 2026, then GRA's 2026 bands (v3) from
// 1 September 2026 under the Income Tax (Amendment) Act, 2026 (Act 1178).
// Source: https://gra.gov.gh/domestic-tax/tax-types/paye/
export const taxRatesByYear: Record<string, TaxRates> = {
  "2026-09": {
    effectiveFrom: "01/09/2026",
    rates: [
      [0, 588],
      [5, 80],
      [10, 100],
      [17.5, 2900],
      [25, 16000],
      [30, 30332],
      [35, Number.POSITIVE_INFINITY], // anything above GHC 50,000
    ] as [number, number][],
  },
  "2026": {
    // January to August 2026 still used the 2024 bands.
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
  "2025": {
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

/**
 * PAYE periods the calculator offers, newest first. 2026 is split because the
 * bands changed part-way through the year. A value is "YYYY" (rates as of
 * 1 January) or "YYYY-MM" (rates as of the 1st of that month).
 */
export const PAYE_PERIODS = [
  { value: "2026-09", label: "2026 (from 1 Sep)" },
  { value: "2026", label: "2026 (Jan–Aug)" },
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
] as const;
export const LATEST_PAYE_PERIOD = PAYE_PERIODS[0].value;

export function isPayePeriod(value: string): boolean {
  return PAYE_PERIODS.some((period) => period.value === value);
}

export function payePeriodLabel(value: string): string {
  return PAYE_PERIODS.find((period) => period.value === value)?.label ?? value;
}

// Legacy export for backward compatibility
export const monthlyTaxRates = taxRatesByYear[LATEST_PAYE_PERIOD];

export function getTaxRatesForYear(year: string): TaxRates {
  return taxRatesByYear[year] || taxRatesByYear[LATEST_PAYE_PERIOD];
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


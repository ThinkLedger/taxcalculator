import type {
  AccountingRatiosResult,
  BalanceSheetInput,
  BalanceSheetResult,
  FinanceRatiosInput,
  FinanceRatiosResult,
  IncomeStatementInput,
  IncomeStatementResult,
} from "./oracle-api";

/**
 * Income statement, balance sheet and ratio calculations, done in the browser.
 *
 * These are standard accounting formulas with no Ghana tax rules in them, so
 * unlike PAYE/VAT/CIT/WHT they do not need the Finance Oracle. Keeping them
 * here means a visitor's figures never leave their browser: previously every
 * visitor's statements were saved under one shared Oracle account, so people
 * overwrote (and could read) each other's numbers, and ratios failed with
 * "No financial data found" for any quarter nobody had saved.
 *
 * The formulas mirror finance-oracle's analytics service exactly.
 */

const STORAGE_KEY = "taxcalculator.statements.v1";

type StoredPeriod = {
  incomeStatement?: IncomeStatementResult["statement"];
  balanceSheet?: BalanceSheetResult["sheet"];
};
type Store = Record<string, StoredPeriod>;

const periodKey = (year: number, quarter: number) => `${year}-Q${quarter}`;
const quarterLabel = (year: number, quarter: number) => `Q${quarter} ${year}`;

function readStore(): Store {
  try {
    const raw = typeof window === "undefined" ? null : window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as Store) : {};
  } catch {
    return {};
  }
}

function writePeriod(year: number, quarter: number, patch: StoredPeriod): void {
  try {
    const store = readStore();
    const key = periodKey(year, quarter);
    store[key] = { ...store[key], ...patch };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage unavailable (private mode, blocked): the result still shows,
    // it just won't be remembered for the ratios.
  }
}

function readPeriod(year: number, quarter: number): StoredPeriod {
  return readStore()[periodKey(year, quarter)] ?? {};
}

function periodRecord(year: number, quarter: number) {
  const now = new Date().toISOString();
  return {
    id: `local-${periodKey(year, quarter)}`,
    orgId: "local",
    year,
    quarter,
    label: quarterLabel(year, quarter),
    createdAt: now,
    updatedAt: now,
  };
}

function safeDivide(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null;
  return numerator / denominator;
}

function pct(value: number | null): number | null {
  return value !== null ? value * 100 : null;
}

// ── Statements ──────────────────────────────────────────────────────────────

export function computeIncomeStatement(input: IncomeStatementInput): IncomeStatementResult {
  const period = periodRecord(input.year, input.quarter);
  const grossProfit = input.totalRevenue - input.costOfGoodsSold;
  const ebit = grossProfit - input.operatingExpenses - input.depreciationCharge;
  const netProfit = ebit - input.interestOnLoans - input.corporateTax;
  const reserves = netProfit - input.dividendPayments;

  const statement: IncomeStatementResult["statement"] = {
    id: `${period.id}-is`,
    periodId: period.id,
    orgId: period.orgId,
    totalRevenue: input.totalRevenue,
    costOfGoodsSold: input.costOfGoodsSold,
    operatingExpenses: input.operatingExpenses,
    depreciationCharge: input.depreciationCharge,
    interestOnLoans: input.interestOnLoans,
    corporateTax: input.corporateTax,
    dividendPayments: input.dividendPayments,
    grossProfit,
    ebit,
    netProfit,
    reserves,
    createdAt: period.createdAt,
    updatedAt: period.updatedAt,
  };
  writePeriod(input.year, input.quarter, { incomeStatement: statement });
  return { period, statement };
}

export function computeBalanceSheet(input: BalanceSheetInput): BalanceSheetResult {
  const period = periodRecord(input.year, input.quarter);
  const currentAssets = input.inventory + input.accountsReceivable + input.cash + input.otherCurrentAssets;
  const totalAssets = input.nonCurrentAssets + currentAssets;
  const totalEquityLiabilityEarnings = input.totalLiabilities + input.shareholdersEquity;

  const sheet: BalanceSheetResult["sheet"] = {
    id: `${period.id}-bs`,
    periodId: period.id,
    orgId: period.orgId,
    nonCurrentAssets: input.nonCurrentAssets,
    inventory: input.inventory,
    accountsReceivable: input.accountsReceivable,
    cash: input.cash,
    otherCurrentAssets: input.otherCurrentAssets,
    currentLiabilities: input.currentLiabilities,
    accountsPayable: input.accountsPayable,
    totalDebt: input.totalDebt,
    totalLiabilities: input.totalLiabilities,
    shareholdersEquity: input.shareholdersEquity,
    currentAssets,
    totalAssets,
    totalEquityLiabilityEarnings,
    createdAt: period.createdAt,
    updatedAt: period.updatedAt,
  };
  writePeriod(input.year, input.quarter, { balanceSheet: sheet });
  return { period, sheet };
}

// ── Ratios ──────────────────────────────────────────────────────────────────

type IncomeStatement = IncomeStatementResult["statement"];
type BalanceSheet = BalanceSheetResult["sheet"];

/**
 * The quarter's statements plus the prior quarter's balance sheet (for
 * averages). The messages name the missing statement; the ratio screens use
 * them to link to the right calculator.
 */
function loadPeriodData(year: number, quarter: number) {
  const { incomeStatement, balanceSheet } = readPeriod(year, quarter);
  if (!incomeStatement) {
    throw new Error(
      `Income statement missing for ${quarterLabel(year, quarter)}. Enter it in the Income Statement calculator first.`,
    );
  }
  if (!balanceSheet) {
    throw new Error(
      `Balance sheet missing for ${quarterLabel(year, quarter)}. Enter it in the Balance Sheet calculator first.`,
    );
  }
  const priorYear = quarter === 1 ? year - 1 : year;
  const priorQuarter = quarter === 1 ? 4 : quarter - 1;
  const priorBs = readPeriod(priorYear, priorQuarter).balanceSheet ?? null;
  return { is: incomeStatement, bs: balanceSheet, priorBs };
}

function averages(bs: BalanceSheet, priorBs: BalanceSheet | null) {
  return {
    avgInventory: priorBs ? (bs.inventory + priorBs.inventory) / 2 : bs.inventory,
    avgTotalAssets: priorBs ? (bs.totalAssets + priorBs.totalAssets) / 2 : bs.totalAssets,
    avgAccountsReceivable: priorBs ? (bs.accountsReceivable + priorBs.accountsReceivable) / 2 : bs.accountsReceivable,
  };
}

const NO_PRIOR_NOTE =
  "No prior-quarter balance sheet found. Turnover and ROA ratios use current-quarter figures instead of averages.";

function liquidity(bs: BalanceSheet) {
  return {
    currentRatio: safeDivide(bs.currentAssets, bs.currentLiabilities),
    quickRatio: safeDivide(bs.currentAssets - bs.inventory, bs.currentLiabilities),
    cashRatio: safeDivide(bs.cash, bs.currentLiabilities),
  };
}

function leverage(bs: BalanceSheet, is: IncomeStatement) {
  return {
    debtToEquity: safeDivide(bs.totalDebt, bs.shareholdersEquity),
    debtRatio: safeDivide(bs.totalLiabilities, bs.totalAssets),
    interestCoverageRatio: safeDivide(is.ebit, is.interestOnLoans),
  };
}

function efficiency(
  is: IncomeStatement,
  avg: ReturnType<typeof averages>,
  avgAccountsPayable: number | null,
) {
  return {
    inventoryTurnover: safeDivide(is.costOfGoodsSold, avg.avgInventory),
    receivablesTurnover: safeDivide(is.totalRevenue, avg.avgAccountsReceivable),
    assetTurnover: safeDivide(is.totalRevenue, avg.avgTotalAssets),
    payablesTurnover: avgAccountsPayable !== null ? safeDivide(is.costOfGoodsSold, avgAccountsPayable) : null,
  };
}

function profitability(is: IncomeStatement, avgTotalAssets: number, bs: BalanceSheet) {
  return {
    grossProfitMarginPct: pct(safeDivide(is.grossProfit, is.totalRevenue)),
    operatingProfitMarginPct: pct(safeDivide(is.ebit, is.totalRevenue)),
    netProfitMarginPct: pct(safeDivide(is.netProfit, is.totalRevenue)),
    returnOnAssetsPct: pct(safeDivide(is.netProfit, avgTotalAssets)),
    returnOnEquityPct: pct(safeDivide(is.netProfit, bs.shareholdersEquity)),
  };
}

export function computeAccountingRatios(year: number, quarter: number): AccountingRatiosResult {
  const { is, bs, priorBs } = loadPeriodData(year, quarter);
  const avg = averages(bs, priorBs);
  return {
    period: quarterLabel(year, quarter),
    liquidity: liquidity(bs),
    profitability: profitability(is, avg.avgTotalAssets, bs),
    leverage: leverage(bs, is),
    efficiency: efficiency(is, avg, null),
    notes: priorBs ? [] : [NO_PRIOR_NOTE],
  };
}

export function computeFinanceRatios(year: number, quarter: number, valuation: FinanceRatiosInput): FinanceRatiosResult {
  const { is, bs, priorBs } = loadPeriodData(year, quarter);
  const avg = averages(bs, priorBs);
  const notes: string[] = priorBs ? [] : [NO_PRIOR_NOTE];

  let roicPct: number | null = null;
  if (valuation.nopat !== undefined && valuation.investedCapital !== undefined) {
    roicPct = pct(safeDivide(valuation.nopat, valuation.investedCapital));
  } else {
    notes.push("ROIC omitted: nopat and investedCapital not provided.");
  }

  const { marketPricePerShare, sharesOutstanding } = valuation;
  const preferredDividends = valuation.preferredDividends ?? 0;
  const eps = safeDivide(is.netProfit - preferredDividends, sharesOutstanding);
  const bookValuePerShare = safeDivide(bs.shareholdersEquity, sharesOutstanding);
  const revenuePerShare = safeDivide(is.totalRevenue, sharesOutstanding);
  const pe = eps !== null && eps !== 0 ? safeDivide(marketPricePerShare, eps) : null;

  let peg: number | null = null;
  if (pe !== null && valuation.expectedEarningsGrowthRate !== undefined && valuation.expectedEarningsGrowthRate !== 0) {
    // Growth is a decimal (0.12 = 12%); PEG uses the percentage form.
    peg = safeDivide(pe, valuation.expectedEarningsGrowthRate * 100);
  } else if (pe !== null) {
    notes.push("PEG omitted: expectedEarningsGrowthRate not provided or is zero.");
  }

  const pb = bookValuePerShare !== null && bookValuePerShare !== 0 ? safeDivide(marketPricePerShare, bookValuePerShare) : null;
  const ps = revenuePerShare !== null && revenuePerShare !== 0 ? safeDivide(marketPricePerShare, revenuePerShare) : null;
  const dividendYieldPct =
    valuation.annualDividendsPerShare !== undefined
      ? pct(safeDivide(valuation.annualDividendsPerShare, marketPricePerShare))
      : null;
  const dividendPayoutRatioPct =
    valuation.annualDividendsPerShare !== undefined && eps !== null && eps !== 0
      ? pct(safeDivide(valuation.annualDividendsPerShare, eps))
      : null;
  if (valuation.annualDividendsPerShare === undefined) {
    notes.push("Dividend Yield and Payout Ratio omitted: annualDividendsPerShare not provided.");
  }

  return {
    period: quarterLabel(year, quarter),
    liquidity: liquidity(bs),
    leverage: leverage(bs, is),
    efficiency: efficiency(is, avg, valuation.averageAccountsPayable ?? null),
    profitability: {
      ...profitability(is, avg.avgTotalAssets, bs),
      returnOnInvestedCapitalPct: roicPct,
      equityRatio: pct(safeDivide(bs.shareholdersEquity, bs.totalAssets)),
    },
    valuation: {
      priceToEarnings: pe,
      priceEarningsToGrowth: peg,
      priceToBook: pb,
      priceToSales: ps,
      earningsPerShare: eps,
      dividendYieldPct,
      dividendPayoutRatioPct,
    },
    notes,
  };
}

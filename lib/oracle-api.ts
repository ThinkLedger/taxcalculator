import { SSNIT_EMPLOYER_RATE } from "./rates";
import type { TaxCalculationResult, ComputationBreakdown } from "./calculator";
import type { VATCalculationResult } from "./vat-calculator";

const DEFAULT_ORACLE_PROXY_URL = "";

interface OracleConfig {
  mode: "proxy" | "direct";
  baseUrl: string;
  apiKey?: string;
  workspaceId?: string;
  orgId?: string;
}

interface OracleTraceStep {
  step?: string;
  inputs?: Record<string, unknown>;
  output?: unknown;
}

interface OracleComputeResponse {
  result?: Record<string, unknown>;
  trace?: {
    steps?: OracleTraceStep[];
  };
  payrollSummary?: {
    lines?: Array<{
      label?: string;
      amount?: number;
    }>;
  };
  message?: string;
}
type PayrollLine = NonNullable<NonNullable<OracleComputeResponse["payrollSummary"]>["lines"]>[number];

interface OracleComputeParams {
  domain: string;
  operation: string;
  year: string;
  payload: Record<string, string | number | boolean>;
}

interface PAYEComputeParams {
  year: string;
  basicSalary: number;
  allowances: number;
  taxRelief: number;
  ssnitEnabled: boolean;
}

interface VATComputeParams {
  year: string;
  amount: number;
}

interface CITComputeParams {
  year: string;
  taxableIncome: number;
}

export interface CITCalculationResult {
  taxableIncome: string;
  citAmount: string;
  netIncome: string;
}

interface WithholdingComputeParams {
  year: string;
  paymentAmount: number;
  counterpartyType: "resident" | "non_resident";
  incomeCategory: string;
}

export interface WithholdingCalculationResult {
  paymentAmount: string;
  withholdingRate: string;
  withholdingAmount: string;
  netPayable: string;
}

interface RentTaxComputeParams {
  year: string;
  rentAmount: number;
  propertyType: "residential" | "commercial";
}

export interface RentTaxCalculationResult {
  rentAmount: string;
  rentTaxRate: string;
  rentTaxAmount: string;
  netRent: string;
}

interface CSTComputeParams {
  year: string;
  serviceCharge: number;
}

export interface CSTCalculationResult {
  serviceCharge: string;
  cstRate: string;
  cstAmount: string;
  totalCharge: string;
}

export interface IncomeStatementInput {
  year: number;
  quarter: number;
  totalRevenue: number;
  costOfGoodsSold: number;
  operatingExpenses: number;
  depreciationCharge: number;
  interestOnLoans: number;
  corporateTax: number;
  dividendPayments: number;
}

export interface IncomeStatementResult {
  period: {
    id: string;
    orgId: string;
    year: number;
    quarter: number;
    label: string;
    createdAt: string;
    updatedAt: string;
  };
  statement: {
    id: string;
    periodId: string;
    orgId: string;
    totalRevenue: number;
    costOfGoodsSold: number;
    operatingExpenses: number;
    depreciationCharge: number;
    interestOnLoans: number;
    corporateTax: number;
    dividendPayments: number;
    grossProfit: number;
    ebit: number;
    netProfit: number;
    reserves: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface BalanceSheetInput {
  year: number;
  quarter: number;
  nonCurrentAssets: number;
  inventory: number;
  accountsReceivable: number;
  cash: number;
  otherCurrentAssets: number;
  currentLiabilities: number;
  accountsPayable: number;
  totalDebt: number;
  totalLiabilities: number;
  shareholdersEquity: number;
}

export interface BalanceSheetResult {
  period: {
    id: string;
    orgId: string;
    year: number;
    quarter: number;
    label: string;
    createdAt: string;
    updatedAt: string;
  };
  sheet: {
    id: string;
    periodId: string;
    orgId: string;
    nonCurrentAssets: number;
    inventory: number;
    accountsReceivable: number;
    cash: number;
    otherCurrentAssets: number;
    currentLiabilities: number;
    accountsPayable: number;
    totalDebt: number;
    totalLiabilities: number;
    shareholdersEquity: number;
    currentAssets: number;
    totalAssets: number;
    totalEquityLiabilityEarnings: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface AccountingRatiosResult {
  period: string;
  liquidity: {
    currentRatio: number | null;
    quickRatio: number | null;
    cashRatio: number | null;
  };
  profitability: {
    grossProfitMarginPct: number | null;
    operatingProfitMarginPct: number | null;
    netProfitMarginPct: number | null;
    returnOnAssetsPct: number | null;
    returnOnEquityPct: number | null;
  };
  leverage: {
    debtToEquity: number | null;
    debtRatio: number | null;
    interestCoverageRatio: number | null;
  };
  efficiency: {
    inventoryTurnover: number | null;
    receivablesTurnover: number | null;
    assetTurnover: number | null;
    payablesTurnover: number | null;
  };
  notes: string[];
}

export interface FinanceRatiosInput {
  marketPricePerShare: number;
  sharesOutstanding: number;
  preferredDividends?: number;
  annualDividendsPerShare?: number;
  expectedEarningsGrowthRate?: number;
  nopat?: number;
  investedCapital?: number;
  averageAccountsPayable?: number;
}

export interface FinanceRatiosResult {
  period: string;
  liquidity: {
    currentRatio: number | null;
    quickRatio: number | null;
    cashRatio: number | null;
  };
  leverage: {
    debtToEquity: number | null;
    debtRatio: number | null;
    interestCoverageRatio: number | null;
  };
  efficiency: {
    inventoryTurnover: number | null;
    receivablesTurnover: number | null;
    assetTurnover: number | null;
    payablesTurnover: number | null;
  };
  profitability: {
    grossProfitMarginPct: number | null;
    operatingProfitMarginPct: number | null;
    netProfitMarginPct: number | null;
    returnOnAssetsPct: number | null;
    returnOnEquityPct: number | null;
    returnOnInvestedCapitalPct: number | null;
    equityRatio: number | null;
  };
  valuation: {
    priceToEarnings: number | null;
    priceEarningsToGrowth: number | null;
    priceToBook: number | null;
    priceToSales: number | null;
    earningsPerShare: number | null;
    dividendYieldPct: number | null;
    dividendPayoutRatioPct: number | null;
  };
  notes: string[];
}

function getConfig(): OracleConfig {
  const proxyUrl = (
    process.env.NEXT_PUBLIC_FINANCE_ORACLE_PROXY_URL ||
    DEFAULT_ORACLE_PROXY_URL
  )
    .trim()
    .replace(/\/+$/, "");
  const directBaseUrl = (process.env.NEXT_PUBLIC_FINANCE_ORACLE_BASE_URL || "")
    .trim()
    .replace(/\/+$/, "");
  const apiKey = process.env.NEXT_PUBLIC_FINANCE_ORACLE_API_KEY?.trim() || "";
  const workspaceId = process.env.NEXT_PUBLIC_FINANCE_ORACLE_WORKSPACE_ID?.trim() || "";
  const orgId = process.env.NEXT_PUBLIC_FINANCE_ORACLE_ORG_ID?.trim() || "";

  if (proxyUrl) {
    return {
      mode: "proxy",
      baseUrl: proxyUrl,
    };
  }

  const missing: string[] = [];
  if (!directBaseUrl) missing.push("NEXT_PUBLIC_FINANCE_ORACLE_BASE_URL");
  if (!apiKey) missing.push("NEXT_PUBLIC_FINANCE_ORACLE_API_KEY");
  if (!workspaceId) missing.push("NEXT_PUBLIC_FINANCE_ORACLE_WORKSPACE_ID");
  if (!orgId) missing.push("NEXT_PUBLIC_FINANCE_ORACLE_ORG_ID");

  if (missing.length > 0) {
    throw new Error(
      `Missing Oracle config. Use proxy (${["NEXT_PUBLIC_FINANCE_ORACLE_PROXY_URL"].join(", ")}) or direct mode (${missing.join(", ")})`
    );
  }

  return {
    mode: "direct",
    baseUrl: directBaseUrl,
    apiKey,
    workspaceId,
    orgId,
  };
}

function toSafeNumber(value: unknown): number {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : 0;
}

function toMoney(value: number): string {
  return value.toFixed(2);
}

function toAsOfDate(year: string): string {
  const parsedYear = Number(year);
  const resolvedYear = Number.isFinite(parsedYear) && parsedYear > 0 ? parsedYear : new Date().getUTCFullYear();
  return new Date(Date.UTC(resolvedYear, 0, 1)).toISOString();
}

async function compute({ domain, operation, year, payload }: OracleComputeParams): Promise<OracleComputeResponse> {
  const config = getConfig();

  const endpoint =
    config.mode === "proxy"
      ? `${config.baseUrl}/compute/${domain}/${operation}`
      : `${config.baseUrl}/compute/${domain}/${operation}`;

  const requestBody =
    config.mode === "proxy"
      ? {
          countryCode: "GH",
          industryCode: "standard",
          asOfDate: toAsOfDate(year),
          payload,
        }
      : {
          workspaceId: config.workspaceId,
          orgId: config.orgId,
          countryCode: "GH",
          industryCode: "standard",
          asOfDate: toAsOfDate(year),
          payload,
        };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(config.mode === "direct" ? { "x-api-key": config.apiKey || "" } : {}),
    },
    body: JSON.stringify(requestBody),
  });

  const body = (await response.json().catch(() => ({}))) as OracleComputeResponse;

  if (!response.ok) {
    throw new Error(body.message || `Oracle request failed with status ${response.status}`);
  }

  return body;
}

async function postAnalytics<TResponse>(
  path: string,
  body: Record<string, unknown>,
  options?: { includeOrgIdInPath?: boolean; includeOrgIdInBody?: boolean }
): Promise<TResponse> {
  const config = getConfig();
  const includeOrgIdInPath = options?.includeOrgIdInPath ?? false;
  const includeOrgIdInBody = options?.includeOrgIdInBody ?? false;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const directPath =
    includeOrgIdInPath && config.orgId
      ? normalizedPath.replace("/analytics/", `/analytics/${config.orgId}/`)
      : normalizedPath;
  const endpoint =
    config.mode === "proxy"
      ? `${config.baseUrl}${normalizedPath}`
      : `${config.baseUrl}${directPath}`;

  const requestBody = {
    ...body,
    ...(config.mode === "direct" && includeOrgIdInBody && config.orgId ? { orgId: config.orgId } : {}),
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(config.mode === "direct" ? { "x-api-key": config.apiKey || "" } : {}),
    },
    body: JSON.stringify(requestBody),
  });

  const json = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const message = typeof json.message === "string" ? json.message : `Analytics request failed with status ${response.status}`;
    throw new Error(message);
  }

  return json as TResponse;
}

async function getAnalytics<TResponse>(
  path: string,
  options?: { includeOrgIdInPath?: boolean }
): Promise<TResponse> {
  const config = getConfig();
  const includeOrgIdInPath = options?.includeOrgIdInPath ?? false;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const directPath =
    includeOrgIdInPath && config.orgId
      ? normalizedPath.replace("/analytics/", `/analytics/${config.orgId}/`)
      : normalizedPath;
  const endpoint =
    config.mode === "proxy"
      ? `${config.baseUrl}${normalizedPath}`
      : `${config.baseUrl}${directPath}`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(config.mode === "direct" ? { "x-api-key": config.apiKey || "" } : {}),
    },
  });

  const json = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const message = typeof json.message === "string" ? json.message : `Analytics request failed with status ${response.status}`;
    throw new Error(message);
  }

  return json as TResponse;
}

function parseComputationBreakdown(steps: OracleTraceStep[] | undefined): ComputationBreakdown[] {
  if (!steps || steps.length === 0) return [];

  const bracketStep = steps.find((step) => typeof step.step === "string" && step.step.startsWith("TAX_BRACKET["));
  const brackets = bracketStep?.inputs?.brackets;

  if (!Array.isArray(brackets)) return [];

  return brackets.map((bracket: unknown) => {
    const value = bracket as { rate?: unknown; amount?: unknown; tax?: unknown };
    return {
      taxRate: toSafeNumber(value.rate) * 100,
      amountTaxed: Math.round(toSafeNumber(value.amount)).toString(),
      taxAmount: toMoney(toSafeNumber(value.tax)),
    };
  });
}

function findPayrollAmount(lines: PayrollLine[] | undefined, label: string): number {
  if (!lines) return 0;
  const line = lines.find((item: PayrollLine) => item.label === label);
  return toSafeNumber(line?.amount);
}

export async function computePAYE(params: PAYEComputeParams): Promise<TaxCalculationResult> {
  const response = await compute({
    domain: "payroll",
    operation: "paye",
    year: params.year,
    payload: {
      basicSalary: params.basicSalary,
      allowances: params.allowances,
      providentFundContribution: 0,
      otherReliefs: params.taxRelief,
    },
  });

  const result = response.result || {};
  const traceSteps = response.trace?.steps;
  const ssnitFromApi = toSafeNumber(result.ssnitDeductionOut);
  const incomeTax = toSafeNumber(result.payeOut);
  const netIncomeFromSummary = findPayrollAmount(response.payrollSummary?.lines, "Net Income (take home)");
  const employerContribution = params.ssnitEnabled
    ? (params.basicSalary * SSNIT_EMPLOYER_RATE) / 100
    : 0;

  const ssnitForUi = params.ssnitEnabled ? ssnitFromApi : 0;
  const netIncomeForUi = params.ssnitEnabled ? netIncomeFromSummary : netIncomeFromSummary + ssnitFromApi;

  return {
    incomeTax: toMoney(incomeTax),
    ssnit: toMoney(ssnitForUi),
    netIncome: toMoney(netIncomeForUi),
    computationBreakdown: parseComputationBreakdown(traceSteps),
    ssnitBreakdown: {
      employeeContribution: toMoney(ssnitForUi),
      employerContribution: toMoney(employerContribution),
      totalContribution: toMoney(ssnitForUi + employerContribution),
      employeeRate: params.ssnitEnabled ? 5.5 : 0,
      employerRate: params.ssnitEnabled ? SSNIT_EMPLOYER_RATE : 0,
      baseAmount: toMoney(params.basicSalary),
    },
  };
}

export async function computeVATExclusive(params: VATComputeParams): Promise<VATCalculationResult> {
  const response = await compute({
    domain: "tax",
    operation: "vat",
    year: params.year,
    payload: {
      taxableAmount: params.amount,
    },
  });

  const result = response.result || {};
  return {
    taxableValue: toMoney(toSafeNumber(result.taxableAmountOut)),
    nhil: toMoney(toSafeNumber(result.nhilOut)),
    getfund: toMoney(toSafeNumber(result.getfundOut)),
    vat: toMoney(toSafeNumber(result.vatOut)),
    finalCost: toMoney(toSafeNumber(result.finalCostOut)),
    mode: "exclusive",
  };
}

export async function computeVATInclusive(params: VATComputeParams): Promise<VATCalculationResult> {
  const response = await compute({
    domain: "tax",
    operation: "vat-inclusive",
    year: params.year,
    payload: {
      inclusiveAmount: params.amount,
    },
  });

  const result = response.result || {};
  return {
    taxableValue: toMoney(toSafeNumber(result.taxableAmountOut)),
    nhil: toMoney(toSafeNumber(result.nhilOut)),
    getfund: toMoney(toSafeNumber(result.getfundOut)),
    vat: toMoney(toSafeNumber(result.vatOut)),
    finalCost: toMoney(toSafeNumber(result.finalCostOut)),
    mode: "inclusive",
  };
}

export async function computeCIT(params: CITComputeParams): Promise<CITCalculationResult> {
  const response = await compute({
    domain: "tax",
    operation: "cit",
    year: params.year,
    payload: {
      taxableIncome: params.taxableIncome,
      counterpartyType: "general",
      citCategory: "standard",
    },
  });

  const result = response.result || {};
  return {
    taxableIncome: toMoney(toSafeNumber(result.taxableIncomeOut)),
    citAmount: toMoney(toSafeNumber(result.citAmountOut)),
    netIncome: toMoney(toSafeNumber(result.netIncomeOut)),
  };
}

export async function computeWithholding(
  params: WithholdingComputeParams
): Promise<WithholdingCalculationResult> {
  const response = await compute({
    domain: "tax",
    operation: "withholding",
    year: params.year,
    payload: {
      paymentAmount: params.paymentAmount,
      counterpartyType: params.counterpartyType,
      incomeCategory: params.incomeCategory,
    },
  });

  const result = response.result || {};
  const rateLookupStep = response.trace?.steps?.find(
    (step) => typeof step.step === "string" && step.step.startsWith("RATE_LOOKUP[")
  );
  const rate = toSafeNumber(rateLookupStep?.output);

  return {
    paymentAmount: toMoney(params.paymentAmount),
    withholdingRate: toMoney(rate * 100),
    withholdingAmount: toMoney(toSafeNumber(result.withholdingAmountOut)),
    netPayable: toMoney(toSafeNumber(result.netPayableOut)),
  };
}

export async function computeRentTax(
  params: RentTaxComputeParams
): Promise<RentTaxCalculationResult> {
  const response = await compute({
    domain: "tax",
    operation: "rent",
    year: params.year,
    payload: {
      rentAmount: params.rentAmount,
      counterpartyType: "general",
      propertyType: params.propertyType,
    },
  });

  const result = response.result || {};
  const rateLookupStep = response.trace?.steps?.find(
    (step) => typeof step.step === "string" && step.step.startsWith("RATE_LOOKUP[")
  );
  const rate = toSafeNumber(rateLookupStep?.output);

  return {
    rentAmount: toMoney(toSafeNumber(result.rentAmountOut)),
    rentTaxRate: toMoney(rate * 100),
    rentTaxAmount: toMoney(toSafeNumber(result.rentTaxAmountOut)),
    netRent: toMoney(toSafeNumber(result.netRentOut)),
  };
}

export async function computeCST(params: CSTComputeParams): Promise<CSTCalculationResult> {
  const response = await compute({
    domain: "tax",
    operation: "cst",
    year: params.year,
    payload: {
      serviceCharge: params.serviceCharge,
    },
  });

  const result = response.result || {};
  const cstRateStep = response.trace?.steps?.find((step) => step.step === "INPUT[cstRate]");
  const rate = toSafeNumber(cstRateStep?.output);

  return {
    serviceCharge: toMoney(toSafeNumber(result.serviceChargeOut)),
    cstRate: toMoney(rate * 100),
    cstAmount: toMoney(toSafeNumber(result.cstAmountOut)),
    totalCharge: toMoney(toSafeNumber(result.totalChargeOut)),
  };
}

export async function upsertIncomeStatement(
  input: IncomeStatementInput
): Promise<IncomeStatementResult> {
  return postAnalytics<IncomeStatementResult>("/analytics/income-statement", {
    year: input.year,
    quarter: input.quarter,
    totalRevenue: input.totalRevenue,
    costOfGoodsSold: input.costOfGoodsSold,
    operatingExpenses: input.operatingExpenses,
    depreciationCharge: input.depreciationCharge,
    interestOnLoans: input.interestOnLoans,
    corporateTax: input.corporateTax,
    dividendPayments: input.dividendPayments,
  }, { includeOrgIdInPath: true });
}

export async function upsertBalanceSheet(
  input: BalanceSheetInput
): Promise<BalanceSheetResult> {
  return postAnalytics<BalanceSheetResult>("/analytics/balance-sheet", {
    year: input.year,
    quarter: input.quarter,
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
  }, { includeOrgIdInPath: true });
}

export async function getAccountingRatios(
  year: number,
  quarter: number
): Promise<AccountingRatiosResult> {
  return getAnalytics<AccountingRatiosResult>(
    `/analytics/ratios/${year}/${quarter}/accounting`,
    { includeOrgIdInPath: true }
  );
}

export async function getFinanceRatios(
  year: number,
  quarter: number,
  input: FinanceRatiosInput
): Promise<FinanceRatiosResult> {
  return postAnalytics<FinanceRatiosResult>(
    `/analytics/ratios/${year}/${quarter}/finance`,
    {
      marketPricePerShare: input.marketPricePerShare,
      sharesOutstanding: input.sharesOutstanding,
      ...(input.preferredDividends !== undefined ? { preferredDividends: input.preferredDividends } : {}),
      ...(input.annualDividendsPerShare !== undefined ? { annualDividendsPerShare: input.annualDividendsPerShare } : {}),
      ...(input.expectedEarningsGrowthRate !== undefined ? { expectedEarningsGrowthRate: input.expectedEarningsGrowthRate } : {}),
      ...(input.nopat !== undefined ? { nopat: input.nopat } : {}),
      ...(input.investedCapital !== undefined ? { investedCapital: input.investedCapital } : {}),
      ...(input.averageAccountsPayable !== undefined ? { averageAccountsPayable: input.averageAccountsPayable } : {}),
    },
    { includeOrgIdInPath: true }
  );
}

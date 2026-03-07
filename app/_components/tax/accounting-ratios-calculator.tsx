"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { exportAccountingRatiosToCSV, exportAccountingRatiosToPDF } from "@/lib/export";
import { getAccountingRatios, type AccountingRatiosResult } from "@/lib/oracle-api";

interface AccountingRatiosCalculatorProps {
  year: string;
  quarter: string;
  onCalculatorTypeChange?: (value: string) => void;
}

function formatRatio(value: number | null, decimals = 2): string {
  if (value === null || Number.isNaN(value)) return "N/A";
  return value.toFixed(decimals);
}

export function AccountingRatiosCalculator({
  year,
  quarter,
  onCalculatorTypeChange,
}: AccountingRatiosCalculatorProps) {
  const [result, setResult] = useState<AccountingRatiosResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setResult(null);
    setErrorMessage(null);
  }, [year, quarter]);

  const handleLoad = async () => {
    const parsedYear = Number(year);
    const parsedQuarter = Number(quarter);

    if (!Number.isFinite(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
      setErrorMessage("Please select a valid year");
      return;
    }
    if (!Number.isFinite(parsedQuarter) || parsedQuarter < 1 || parsedQuarter > 4) {
      setErrorMessage("Please select a valid quarter");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await getAccountingRatios(parsedYear, parsedQuarter);
      setResult(response);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to load accounting ratios";
      setErrorMessage(message);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const hasMissingPeriodDataError =
    !!errorMessage &&
    (errorMessage.toLowerCase().includes("no financial data found") ||
      errorMessage.toLowerCase().includes("income statement missing") ||
      errorMessage.toLowerCase().includes("balance sheet missing"));

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Accounting Ratios 🇬🇭</CardTitle>
        <CardDescription>
          Compute liquidity, profitability, leverage, and efficiency ratios for {`Q${quarter} ${year}`}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button onClick={handleLoad} className="w-full" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading Ratios...
            </span>
          ) : (
            "Generate Accounting Ratios"
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Ratios are computed from the selected quarter&apos;s Income Statement and Balance Sheet.
        </p>

        {errorMessage && <p className="text-sm text-destructive text-center">{errorMessage}</p>}
        {hasMissingPeriodDataError && onCalculatorTypeChange && (
          <div className="rounded-md border border-amber-300/60 bg-amber-50 px-3 py-3 dark:border-amber-800 dark:bg-amber-950/20">
            <p className="text-xs text-amber-900 dark:text-amber-100 text-center">
              Add this quarter&apos;s statements first, then generate ratios.
            </p>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => onCalculatorTypeChange("INCOME_STATEMENT")}
                className="w-full"
              >
                Go To Income Statement
              </Button>
              <Button
                variant="outline"
                onClick={() => onCalculatorTypeChange("BALANCE_SHEET")}
                className="w-full"
              >
                Go To Balance Sheet
              </Button>
            </div>
          </div>
        )}

        {result && !errorMessage && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => exportAccountingRatiosToPDF({ year, quarter, result })}
              >
                Export PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => exportAccountingRatiosToCSV({ year, quarter, result })}
              >
                Export CSV
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Liquidity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>Current Ratio: {formatRatio(result.liquidity.currentRatio)}</p>
                  <p>Quick Ratio: {formatRatio(result.liquidity.quickRatio)}</p>
                  <p>Cash Ratio: {formatRatio(result.liquidity.cashRatio)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Profitability</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>Gross Margin: {formatRatio(result.profitability.grossProfitMarginPct)}%</p>
                  <p>Operating Margin: {formatRatio(result.profitability.operatingProfitMarginPct)}%</p>
                  <p>Net Margin: {formatRatio(result.profitability.netProfitMarginPct)}%</p>
                  <p>ROA: {formatRatio(result.profitability.returnOnAssetsPct)}%</p>
                  <p>ROE: {formatRatio(result.profitability.returnOnEquityPct)}%</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Leverage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>Debt to Equity: {formatRatio(result.leverage.debtToEquity)}</p>
                  <p>Debt Ratio: {formatRatio(result.leverage.debtRatio)}</p>
                  <p>Interest Coverage: {formatRatio(result.leverage.interestCoverageRatio)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Efficiency</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>Inventory Turnover: {formatRatio(result.efficiency.inventoryTurnover)}</p>
                  <p>Receivables Turnover: {formatRatio(result.efficiency.receivablesTurnover)}</p>
                  <p>Asset Turnover: {formatRatio(result.efficiency.assetTurnover)}</p>
                  <p>Payables Turnover: {formatRatio(result.efficiency.payablesTurnover)}</p>
                </CardContent>
              </Card>
            </div>

            {result.notes.length > 0 && (
              <div className="rounded-md border border-yellow-300/60 bg-yellow-50 px-3 py-2 dark:border-yellow-800 dark:bg-yellow-950/20">
                <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">Notes</p>
                {result.notes.map((note) => (
                  <p key={note} className="text-xs text-yellow-800 dark:text-yellow-200">
                    - {note}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

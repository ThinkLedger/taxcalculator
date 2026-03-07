"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "@/components/animated-number";
import { exportIncomeStatementToCSV, exportIncomeStatementToPDF } from "@/lib/export";
import { upsertIncomeStatement, type IncomeStatementResult } from "@/lib/oracle-api";
import { formatCurrency, formatInputValue, parseInputValue } from "../utils";

type StatementFieldKey =
  | "totalRevenue"
  | "costOfGoodsSold"
  | "operatingExpenses"
  | "depreciationCharge"
  | "interestOnLoans"
  | "corporateTax"
  | "dividendPayments";

type StatementValues = Record<StatementFieldKey, string>;

const FIELD_LABELS: Record<StatementFieldKey, string> = {
  totalRevenue: "Total revenue",
  costOfGoodsSold: "Cost of goods sold",
  operatingExpenses: "Operating expenses",
  depreciationCharge: "Depreciation charge",
  interestOnLoans: "Interest on loans",
  corporateTax: "Corporate tax",
  dividendPayments: "Dividend payments",
};

const INITIAL_VALUES: StatementValues = {
  totalRevenue: "",
  costOfGoodsSold: "",
  operatingExpenses: "",
  depreciationCharge: "",
  interestOnLoans: "",
  corporateTax: "",
  dividendPayments: "",
};

interface IncomeStatementCalculatorProps {
  year: string;
  quarter: string;
}

export function IncomeStatementCalculator({ year, quarter }: IncomeStatementCalculatorProps) {
  const [values, setValues] = useState<StatementValues>(INITIAL_VALUES);
  const [result, setResult] = useState<IncomeStatementResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fieldKeys = useMemo(() => Object.keys(FIELD_LABELS) as StatementFieldKey[], []);
  const shimmerClass = "inline-block h-6 w-20 animate-pulse rounded bg-muted align-middle";

  const handleInputChange = (field: StatementFieldKey, value: string) => {
    setValues((prev) => ({ ...prev, [field]: formatInputValue(value) }));
  };

  const handleSubmit = async () => {
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

    const parsedValues: Partial<Record<StatementFieldKey, number>> = {};
    for (const key of fieldKeys) {
      const raw = parseInputValue(values[key]);
      const parsed = Number(raw || "0");
      if (!Number.isFinite(parsed) || parsed < 0) {
        setErrorMessage(`Please input a valid value for ${FIELD_LABELS[key]}`);
        return;
      }
      parsedValues[key] = parsed;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await upsertIncomeStatement({
        year: parsedYear,
        quarter: parsedQuarter,
        totalRevenue: parsedValues.totalRevenue || 0,
        costOfGoodsSold: parsedValues.costOfGoodsSold || 0,
        operatingExpenses: parsedValues.operatingExpenses || 0,
        depreciationCharge: parsedValues.depreciationCharge || 0,
        interestOnLoans: parsedValues.interestOnLoans || 0,
        corporateTax: parsedValues.corporateTax || 0,
        dividendPayments: parsedValues.dividendPayments || 0,
      });
      setResult(response);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to save income statement";
      setErrorMessage(message);
      setResult(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Income Statement 🇬🇭</CardTitle>
        <CardDescription>
          Generate quarterly income statement data and compute derived values.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fieldKeys.map((field) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={`statement-${field}`}>{FIELD_LABELS[field]}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">GH₵</span>
                <Input
                  id={`statement-${field}`}
                  type="text"
                  inputMode="numeric"
                  value={values[field]}
                  onChange={(event) => handleInputChange(field, event.target.value)}
                  placeholder="0"
                  className="pl-12 text-right text-lg"
                />
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </span>
          ) : (
            "Generate Income Statement"
          )}
        </Button>
        {result && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => exportIncomeStatementToPDF({ year, quarter, result })}
            >
              Export PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => exportIncomeStatementToCSV({ year, quarter, result })}
            >
              Export CSV
            </Button>
          </div>
        )}

        <div className="space-y-4 pt-4 border-t">
          {errorMessage ? (
            <p className="text-sm text-destructive text-center">{errorMessage}</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Gross Profit</p>
                  <p className="text-lg font-semibold">
                    GH¢{" "}
                    {isSubmitting ? (
                      <span className={shimmerClass} />
                    ) : (
                      <AnimatedNumber value={result ? formatCurrency(String(result.statement.grossProfit)) : "0.00"} />
                    )}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-sm text-muted-foreground">EBIT</p>
                  <p className="text-lg font-semibold">
                    GH¢{" "}
                    {isSubmitting ? (
                      <span className={shimmerClass} />
                    ) : (
                      <AnimatedNumber value={result ? formatCurrency(String(result.statement.ebit)) : "0.00"} />
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Net Profit</p>
                  <p className="text-lg font-semibold">
                    GH¢{" "}
                    {isSubmitting ? (
                      <span className={shimmerClass} />
                    ) : (
                      <AnimatedNumber value={result ? formatCurrency(String(result.statement.netProfit)) : "0.00"} />
                    )}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-sm text-muted-foreground">Reserves</p>
                  <p className="text-lg font-semibold">
                    GH¢{" "}
                    {isSubmitting ? (
                      <span className={shimmerClass} />
                    ) : (
                      <AnimatedNumber value={result ? formatCurrency(String(result.statement.reserves)) : "0.00"} />
                    )}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

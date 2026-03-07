"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getFinanceRatios, type FinanceRatiosInput, type FinanceRatiosResult } from "@/lib/oracle-api";
import { formatInputValue, parseInputValue } from "../utils";

type FinanceFieldKey =
  | "marketPricePerShare"
  | "sharesOutstanding"
  | "preferredDividends"
  | "annualDividendsPerShare"
  | "expectedEarningsGrowthRate"
  | "nopat"
  | "investedCapital"
  | "averageAccountsPayable";

type FinanceFieldConfig = {
  label: string;
  placeholder: string;
  required: boolean;
  helper?: string;
};

const FIELD_CONFIG: Record<FinanceFieldKey, FinanceFieldConfig> = {
  marketPricePerShare: { label: "Market Price Per Share", placeholder: "e.g. 8.5", required: true },
  sharesOutstanding: { label: "Shares Outstanding", placeholder: "e.g. 500000", required: true },
  preferredDividends: { label: "Preferred Dividends", placeholder: "Optional", required: false },
  annualDividendsPerShare: { label: "Annual Dividends Per Share", placeholder: "Optional", required: false },
  expectedEarningsGrowthRate: {
    label: "Expected Earnings Growth Rate",
    placeholder: "e.g. 0.14",
    required: false,
    helper: "Use decimal format (0.14 = 14%).",
  },
  nopat: { label: "NOPAT", placeholder: "Optional", required: false },
  investedCapital: { label: "Invested Capital", placeholder: "Optional", required: false },
  averageAccountsPayable: { label: "Average Accounts Payable", placeholder: "Optional", required: false },
};

const FIELD_KEYS = Object.keys(FIELD_CONFIG) as FinanceFieldKey[];
const FINANCE_PRESET_KEY = "taxcalculatorgh.financeRatios.inputs.v1";

const FINANCE_PRESETS: Record<
  "CONSERVATIVE" | "BASE" | "AGGRESSIVE",
  Record<FinanceFieldKey, string>
> = {
  CONSERVATIVE: {
    marketPricePerShare: "6.50",
    sharesOutstanding: "500000",
    preferredDividends: "0",
    annualDividendsPerShare: "0.20",
    expectedEarningsGrowthRate: "0.08",
    nopat: "280000",
    investedCapital: "1200000",
    averageAccountsPayable: "65000",
  },
  BASE: {
    marketPricePerShare: "8.50",
    sharesOutstanding: "500000",
    preferredDividends: "0",
    annualDividendsPerShare: "0.40",
    expectedEarningsGrowthRate: "0.14",
    nopat: "380000",
    investedCapital: "1170000",
    averageAccountsPayable: "72000",
  },
  AGGRESSIVE: {
    marketPricePerShare: "12.00",
    sharesOutstanding: "500000",
    preferredDividends: "0",
    annualDividendsPerShare: "0.60",
    expectedEarningsGrowthRate: "0.22",
    nopat: "520000",
    investedCapital: "1250000",
    averageAccountsPayable: "85000",
  },
};

interface FinanceRatiosCalculatorProps {
  year: string;
  quarter: string;
  onResultChange?: (result: FinanceRatiosResult | null) => void;
}

export function FinanceRatiosCalculator({ year, quarter, onResultChange }: FinanceRatiosCalculatorProps) {
  const [values, setValues] = useState<Record<FinanceFieldKey, string>>({
    marketPricePerShare: "",
    sharesOutstanding: "",
    preferredDividends: "",
    annualDividendsPerShare: "",
    expectedEarningsGrowthRate: "",
    nopat: "",
    investedCapital: "",
    averageAccountsPayable: "",
  });
  const [result, setResult] = useState<FinanceRatiosResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setResult(null);
    setErrorMessage(null);
    onResultChange?.(null);
  }, [year, quarter, onResultChange]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(FINANCE_PRESET_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<Record<FinanceFieldKey, string>>;
      const nextValues: Record<FinanceFieldKey, string> = {
        marketPricePerShare: parsed.marketPricePerShare ?? "",
        sharesOutstanding: parsed.sharesOutstanding ?? "",
        preferredDividends: parsed.preferredDividends ?? "",
        annualDividendsPerShare: parsed.annualDividendsPerShare ?? "",
        expectedEarningsGrowthRate: parsed.expectedEarningsGrowthRate ?? "",
        nopat: parsed.nopat ?? "",
        investedCapital: parsed.investedCapital ?? "",
        averageAccountsPayable: parsed.averageAccountsPayable ?? "",
      };
      setValues(nextValues);
    } catch {
      // Ignore malformed persisted values.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(FINANCE_PRESET_KEY, JSON.stringify(values));
  }, [values]);

  const parsedInput = useMemo(() => {
    const parseOptional = (raw: string): number | undefined => {
      if (!raw.trim()) return undefined;
      const parsed = Number(parseInputValue(raw));
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    const marketPricePerShare = Number(parseInputValue(values.marketPricePerShare));
    const sharesOutstanding = Number(parseInputValue(values.sharesOutstanding));

    return {
      marketPricePerShare,
      sharesOutstanding,
      preferredDividends: parseOptional(values.preferredDividends),
      annualDividendsPerShare: parseOptional(values.annualDividendsPerShare),
      expectedEarningsGrowthRate: parseOptional(values.expectedEarningsGrowthRate),
      nopat: parseOptional(values.nopat),
      investedCapital: parseOptional(values.investedCapital),
      averageAccountsPayable: parseOptional(values.averageAccountsPayable),
    };
  }, [values]);

  const handleInputChange = (field: FinanceFieldKey, value: string) => {
    setValues((prev) => ({ ...prev, [field]: formatInputValue(value) }));
  };

  const applyPreset = (preset: keyof typeof FINANCE_PRESETS) => {
    setValues(FINANCE_PRESETS[preset]);
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

    if (!Number.isFinite(parsedInput.marketPricePerShare) || parsedInput.marketPricePerShare <= 0) {
      setErrorMessage("Market price per share must be greater than 0");
      return;
    }
    if (!Number.isFinite(parsedInput.sharesOutstanding) || parsedInput.sharesOutstanding <= 0) {
      setErrorMessage("Shares outstanding must be greater than 0");
      return;
    }

    const optionalNumbers: Array<{ label: string; value: number | undefined }> = [
      { label: "Preferred Dividends", value: parsedInput.preferredDividends },
      { label: "Annual Dividends Per Share", value: parsedInput.annualDividendsPerShare },
      { label: "Expected Earnings Growth Rate", value: parsedInput.expectedEarningsGrowthRate },
      { label: "NOPAT", value: parsedInput.nopat },
      { label: "Invested Capital", value: parsedInput.investedCapital },
      { label: "Average Accounts Payable", value: parsedInput.averageAccountsPayable },
    ];

    const invalid = optionalNumbers.find((item) => item.value !== undefined && !Number.isFinite(item.value));
    if (invalid) {
      setErrorMessage(`Please enter a valid number for ${invalid.label}`);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const input: FinanceRatiosInput = {
        marketPricePerShare: parsedInput.marketPricePerShare,
        sharesOutstanding: parsedInput.sharesOutstanding,
        preferredDividends: parsedInput.preferredDividends,
        annualDividendsPerShare: parsedInput.annualDividendsPerShare,
        expectedEarningsGrowthRate: parsedInput.expectedEarningsGrowthRate,
        nopat: parsedInput.nopat,
        investedCapital: parsedInput.investedCapital,
        averageAccountsPayable: parsedInput.averageAccountsPayable,
      };

      const response = await getFinanceRatios(parsedYear, parsedQuarter, input);
      setResult(response);
      onResultChange?.(response);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to compute finance ratios";
      setErrorMessage(message);
      setResult(null);
      onResultChange?.(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Finance Ratios 🇬🇭</CardTitle>
        <CardDescription>
          Enter valuation inputs and compute finance ratios for {`Q${quarter} ${year}`} from your stored financial statements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button variant="outline" onClick={() => applyPreset("CONSERVATIVE")} disabled={isLoading}>
            Conservative
          </Button>
          <Button variant="outline" onClick={() => applyPreset("BASE")} disabled={isLoading}>
            Base
          </Button>
          <Button variant="outline" onClick={() => applyPreset("AGGRESSIVE")} disabled={isLoading}>
            Aggressive
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FIELD_KEYS.map((field) => (
            <div key={field} className="space-y-1.5">
              <Label htmlFor={`finance-${field}`}>
                {FIELD_CONFIG[field].label}
                {FIELD_CONFIG[field].required ? " *" : ""}
              </Label>
              <Input
                id={`finance-${field}`}
                type="text"
                inputMode="decimal"
                value={values[field]}
                onChange={(event) => handleInputChange(field, event.target.value)}
                placeholder={FIELD_CONFIG[field].placeholder}
              />
              {FIELD_CONFIG[field].helper && (
                <p className="text-xs text-muted-foreground">{FIELD_CONFIG[field].helper}</p>
              )}
            </div>
          ))}
        </div>

        <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Computing Finance Ratios...
            </span>
          ) : (
            "Generate Finance Ratios"
          )}
        </Button>

        {errorMessage && <p className="text-sm text-destructive text-center">{errorMessage}</p>}

        {result && !errorMessage && (
          <p className="text-xs text-muted-foreground text-center">
            Finance ratios generated. Open the Finance Results panel to view details.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

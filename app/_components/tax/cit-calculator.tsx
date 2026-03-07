"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedNumber } from "@/components/animated-number";
import type { CITCalculationResult } from "@/lib/oracle-api";
import { formatCurrency, formatInputValue } from "../utils";

interface CITCalculatorProps {
  taxableIncome: string;
  onTaxableIncomeChange: (value: string) => void;
  result: CITCalculationResult | null;
  isLoading?: boolean;
  errorMessage?: string;
}

export function CITCalculator({
  taxableIncome,
  onTaxableIncomeChange,
  result,
  isLoading = false,
  errorMessage,
}: CITCalculatorProps) {
  const shimmerClass = "inline-block h-6 w-20 animate-pulse rounded bg-muted align-middle";

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">CIT Calculator 🇬🇭</CardTitle>
        <CardDescription>
          Compute corporate income tax (standard rate) from taxable income.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="taxable-income">Annual taxable income</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">GH₵</span>
            <Input
              id="taxable-income"
              type="text"
              inputMode="numeric"
              value={taxableIncome}
              onChange={(e) => {
                const formatted = formatInputValue(e.target.value);
                onTaxableIncomeChange(formatted);
              }}
              placeholder="0"
              className="pl-12 text-right text-lg"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          {errorMessage ? (
            <p className="text-sm text-destructive text-center">{errorMessage}</p>
          ) : (
            <>
              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">Taxable Income</p>
                <p className="text-lg font-semibold">
                  GH¢ {isLoading ? <span className={shimmerClass} /> : <AnimatedNumber value={result ? formatCurrency(result.taxableIncome) : "0.00"} />}
                </p>
              </div>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">CIT Amount</p>
                  <p className="text-lg font-semibold">
                    GH¢ {isLoading ? <span className={shimmerClass} /> : <AnimatedNumber value={result ? formatCurrency(result.citAmount) : "0.00"} />}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-sm text-muted-foreground">Net Income</p>
                  <p className="text-lg font-semibold">
                    GH¢ {isLoading ? <span className={shimmerClass} /> : <AnimatedNumber value={result ? formatCurrency(result.netIncome) : "0.00"} />}
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

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedNumber } from "@/components/animated-number";
import type { CSTCalculationResult } from "@/lib/oracle-api";
import { formatCurrency, formatInputValue } from "../utils";

interface CSTCalculatorProps {
  serviceCharge: string;
  onServiceChargeChange: (value: string) => void;
  result: CSTCalculationResult | null;
  isLoading?: boolean;
  errorMessage?: string;
}

export function CSTCalculator({
  serviceCharge,
  onServiceChargeChange,
  result,
  isLoading = false,
  errorMessage,
}: CSTCalculatorProps) {
  const shimmerClass = "inline-block h-6 w-20 animate-pulse rounded bg-muted align-middle";

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">CST Calculator 🇬🇭</CardTitle>
        <CardDescription>
          Compute Communications Service Tax and total charge.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="service-charge">Service charge</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">GH₵</span>
            <Input
              id="service-charge"
              type="text"
              inputMode="numeric"
              value={serviceCharge}
              onChange={(e) => {
                const formatted = formatInputValue(e.target.value);
                onServiceChargeChange(formatted);
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
                <p className="text-sm text-muted-foreground">CST Rate</p>
                <p className="text-lg font-semibold">
                  {isLoading ? <span className={shimmerClass} /> : <AnimatedNumber value={result ? result.cstRate : "0.00"} />}%
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">CST Amount</p>
                  <p className="text-lg font-semibold">
                    GH¢ {isLoading ? <span className={shimmerClass} /> : <AnimatedNumber value={result ? formatCurrency(result.cstAmount) : "0.00"} />}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-sm text-muted-foreground">Total Charge</p>
                  <p className="text-lg font-semibold">
                    GH¢ {isLoading ? <span className={shimmerClass} /> : <AnimatedNumber value={result ? formatCurrency(result.totalCharge) : "0.00"} />}
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

"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "@/components/animated-number";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  calculateVATExclusive,
  calculateVATInclusive,
  type VATCalculationResult,
} from "@/lib/vat-calculator";
import { formatCurrency, formatInputValue, parseInputValue } from "../utils";

interface VATCalculatorProps {
  year: string;
  onResultChange?: (result: VATCalculationResult | null) => void;
  onInputsChange?: (inputs: { mode: "exclusive" | "inclusive"; amount: string }) => void;
}

export function VATCalculator({ year: _year, onResultChange, onInputsChange }: VATCalculatorProps) {
  const [mode, setMode] = useState<"exclusive" | "inclusive">("exclusive");
  const [exclusiveAmount, setExclusiveAmount] = useState("");
  const [inclusiveAmount, setInclusiveAmount] = useState("");

  const exclusiveResult = useMemo(() => {
    if (mode !== "exclusive" || !exclusiveAmount) return null;
    const parsed = parseInputValue(exclusiveAmount);
    return calculateVATExclusive(parsed);
  }, [exclusiveAmount, mode]);

  const inclusiveResult = useMemo(() => {
    if (mode !== "inclusive" || !inclusiveAmount) return null;
    const parsed = parseInputValue(inclusiveAmount);
    return calculateVATInclusive(parsed);
  }, [inclusiveAmount, mode]);

  const result = mode === "exclusive" ? exclusiveResult : inclusiveResult;
  const hasError = result && "errorMessage" in result;
  const vatResult: VATCalculationResult | null =
    result && !hasError ? (result as VATCalculationResult) : null;

  // Notify parent of result changes
  useEffect(() => {
    if (onResultChange) {
      if (vatResult !== null) {
        onResultChange(vatResult);
      } else if (!exclusiveAmount && !inclusiveAmount) {
        onResultChange(null);
      }
    }
  }, [vatResult, exclusiveAmount, inclusiveAmount, onResultChange]);

  // Notify parent of input changes
  useEffect(() => {
    if (onInputsChange) {
      const amount = mode === "exclusive" ? exclusiveAmount : inclusiveAmount;
      onInputsChange({ mode, amount });
    }
  }, [mode, exclusiveAmount, inclusiveAmount, onInputsChange]);

  const clearExclusive = () => {
    setExclusiveAmount("");
  };

  const clearInclusive = () => {
    setInclusiveAmount("");
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">VAT Calculator 🇬🇭</CardTitle>
        <CardDescription>
          Calculate VAT, NHIL, and GETFund Levy for goods and services.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={mode} onValueChange={(value) => setMode(value as "exclusive" | "inclusive")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="exclusive" className="text-xs">Exclusive (before taxes)</TabsTrigger>
            <TabsTrigger value="inclusive" className="text-xs">Inclusive (final cost)</TabsTrigger>
          </TabsList>

          <TabsContent value="exclusive" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="exclusive-amount">Taxable amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  GH₵
                </span>
                <Input
                  id="exclusive-amount"
                  type="text"
                  inputMode="numeric"
                  value={exclusiveAmount}
                  onChange={(e) => {
                    const formatted = formatInputValue(e.target.value);
                    setExclusiveAmount(formatted);
                  }}
                  placeholder="0"
                  className="pl-12 text-right text-lg"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the taxable amount (before taxes). NHIL 2.5%, GETFund 2.5%, VAT 15% will be
                added on the taxable value.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={clearExclusive}
                disabled={!exclusiveAmount}
              >
                Clear
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="inclusive" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="inclusive-amount">Final cost (inclusive) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  GH₵
                </span>
                <Input
                  id="inclusive-amount"
                  type="text"
                  inputMode="numeric"
                  value={inclusiveAmount}
                  onChange={(e) => {
                    const formatted = formatInputValue(e.target.value);
                    setInclusiveAmount(formatted);
                  }}
                  placeholder="0"
                  className="pl-12 text-right text-lg"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the final amount (tax-inclusive). The calculator will derive the taxable
                value and compute NHIL 2.5%, GETFund 2.5%, VAT 15%.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={clearInclusive}
                disabled={!inclusiveAmount}
              >
                Clear
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Results */}
        {hasError ? (
          <div className="pt-4 border-t">
            <p className="text-sm text-destructive text-center">
              {(result as { errorMessage: string }).errorMessage}
            </p>
          </div>
        ) : (
          vatResult && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">TAXABLE VALUE:</p>
                  <p className="text-lg font-semibold">
                    GH₵ <AnimatedNumber value={formatCurrency(vatResult.taxableValue)} />
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-xs text-muted-foreground whitespace-nowrap">FINAL COST (INCL. TAXES):</p>
                  <p className="text-lg font-semibold">
                    GH₵ <AnimatedNumber value={formatCurrency(vatResult.finalCost)} />
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">NHIL (2.5%):</p>
                  <p className="text-base font-semibold">
                    GH₵ <AnimatedNumber value={formatCurrency(vatResult.nhil)} />
                  </p>
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-xs text-muted-foreground">GETFUND LEVY (2.5%):</p>
                  <p className="text-base font-semibold">
                    GH₵ <AnimatedNumber value={formatCurrency(vatResult.getfund)} />
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-xs text-muted-foreground">VAT (15%):</p>
                  <p className="text-base font-semibold">
                    GH₵ <AnimatedNumber value={formatCurrency(vatResult.vat)} />
                  </p>
                </div>
              </div>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}

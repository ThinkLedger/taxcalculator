"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "@/components/animated-number";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { VATCalculationResult } from "@/lib/vat-calculator";
import { computeVATExclusive, computeVATInclusive } from "@/lib/oracle-api";
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
  const [vatResult, setVatResult] = useState<VATCalculationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeAmount = mode === "exclusive" ? exclusiveAmount : inclusiveAmount;
  const parsedActiveAmount = useMemo(() => Number(parseInputValue(activeAmount || "0")), [activeAmount]);
  const shimmerClass = "inline-block h-5 w-20 animate-pulse rounded bg-muted align-middle";
  const validationError = useMemo(() => {
    if (!activeAmount.trim()) return null;
    if (!Number.isFinite(parsedActiveAmount) || parsedActiveAmount < 0) {
      return mode === "exclusive" ? "Please input a valid taxable amount" : "Please input a valid final cost amount";
    }
    return null;
  }, [activeAmount, mode, parsedActiveAmount]);

  const resetComputedState = () => {
    setVatResult(null);
    setErrorMessage(null);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!activeAmount.trim()) {
      return;
    }

    if (validationError) {
      return;
    }

    let active = true;
    const run = async () => {
      setErrorMessage(null);
      setIsLoading(true);

      try {
        const result =
          mode === "exclusive"
            ? await computeVATExclusive({ year: _year, amount: parsedActiveAmount })
            : await computeVATInclusive({ year: _year, amount: parsedActiveAmount });
        if (!active) return;
        setVatResult(result);
      } catch (error: unknown) {
        if (!active) return;
        const message = error instanceof Error ? error.message : "Unable to compute VAT from API";
        setVatResult(null);
        setErrorMessage(message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [activeAmount, mode, parsedActiveAmount, _year, validationError]);

  // Notify parent of result changes
  useEffect(() => {
    const computedError = validationError || errorMessage;
    const effectiveResult = computedError ? null : vatResult;
    if (onResultChange) {
      if (effectiveResult !== null) {
        onResultChange(effectiveResult);
      } else if (!exclusiveAmount && !inclusiveAmount) {
        onResultChange(null);
      } else if (computedError) {
        onResultChange(null);
      }
    }
  }, [vatResult, exclusiveAmount, inclusiveAmount, onResultChange, errorMessage, validationError]);

  // Notify parent of input changes
  useEffect(() => {
    if (onInputsChange) {
      const amount = mode === "exclusive" ? exclusiveAmount : inclusiveAmount;
      onInputsChange({ mode, amount });
    }
  }, [mode, exclusiveAmount, inclusiveAmount, onInputsChange]);

  const clearExclusive = () => {
    setExclusiveAmount("");
    resetComputedState();
  };

  const clearInclusive = () => {
    setInclusiveAmount("");
    resetComputedState();
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
        <Tabs
          value={mode}
          onValueChange={(value) => {
            setMode(value as "exclusive" | "inclusive");
            resetComputedState();
          }}
        >
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
                    if (!formatted.trim()) resetComputedState();
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
                    if (!formatted.trim()) resetComputedState();
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
        {validationError || errorMessage ? (
          <div className="pt-4 border-t">
            <p className="text-sm text-destructive text-center">
              {validationError || errorMessage}
            </p>
          </div>
        ) : (
          (vatResult || isLoading) && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">TAXABLE VALUE:</p>
                  <p className="text-lg font-semibold">
                    GH₵{" "}
                    {isLoading || !vatResult ? (
                      <span className={shimmerClass} />
                    ) : (
                      <AnimatedNumber value={formatCurrency(vatResult.taxableValue)} />
                    )}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-xs text-muted-foreground whitespace-nowrap">FINAL COST (INCL. TAXES):</p>
                  <p className="text-lg font-semibold">
                    GH₵{" "}
                    {isLoading || !vatResult ? (
                      <span className={shimmerClass} />
                    ) : (
                      <AnimatedNumber value={formatCurrency(vatResult.finalCost)} />
                    )}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">NHIL (2.5%):</p>
                  <p className="text-base font-semibold">
                    GH₵{" "}
                    {isLoading || !vatResult ? (
                      <span className={shimmerClass} />
                    ) : (
                      <AnimatedNumber value={formatCurrency(vatResult.nhil)} />
                    )}
                  </p>
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-xs text-muted-foreground">GETFUND LEVY (2.5%):</p>
                  <p className="text-base font-semibold">
                    GH₵{" "}
                    {isLoading || !vatResult ? (
                      <span className={shimmerClass} />
                    ) : (
                      <AnimatedNumber value={formatCurrency(vatResult.getfund)} />
                    )}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-xs text-muted-foreground">VAT (15%):</p>
                  <p className="text-base font-semibold">
                    GH₵{" "}
                    {isLoading || !vatResult ? (
                      <span className={shimmerClass} />
                    ) : (
                      <AnimatedNumber value={formatCurrency(vatResult.vat)} />
                    )}
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

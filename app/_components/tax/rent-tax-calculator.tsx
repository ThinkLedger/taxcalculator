"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatedNumber } from "@/components/animated-number";
import type { RentTaxCalculationResult } from "@/lib/oracle-api";
import { formatCurrency, formatInputValue } from "../utils";

interface RentTaxCalculatorProps {
  rentAmount: string;
  onRentAmountChange: (value: string) => void;
  propertyType: "residential" | "commercial";
  onPropertyTypeChange: (value: "residential" | "commercial") => void;
  result: RentTaxCalculationResult | null;
  isLoading?: boolean;
  errorMessage?: string;
}

export function RentTaxCalculator({
  rentAmount,
  onRentAmountChange,
  propertyType,
  onPropertyTypeChange,
  result,
  isLoading = false,
  errorMessage,
}: RentTaxCalculatorProps) {
  const shimmerClass = "inline-block h-6 w-20 animate-pulse rounded bg-muted align-middle";

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Rent Tax 🇬🇭</CardTitle>
        <CardDescription>
          Compute rent income tax and net rent received.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="property-type">Property Type</Label>
            <Select
              value={propertyType}
              onValueChange={(value) => onPropertyTypeChange(value as "residential" | "commercial")}
            >
              <SelectTrigger id="property-type" className="w-full">
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Residential (8%)</SelectItem>
                <SelectItem value="commercial">Commercial (15%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rent-amount">Rent amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">GH₵</span>
              <Input
                id="rent-amount"
                type="text"
                inputMode="numeric"
                value={rentAmount}
                onChange={(e) => {
                  const formatted = formatInputValue(e.target.value);
                  onRentAmountChange(formatted);
                }}
                placeholder="0"
                className="pl-12 text-right text-lg"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          {errorMessage ? (
            <p className="text-sm text-destructive text-center">{errorMessage}</p>
          ) : (
            <>
              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">Rent Tax Rate</p>
                <p className="text-lg font-semibold">
                  {isLoading ? <span className={shimmerClass} /> : <AnimatedNumber value={result ? result.rentTaxRate : "0.00"} />}%
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Rent Tax Amount</p>
                  <p className="text-lg font-semibold">
                    GH¢ {isLoading ? <span className={shimmerClass} /> : <AnimatedNumber value={result ? formatCurrency(result.rentTaxAmount) : "0.00"} />}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-sm text-muted-foreground">Net Rent</p>
                  <p className="text-lg font-semibold">
                    GH¢ {isLoading ? <span className={shimmerClass} /> : <AnimatedNumber value={result ? formatCurrency(result.netRent) : "0.00"} />}
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

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimatedNumber } from "@/components/animated-number";
import type { CITCalculationResult } from "@/lib/oracle-api";
import { formatCurrency, formatInputValue } from "../utils";

/**
 * Business categories and rates, mirroring the Finance Oracle CIT rule pack
 * (Income Tax Act, 2015 (Act 896), as amended). The standard rate is 25%; the
 * rest depend on the nature, location and industry of the business (GRA).
 * The rate shown is for choosing; the Oracle applies the one it holds.
 */
export const CIT_CATEGORY_GROUPS = [
  {
    label: "General rates",
    options: [
      { value: "standard", label: "Standard rate", rate: 25 },
      { value: "trust", label: "Income of a trust", rate: 25 },
      { value: "hotel", label: "Hotel industry", rate: 22 },
      { value: "non_traditional_exports", label: "Non-traditional exports", rate: 8 },
      { value: "financial_farming_loans", label: "Financial institution — loans to farming", rate: 20 },
      { value: "financial_leasing_loans", label: "Financial institution — loans to leasing", rate: 20 },
      { value: "free_zone_domestic", label: "Free zone (post-holiday) — domestic sales", rate: 25 },
      { value: "free_zone_exports", label: "Free zone (post-holiday) — exports", rate: 15 },
      { value: "petroleum", label: "Petroleum income", rate: 35 },
      { value: "minerals", label: "Mineral income", rate: 35 },
      { value: "rural_bank", label: "Rural bank (post-holiday)", rate: 8 },
    ],
  },
  {
    label: "During a tax holiday",
    options: [
      { value: "agro_processing_holiday", label: "Agro-processing (5-year holiday)", rate: 5 },
      { value: "cocoa_byproduct_holiday", label: "Cocoa by-products (5-year holiday)", rate: 5 },
      { value: "tree_crop_holiday", label: "Tree crop farming (10-year holiday)", rate: 5 },
      { value: "cash_crops_livestock_holiday", label: "Cash crops / livestock excl. cattle (5-year holiday)", rate: 5 },
      { value: "cattle_holiday", label: "Cattle farming (10-year holiday)", rate: 5 },
      { value: "waste_processing_holiday", label: "Waste processing (7-year holiday)", rate: 5 },
      { value: "rural_bank_holiday", label: "Rural bank (10-year holiday)", rate: 5 },
      { value: "real_estate_low_cost_holiday", label: "Low-cost housing real estate (5-year holiday)", rate: 5 },
    ],
  },
  {
    label: "Agro-processing after the holiday (by location)",
    options: [
      { value: "agro_post_holiday_accra", label: "Plant in Accra", rate: 20 },
      { value: "agro_post_holiday_tema", label: "Plant in Tema", rate: 20 },
      { value: "agro_post_holiday_regional_capital", label: "Plant in another regional capital", rate: 15 },
      { value: "agro_post_holiday_outside_regional", label: "Plant outside regional capitals", rate: 10 },
      { value: "agro_post_holiday_northern_belt", label: "Plant in Northern, Upper East or Upper West", rate: 5 },
    ],
  },
  {
    label: "Manufacturing (by location)",
    options: [
      { value: "manufacturing_regional_capital", label: "Plant in a regional capital (excl. Accra, Tema)", rate: 18.75 },
      { value: "manufacturing_rural", label: "Plant outside Accra, Tema and regional capitals", rate: 12.5 },
    ],
  },
] as const;

export const DEFAULT_CIT_CATEGORY = "standard";

export function citCategoryRate(value: string): number | undefined {
  for (const group of CIT_CATEGORY_GROUPS) {
    const option = group.options.find((item) => item.value === value);
    if (option) return option.rate;
  }
  return undefined;
}

interface CITCalculatorProps {
  taxableIncome: string;
  onTaxableIncomeChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  result: CITCalculationResult | null;
  isLoading?: boolean;
  errorMessage?: string;
}

export function CITCalculator({
  taxableIncome,
  onTaxableIncomeChange,
  category,
  onCategoryChange,
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
          Compute corporate income tax for your type of business.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="cit-category">Business category</Label>
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger id="cit-category" className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CIT_CATEGORY_GROUPS.map((group) => (
                <SelectGroup key={group.label}>
                  <SelectLabel>{group.label}</SelectLabel>
                  {group.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} ({option.rate}%)
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

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
                <p className="text-sm text-muted-foreground">CIT Rate</p>
                <p className="text-lg font-semibold">{citCategoryRate(category) ?? "—"}%</p>
              </div>
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

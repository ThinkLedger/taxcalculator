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
import type { WithholdingCalculationResult } from "@/lib/oracle-api";
import { formatCurrency, formatInputValue } from "../utils";

export const WHT_CATEGORIES = {
  resident: [
    { value: "dividends", label: "Dividends (8%)" },
    { value: "interest", label: "Interest (8%)" },
    { value: "rent_residential", label: "Rent Residential (8%)" },
    { value: "rent_non_residential", label: "Rent Non-Residential (15%)" },
    { value: "examination_fees", label: "Examination Fees (10%)" },
    { value: "director_fees", label: "Director Fees (20%)" },
    { value: "agent_commission", label: "Agent Commission (10%)" },
    { value: "services_entity", label: "Services by Entity (7.5%)" },
    { value: "services_individual", label: "Services by Individual (7.5%)" },
    { value: "goods", label: "Goods Supply (3%)" },
    { value: "works", label: "Works Supply (5%)" },
    { value: "petroleum_subcontractor", label: "Petroleum Subcontractor (7.5%)" },
    { value: "precious_minerals", label: "Precious Minerals (3%)" },
    { value: "royalties", label: "Royalties (15%)" },
  ],
  non_resident: [
    { value: "dividends", label: "Dividends (8%)" },
    { value: "management_technical_fees", label: "Management/Technical Fees (20%)" },
    { value: "goods_works_services", label: "Goods/Works/Services (20%)" },
    { value: "royalties_resources_rents", label: "Royalties/Resources/Rents (15%)" },
    { value: "telecoms_transport", label: "Telecoms/Transport (15%)" },
    { value: "petroleum_subcontractor", label: "Petroleum Subcontractor (15%)" },
    { value: "branch_profits", label: "Branch Profits (8%)" },
    { value: "interest", label: "Interest (8%)" },
    { value: "insurance_premiums", label: "Insurance Premiums (5%)" },
  ],
} as const;

interface WithholdingCalculatorProps {
  paymentAmount: string;
  onPaymentAmountChange: (value: string) => void;
  counterpartyType: "resident" | "non_resident";
  onCounterpartyTypeChange: (value: "resident" | "non_resident") => void;
  incomeCategory: string;
  onIncomeCategoryChange: (value: string) => void;
  result: WithholdingCalculationResult | null;
  isLoading?: boolean;
  errorMessage?: string;
}

export function WithholdingCalculator({
  paymentAmount,
  onPaymentAmountChange,
  counterpartyType,
  onCounterpartyTypeChange,
  incomeCategory,
  onIncomeCategoryChange,
  result,
  isLoading = false,
  errorMessage,
}: WithholdingCalculatorProps) {
  const shimmerClass = "inline-block h-6 w-20 animate-pulse rounded bg-muted align-middle";
  const categories = WHT_CATEGORIES[counterpartyType];

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Withholding Tax 🇬🇭</CardTitle>
        <CardDescription>
          Compute withholding amount and net payable per transaction.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="counterparty-type">Counterparty Type</Label>
            <Select
              value={counterpartyType}
              onValueChange={(value) => onCounterpartyTypeChange(value as "resident" | "non_resident")}
            >
              <SelectTrigger id="counterparty-type" className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resident">Resident</SelectItem>
                <SelectItem value="non_resident">Non-resident</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="income-category">Income Category</Label>
            <Select value={incomeCategory} onValueChange={onIncomeCategoryChange}>
              <SelectTrigger id="income-category" className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-amount">Payment amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">GH₵</span>
              <Input
                id="payment-amount"
                type="text"
                inputMode="numeric"
                value={paymentAmount}
                onChange={(e) => {
                  const formatted = formatInputValue(e.target.value);
                  onPaymentAmountChange(formatted);
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
                <p className="text-sm text-muted-foreground">Withholding Rate</p>
                <p className="text-lg font-semibold">
                  {isLoading ? <span className={shimmerClass} /> : <AnimatedNumber value={result ? result.withholdingRate : "0.00"} />}%
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Withholding Amount</p>
                  <p className="text-lg font-semibold">
                    GH¢ {isLoading ? <span className={shimmerClass} /> : <AnimatedNumber value={result ? formatCurrency(result.withholdingAmount) : "0.00"} />}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-sm text-muted-foreground">Net Payable</p>
                  <p className="text-lg font-semibold">
                    GH¢ {isLoading ? <span className={shimmerClass} /> : <AnimatedNumber value={result ? formatCurrency(result.netPayable) : "0.00"} />}
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

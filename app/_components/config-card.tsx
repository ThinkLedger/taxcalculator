"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface ConfigCardProps {
  calculatorType: string;
  onCalculatorTypeChange: (value: string) => void;
  country: string;
  onCountryChange: (value: string) => void;
  year: string;
  onYearChange: (value: string) => void;
  quarter: string;
  onQuarterChange: (value: string) => void;
  ssnitEnabled: boolean;
  onSsnitChange: (checked: boolean) => void;
}

export function ConfigCard({
  calculatorType,
  onCalculatorTypeChange,
  country,
  onCountryChange,
  year,
  onYearChange,
  quarter,
  onQuarterChange,
  ssnitEnabled,
  onSsnitChange,
}: ConfigCardProps) {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="calculator-type">Calculator</Label>
          <Select value={calculatorType} onValueChange={onCalculatorTypeChange}>
            <SelectTrigger id="calculator-type" className="w-full">
              <SelectValue placeholder="Select calculator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PAYE">PAYE (Income Tax)</SelectItem>
              <SelectItem value="CIT">CIT (Corporate Tax)</SelectItem>
              <SelectItem value="VAT">VAT</SelectItem>
              <SelectItem value="WHT">Withholding Tax</SelectItem>
              <SelectItem value="RENT">Rent Tax</SelectItem>
              <SelectItem value="CST">CST</SelectItem>
              <SelectItem value="INCOME_STATEMENT">Income Statement</SelectItem>
              <SelectItem value="BALANCE_SHEET">Balance Sheet</SelectItem>
              <SelectItem value="CASH_FLOW">Cash Flow Statement</SelectItem>
              <SelectItem value="ACCOUNTING_RATIOS">Accounting Ratios</SelectItem>
              <SelectItem value="FINANCE_RATIOS">Finance Ratios</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 flex-1">
            <Label htmlFor="country">Country</Label>
            <Select value={country} onValueChange={onCountryChange}>
              <SelectTrigger id="country" className="w-full">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ghana">Ghana</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 flex-1">
            <Label htmlFor="year">Year</Label>
            <Select value={year} onValueChange={onYearChange}>
              <SelectTrigger id="year" className="w-full">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {calculatorType === "VAT" ? (
                  <SelectItem value="2026">2026</SelectItem>
                ) : calculatorType === "INCOME_STATEMENT" || calculatorType === "BALANCE_SHEET" || calculatorType === "CASH_FLOW" || calculatorType === "ACCOUNTING_RATIOS" || calculatorType === "FINANCE_RATIOS" ? (
                  <>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </>
                ) : calculatorType === "CIT" || calculatorType === "WHT" || calculatorType === "RENT" || calculatorType === "CST" ? (
                  <SelectItem value="2024">2024</SelectItem>
                ) : (
                  <>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        {(calculatorType === "INCOME_STATEMENT" || calculatorType === "BALANCE_SHEET" || calculatorType === "CASH_FLOW" || calculatorType === "ACCOUNTING_RATIOS" || calculatorType === "FINANCE_RATIOS") && (
          <div className="space-y-2">
            <Label htmlFor="quarter">Quarter</Label>
            <Select value={quarter} onValueChange={onQuarterChange}>
              <SelectTrigger id="quarter" className="w-full">
                <SelectValue placeholder="Select quarter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Q1</SelectItem>
                <SelectItem value="2">Q2</SelectItem>
                <SelectItem value="3">Q3</SelectItem>
                <SelectItem value="4">Q4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {calculatorType === "PAYE" && (
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="ssnit" className="flex-1">
              SSNIT Deductions
            </Label>
            <Switch
              id="ssnit"
              checked={ssnitEnabled}
              onCheckedChange={onSsnitChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

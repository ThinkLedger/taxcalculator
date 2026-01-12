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
  ssnitEnabled,
  onSsnitChange,
}: ConfigCardProps) {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Config</CardTitle>
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
              <SelectItem value="VAT">VAT</SelectItem>
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


"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedNumber } from "@/components/animated-number";
import { formatCurrency, formatInputValue, parseInputValue } from "../utils";

type CashFlowFieldKey =
  | "netCashFromOperatingActivities"
  | "netCashFromInvestingActivities"
  | "netCashFromFinancingActivities"
  | "openingCashBalance";

type CashFlowValues = Record<CashFlowFieldKey, string>;

const FIELD_LABELS: Record<CashFlowFieldKey, string> = {
  netCashFromOperatingActivities: "Operating cash flow",
  netCashFromInvestingActivities: "Investing cash flow",
  netCashFromFinancingActivities: "Financing cash flow",
  openingCashBalance: "Opening cash balance",
};

const INITIAL_VALUES: CashFlowValues = {
  netCashFromOperatingActivities: "",
  netCashFromInvestingActivities: "",
  netCashFromFinancingActivities: "",
  openingCashBalance: "",
};

interface CashFlowCalculatorProps {
  year: string;
  quarter: string;
}

export function CashFlowCalculator({ year, quarter }: CashFlowCalculatorProps) {
  const [values, setValues] = useState<CashFlowValues>(INITIAL_VALUES);

  const fieldKeys = useMemo(() => Object.keys(FIELD_LABELS) as CashFlowFieldKey[], []);

  const parsed = useMemo(() => {
    const operating = Number(parseInputValue(values.netCashFromOperatingActivities || "0"));
    const investing = Number(parseInputValue(values.netCashFromInvestingActivities || "0"));
    const financing = Number(parseInputValue(values.netCashFromFinancingActivities || "0"));
    const opening = Number(parseInputValue(values.openingCashBalance || "0"));

    const safeOperating = Number.isFinite(operating) ? operating : 0;
    const safeInvesting = Number.isFinite(investing) ? investing : 0;
    const safeFinancing = Number.isFinite(financing) ? financing : 0;
    const safeOpening = Number.isFinite(opening) ? opening : 0;

    const netCashMovement = safeOperating + safeInvesting + safeFinancing;
    const closingCashBalance = safeOpening + netCashMovement;

    return {
      netCashMovement,
      closingCashBalance,
    };
  }, [values]);

  const handleInputChange = (field: CashFlowFieldKey, value: string) => {
    setValues((prev) => ({ ...prev, [field]: formatInputValue(value) }));
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Cash Flow Statement 🇬🇭</CardTitle>
        <CardDescription>
          Track quarterly cash movement for {`Q${quarter} ${year}`}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fieldKeys.map((field) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={`cash-flow-${field}`}>{FIELD_LABELS[field]}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">GH₵</span>
                <Input
                  id={`cash-flow-${field}`}
                  type="text"
                  inputMode="numeric"
                  value={values[field]}
                  onChange={(event) => handleInputChange(field, event.target.value)}
                  placeholder="0"
                  className="pl-12 text-right text-lg"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Net Cash Movement</p>
              <p className="text-lg font-semibold">
                GH¢ <AnimatedNumber value={formatCurrency(String(parsed.netCashMovement))} />
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-sm text-muted-foreground">Closing Cash Balance</p>
              <p className="text-lg font-semibold">
                GH¢ <AnimatedNumber value={formatCurrency(String(parsed.closingCashBalance))} />
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Closing balance = Opening cash + Operating + Investing + Financing
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

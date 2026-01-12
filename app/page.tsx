"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Twitter, Facebook, Linkedin, Share2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { calculate, type TaxCalculationResult } from "@/lib/calculator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AnimatedNumber } from "@/components/animated-number";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function formatCurrency(value: string): string {
  if (!value || value === "0.00") return "0.00";
  const num = parseFloat(value);
  if (isNaN(num)) return "0.00";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatAmount(value: string): string {
  if (!value || value === "0") return "0";
  const num = parseFloat(value);
  if (isNaN(num)) return "0";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// Format input with commas as user types
function formatInputValue(value: string): string {
  // Remove all non-digit characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, "");
  
  // Prevent multiple decimal points
  const parts = cleaned.split(".");
  if (parts.length > 2) {
    return parts[0] + "." + parts.slice(1).join("");
  }
  
  // Format integer part with commas
  if (parts[0]) {
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
  }
  
  return cleaned;
}

// Parse formatted input back to number string
function parseInputValue(value: string): string {
  return value.replace(/,/g, "");
}

export default function Home() {
  const [monthlyBasicIncome, setMonthlyBasicIncome] = useState("");
  const [monthlyAllowances, setMonthlyAllowances] = useState("");
  const [taxRelief, setTaxRelief] = useState("");
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showMobileConfig, setShowMobileConfig] = useState(false);
  const [showMobileBreakdown, setShowMobileBreakdown] = useState(false);
  const [country, setCountry] = useState("Ghana");
  const [year, setYear] = useState("2024");
  const [ssnitEnabled, setSsnitEnabled] = useState(true);

  const calculationResult = useMemo(() => {
    const parsedIncome = parseInputValue(monthlyBasicIncome);
    const parsedAllowances = parseInputValue(monthlyAllowances);
    const parsedRelief = parseInputValue(taxRelief);
    return calculate(parsedIncome, parsedAllowances, parsedRelief, ssnitEnabled, year);
  }, [monthlyBasicIncome, monthlyAllowances, taxRelief, ssnitEnabled, year]);

  const hasError = "errorMessage" in calculationResult;
  const result: TaxCalculationResult | null = hasError
    ? null
    : (calculationResult as TaxCalculationResult);

  return (
    <div className="flex min-h-screen items-start justify-center bg-background p-4 pt-8">
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
        </div>
      {/* <div className="fixed bottom-4 left-4 z-10">
        <p className="text-xs text-muted-foreground">
          Inspired by{" "}
          <a
            href="https://kessir.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            Kessir
          </a>
        </p>
      </div> */}
      <div className="relative w-full max-w-6xl">
        <div
          className={`hidden lg:block absolute top-16 w-full max-w-sm transition-all duration-500 ease-in-out ${
            showConfig
              ? "opacity-100 -translate-x-0"
              : "opacity-0 -translate-x-8 pointer-events-none"
          }`}
          style={{ right: "calc(50% + 13rem)" }}
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Config</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="country">Country</Label>
                  <Select value={country} onValueChange={setCountry}>
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
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger id="year" className="w-full">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="ssnit" className="flex-1">
                  SSNIT Deductions
                </Label>
                <Switch
                  id="ssnit"
                  checked={ssnitEnabled}
                  onCheckedChange={setSsnitEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <main className="w-full max-w-sm mx-auto space-y-4">
          <div className="rounded-md bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 px-3 py-2 text-center">
            <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
              ⚠️ Using {year} tax rates!
            </p>
          </div>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Tax Calculator 🇬🇭</CardTitle>
              <CardDescription>
                Compute your net income, PAYE income tax and SSNIT deduction.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="basic-income">Monthly basic income</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">GH₵</span>
                  <Input
                    id="basic-income"
                    type="text"
                    inputMode="numeric"
                    value={monthlyBasicIncome}
                    onChange={(e) => {
                      const formatted = formatInputValue(e.target.value);
                      setMonthlyBasicIncome(formatted);
                    }}
                    placeholder="0"
                    className="pl-12 text-right text-lg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowances">Monthly allowances*</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">GH₵</span>
                  <Input
                    id="allowances"
                    type="text"
                    inputMode="numeric"
                    value={monthlyAllowances}
                    onChange={(e) => {
                      const formatted = formatInputValue(e.target.value);
                      setMonthlyAllowances(formatted);
                    }}
                    placeholder="0"
                    className="pl-12 text-right text-lg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax-relief">Tax relief</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">GH₵</span>
                  <Input
                    id="tax-relief"
                    type="text"
                    inputMode="numeric"
                    value={taxRelief}
                    onChange={(e) => {
                      const formatted = formatInputValue(e.target.value);
                      setTaxRelief(formatted);
                    }}
                    placeholder="0"
                    className="pl-12 text-right text-lg"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t">
                {hasError ? (
                  <p className="text-sm text-destructive text-center">
                    {(calculationResult as { errorMessage: string }).errorMessage}
                  </p>
                ) : (
                  <>
                    <div className="text-center space-y-1">
                      <p className="text-sm text-muted-foreground">Net Income (take home)</p>
                      <p className="text-lg font-semibold">
                        GH¢{" "}
                        <AnimatedNumber
                          value={result ? formatCurrency(result.netIncome) : "0.00"}
                        />
                      </p>
                    </div>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Income Tax</p>
                        <p className="text-lg font-semibold">
                          GH¢{" "}
                          <AnimatedNumber
                            value={result ? formatCurrency(result.incomeTax) : "0.00"}
                          />
                        </p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-sm text-muted-foreground">SSNIT</p>
                        <p className="text-lg font-semibold">
                          GH¢{" "}
                          <AnimatedNumber
                            value={result && ssnitEnabled ? formatCurrency(result.ssnitBreakdown.totalContribution) : "0.00"}
                          />
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <Dialog open={showMobileConfig} onOpenChange={setShowMobileConfig}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 lg:hidden">
                  Show Config
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Config</DialogTitle>
                  <DialogDescription>
                    Configure tax calculation settings
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mobile-country">Country</Label>
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger id="mobile-country" className="w-full">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ghana">Ghana</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile-year">Year</Label>
                      <Select value={year} onValueChange={setYear}>
                        <SelectTrigger id="mobile-year" className="w-full">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2022">2022</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="mobile-ssnit" className="flex-1">
                      SSNIT Deductions
                    </Label>
                    <Switch
                      id="mobile-ssnit"
                      checked={ssnitEnabled}
                      onCheckedChange={setSsnitEnabled}
            />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              className="hidden lg:flex flex-1"
              onClick={() => setShowConfig(!showConfig)}
            >
              {showConfig ? "Hide Config" : "Show Config"}
            </Button>
            <Dialog
              open={showMobileBreakdown}
              onOpenChange={setShowMobileBreakdown}
            >
              <DialogTrigger asChild>
                <Button className="flex-1 lg:hidden">
                  Show tax breakdown
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tax Breakdown</DialogTitle>
                  <DialogDescription>
                    Detailed breakdown of tax brackets and rates
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Accordion type="single" collapsible className="w-full" defaultValue="income-tax">
                    {/* Income Tax Breakdown */}
                    <AccordionItem value="income-tax">
                      <AccordionTrigger className="text-sm font-semibold">
                        Income Tax Breakdown
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 px-2 font-semibold">
                                  Taxable amount
                                </th>
                                <th className="text-center py-2 px-2 font-semibold">
                                  Rate
                                </th>
                                <th className="text-right py-2 px-2 font-semibold">
                                  Tax due (GH¢)
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {result && result.computationBreakdown.length > 0 ? (
                                <>
                                  {result.computationBreakdown
                                    .filter(
                                      (breakdown) =>
                                        parseFloat(breakdown.amountTaxed) > 0
                                    )
                                    .map((breakdown, index) => {
                                      const isFirst = index === 0;
                                      const amountLabel = isFirst
                                        ? `First GH¢ ${formatAmount(
                                            breakdown.amountTaxed
                                          )}`
                                        : `Next GH¢ ${formatAmount(
                                            breakdown.amountTaxed
                                          )}`;
                                      return (
                                        <tr key={index} className="border-b">
                                          <td className="py-2 px-2">{amountLabel}</td>
                                          <td className="text-center py-2 px-2">
                                            {breakdown.taxRate}%
                                          </td>
                                          <td className="text-right py-2 px-2">
                                            {formatCurrency(breakdown.taxAmount)}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  {result.incomeTax !== "0.00" && (
                                    <tr className="border-t-2 font-semibold">
                                      <td className="py-2 px-2">Total</td>
                                      <td className="text-center py-2 px-2"></td>
                                      <td className="text-right py-2 px-2">
                                        GH¢ {formatCurrency(result.incomeTax)}
                                      </td>
                                    </tr>
                                  )}
                                </>
                              ) : (
                                <tr>
                                  <td
                                    colSpan={3}
                                    className="py-4 text-center text-muted-foreground text-sm"
                                  >
                                    Enter values to see breakdown
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4 italic">
                          * Allowances are also taxed
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    {/* SSNIT Breakdown */}
                    {result && ssnitEnabled && (
                      <AccordionItem value="ssnit">
                        <AccordionTrigger className="text-sm font-semibold">
                          SSNIT Breakdown
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-2 px-2 font-semibold">Contribution Type</th>
                                  <th className="text-center py-2 px-2 font-semibold">Rate</th>
                                  <th className="text-right py-2 px-2 font-semibold">Amount (GH¢)</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b">
                                  <td className="py-2 px-2">Employee Contribution</td>
                                  <td className="text-center py-2 px-2">{result.ssnitBreakdown.employeeRate}%</td>
                                  <td className="text-right py-2 px-2">
                                    {formatCurrency(result.ssnitBreakdown.employeeContribution)}
                                  </td>
                                </tr>
                                <tr className="border-b">
                                  <td className="py-2 px-2">Employer Contribution*</td>
                                  <td className="text-center py-2 px-2">{result.ssnitBreakdown.employerRate}%</td>
                                  <td className="text-right py-2 px-2">
                                    {formatCurrency(result.ssnitBreakdown.employerContribution)}
                                  </td>
                                </tr>
                                <tr className="border-t-2 font-semibold">
                                  <td className="py-2 px-2">Total SSNIT Contribution</td>
                                  <td className="text-center py-2 px-2">{result.ssnitBreakdown.employeeRate + result.ssnitBreakdown.employerRate}%</td>
                                  <td className="text-right py-2 px-2">
                                    GH¢ {formatCurrency(result.ssnitBreakdown.totalContribution)}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <p className="text-xs text-muted-foreground mt-3 italic">
                            * Employer contribution is not deducted from your salary
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Base amount: GH¢ {formatCurrency(result.ssnitBreakdown.baseAmount)}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              className="hidden lg:flex flex-1"
              onClick={() => setShowBreakdown(!showBreakdown)}
            >
              {showBreakdown ? "Hide tax breakdown" : "Show tax breakdown"}
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Last updated: February 1st, 2024
          </p>
          <footer className="pt-8 pb-4 space-y-3 text-center">
            <p className="text-xs text-muted-foreground">
              Disclaimer: We do our best to ensure the accuracy of this tool but we cannot be held responsible for any errors.
            </p>
            <p className="text-xs text-muted-foreground">
              Send feedback and suggestions to{" "}
              <a
                href="mailto:tax.calculator@thinkledger.pro"
                className="text-primary hover:underline"
              >
                tax.calculator@thinkledger.pro
              </a>
            </p>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Share with others</p>
              <div className="flex justify-center items-center gap-4">
                <a
                  href="https://twitter.com/intent/tweet?url=https://taxcalculator.com&text=Check%20out%20this%20Ghana%20Tax%20Calculator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="https://www.facebook.com/sharer/sharer.php?u=https://taxcalculator.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="w-5 h-5" />
          </a>
          <a
                  href="https://www.linkedin.com/sharing/share-offsite/?url=https://taxcalculator.com"
            target="_blank"
            rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: "Ghana Tax Calculator",
                        text: "Check out this Ghana Tax Calculator",
                        url: window.location.href,
                      });
                    }
                  }}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Share via native share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </footer>
        </main>
        <div
          className={`hidden lg:block absolute top-16 w-full max-w-sm transition-all duration-500 ease-in-out ${
            showBreakdown
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-8 pointer-events-none"
          }`}
          style={{ left: "calc(50% + 13rem)" }}
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Tax Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full" defaultValue="income-tax">
                {/* Income Tax Breakdown */}
                <AccordionItem value="income-tax">
                  <AccordionTrigger className="text-sm font-semibold">
                    Income Tax Breakdown
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-2 font-semibold">Taxable amount</th>
                            <th className="text-center py-2 px-2 font-semibold">Rate</th>
                            <th className="text-right py-2 px-2 font-semibold">Tax due (GH¢)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result && result.computationBreakdown.length > 0 ? (
                            <>
                              {result.computationBreakdown
                                .filter(
                                  (breakdown) => parseFloat(breakdown.amountTaxed) > 0
                                )
                                .map((breakdown, index) => {
                                  const isFirst = index === 0;
                                  const amountLabel = isFirst
                                    ? `First GH¢ ${formatAmount(breakdown.amountTaxed)}`
                                    : `Next GH¢ ${formatAmount(breakdown.amountTaxed)}`;
                                  return (
                                    <tr key={index} className="border-b">
                                      <td className="py-2 px-2">{amountLabel}</td>
                                      <td className="text-center py-2 px-2">
                                        {breakdown.taxRate}%
                                      </td>
                                      <td className="text-right py-2 px-2">
                                        {formatCurrency(breakdown.taxAmount)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              {result.incomeTax !== "0.00" && (
                                <tr className="border-t-2 font-semibold">
                                  <td className="py-2 px-2">Total</td>
                                  <td className="text-center py-2 px-2"></td>
                                  <td className="text-right py-2 px-2">
                                    GH¢ {formatCurrency(result.incomeTax)}
                                  </td>
                                </tr>
                              )}
                            </>
                          ) : (
                            <tr>
                              <td
                                colSpan={3}
                                className="py-4 text-center text-muted-foreground text-sm"
                              >
                                Enter values to see breakdown
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 italic">
                      * Allowances are also taxed
                    </p>
                  </AccordionContent>
                </AccordionItem>

                {/* SSNIT Breakdown */}
                {result && ssnitEnabled && (
                  <AccordionItem value="ssnit">
                    <AccordionTrigger className="text-sm font-semibold">
                      SSNIT Breakdown
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-2 font-semibold">Contribution Type</th>
                              <th className="text-center py-2 px-2 font-semibold">Rate</th>
                              <th className="text-right py-2 px-2 font-semibold">Amount (GH¢)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="py-2 px-2">Employee Contribution</td>
                              <td className="text-center py-2 px-2">{result.ssnitBreakdown.employeeRate}%</td>
                              <td className="text-right py-2 px-2">
                                {formatCurrency(result.ssnitBreakdown.employeeContribution)}
                              </td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2 px-2">Employer Contribution*</td>
                              <td className="text-center py-2 px-2">{result.ssnitBreakdown.employerRate}%</td>
                              <td className="text-right py-2 px-2">
                                {formatCurrency(result.ssnitBreakdown.employerContribution)}
                              </td>
                            </tr>
                            <tr className="border-t-2 font-semibold">
                              <td className="py-2 px-2">Total SSNIT Contribution</td>
                              <td className="text-center py-2 px-2">{result.ssnitBreakdown.employeeRate + result.ssnitBreakdown.employerRate}%</td>
                              <td className="text-right py-2 px-2">
                                GH¢ {formatCurrency(result.ssnitBreakdown.totalContribution)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3 italic">
                        * Employer contribution is not deducted from your salary
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Base amount: GH¢ {formatCurrency(result.ssnitBreakdown.baseAmount)}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

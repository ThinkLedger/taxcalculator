"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Twitter, Facebook, Linkedin, Share2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { calculate, type TaxCalculationResult } from "@/lib/calculator";
import type { VATCalculationResult } from "@/lib/vat-calculator";
import { parseInputValue } from "./_components/utils";
import { ConfigCard } from "./_components/config-card";
import { PAYECalculator } from "./_components/tax/paye-calculator";
import { VATCalculator } from "./_components/vat/vat-calculator";
import { TaxBreakdownCard } from "./_components/tax/tax-breakdown-card";
import { VATBreakdownCard } from "./_components/vat/vat-breakdown-card";
import { MobileConfigDialog } from "./_components/mobile-config-dialog";
import { MobileBreakdownDialog } from "./_components/tax/mobile-breakdown-dialog";
import { MobileVATBreakdownDialog } from "./_components/vat/mobile-vat-breakdown-dialog";

export default function Home() {
  const [monthlyBasicIncome, setMonthlyBasicIncome] = useState("");
  const [monthlyAllowances, setMonthlyAllowances] = useState("");
  const [taxRelief, setTaxRelief] = useState("");
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showMobileConfig, setShowMobileConfig] = useState(false);
  const [showMobileBreakdown, setShowMobileBreakdown] = useState(false);
  const [showMobileVATBreakdown, setShowMobileVATBreakdown] = useState(false);
  const [calculatorType, setCalculatorType] = useState("PAYE");
  const [country, setCountry] = useState("Ghana");
  const [year, setYear] = useState("2024");
  const [ssnitEnabled, setSsnitEnabled] = useState(true);
  const [vatResult, setVATResult] = useState<VATCalculationResult | null>(null);

  // Auto-set year to 2026 when VAT is selected
  const handleCalculatorTypeChange = (value: string) => {
    setCalculatorType(value);
    if (value === "VAT") {
      setYear("2026");
    } else if (value === "PAYE" && year === "2026") {
      setYear("2024");
    }
  };

  const calculationResult = useMemo(() => {
    if (calculatorType !== "PAYE") return null;
    const parsedIncome = parseInputValue(monthlyBasicIncome);
    const parsedAllowances = parseInputValue(monthlyAllowances);
    const parsedRelief = parseInputValue(taxRelief);
    return calculate(parsedIncome, parsedAllowances, parsedRelief, ssnitEnabled, year);
  }, [monthlyBasicIncome, monthlyAllowances, taxRelief, ssnitEnabled, year, calculatorType]);

  const hasError = calculationResult && "errorMessage" in calculationResult;
  const result: TaxCalculationResult | null = 
    calculationResult && !hasError
      ? (calculationResult as TaxCalculationResult)
      : null;
  const errorMessage = hasError && calculationResult 
    ? (calculationResult as { errorMessage: string }).errorMessage 
    : undefined;

  return (
    <div className="flex min-h-screen items-start justify-center bg-background p-4 pt-8">
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="fixed bottom-4 left-4 z-10 animate-pulse">
        <a
          href="https://thinkledger.pro"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <p className="font-medium">ThinkLedger</p>
          <p className="text-[10px]">Accounting | CRM | Payroll</p>
          <p className="text-[10px] italic">Coming soon</p>
        </a>
      </div>
      <div className="relative w-full max-w-6xl">
        {/* Desktop Config Card */}
        <div
          className={`hidden lg:block absolute top-16 w-full max-w-sm transition-all duration-500 ease-in-out ${
            showConfig
              ? "opacity-100 -translate-x-0"
              : "opacity-0 -translate-x-8 pointer-events-none"
          }`}
          style={{ right: "calc(50% + 13rem)" }}
        >
          <ConfigCard
            calculatorType={calculatorType}
            onCalculatorTypeChange={handleCalculatorTypeChange}
            country={country}
            onCountryChange={setCountry}
            year={year}
            onYearChange={setYear}
            ssnitEnabled={ssnitEnabled}
            onSsnitChange={setSsnitEnabled}
          />
        </div>

        <main className="w-full max-w-sm mx-auto space-y-4">
          {calculatorType === "VAT" ? (
            <div className="rounded-md bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 px-3 py-2 text-center">
              <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                ⚠️ Using 2026 VAT rates!
              </p>
            </div>
          ) : (
            <div className="rounded-md bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 px-3 py-2 text-center">
              <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                ⚠️ Using {year} tax rates!
              </p>
            </div>
          )}

          {/* Calculator Component */}
          {calculatorType === "PAYE" ? (
            <PAYECalculator
              monthlyBasicIncome={monthlyBasicIncome}
              onMonthlyBasicIncomeChange={setMonthlyBasicIncome}
              monthlyAllowances={monthlyAllowances}
              onMonthlyAllowancesChange={setMonthlyAllowances}
              taxRelief={taxRelief}
              onTaxReliefChange={setTaxRelief}
              result={result}
              hasError={!!hasError}
              errorMessage={errorMessage}
              ssnitEnabled={ssnitEnabled}
            />
          ) : (
            <VATCalculator year={year} onResultChange={setVATResult} />
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <MobileConfigDialog
              open={showMobileConfig}
              onOpenChange={setShowMobileConfig}
              calculatorType={calculatorType}
              onCalculatorTypeChange={handleCalculatorTypeChange}
              country={country}
              onCountryChange={setCountry}
              year={year}
              onYearChange={setYear}
              ssnitEnabled={ssnitEnabled}
              onSsnitChange={setSsnitEnabled}
            />
            <Button
              variant="outline"
              className="hidden lg:flex flex-1"
              onClick={() => setShowConfig(!showConfig)}
            >
              {showConfig ? "Hide Config" : "Show Config"}
            </Button>
            {calculatorType === "PAYE" && (
              <>
                <MobileBreakdownDialog
                  open={showMobileBreakdown}
                  onOpenChange={setShowMobileBreakdown}
                  result={result}
                  ssnitEnabled={ssnitEnabled}
                />
                <Button
                  className="hidden lg:flex flex-1"
                  onClick={() => setShowBreakdown(!showBreakdown)}
                >
                  {showBreakdown ? "Hide tax breakdown" : "Show tax breakdown"}
                </Button>
              </>
            )}
            {calculatorType === "VAT" && (
              <>
                <MobileVATBreakdownDialog
                  open={showMobileVATBreakdown}
                  onOpenChange={setShowMobileVATBreakdown}
                  result={vatResult}
                />
                <Button
                  className="hidden lg:flex flex-1"
                  onClick={() => setShowBreakdown(!showBreakdown)}
                >
                  {showBreakdown ? "Hide VAT breakdown" : "Show VAT breakdown"}
                </Button>
              </>
            )}
          </div>

          {calculatorType === "PAYE" && (
            <p className="text-center text-xs text-muted-foreground">
              Last updated: February 1st, 2024
            </p>
          )}

          {/* Footer */}
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

        {/* Desktop Breakdown Card */}
        {calculatorType === "PAYE" && (
          <div
            className={`hidden lg:block absolute top-16 w-full max-w-sm transition-all duration-500 ease-in-out ${
              showBreakdown
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8 pointer-events-none"
            }`}
            style={{ left: "calc(50% + 13rem)" }}
          >
            <TaxBreakdownCard result={result} ssnitEnabled={ssnitEnabled} />
          </div>
        )}
        {calculatorType === "VAT" && (
          <div
            className={`hidden lg:block absolute top-16 w-full max-w-md transition-all duration-500 ease-in-out ${
              showBreakdown
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8 pointer-events-none"
            }`}
            style={{ left: "calc(50% + 13rem)" }}
          >
            <VATBreakdownCard result={vatResult} />
          </div>
        )}
      </div>
    </div>
  );
}

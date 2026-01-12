"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Twitter, Facebook, Linkedin, Share2, Download, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { calculate, type TaxCalculationResult } from "@/lib/calculator";
import type { VATCalculationResult } from "@/lib/vat-calculator";
import { parseInputValue } from "./_components/utils";
import {
  exportPAYEToPDF,
  exportVATToPDF,
  exportPAYEToExcel,
  exportVATToExcel,
  exportPAYEToCSV,
  exportVATToCSV,
  type ExportFormat,
} from "@/lib/export";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [vatInputs, setVATInputs] = useState<{ mode: "exclusive" | "inclusive"; amount: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

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

  // Check if values are entered for PAYE
  const hasPAYEValues = useMemo(() => {
    return monthlyBasicIncome.trim() !== "" && result !== null;
  }, [monthlyBasicIncome, result]);

  // Check if values are entered for VAT
  const hasVATValues = useMemo(() => {
    return vatInputs !== null && vatInputs.amount.trim() !== "" && vatResult !== null;
  }, [vatInputs, vatResult]);

  // Export handlers
  const handleExportPAYE = async (format: ExportFormat) => {
    if (!result || isExporting) return;
    setIsExporting(true);
    try {
      // Use setTimeout to allow UI to update with spinner
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          const exportData = {
            inputs: {
              monthlyBasicIncome,
              monthlyAllowances,
              taxRelief,
              year,
              ssnitEnabled,
            },
            result,
          };

          switch (format) {
            case "pdf":
              exportPAYEToPDF(exportData);
              break;
            case "excel":
              exportPAYEToExcel(exportData);
              break;
            case "csv":
              exportPAYEToCSV(exportData);
              break;
          }
          resolve();
        }, 100);
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportVAT = async (format: ExportFormat) => {
    if (!vatResult || !vatInputs || isExporting) return;
    setIsExporting(true);
    try {
      // Use setTimeout to allow UI to update with spinner
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          const exportData = {
            inputs: {
              mode: vatInputs.mode,
              amount: vatInputs.amount,
              year,
            },
            result: vatResult,
          };

          switch (format) {
            case "pdf":
              exportVATToPDF(exportData);
              break;
            case "excel":
              exportVATToExcel(exportData);
              break;
            case "csv":
              exportVATToCSV(exportData);
              break;
          }
          resolve();
        }, 100);
      });
    } finally {
      setIsExporting(false);
    }
  };

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
            <VATCalculator 
              year={year} 
              onResultChange={setVATResult}
              onInputsChange={setVATInputs}
            />
          )}

          {/* Action Buttons */}
          <div className="flex flex-col lg:flex-row gap-2">
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
              className="hidden lg:flex flex-1 min-w-0"
              onClick={() => setShowConfig(!showConfig)}
            >
              Settings
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
                  className="hidden lg:flex flex-1 min-w-0"
                  onClick={() => setShowBreakdown(!showBreakdown)}
                >
                  Tax Breakdown
                </Button>
                <div
                  className={`hidden lg:block transition-all duration-500 ease-in-out ${
                    hasPAYEValues
                      ? "opacity-100 translate-y-0 flex-1 min-w-0"
                      : "opacity-0 -translate-y-2 w-0 overflow-hidden pointer-events-none"
                  }`}
                >
                  {hasPAYEValues && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full px-2 text-xs sm:text-sm"
                          disabled={isExporting || !result}
                        >
                          {isExporting ? (
                            <span className="flex items-center justify-center gap-1.5">
                              <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                              <span className="truncate">Exporting...</span>
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-1.5">
                              <Download className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">Export</span>
                            </span>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleExportPAYE("pdf")}
                          disabled={isExporting}
                        >
                          Export as PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleExportPAYE("excel")}
                          disabled={isExporting}
                        >
                          Export as Excel
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleExportPAYE("csv")}
                          disabled={isExporting}
                        >
                          Export as CSV
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </>
            )}
            {/* Mobile Export Button for PAYE */}
            {calculatorType === "PAYE" && hasPAYEValues && (
              <div className="lg:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full px-2 text-xs sm:text-sm"
                      disabled={isExporting || !result}
                    >
                      {isExporting ? (
                        <span className="flex items-center justify-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                          <span className="truncate">Exporting...</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1.5">
                          <Download className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">Export</span>
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleExportPAYE("pdf")}
                      disabled={isExporting}
                    >
                      Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExportPAYE("excel")}
                      disabled={isExporting}
                    >
                      Export as Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExportPAYE("csv")}
                      disabled={isExporting}
                    >
                      Export as CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            {calculatorType === "VAT" && (
              <>
                <MobileVATBreakdownDialog
                  open={showMobileVATBreakdown}
                  onOpenChange={setShowMobileVATBreakdown}
                  result={vatResult}
                />
                <Button
                  className="hidden lg:flex flex-1 min-w-0"
                  onClick={() => setShowBreakdown(!showBreakdown)}
                >
                  VAT Breakdown
                </Button>
                <div
                  className={`hidden lg:block transition-all duration-500 ease-in-out ${
                    hasVATValues
                      ? "opacity-100 translate-y-0 flex-1 min-w-0"
                      : "opacity-0 -translate-y-2 w-0 overflow-hidden pointer-events-none"
                  }`}
                >
                  {hasVATValues && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full px-2 text-xs sm:text-sm"
                          disabled={isExporting || !vatResult || !vatInputs}
                        >
                          {isExporting ? (
                            <span className="flex items-center justify-center gap-1.5">
                              <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                              <span className="truncate">Exporting...</span>
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-1.5">
                              <Download className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">Export</span>
                            </span>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleExportVAT("pdf")}
                          disabled={isExporting}
                        >
                          Export as PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleExportVAT("excel")}
                          disabled={isExporting}
                        >
                          Export as Excel
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleExportVAT("csv")}
                          disabled={isExporting}
                        >
                          Export as CSV
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </>
            )}
            {/* Mobile Export Button for VAT */}
            {calculatorType === "VAT" && hasVATValues && (
              <div className="lg:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full px-2 text-xs sm:text-sm"
                      disabled={isExporting || !vatResult || !vatInputs}
                    >
                      {isExporting ? (
                        <span className="flex items-center justify-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                          <span className="truncate">Exporting...</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1.5">
                          <Download className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">Export</span>
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleExportVAT("pdf")}
                      disabled={isExporting}
                    >
                      Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExportVAT("excel")}
                      disabled={isExporting}
                    >
                      Export as Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExportVAT("csv")}
                      disabled={isExporting}
                    >
                      Export as CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {calculatorType === "PAYE" && (
            <p className="text-center text-xs text-muted-foreground">
              Last updated: February 1st, 2024
            </p>
          )}
          {calculatorType === "VAT" && (
            <p className="text-center text-xs text-muted-foreground">
              Last updated: 1st January 2026
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

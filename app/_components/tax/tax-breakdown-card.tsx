"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { TaxCalculationResult } from "@/lib/calculator";
import { formatCurrency, formatAmount } from "../utils";

interface TaxBreakdownCardProps {
  result: TaxCalculationResult | null;
  ssnitEnabled: boolean;
}

export function TaxBreakdownCard({ result, ssnitEnabled }: TaxBreakdownCardProps) {
  return (
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
                      <tr className="border-t">
                        <td className="py-2 px-2">Tier 1 Payable (13.5/18.5)</td>
                        <td className="text-center py-2 px-2">13.5%</td>
                        <td className="text-right py-2 px-2">
                          GH¢ {formatCurrency(result.ssnitBreakdown.tier1Payable)}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-2">Tier 2 Payable (Remaining)</td>
                        <td className="text-center py-2 px-2">5%</td>
                        <td className="text-right py-2 px-2">
                          GH¢ {formatCurrency(result.ssnitBreakdown.tier2Payable)}
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
  );
}


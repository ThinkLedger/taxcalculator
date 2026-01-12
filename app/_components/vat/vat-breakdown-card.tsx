"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { VATCalculationResult } from "@/lib/vat-calculator";
import { formatCurrency } from "../utils";
import { VAT_RATE, NHIL_RATE, GETFUND_RATE, TOTAL_TAX_RATE } from "@/lib/vat-calculator";

interface VATBreakdownCardProps {
  result: VATCalculationResult | null;
}

export function VATBreakdownCard({ result }: VATBreakdownCardProps) {
  if (!result) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">VAT Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Enter values to see breakdown
          </p>
        </CardContent>
      </Card>
    );
  }

  const breakdownItems = [
    {
      item: result.mode === "exclusive" ? "Taxable value (input)" : "Taxable value (derived)",
      rate: "—",
      base: result.mode === "exclusive" ? "Input taxable amount" : "Derived from final amount",
      amount: result.taxableValue,
      notes: "Used as base for NHIL, GETFund, VAT",
    },
    {
      item: "NHIL",
      rate: `${NHIL_RATE}%`,
      base: "Taxable value",
      amount: result.nhil,
      notes: `0.025 × taxable value`,
    },
    {
      item: "GETFund Levy",
      rate: `${GETFUND_RATE}%`,
      base: "Taxable value",
      amount: result.getfund,
      notes: `0.025 × taxable value`,
    },
    {
      item: "VAT",
      rate: `${VAT_RATE}%`,
      base: "Taxable value",
      amount: result.vat,
      notes: `0.15 × taxable value`,
    },
    {
      item: "Final amount (tax-inclusive)",
      rate: "—",
      base: "Taxable value + levies",
      amount: result.finalCost,
      notes: "Taxable + NHIL + GETFund + VAT",
    },
  ];

  const ratesUsed = [
    {
      levy: "NHIL",
      rate: `${NHIL_RATE}%`,
      appliedOn: "Taxable value",
      formula: "0.025 × taxable value",
      effect: "Adds 2.5% of taxable value",
    },
    {
      levy: "GETFund Levy",
      rate: `${GETFUND_RATE}%`,
      appliedOn: "Taxable value",
      formula: "0.025 × taxable value",
      effect: "Adds 2.5% of taxable value",
    },
    {
      levy: "VAT",
      rate: `${VAT_RATE}%`,
      appliedOn: "Taxable value",
      formula: "0.15 × taxable value",
      effect: "Adds 15% of taxable value",
    },
    {
      levy: "Total add-on (NHIL + GETFund + VAT)",
      rate: `${TOTAL_TAX_RATE}% of taxable value`,
      appliedOn: "—",
      formula: "—",
      effect: "—",
    },
  ];

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">VAT Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full" defaultValue="breakdown">
          <AccordionItem value="breakdown">
            <AccordionTrigger className="text-sm font-semibold">
              Calculation Breakdown
            </AccordionTrigger>
            <AccordionContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-semibold">Item</th>
                      <th className="text-center py-2 px-2 font-semibold">Rate</th>
                      <th className="text-left py-2 px-2 font-semibold">Base</th>
                      <th className="text-right py-2 px-2 font-semibold">Amount (GH₵)</th>
                      <th className="text-left py-2 px-2 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {breakdownItems.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-2">{item.item}</td>
                        <td className="text-center py-2 px-2">{item.rate}</td>
                        <td className="py-2 px-2">{item.base}</td>
                        <td className="text-right py-2 px-2">
                          GH₵ {formatCurrency(item.amount)}
                        </td>
                        <td className="py-2 px-2 text-xs text-muted-foreground">{item.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="threshold">
            <AccordionTrigger className="text-sm font-semibold">
              VAT Registration Threshold
            </AccordionTrigger>
            <AccordionContent>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Service Providers: No threshold, unless directed by the GRA–Commissioner-General.</li>
                <li>Manufacturers: Register if taxable supplies exceed GHS 750,000 in any 12-month period.</li>
                <li>Retailers: Register if taxable supplies exceed GHS 750,000 in any 12-month period.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="rates">
            <AccordionTrigger className="text-sm font-semibold">Rates Used</AccordionTrigger>
            <AccordionContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-semibold">Levy</th>
                      <th className="text-center py-2 px-2 font-semibold">Rate</th>
                      <th className="text-left py-2 px-2 font-semibold">Applied on</th>
                      <th className="text-left py-2 px-2 font-semibold">Formula</th>
                      <th className="text-left py-2 px-2 font-semibold">Effect</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratesUsed.map((rate, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-2">{rate.levy}</td>
                        <td className="text-center py-2 px-2">{rate.rate}</td>
                        <td className="py-2 px-2">{rate.appliedOn}</td>
                        <td className="py-2 px-2 text-xs text-muted-foreground">{rate.formula}</td>
                        <td className="py-2 px-2 text-xs text-muted-foreground">{rate.effect}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}


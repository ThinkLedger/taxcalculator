import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import currencySymbol from "currency-symbol";
import * as XLSX from "xlsx";
import type { TaxCalculationResult } from "./calculator";
import type { VATCalculationResult } from "./vat-calculator";

// Parse formatted input back to number string (remove commas)
function parseInputValue(value: string): string {
  return value.replace(/,/g, "");
}

export type ExportFormat = "pdf" | "excel" | "csv";

// Get Ghana Cedis symbol and decode HTML entity
function getCurrencySymbol(): string {
  try {
    // Try multiple ways to get the symbol
    const htmlEntity = currencySymbol.symbol("Ghana") || currencySymbol.symbol("GHS") || currencySymbol.symbol("GHC");
    
    if (!htmlEntity) return "GH¢";
    
    // Decode HTML entity (e.g., &#162; -> ¢)
    const decoded = htmlEntity.replace(/&#(\d+);/g, (_match, dec) => {
      return String.fromCharCode(parseInt(dec, 10));
    });
    
    // Format as "GH" + symbol for better readability
    // The package returns cent symbol (¢) for Ghana, which is acceptable
    return `GH${decoded}`;
  } catch (error) {
    return "GH¢"; // Fallback to GH¢ if anything fails
  }
}

// Format currency with 2 decimal places
function formatCurrency(value: string): string {
  if (!value || value === "0.00") return "0.00";
  const num = parseFloat(value);
  if (isNaN(num)) return "0.00";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Format amount without decimals
function formatAmount(value: string): string {
  if (!value || value === "0") return "0";
  const num = parseFloat(value);
  if (isNaN(num)) return "0";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// Get currency symbol once
const CURRENCY_SYMBOL = getCurrencySymbol();

interface PAYEExportData {
  inputs: {
    monthlyBasicIncome: string;
    monthlyAllowances: string;
    taxRelief: string;
    year: string;
    ssnitEnabled: boolean;
  };
  result: TaxCalculationResult;
}

interface VATExportData {
  inputs: {
    mode: "exclusive" | "inclusive";
    amount: string;
    year: string;
  };
  result: VATCalculationResult;
}

export function exportPAYEToPDF(data: PAYEExportData): void {
  const doc = new jsPDF();
  const { inputs, result } = data;

  // Title
  doc.setFontSize(18);
  doc.text("Ghana Tax Calculator - PAYE Report", 14, 20);

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleDateString("en-GB", { 
    day: "numeric", 
    month: "long", 
    year: "numeric" 
  })}`, 14, 28);

  doc.setTextColor(0, 0, 0);
  let yPos = 40;

  // Inputs Section
  doc.setFontSize(14);
  doc.text("Input Values", 14, yPos);
  yPos += 8;

  doc.setFontSize(10);
  const inputsData = [
    ["Monthly Basic Income", `${CURRENCY_SYMBOL} ${formatCurrency(parseInputValue(inputs.monthlyBasicIncome || "0"))}`],
    ["Monthly Allowances", `${CURRENCY_SYMBOL} ${formatCurrency(parseInputValue(inputs.monthlyAllowances || "0"))}`],
    ["Tax Relief", `${CURRENCY_SYMBOL} ${formatCurrency(parseInputValue(inputs.taxRelief || "0"))}`],
    ["Year", inputs.year],
    ["SSNIT Enabled", inputs.ssnitEnabled ? "Yes" : "No"],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["Field", "Value"]],
    body: inputsData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;

  // Results Summary
  doc.setFontSize(14);
  doc.text("Results Summary", 14, yPos);
  yPos += 8;

  doc.setFontSize(10);
  const summaryData = [
    ["Net Income (Take Home)", `${CURRENCY_SYMBOL} ${formatCurrency(result.netIncome)}`],
    ["Income Tax", `${CURRENCY_SYMBOL} ${formatCurrency(result.incomeTax)}`],
    ["SSNIT Contribution", `${CURRENCY_SYMBOL} ${formatCurrency(result.ssnitBreakdown.totalContribution)}`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["Item", "Amount"]],
    body: summaryData,
    theme: "striped",
    headStyles: { fillColor: [34, 197, 94] },
    styles: { fontSize: 10, fontStyle: "bold" },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;

  // Income Tax Breakdown
  doc.setFontSize(14);
  doc.text("Income Tax Breakdown", 14, yPos);
  yPos += 8;

  const taxBreakdownData = result.computationBreakdown
    .filter((breakdown) => parseFloat(breakdown.amountTaxed) > 0)
    .map((breakdown, index) => {
      const isFirst = index === 0;
      const amountLabel = isFirst
        ? `First ${CURRENCY_SYMBOL} ${formatAmount(breakdown.amountTaxed)}`
        : `Next ${CURRENCY_SYMBOL} ${formatAmount(breakdown.amountTaxed)}`;
      return [
        amountLabel,
        `${breakdown.taxRate}%`,
        `${CURRENCY_SYMBOL} ${formatCurrency(breakdown.taxAmount)}`,
      ];
    });

  if (result.incomeTax !== "0.00") {
    taxBreakdownData.push(["Total", "", `${CURRENCY_SYMBOL} ${formatCurrency(result.incomeTax)}`]);
  }

  autoTable(doc, {
    startY: yPos,
    head: [["Taxable Amount", "Rate", `Tax Due (${CURRENCY_SYMBOL})`]],
    body: taxBreakdownData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
    footStyles: { fontStyle: "bold" },
  });

  yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;

  // SSNIT Breakdown
  if (inputs.ssnitEnabled) {
    doc.setFontSize(14);
    doc.text("SSNIT Breakdown", 14, yPos);
    yPos += 8;

    const ssnitData = [
      [
        "Employee Contribution",
        `${result.ssnitBreakdown.employeeRate}%`,
        `${CURRENCY_SYMBOL} ${formatCurrency(result.ssnitBreakdown.employeeContribution)}`,
      ],
      [
        "Employer Contribution*",
        `${result.ssnitBreakdown.employerRate}%`,
        `${CURRENCY_SYMBOL} ${formatCurrency(result.ssnitBreakdown.employerContribution)}`,
      ],
      [
        "Total SSNIT Contribution",
        `${result.ssnitBreakdown.employeeRate + result.ssnitBreakdown.employerRate}%`,
        `${CURRENCY_SYMBOL} ${formatCurrency(result.ssnitBreakdown.totalContribution)}`,
      ],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [["Contribution Type", "Rate", `Amount (${CURRENCY_SYMBOL})`]],
      body: ssnitData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
      footStyles: { fontStyle: "bold" },
    });

    yPos = (doc.lastAutoTable?.finalY ?? yPos) + 10;

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "* Employer contribution is not deducted from your salary",
      14,
      yPos
    );
    doc.text(
      `Base amount: ${CURRENCY_SYMBOL} ${formatCurrency(result.ssnitBreakdown.baseAmount)}`,
      14,
      yPos + 5
    );
    yPos += 10;
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Disclaimer: We do our best to ensure the accuracy of this tool but we cannot be held responsible for any errors.",
    14,
    pageHeight - 20
  );
  doc.text(
    "Generated by Ghana Tax Calculator - https://thinkledger.pro",
    14,
    pageHeight - 15
  );
  doc.text(
    "* Allowances are also taxed",
    14,
    pageHeight - 10
  );

  // Save PDF
  const fileName = `PAYE_Tax_Calculation_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}

export function exportVATToPDF(data: VATExportData): void {
  const doc = new jsPDF();
  const { inputs, result } = data;

  // Title
  doc.setFontSize(18);
  doc.text("Ghana VAT Calculator - Report", 14, 20);

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleDateString("en-GB", { 
    day: "numeric", 
    month: "long", 
    year: "numeric" 
  })}`, 14, 28);

  doc.setTextColor(0, 0, 0);
  let yPos = 40;

  // Inputs Section
  doc.setFontSize(14);
  doc.text("Input Values", 14, yPos);
  yPos += 8;

  doc.setFontSize(10);
  const modeLabel = inputs.mode === "exclusive" ? "Exclusive (before taxes)" : "Inclusive (final cost)";
  const inputsData = [
    ["Calculation Mode", modeLabel],
    [
      inputs.mode === "exclusive" ? "Taxable Amount" : "Final Cost",
      `${CURRENCY_SYMBOL} ${formatCurrency(parseInputValue(inputs.amount || "0"))}`,
    ],
    ["Year", inputs.year],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["Field", "Value"]],
    body: inputsData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;

  // Results Summary
  doc.setFontSize(14);
  doc.text("Results Summary", 14, yPos);
  yPos += 8;

  doc.setFontSize(10);
  const summaryData = [
    ["Taxable Value", `${CURRENCY_SYMBOL} ${formatCurrency(result.taxableValue)}`],
    ["NHIL (2.5%)", `${CURRENCY_SYMBOL} ${formatCurrency(result.nhil)}`],
    ["GETFund Levy (2.5%)", `${CURRENCY_SYMBOL} ${formatCurrency(result.getfund)}`],
    ["VAT (15%)", `${CURRENCY_SYMBOL} ${formatCurrency(result.vat)}`],
    ["Final Cost (Incl. Taxes)", `${CURRENCY_SYMBOL} ${formatCurrency(result.finalCost)}`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["Item", "Amount"]],
    body: summaryData,
    theme: "striped",
    headStyles: { fillColor: [34, 197, 94] },
    styles: { fontSize: 10, fontStyle: "bold" },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;

  // Calculation Breakdown
  doc.setFontSize(14);
  doc.text("Calculation Breakdown", 14, yPos);
  yPos += 8;

  const breakdownData = [
    [
      result.mode === "exclusive" ? "Taxable value (input)" : "Taxable value (derived)",
      "—",
      result.mode === "exclusive" ? "Input taxable amount" : "Derived from final amount",
      `${CURRENCY_SYMBOL} ${formatCurrency(result.taxableValue)}`,
      "Used as base for NHIL, GETFund, VAT",
    ],
    [
      "NHIL",
      "2.5%",
      "Taxable value",
      `${CURRENCY_SYMBOL} ${formatCurrency(result.nhil)}`,
      "0.025 × taxable value",
    ],
    [
      "GETFund Levy",
      "2.5%",
      "Taxable value",
      `${CURRENCY_SYMBOL} ${formatCurrency(result.getfund)}`,
      "0.025 × taxable value",
    ],
    [
      "VAT",
      "15%",
      "Taxable value",
      `${CURRENCY_SYMBOL} ${formatCurrency(result.vat)}`,
      "0.15 × taxable value",
    ],
    [
      "Final amount (tax-inclusive)",
      "—",
      "Taxable value + levies",
      `${CURRENCY_SYMBOL} ${formatCurrency(result.finalCost)}`,
      "Taxable + NHIL + GETFund + VAT",
    ],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["Item", "Rate", "Base", `Amount (${CURRENCY_SYMBOL})`, "Notes"]],
    body: breakdownData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
    columnStyles: {
      4: { cellWidth: 50 },
    },
  });

  yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;

  // Rates Used
  doc.setFontSize(14);
  doc.text("Rates Used", 14, yPos);
  yPos += 8;

  const ratesData = [
    ["NHIL", "2.5%", "Taxable value", "0.025 × taxable value", "Adds 2.5% of taxable value"],
    [
      "GETFund Levy",
      "2.5%",
      "Taxable value",
      "0.025 × taxable value",
      "Adds 2.5% of taxable value",
    ],
    ["VAT", "15%", "Taxable value", "0.15 × taxable value", "Adds 15% of taxable value"],
    [
      "Total add-on (NHIL + GETFund + VAT)",
      "20% of taxable value",
      "—",
      "—",
      "—",
    ],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["Levy", "Rate", "Applied on", "Formula", "Effect"]],
    body: ratesData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
    columnStyles: {
      3: { cellWidth: 40 },
      4: { cellWidth: 50 },
    },
  });

  yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;

  // VAT Registration Threshold
  doc.setFontSize(14);
  doc.text("VAT Registration Threshold", 14, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.text("• Service Providers: No threshold, unless directed by the GRA–Commissioner-General.", 14, yPos);
  yPos += 6;
  doc.text("• Manufacturers: Register if taxable supplies exceed GHS 750,000 in any 12-month period.", 14, yPos);
  yPos += 6;
  doc.text("• Retailers: Register if taxable supplies exceed GHS 750,000 in any 12-month period.", 14, yPos);

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Disclaimer: We do our best to ensure the accuracy of this tool but we cannot be held responsible for any errors.",
    14,
    pageHeight - 20
  );
  doc.text(
    "Generated by Ghana Tax Calculator - https://thinkledger.pro",
    14,
    pageHeight - 15
  );

  // Save PDF
  const fileName = `VAT_Calculation_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}

// Excel and CSV export functions for PAYE
export function exportPAYEToExcel(data: PAYEExportData): void {
  const { inputs, result } = data;
  const workbook = XLSX.utils.book_new();

  // Inputs sheet
  const inputsData = [
    ["Field", "Value"],
    ["Monthly Basic Income", `${CURRENCY_SYMBOL} ${formatCurrency(parseInputValue(inputs.monthlyBasicIncome || "0"))}`],
    ["Monthly Allowances", `${CURRENCY_SYMBOL} ${formatCurrency(parseInputValue(inputs.monthlyAllowances || "0"))}`],
    ["Tax Relief", `${CURRENCY_SYMBOL} ${formatCurrency(parseInputValue(inputs.taxRelief || "0"))}`],
    ["Year", inputs.year],
    ["SSNIT Enabled", inputs.ssnitEnabled ? "Yes" : "No"],
  ];
  const inputsSheet = XLSX.utils.aoa_to_sheet(inputsData);
  XLSX.utils.book_append_sheet(workbook, inputsSheet, "Inputs");

  // Results Summary sheet
  const summaryData = [
    ["Item", "Amount"],
    ["Net Income (Take Home)", `${CURRENCY_SYMBOL} ${formatCurrency(result.netIncome)}`],
    ["Income Tax", `${CURRENCY_SYMBOL} ${formatCurrency(result.incomeTax)}`],
    ["SSNIT Contribution", `${CURRENCY_SYMBOL} ${formatCurrency(result.ssnitBreakdown.totalContribution)}`],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // Income Tax Breakdown sheet
  const taxBreakdownData = [
    ["Taxable Amount", "Rate", "Tax Due (GH¢)"],
    ...result.computationBreakdown
      .filter((breakdown) => parseFloat(breakdown.amountTaxed) > 0)
      .map((breakdown, index) => {
        const isFirst = index === 0;
        const amountLabel = isFirst
          ? `First ${CURRENCY_SYMBOL} ${formatAmount(breakdown.amountTaxed)}`
          : `Next ${CURRENCY_SYMBOL} ${formatAmount(breakdown.amountTaxed)}`;
        return [
          amountLabel,
          `${breakdown.taxRate}%`,
          `${CURRENCY_SYMBOL} ${formatCurrency(breakdown.taxAmount)}`,
        ];
      }),
  ];
  if (result.incomeTax !== "0.00") {
    taxBreakdownData.push(["Total", "", `${CURRENCY_SYMBOL} ${formatCurrency(result.incomeTax)}`]);
  }
  const taxSheet = XLSX.utils.aoa_to_sheet(taxBreakdownData);
  XLSX.utils.book_append_sheet(workbook, taxSheet, "Tax Breakdown");

  // SSNIT Breakdown sheet
  if (inputs.ssnitEnabled) {
    const ssnitData = [
      ["Contribution Type", "Rate", "Amount (GH¢)"],
      [
        "Employee Contribution",
        `${result.ssnitBreakdown.employeeRate}%`,
        `${CURRENCY_SYMBOL} ${formatCurrency(result.ssnitBreakdown.employeeContribution)}`,
      ],
      [
        "Employer Contribution*",
        `${result.ssnitBreakdown.employerRate}%`,
        `${CURRENCY_SYMBOL} ${formatCurrency(result.ssnitBreakdown.employerContribution)}`,
      ],
      [
        "Total SSNIT Contribution",
        `${result.ssnitBreakdown.employeeRate + result.ssnitBreakdown.employerRate}%`,
        `${CURRENCY_SYMBOL} ${formatCurrency(result.ssnitBreakdown.totalContribution)}`,
      ],
    ];
    const ssnitSheet = XLSX.utils.aoa_to_sheet(ssnitData);
    XLSX.utils.book_append_sheet(workbook, ssnitSheet, "SSNIT Breakdown");
  }

  const fileName = `PAYE_Tax_Calculation_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportPAYEToCSV(data: PAYEExportData): void {
  const { inputs, result } = data;
  const rows: string[][] = [];

  // Header
  rows.push(["Ghana Tax Calculator - PAYE Report"]);
  rows.push([`Generated on: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`]);
  rows.push([]);

  // Inputs
  rows.push(["Input Values"]);
  rows.push(["Field", "Value"]);
  rows.push(["Monthly Basic Income", `${CURRENCY_SYMBOL} ${formatCurrency(parseInputValue(inputs.monthlyBasicIncome || "0"))}`]);
  rows.push(["Monthly Allowances", `${CURRENCY_SYMBOL} ${formatCurrency(parseInputValue(inputs.monthlyAllowances || "0"))}`]);
  rows.push(["Tax Relief", `${CURRENCY_SYMBOL} ${formatCurrency(parseInputValue(inputs.taxRelief || "0"))}`]);
  rows.push(["Year", inputs.year]);
  rows.push(["SSNIT Enabled", inputs.ssnitEnabled ? "Yes" : "No"]);
  rows.push([]);

  // Results Summary
  rows.push(["Results Summary"]);
  rows.push(["Item", "Amount"]);
  rows.push(["Net Income (Take Home)", `${CURRENCY_SYMBOL} ${formatCurrency(result.netIncome)}`]);
  rows.push(["Income Tax", `${CURRENCY_SYMBOL} ${formatCurrency(result.incomeTax)}`]);
  rows.push(["SSNIT Contribution", `${CURRENCY_SYMBOL} ${formatCurrency(result.ssnitBreakdown.totalContribution)}`]);
  rows.push([]);

  // Income Tax Breakdown
  rows.push(["Income Tax Breakdown"]);
  rows.push(["Taxable Amount", "Rate", "Tax Due (GH¢)"]);
  result.computationBreakdown
    .filter((breakdown) => parseFloat(breakdown.amountTaxed) > 0)
    .forEach((breakdown, index) => {
      const isFirst = index === 0;
      const amountLabel = isFirst
        ? `First ${CURRENCY_SYMBOL} ${formatAmount(breakdown.amountTaxed)}`
        : `Next ${CURRENCY_SYMBOL} ${formatAmount(breakdown.amountTaxed)}`;
      rows.push([
        amountLabel,
        `${breakdown.taxRate}%`,
        `${CURRENCY_SYMBOL} ${formatCurrency(breakdown.taxAmount)}`,
      ]);
    });
  if (result.incomeTax !== "0.00") {
    rows.push(["Total", "", `${CURRENCY_SYMBOL} ${formatCurrency(result.incomeTax)}`]);
  }
  rows.push([]);

  // SSNIT Breakdown
  if (inputs.ssnitEnabled) {
    rows.push(["SSNIT Breakdown"]);
    rows.push(["Contribution Type", "Rate", "Amount (GH¢)"]);
    rows.push([
      "Employee Contribution",
      `${result.ssnitBreakdown.employeeRate}%`,
      `${CURRENCY_SYMBOL} ${formatCurrency(result.ssnitBreakdown.employeeContribution)}`,
    ]);
    rows.push([
      "Employer Contribution*",
      `${result.ssnitBreakdown.employerRate}%`,
      `${CURRENCY_SYMBOL} ${formatCurrency(result.ssnitBreakdown.employerContribution)}`,
    ]);
    rows.push([
      "Total SSNIT Contribution",
      `${result.ssnitBreakdown.employeeRate + result.ssnitBreakdown.employerRate}%`,
      `${CURRENCY_SYMBOL} ${formatCurrency(result.ssnitBreakdown.totalContribution)}`,
    ]);
  }

  // Convert to CSV
  const csvContent = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `PAYE_Tax_Calculation_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Excel and CSV export functions for VAT
export function exportVATToExcel(data: VATExportData): void {
  const { inputs, result } = data;
  const workbook = XLSX.utils.book_new();

  // Inputs sheet
  const modeLabel = inputs.mode === "exclusive" ? "Exclusive (before taxes)" : "Inclusive (final cost)";
  const inputsData = [
    ["Field", "Value"],
    ["Calculation Mode", modeLabel],
    [
      inputs.mode === "exclusive" ? "Taxable Amount" : "Final Cost",
      `${CURRENCY_SYMBOL} ${formatCurrency(parseInputValue(inputs.amount || "0"))}`,
    ],
    ["Year", inputs.year],
  ];
  const inputsSheet = XLSX.utils.aoa_to_sheet(inputsData);
  XLSX.utils.book_append_sheet(workbook, inputsSheet, "Inputs");

  // Results Summary sheet
  const summaryData = [
    ["Item", "Amount"],
    ["Taxable Value", `${CURRENCY_SYMBOL} ${formatCurrency(result.taxableValue)}`],
    ["NHIL (2.5%)", `${CURRENCY_SYMBOL} ${formatCurrency(result.nhil)}`],
    ["GETFund Levy (2.5%)", `${CURRENCY_SYMBOL} ${formatCurrency(result.getfund)}`],
    ["VAT (15%)", `${CURRENCY_SYMBOL} ${formatCurrency(result.vat)}`],
    ["Final Cost (Incl. Taxes)", `${CURRENCY_SYMBOL} ${formatCurrency(result.finalCost)}`],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // Calculation Breakdown sheet
  const breakdownData = [
    ["Item", "Rate", "Base", "Amount (GH¢)", "Notes"],
    [
      result.mode === "exclusive" ? "Taxable value (input)" : "Taxable value (derived)",
      "—",
      result.mode === "exclusive" ? "Input taxable amount" : "Derived from final amount",
      `${CURRENCY_SYMBOL} ${formatCurrency(result.taxableValue)}`,
      "Used as base for NHIL, GETFund, VAT",
    ],
    [
      "NHIL",
      "2.5%",
      "Taxable value",
      `${CURRENCY_SYMBOL} ${formatCurrency(result.nhil)}`,
      "0.025 × taxable value",
    ],
    [
      "GETFund Levy",
      "2.5%",
      "Taxable value",
      `${CURRENCY_SYMBOL} ${formatCurrency(result.getfund)}`,
      "0.025 × taxable value",
    ],
    [
      "VAT",
      "15%",
      "Taxable value",
      `${CURRENCY_SYMBOL} ${formatCurrency(result.vat)}`,
      "0.15 × taxable value",
    ],
    [
      "Final amount (tax-inclusive)",
      "—",
      "Taxable value + levies",
      `${CURRENCY_SYMBOL} ${formatCurrency(result.finalCost)}`,
      "Taxable + NHIL + GETFund + VAT",
    ],
  ];
  const breakdownSheet = XLSX.utils.aoa_to_sheet(breakdownData);
  XLSX.utils.book_append_sheet(workbook, breakdownSheet, "Breakdown");

  // Rates Used sheet
  const ratesData = [
    ["Levy", "Rate", "Applied on", "Formula", "Effect"],
    ["NHIL", "2.5%", "Taxable value", "0.025 × taxable value", "Adds 2.5% of taxable value"],
    [
      "GETFund Levy",
      "2.5%",
      "Taxable value",
      "0.025 × taxable value",
      "Adds 2.5% of taxable value",
    ],
    ["VAT", "15%", "Taxable value", "0.15 × taxable value", "Adds 15% of taxable value"],
    [
      "Total add-on (NHIL + GETFund + VAT)",
      "20% of taxable value",
      "—",
      "—",
      "—",
    ],
  ];
  const ratesSheet = XLSX.utils.aoa_to_sheet(ratesData);
  XLSX.utils.book_append_sheet(workbook, ratesSheet, "Rates");

  const fileName = `VAT_Calculation_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportVATToCSV(data: VATExportData): void {
  const { inputs, result } = data;
  const rows: string[][] = [];

  // Header
  rows.push(["Ghana VAT Calculator - Report"]);
  rows.push([`Generated on: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`]);
  rows.push([]);

  // Inputs
  rows.push(["Input Values"]);
  rows.push(["Field", "Value"]);
  const modeLabel = inputs.mode === "exclusive" ? "Exclusive (before taxes)" : "Inclusive (final cost)";
  rows.push(["Calculation Mode", modeLabel]);
  rows.push([
    inputs.mode === "exclusive" ? "Taxable Amount" : "Final Cost",
    `${CURRENCY_SYMBOL} ${formatCurrency(parseInputValue(inputs.amount || "0"))}`,
  ]);
  rows.push(["Year", inputs.year]);
  rows.push([]);

  // Results Summary
  rows.push(["Results Summary"]);
  rows.push(["Item", "Amount"]);
  rows.push(["Taxable Value", `${CURRENCY_SYMBOL} ${formatCurrency(result.taxableValue)}`]);
  rows.push(["NHIL (2.5%)", `${CURRENCY_SYMBOL} ${formatCurrency(result.nhil)}`]);
  rows.push(["GETFund Levy (2.5%)", `${CURRENCY_SYMBOL} ${formatCurrency(result.getfund)}`]);
  rows.push(["VAT (15%)", `${CURRENCY_SYMBOL} ${formatCurrency(result.vat)}`]);
  rows.push(["Final Cost (Incl. Taxes)", `${CURRENCY_SYMBOL} ${formatCurrency(result.finalCost)}`]);
  rows.push([]);

  // Calculation Breakdown
  rows.push(["Calculation Breakdown"]);
  rows.push(["Item", "Rate", "Base", "Amount (GH¢)", "Notes"]);
  rows.push([
    result.mode === "exclusive" ? "Taxable value (input)" : "Taxable value (derived)",
    "—",
    result.mode === "exclusive" ? "Input taxable amount" : "Derived from final amount",
    `${CURRENCY_SYMBOL} ${formatCurrency(result.taxableValue)}`,
    "Used as base for NHIL, GETFund, VAT",
  ]);
  rows.push([
    "NHIL",
    "2.5%",
    "Taxable value",
    `${CURRENCY_SYMBOL} ${formatCurrency(result.nhil)}`,
    "0.025 × taxable value",
  ]);
  rows.push([
    "GETFund Levy",
    "2.5%",
    "Taxable value",
    `${CURRENCY_SYMBOL} ${formatCurrency(result.getfund)}`,
    "0.025 × taxable value",
  ]);
  rows.push([
    "VAT",
    "15%",
    "Taxable value",
    `${CURRENCY_SYMBOL} ${formatCurrency(result.vat)}`,
    "0.15 × taxable value",
  ]);
  rows.push([
    "Final amount (tax-inclusive)",
    "—",
    "Taxable value + levies",
    `${CURRENCY_SYMBOL} ${formatCurrency(result.finalCost)}`,
    "Taxable + NHIL + GETFund + VAT",
  ]);

  // Convert to CSV
  const csvContent = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `VAT_Calculation_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


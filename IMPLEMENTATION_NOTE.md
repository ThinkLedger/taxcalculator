# Implementation Note: Deductions, Allowances, SSNIT Tiers & Absenteeism

## Overview

This document describes the implementation of advanced tax calculation features including:
- **Deductions Management**: Non-taxable deductions that reduce net income
- **Allowances Management**: Taxable and non-taxable allowances
- **SSNIT Tier Breakdown**: Tier 1 (13.5/18.5) and Tier 2 (remaining) calculations
- **Absenteeism Calculation**: Automatic deduction based on working days and missed days
- **Enhanced Exports**: PDF, Excel, and CSV exports with all new breakdowns

---

## Key Business Rules

### Deductions
- **Deductions are NOT taxable** - They are subtracted directly from net income
- Formula: `Net Income = Basic Income + Allowances - Income Tax - SSNIT Employee - Total Deductions - Absenteeism`

### Allowances
- **Taxable Allowances**: Included in taxable income calculation
- **Non-Taxable Allowances**: Added to gross but not included in taxable income
- Formula for taxable income: `Taxable Income = Basic Income - Tax Relief + Taxable Allowances`

### SSNIT Tiers
- **Tier 1 Payable**: `13.5 / 18.5 × Total SSNIT Contribution`
- **Tier 2 Payable**: `Total SSNIT - Tier 1 Payable`
- Total SSNIT = Employee (5.5%) + Employer (13%) = 18.5%

### Absenteeism
- **Formula**: `(Net Income Before Deductions / Working Days) × Missed Days`
- Net Income Before Deductions = Gross Income + Allowances - Income Tax - SSNIT Employee
- Default working days: 22 (30 days minus holidays/weekends)

---

## Data Structures

### TypeScript Interfaces

```typescript
// Deduction Item
export interface DeductionItem {
  id: string;
  label: string;
  value: string;
  taxable: boolean; // Always false for deductions
}

// Allowance Item
export interface AllowanceItem {
  id: string;
  label: string;
  value: string;
  taxable: boolean; // Can be true or false
}

// Updated Tax Calculation Result
export interface TaxCalculationResult {
  incomeTax: string;
  ssnit: string;
  netIncome: string;
  computationBreakdown: ComputationBreakdown[];
  ssnitBreakdown: SSNITBreakdown;
  totalDeductions: string;
  totalTaxableAllowances: string;
  absenteeismDeduction: string;
}

// Updated SSNIT Breakdown
export interface SSNITBreakdown {
  employeeContribution: string;
  employerContribution: string;
  totalContribution: string;
  employeeRate: number;
  employerRate: number;
  baseAmount: string;
  tier1Payable: string;
  tier2Payable: string;
}
```

---

## Implementation Details

### 1. Calculator Logic (`lib/calculator.ts`)

#### Updated `computeTaxes` Function

```typescript
function computeTaxes({
  grossIncome,
  allowances,
  taxRelief,
  taxRates,
  ssnitEnabled = true,
  deductions = [],
  allowanceItems = [],
  workingDays = "",
  missedDays = "",
}: ComputeTaxesParams): TaxCalculationResult {
  // Calculate SSNIT contributions
  const employeeSsnitContribution = ssnitEnabled
    ? grossIncome.times(SSNIT_EMPLOYEE_RATE).dividedBy(100)
    : new Decimal(0);
  const employerSsnitContribution = ssnitEnabled
    ? grossIncome.times(SSNIT_EMPLOYER_RATE).dividedBy(100)
    : new Decimal(0);
  const totalSsnitContribution = employeeSsnitContribution.plus(employerSsnitContribution);

  // Calculate SSNIT tiers
  const tier1Payable = totalSsnitContribution.times(13.5).dividedBy(18.5);
  const tier2Payable = totalSsnitContribution.minus(tier1Payable);

  // Calculate total deductions (NOT taxable)
  const totalDeductions = deductions.reduce((sum, d) => {
    const valueStr = d.value.replace(/,/g, "");
    const value = parseFloat(valueStr);
    return sum.plus(isNaN(value) ? 0 : value);
  }, new Decimal(0));

  // Calculate taxable allowances (only those marked as taxable)
  const totalTaxableAllowances = allowanceItems.reduce((sum, a) => {
    if (!a.taxable) return sum;
    const valueStr = a.value.replace(/,/g, "");
    const value = parseFloat(valueStr);
    return sum.plus(isNaN(value) ? 0 : value);
  }, new Decimal(0));

  // Add old allowances input for backward compatibility
  const totalTaxableAllowancesWithOld = totalTaxableAllowances.plus(allowances);

  // Calculate taxable income
  const totalTaxRelief = employeeSsnitContribution.plus(taxRelief);
  let taxableRemaining = grossIncome
    .minus(totalTaxRelief)
    .plus(totalTaxableAllowancesWithOld);

  // Calculate income tax (existing logic)
  // ... tax calculation code ...

  // Calculate total allowances (both taxable and non-taxable)
  const totalAllowancesAmount = allowanceItems.reduce((sum, a) => {
    const valueStr = a.value.replace(/,/g, "");
    const value = parseFloat(valueStr);
    return sum.plus(isNaN(value) ? 0 : value);
  }, new Decimal(0));
  const totalAllowancesWithOld = totalAllowancesAmount.plus(allowances);

  // Calculate absenteeism deduction
  let absenteeismDeduction = new Decimal(0);
  if (workingDays && missedDays) {
    const workingDaysNum = parseFloat(workingDays.replace(/,/g, ""));
    const missedDaysNum = parseFloat(missedDays.replace(/,/g, ""));
    if (!isNaN(workingDaysNum) && !isNaN(missedDaysNum) && workingDaysNum > 0 && missedDaysNum > 0) {
      const netBeforeDeductions = grossIncome
        .plus(totalAllowancesWithOld)
        .minus(totalTax)
        .minus(employeeSsnitContribution);
      const salaryPerDay = netBeforeDeductions.dividedBy(workingDaysNum);
      absenteeismDeduction = salaryPerDay.times(missedDaysNum);
    }
  }

  // Calculate final net income
  const netIncome = grossIncome
    .plus(totalAllowancesWithOld)
    .minus(totalTax)
    .minus(employeeSsnitContribution)
    .minus(totalDeductions)
    .minus(absenteeismDeduction);

  return {
    // ... existing fields ...
    ssnitBreakdown: {
      // ... existing fields ...
      tier1Payable: tier1Payable.toFixed(2),
      tier2Payable: tier2Payable.toFixed(2),
    },
    totalDeductions: totalDeductions.toFixed(2),
    totalTaxableAllowances: totalTaxableAllowancesWithOld.toFixed(2),
    absenteeismDeduction: absenteeismDeduction.toFixed(2),
  };
}
```

#### Updated `calculate` Function Signature

```typescript
export function calculate(
  grossInput: string | number,
  allowancesInput: string | number,
  taxReliefInput: string | number,
  ssnitEnabled: boolean = true,
  year: string = "2024",
  deductions: DeductionItem[] = [],
  allowanceItems: AllowanceItem[] = [],
  workingDays: string = "",
  missedDays: string = ""
): TaxCalculationResponse {
  // ... validation and calculation ...
}
```

---

### 2. UI Components

#### Deductions & Allowances Card (`app/_components/tax/deductions-allowances-card.tsx`)

**Key Features:**
- Three accordions: Deductions, Allowances, Absenteeism
- Dialog-based add/edit for items
- Table view for listing items
- Taxable toggle for allowances (not for deductions)

**Component Structure:**
```typescript
interface DeductionsAndAllowancesCardProps {
  deductions: DeductionItem[];
  onDeductionsChange: (deductions: DeductionItem[]) => void;
  allowances: AllowanceItem[];
  onAllowancesChange: (allowances: AllowanceItem[]) => void;
  workingDays: string;
  onWorkingDaysChange: (value: string) => void;
  missedDays: string;
  onMissedDaysChange: (value: string) => void;
}
```

**Dialog Implementation:**
- Separate dialogs for adding/editing deductions and allowances
- Deduction dialog: Label + Amount (no taxable toggle)
- Allowance dialog: Label + Amount + Taxable toggle
- Form validation and currency formatting

**Table Display:**
- Columns: Label, Amount, Taxable (for allowances), Actions
- Edit and Delete buttons for each item
- Total displayed in accordion header

---

### 3. Tax Breakdown Card Updates (`app/_components/tax/tax-breakdown-card.tsx`)

**SSNIT Breakdown Section:**
- Added Tier 1 Payable row
- Added Tier 2 Payable row
- Displays: Contribution Type, Rate, Amount

```typescript
<tr className="border-t">
  <td>Tier 1 Payable (13.5/18.5)</td>
  <td>13.5%</td>
  <td>GH¢ {formatCurrency(result.ssnitBreakdown.tier1Payable)}</td>
</tr>
<tr className="border-b">
  <td>Tier 2 Payable (Remaining)</td>
  <td>5%</td>
  <td>GH¢ {formatCurrency(result.ssnitBreakdown.tier2Payable)}</td>
</tr>
```

---

### 4. Export Functionality (`lib/export.ts`)

#### Updated Export Data Interface

```typescript
interface PAYEExportData {
  inputs: {
    monthlyBasicIncome: string;
    monthlyAllowances: string;
    taxRelief: string;
    year: string;
    ssnitEnabled: boolean;
    deductions?: DeductionItem[];
    allowances?: AllowanceItem[];
    workingDays?: string;
    missedDays?: string;
  };
  result: TaxCalculationResult;
}
```

#### PDF Export Updates

**New Sections Added:**
1. **Results Summary**: Includes Total Deductions, Total Taxable Allowances, Absenteeism Deduction
2. **SSNIT Tier Breakdown**: Table showing Tier 1 and Tier 2
3. **Deductions Breakdown**: List of all deductions with amounts
4. **Allowances Breakdown**: List of allowances with amounts and taxable status
5. **Absenteeism Section**: Working days, missed days, and deduction amount

#### Excel Export Updates

**New Sheets Added:**
1. **Deductions Sheet**: List of deductions with total
2. **Allowances Sheet**: List of allowances with taxable column
3. **Absenteeism Sheet**: Working days, missed days, deduction
4. **SSNIT Breakdown Sheet**: Updated with Tier 1 and Tier 2 rows

#### CSV Export Updates

**New Sections Added:**
- SSNIT Tier 1 and Tier 2 rows
- Deductions Breakdown section
- Allowances Breakdown section (with taxable column)
- Absenteeism section

---

### 5. Page Integration (`app/page.tsx`)

#### State Management

```typescript
const [deductions, setDeductions] = useState<DeductionItem[]>([]);
const [allowances, setAllowances] = useState<AllowanceItem[]>([]);
const [workingDays, setWorkingDays] = useState("22");
const [missedDays, setMissedDays] = useState("");
```

#### Calculation Integration

```typescript
const calculationResult = useMemo(() => {
  if (calculatorType !== "PAYE") return null;
  const parsedIncome = parseInputValue(monthlyBasicIncome);
  const parsedAllowances = parseInputValue(monthlyAllowances);
  const parsedRelief = parseInputValue(taxRelief);
  return calculate(
    parsedIncome,
    parsedAllowances,
    parsedRelief,
    ssnitEnabled,
    year,
    deductions,
    allowances,
    workingDays,
    missedDays
  );
}, [monthlyBasicIncome, monthlyAllowances, taxRelief, ssnitEnabled, year, calculatorType, deductions, allowances, workingDays, missedDays]);
```

#### Export Integration

```typescript
const exportData = {
  inputs: {
    monthlyBasicIncome,
    monthlyAllowances,
    taxRelief,
    year,
    ssnitEnabled,
    deductions,
    allowances,
    workingDays,
    missedDays,
  },
  result,
};
```

---

## Step-by-Step Implementation Guide

### Step 1: Update Data Structures
1. Add `DeductionItem` and `AllowanceItem` interfaces
2. Update `TaxCalculationResult` interface with new fields
3. Update `SSNITBreakdown` interface with tier fields

### Step 2: Update Calculator Logic
1. Modify `computeTaxes` function to accept deductions, allowances, workingDays, missedDays
2. Calculate total deductions (non-taxable)
3. Calculate taxable allowances (filter by taxable flag)
4. Calculate SSNIT tiers (Tier 1 = 13.5/18.5, Tier 2 = remaining)
5. Calculate absenteeism deduction
6. Update net income calculation to subtract deductions and absenteeism

### Step 3: Create UI Components
1. Create `DeductionsAndAllowancesCard` component
2. Implement three accordions (Deductions, Allowances, Absenteeism)
3. Create dialog components for adding/editing items
4. Implement table view for listing items
5. Add taxable toggle for allowances (not deductions)

### Step 4: Update Tax Breakdown Display
1. Add Tier 1 and Tier 2 rows to SSNIT breakdown table
2. Display tier calculations with proper formatting

### Step 5: Update Export Functions
1. Update `PAYEExportData` interface
2. Add new sections to PDF export
3. Add new sheets to Excel export
4. Add new sections to CSV export
5. Update page.tsx to pass new data to export functions

### Step 6: Integration
1. Add state management in main page component
2. Pass props to child components
3. Update calculation dependencies
4. Test all functionality

---

## Testing Checklist

- [ ] Deductions are subtracted from net income (not taxable)
- [ ] Taxable allowances are included in taxable income
- [ ] Non-taxable allowances are added to gross but not taxable income
- [ ] SSNIT Tier 1 = 13.5/18.5 × Total SSNIT
- [ ] SSNIT Tier 2 = Total SSNIT - Tier 1
- [ ] Absenteeism = (Net Before Deductions / Working Days) × Missed Days
- [ ] Net Income includes all deductions and absenteeism
- [ ] PDF export includes all new sections
- [ ] Excel export includes all new sheets
- [ ] CSV export includes all new sections
- [ ] Mobile dialog works correctly
- [ ] Form validation works for all inputs

---

## Key Formulas Reference

### Net Income Calculation
```
Net Income = Gross Income 
           + Total Allowances 
           - Income Tax 
           - SSNIT Employee Contribution 
           - Total Deductions 
           - Absenteeism Deduction
```

### Taxable Income Calculation
```
Taxable Income = Gross Income 
               - Tax Relief (SSNIT Employee + Tax Relief) 
               + Taxable Allowances Only
```

### SSNIT Tier Calculations
```
Tier 1 Payable = (13.5 / 18.5) × Total SSNIT Contribution
Tier 2 Payable = Total SSNIT Contribution - Tier 1 Payable
```

### Absenteeism Calculation
```
Net Before Deductions = Gross Income 
                      + Total Allowances 
                      - Income Tax 
                      - SSNIT Employee Contribution

Salary Per Day = Net Before Deductions / Working Days
Absenteeism Deduction = Salary Per Day × Missed Days
```

---

## Dependencies

- `decimal.js`: For precise financial calculations
- `jspdf` & `jspdf-autotable`: For PDF generation
- `xlsx`: For Excel/CSV generation
- `currency-symbol`: For currency symbol formatting

---

## File Structure

```
lib/
├── calculator.ts          # Core calculation logic
├── export.ts              # Export functions (PDF, Excel, CSV)
└── rates.ts               # Tax rates configuration

app/
├── page.tsx               # Main page component
└── _components/
    └── tax/
        ├── deductions-allowances-card.tsx
        ├── tax-breakdown-card.tsx
        └── mobile-deductions-allowances-dialog.tsx
```

---

## Notes

1. **Deductions are never taxable** - The taxable field exists in the interface for type consistency but is always set to `false` and not shown in the UI for deductions.

2. **Backward Compatibility** - The old `allowances` input field is still supported and added to taxable allowances for backward compatibility.

3. **Default Working Days** - Set to 22 days (typical month minus holidays/weekends).

4. **Currency Formatting** - All amounts use `formatCurrency` function which adds commas and 2 decimal places.

5. **Input Parsing** - Use `parseInputValue` to remove commas before calculations.

---

## Contact & Support

For questions or clarifications about this implementation, please refer to the codebase or contact the development team.

**Last Updated**: January 2025
**Version**: 1.0.0


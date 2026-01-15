"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DeductionsAndAllowancesCard, type DeductionItem, type AllowanceItem } from "./deductions-allowances-card";

interface MobileDeductionsAllowancesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deductions: DeductionItem[];
  onDeductionsChange: (deductions: DeductionItem[]) => void;
  allowances: AllowanceItem[];
  onAllowancesChange: (allowances: AllowanceItem[]) => void;
  workingDays: string;
  onWorkingDaysChange: (value: string) => void;
  missedDays: string;
  onMissedDaysChange: (value: string) => void;
}

export function MobileDeductionsAllowancesDialog({
  open,
  onOpenChange,
  deductions,
  onDeductionsChange,
  allowances,
  onAllowancesChange,
  workingDays,
  onWorkingDaysChange,
  missedDays,
  onMissedDaysChange,
}: MobileDeductionsAllowancesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1 lg:hidden">
          Deductions & Allowances
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Deductions & Allowances</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <DeductionsAndAllowancesCard
            deductions={deductions}
            onDeductionsChange={onDeductionsChange}
            allowances={allowances}
            onAllowancesChange={onAllowancesChange}
            workingDays={workingDays}
            onWorkingDaysChange={onWorkingDaysChange}
            missedDays={missedDays}
            onMissedDaysChange={onMissedDaysChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

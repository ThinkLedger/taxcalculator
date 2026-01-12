"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConfigCard } from "./config-card";

interface MobileConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calculatorType: string;
  onCalculatorTypeChange: (value: string) => void;
  country: string;
  onCountryChange: (value: string) => void;
  year: string;
  onYearChange: (value: string) => void;
  ssnitEnabled: boolean;
  onSsnitChange: (checked: boolean) => void;
}

export function MobileConfigDialog({
  open,
  onOpenChange,
  calculatorType,
  onCalculatorTypeChange,
  country,
  onCountryChange,
  year,
  onYearChange,
  ssnitEnabled,
  onSsnitChange,
}: MobileConfigDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1 lg:hidden">
          Show Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure tax calculation settings
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ConfigCard
            calculatorType={calculatorType}
            onCalculatorTypeChange={onCalculatorTypeChange}
            country={country}
            onCountryChange={onCountryChange}
            year={year}
            onYearChange={onYearChange}
            ssnitEnabled={ssnitEnabled}
            onSsnitChange={onSsnitChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}


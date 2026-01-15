"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { formatInputValue, parseInputValue, formatCurrency } from "../utils";

export interface DeductionItem {
  id: string;
  label: string;
  value: string;
  taxable: boolean;
}

export interface AllowanceItem {
  id: string;
  label: string;
  value: string;
  taxable: boolean;
}

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

export function DeductionsAndAllowancesCard({
  deductions,
  onDeductionsChange,
  allowances,
  onAllowancesChange,
  workingDays,
  onWorkingDaysChange,
  missedDays,
  onMissedDaysChange,
}: DeductionsAndAllowancesCardProps) {
  const [deductionDialogOpen, setDeductionDialogOpen] = useState(false);
  const [allowanceDialogOpen, setAllowanceDialogOpen] = useState(false);
  const [editingDeduction, setEditingDeduction] = useState<DeductionItem | null>(null);
  const [editingAllowance, setEditingAllowance] = useState<AllowanceItem | null>(null);
  const [deductionForm, setDeductionForm] = useState({ label: "", value: "", taxable: false });
  const [allowanceForm, setAllowanceForm] = useState({ label: "", value: "", taxable: false });

  const openDeductionDialog = (deduction?: DeductionItem) => {
    if (deduction) {
      setEditingDeduction(deduction);
      setDeductionForm({
        label: deduction.label,
        value: deduction.value,
        taxable: deduction.taxable,
      });
    } else {
      setEditingDeduction(null);
      setDeductionForm({ label: "", value: "", taxable: false });
    }
    setDeductionDialogOpen(true);
  };

  const openAllowanceDialog = (allowance?: AllowanceItem) => {
    if (allowance) {
      setEditingAllowance(allowance);
      setAllowanceForm({
        label: allowance.label,
        value: allowance.value,
        taxable: allowance.taxable,
      });
    } else {
      setEditingAllowance(null);
      setAllowanceForm({ label: "", value: "", taxable: false });
    }
    setAllowanceDialogOpen(true);
  };

  const saveDeduction = () => {
    if (editingDeduction) {
      // Update existing
      onDeductionsChange(
        deductions.map((d) =>
          d.id === editingDeduction.id
            ? { ...d, ...deductionForm }
            : d
        )
      );
    } else {
      // Add new
      const newDeduction: DeductionItem = {
        id: `deduction-${Date.now()}`,
        ...deductionForm,
      };
      onDeductionsChange([...deductions, newDeduction]);
    }
    setDeductionDialogOpen(false);
    setEditingDeduction(null);
    setDeductionForm({ label: "", value: "", taxable: false });
  };

  const saveAllowance = () => {
    if (editingAllowance) {
      // Update existing
      onAllowancesChange(
        allowances.map((a) =>
          a.id === editingAllowance.id
            ? { ...a, ...allowanceForm }
            : a
        )
      );
    } else {
      // Add new
      const newAllowance: AllowanceItem = {
        id: `allowance-${Date.now()}`,
        ...allowanceForm,
      };
      onAllowancesChange([...allowances, newAllowance]);
    }
    setAllowanceDialogOpen(false);
    setEditingAllowance(null);
    setAllowanceForm({ label: "", value: "", taxable: false });
  };

  const removeDeduction = (id: string) => {
    onDeductionsChange(deductions.filter((d) => d.id !== id));
  };

  const removeAllowance = (id: string) => {
    onAllowancesChange(allowances.filter((a) => a.id !== id));
  };

  const getTotalDeductions = (): number => {
    const total = deductions.reduce((sum, d) => {
      const valueStr = parseInputValue(d.value || "");
      const value = parseFloat(valueStr);
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
    return typeof total === "number" ? total : 0;
  };

  const getTotalAllowances = (): number => {
    const total = allowances.reduce((sum, a) => {
      const valueStr = parseInputValue(a.value || "");
      const value = parseFloat(valueStr);
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
    return typeof total === "number" ? total : 0;
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Deductions & Allowances</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {/* Deductions Accordion */}
          <AccordionItem value="deductions">
            <AccordionTrigger className="text-sm font-semibold">
              Deductions
              {deductions.length > 0 && (
                <span className="ml-2 text-xs text-muted-foreground font-normal">
                  (Total: GH¢ {formatCurrency(getTotalDeductions().toFixed(2))})
                </span>
              )}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {deductions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No deductions added
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2 font-semibold">Label</th>
                          <th className="text-right py-2 px-2 font-semibold">Amount</th>
                          <th className="text-center py-2 px-2 font-semibold">Taxable</th>
                          <th className="text-center py-2 px-2 font-semibold w-20">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deductions.map((deduction) => (
                          <tr key={deduction.id} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-2">{deduction.label || "-"}</td>
                            <td className="py-2 px-2 text-right">
                              {deduction.value ? `GH¢ ${formatCurrency(parseInputValue(deduction.value))}` : "-"}
                            </td>
                            <td className="py-2 px-2 text-center">
                              {deduction.taxable ? "Yes" : "No"}
                            </td>
                            <td className="py-2 px-2">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDeductionDialog(deduction)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeDeduction(deduction.id)}
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDeductionDialog()}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Deduction
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Allowances Accordion */}
          <AccordionItem value="allowances">
            <AccordionTrigger className="text-sm font-semibold">
              Allowances
              {allowances.length > 0 && (
                <span className="ml-2 text-xs text-muted-foreground font-normal">
                  (Total: GH¢ {formatCurrency(getTotalAllowances().toFixed(2))})
                </span>
              )}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {allowances.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No allowances added
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2 font-semibold">Label</th>
                          <th className="text-right py-2 px-2 font-semibold">Amount</th>
                          <th className="text-center py-2 px-2 font-semibold">Taxable</th>
                          <th className="text-center py-2 px-2 font-semibold w-20">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allowances.map((allowance) => (
                          <tr key={allowance.id} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-2">{allowance.label || "-"}</td>
                            <td className="py-2 px-2 text-right">
                              {allowance.value ? `GH¢ ${formatCurrency(parseInputValue(allowance.value))}` : "-"}
                            </td>
                            <td className="py-2 px-2 text-center">
                              {allowance.taxable ? "Yes" : "No"}
                            </td>
                            <td className="py-2 px-2">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openAllowanceDialog(allowance)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAllowance(allowance.id)}
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openAllowanceDialog()}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Allowance
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Absenteeism Accordion */}
          <AccordionItem value="absenteeism">
            <AccordionTrigger className="text-sm font-semibold">
              Absenteeism
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="working-days">Working Days</Label>
                    <Input
                      id="working-days"
                      type="number"
                      inputMode="numeric"
                      value={workingDays}
                      onChange={(e) => onWorkingDaysChange(e.target.value)}
                      placeholder="22"
                      className="text-right text-lg"
                      min="1"
                      max="31"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="missed-days">Missed Days</Label>
                    <Input
                      id="missed-days"
                      type="number"
                      inputMode="numeric"
                      value={missedDays}
                      onChange={(e) => onMissedDaysChange(e.target.value)}
                      placeholder="0"
                      className="text-right text-lg"
                      min="0"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  * Working days typically 22 (30 days minus holidays/weekends)
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  Absenteeism deduction = (Net Income / Working Days) × Missed Days
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>

      {/* Deduction Dialog */}
      <Dialog open={deductionDialogOpen} onOpenChange={setDeductionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDeduction ? "Edit Deduction" : "Add Deduction"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deduction-label">Label</Label>
              <Input
                id="deduction-label"
                type="text"
                value={deductionForm.label}
                onChange={(e) =>
                  setDeductionForm({ ...deductionForm, label: e.target.value })
                }
                placeholder="e.g., Health Insurance"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deduction-value">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  GH₵
                </span>
                <Input
                  id="deduction-value"
                  type="text"
                  inputMode="numeric"
                  value={deductionForm.value}
                  onChange={(e) => {
                    const formatted = formatInputValue(e.target.value);
                    setDeductionForm({ ...deductionForm, value: formatted });
                  }}
                  placeholder="0"
                  className="pl-12 text-right"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="deduction-taxable">Taxable</Label>
              <Switch
                id="deduction-taxable"
                checked={deductionForm.taxable}
                onCheckedChange={(checked) =>
                  setDeductionForm({ ...deductionForm, taxable: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeductionDialogOpen(false);
                setEditingDeduction(null);
                setDeductionForm({ label: "", value: "", taxable: false });
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveDeduction}>
              {editingDeduction ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Allowance Dialog */}
      <Dialog open={allowanceDialogOpen} onOpenChange={setAllowanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAllowance ? "Edit Allowance" : "Add Allowance"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="allowance-label">Label</Label>
              <Input
                id="allowance-label"
                type="text"
                value={allowanceForm.label}
                onChange={(e) =>
                  setAllowanceForm({ ...allowanceForm, label: e.target.value })
                }
                placeholder="e.g., Transport Allowance"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allowance-value">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  GH₵
                </span>
                <Input
                  id="allowance-value"
                  type="text"
                  inputMode="numeric"
                  value={allowanceForm.value}
                  onChange={(e) => {
                    const formatted = formatInputValue(e.target.value);
                    setAllowanceForm({ ...allowanceForm, value: formatted });
                  }}
                  placeholder="0"
                  className="pl-12 text-right"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="allowance-taxable">Taxable</Label>
              <Switch
                id="allowance-taxable"
                checked={allowanceForm.taxable}
                onCheckedChange={(checked) =>
                  setAllowanceForm({ ...allowanceForm, taxable: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAllowanceDialogOpen(false);
                setEditingAllowance(null);
                setAllowanceForm({ label: "", value: "", taxable: false });
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveAllowance}>
              {editingAllowance ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}


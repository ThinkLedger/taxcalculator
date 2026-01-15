"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AbsenteeismCardProps {
  workingDays: string;
  onWorkingDaysChange: (value: string) => void;
  missedDays: string;
  onMissedDaysChange: (value: string) => void;
}

export function AbsenteeismCard({
  workingDays,
  onWorkingDaysChange,
  missedDays,
  onMissedDaysChange,
}: AbsenteeismCardProps) {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Absenteeism</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  );
}


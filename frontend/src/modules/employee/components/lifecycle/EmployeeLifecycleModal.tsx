'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useEmployee } from '../../hooks/useEmployee';
import { Employee, EmployeeStatus, TransitionLifecycleInput } from '../../types';
import { toast } from 'sonner';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  Loader2,
  UserCheck,
  UserMinus,
  AlertCircle,
} from 'lucide-react';

interface EmployeeLifecycleModalProps {
  employee: Employee;
  targetStatus: EmployeeStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_TITLES: Record<string, string> = {
  JOINED: 'Mark Employee as Joined',
  PROBATION: 'Move to Probation Period',
  CONFIRMED: 'Confirm Employee',
  NOTICE_PERIOD: 'Initiate Notice Period',
  RELIEVED: 'Mark Employee as Relieved',
  ACTIVE: 'Activate Employee',
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  JOINED: 'Record official joining date and complete employee onboarding induction.',
  PROBATION: 'Establish probation duration and milestones for review.',
  CONFIRMED: 'Formally confirm employment following successful completion of probation.',
  NOTICE_PERIOD: 'Record employee resignation date, calculated notice period, and final working date.',
  RELIEVED: 'Formally relieve the employee upon completion of notice period and handovers.',
  ACTIVE: 'Mark employee as actively engaged in the company.',
};

export function EmployeeLifecycleModal({
  employee,
  targetStatus,
  open,
  onOpenChange,
}: EmployeeLifecycleModalProps) {
  const { transitionLifecycle } = useEmployee();

  // Helper date formatting
  const todayStr = new Date().toISOString().split('T')[0];
  const joinedStr = employee.joinedDate
    ? new Date(employee.joinedDate).toISOString().split('T')[0]
    : todayStr;

  // Default dates based on target status
  const [effectiveDate, setEffectiveDate] = React.useState<string>(todayStr);
  const [probationEndDate, setProbationEndDate] = React.useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  });
  const [confirmationDate, setConfirmationDate] = React.useState<string>(todayStr);
  const [resignationDate, setResignationDate] = React.useState<string>(todayStr);
  const [lastWorkingDate, setLastWorkingDate] = React.useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [noticePeriodDays, setNoticePeriodDays] = React.useState<number>(30);
  const [notes, setNotes] = React.useState<string>('');
  const [validationError, setValidationError] = React.useState<string | null>(null);

  // Auto calculate notice period days when dates change
  React.useEffect(() => {
    if (targetStatus === 'NOTICE_PERIOD') {
      try {
        const start = new Date(resignationDate).getTime();
        const end = new Date(lastWorkingDate).getTime();
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
          setNoticePeriodDays(diffDays);
        }
      } catch {
        // ignore invalid dates during typing
      }
    }
  }, [resignationDate, lastWorkingDate, targetStatus]);

  const validate = (): boolean => {
    setValidationError(null);

    if (targetStatus === 'CONFIRMED') {
      if (!confirmationDate) {
        setValidationError('Confirmation date is required');
        return false;
      }
      if (confirmationDate < joinedStr) {
        setValidationError(`Confirmation date cannot be earlier than joining date (${joinedStr})`);
        return false;
      }
    }

    if (targetStatus === 'PROBATION') {
      if (probationEndDate && probationEndDate < joinedStr) {
        setValidationError(`Probation end date cannot be earlier than joining date (${joinedStr})`);
        return false;
      }
    }

    if (targetStatus === 'NOTICE_PERIOD') {
      if (!resignationDate) {
        setValidationError('Resignation date is required');
        return false;
      }
      if (resignationDate < joinedStr) {
        setValidationError(`Resignation date cannot be earlier than joining date (${joinedStr})`);
        return false;
      }
      if (!lastWorkingDate) {
        setValidationError('Last working date is required');
        return false;
      }
      if (lastWorkingDate < resignationDate) {
        setValidationError('Last working date cannot be earlier than resignation date');
        return false;
      }
    }

    if (targetStatus === 'RELIEVED') {
      if (!lastWorkingDate) {
        setValidationError('Last working date is required');
        return false;
      }
      const compareDate = employee.resignationDate
        ? new Date(employee.resignationDate).toISOString().split('T')[0]
        : joinedStr;
      if (lastWorkingDate < compareDate) {
        setValidationError(`Last working date cannot be earlier than ${employee.resignationDate ? 'resignation date' : 'joining date'}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: TransitionLifecycleInput = {
      status: targetStatus,
      notes: notes.trim() || undefined,
    };

    if (targetStatus === 'JOINED') {
      payload.effectiveDate = effectiveDate;
    } else if (targetStatus === 'PROBATION') {
      payload.probationEndDate = probationEndDate;
    } else if (targetStatus === 'CONFIRMED') {
      payload.confirmationDate = confirmationDate;
    } else if (targetStatus === 'NOTICE_PERIOD') {
      payload.resignationDate = resignationDate;
      payload.lastWorkingDate = lastWorkingDate;
      payload.noticePeriodDays = noticePeriodDays;
    } else if (targetStatus === 'RELIEVED') {
      payload.lastWorkingDate = lastWorkingDate;
    }

    try {
      await transitionLifecycle.mutateAsync({
        id: employee.id,
        data: payload,
      });
      onOpenChange(false);
    } catch {
      // Error handled by hook toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              {targetStatus === 'CONFIRMED' && <FileCheck className="h-5 w-5 text-emerald-600" />}
              {targetStatus === 'PROBATION' && <Clock className="h-5 w-5 text-amber-600" />}
              {targetStatus === 'NOTICE_PERIOD' && <AlertCircle className="h-5 w-5 text-orange-600" />}
              {targetStatus === 'RELIEVED' && <UserMinus className="h-5 w-5 text-purple-600" />}
              {targetStatus === 'JOINED' && <UserCheck className="h-5 w-5 text-blue-600" />}
              {STATUS_TITLES[targetStatus] || 'Transition Lifecycle'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {STATUS_DESCRIPTIONS[targetStatus] || 'Update the employee lifecycle state and record history.'}
            </DialogDescription>
          </DialogHeader>

          {/* Status Progression Preview */}
          <div className="my-4 p-3 bg-muted/60 rounded-lg flex items-center justify-between border text-sm">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium">Current Status</span>
              <Badge variant="outline" className="mt-1 font-semibold w-fit">
                {employee.status}
              </Badge>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground mx-2" />
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground font-medium">Target Status</span>
              <Badge variant="default" className="mt-1 font-semibold w-fit bg-primary">
                {targetStatus}
              </Badge>
            </div>
          </div>

          {validationError && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="space-y-4 py-2">
            {/* Target: JOINED */}
            {targetStatus === 'JOINED' && (
              <div className="space-y-1">
                <Label htmlFor="effectiveDate" className="text-xs font-medium">
                  Official Joining Date *
                </Label>
                <Input
                  id="effectiveDate"
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Target: PROBATION */}
            {targetStatus === 'PROBATION' && (
              <div className="space-y-1">
                <Label htmlFor="probationEndDate" className="text-xs font-medium">
                  Probation End Date (Expected Review Date)
                </Label>
                <Input
                  id="probationEndDate"
                  type="date"
                  value={probationEndDate}
                  onChange={(e) => setProbationEndDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Joined on: {joinedStr}
                </p>
              </div>
            )}

            {/* Target: CONFIRMED */}
            {targetStatus === 'CONFIRMED' && (
              <div className="space-y-1">
                <Label htmlFor="confirmationDate" className="text-xs font-medium">
                  Confirmation Date *
                </Label>
                <Input
                  id="confirmationDate"
                  type="date"
                  value={confirmationDate}
                  onChange={(e) => setConfirmationDate(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Must be on or after joining date ({joinedStr}).
                </p>
              </div>
            )}

            {/* Target: NOTICE_PERIOD */}
            {targetStatus === 'NOTICE_PERIOD' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="resignationDate" className="text-xs font-medium">
                      Resignation Date *
                    </Label>
                    <Input
                      id="resignationDate"
                      type="date"
                      value={resignationDate}
                      onChange={(e) => setResignationDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lastWorkingDate" className="text-xs font-medium">
                      Last Working Date *
                    </Label>
                    <Input
                      id="lastWorkingDate"
                      type="date"
                      value={lastWorkingDate}
                      onChange={(e) => setLastWorkingDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="noticePeriodDays" className="text-xs font-medium">
                    Notice Period (Days)
                  </Label>
                  <Input
                    id="noticePeriodDays"
                    type="number"
                    min={0}
                    value={noticePeriodDays}
                    onChange={(e) => setNoticePeriodDays(Number(e.target.value))}
                  />
                </div>
              </>
            )}

            {/* Target: RELIEVED */}
            {targetStatus === 'RELIEVED' && (
              <div className="space-y-1">
                <Label htmlFor="lastWorkingDate" className="text-xs font-medium">
                  Official Last Working Date *
                </Label>
                <Input
                  id="lastWorkingDate"
                  type="date"
                  value={lastWorkingDate}
                  onChange={(e) => setLastWorkingDate(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Employee record will remain available historically (read-only).
                </p>
              </div>
            )}

            {/* Common: Reason / Notes */}
            <div className="space-y-1">
              <Label htmlFor="notes" className="text-xs font-medium">
                Reason / Internal Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Enter remarks or approval details for employment audit history..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={transitionLifecycle.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={transitionLifecycle.isPending}
            >
              {transitionLifecycle.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm Transition
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

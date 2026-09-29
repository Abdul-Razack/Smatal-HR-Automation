'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Employee, EmployeeStatus } from '../../types';
import { EmployeeLifecycleModal } from './EmployeeLifecycleModal';
import {
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  FileCheck,
  UserCheck,
  UserMinus,
  AlertCircle,
  Calendar,
} from 'lucide-react';

interface EmployeeLifecycleTrackerProps {
  employee: Employee;
}

interface StepConfig {
  key: EmployeeStatus;
  label: string;
  description: string;
  getDate: (emp: Employee) => string | null | undefined;
  dateLabel: string;
}

const LIFECYCLE_STEPS: StepConfig[] = [
  {
    key: 'JOINED',
    label: 'Joined',
    description: 'Onboarding complete, officially joined the organization',
    getDate: (emp) => emp.joinedDate,
    dateLabel: 'Joined Date',
  },
  {
    key: 'PROBATION',
    label: 'Probation',
    description: 'Under active performance evaluation and probation review',
    getDate: (emp) => emp.probationEndDate,
    dateLabel: 'Review Date',
  },
  {
    key: 'CONFIRMED',
    label: 'Confirmed',
    description: 'Probation passed, confirmed permanent employee',
    getDate: (emp) => emp.confirmationDate,
    dateLabel: 'Confirmation Date',
  },
  {
    key: 'NOTICE_PERIOD',
    label: 'Notice Period',
    description: 'Resignation tendered, serving mandatory notice period',
    getDate: (emp) => emp.resignationDate,
    dateLabel: 'Resignation Date',
  },
  {
    key: 'RELIEVED',
    label: 'Relieved',
    description: 'Formal exit process completed, all handovers finished',
    getDate: (emp) => emp.lastWorkingDate,
    dateLabel: 'Last Working Date',
  },
];

// Helper to determine step ordering
const STATUS_ORDER: Record<string, number> = {
  OFFER: 0,
  ONBOARDING: 0,
  JOINED: 1,
  PROBATION: 2,
  ACTIVE: 3,
  CONFIRMED: 3,
  NOTICE: 4,
  NOTICE_PERIOD: 4,
  RESIGNED: 5,
  RELIEVED: 5,
  TERMINATED: 6,
  RETIRED: 6,
};

export function EmployeeLifecycleTracker({ employee }: EmployeeLifecycleTrackerProps) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [targetStatus, setTargetStatus] = React.useState<EmployeeStatus>('CONFIRMED');

  const currentOrder = STATUS_ORDER[employee.status] ?? 1;

  const handleOpenTransition = (status: EmployeeStatus) => {
    setTargetStatus(status);
    setModalOpen(true);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Determine valid next actions based on current status
  const renderNextActions = () => {
    switch (employee.status) {
      case 'OFFER':
      case 'ONBOARDING':
        return (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => handleOpenTransition('JOINED')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <UserCheck className="mr-2 h-4 w-4" /> Mark as Joined
            </Button>
          </div>
        );

      case 'JOINED':
        return (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => handleOpenTransition('PROBATION')}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Clock className="mr-2 h-4 w-4" /> Move to Probation
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOpenTransition('CONFIRMED')}
            >
              <FileCheck className="mr-2 h-4 w-4" /> Direct Confirmation
            </Button>
          </div>
        );

      case 'PROBATION':
        return (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => handleOpenTransition('CONFIRMED')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <FileCheck className="mr-2 h-4 w-4" /> Confirm Employee
            </Button>
          </div>
        );

      case 'CONFIRMED':
      case 'ACTIVE':
        return (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => handleOpenTransition('NOTICE_PERIOD')}
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              <AlertCircle className="mr-2 h-4 w-4" /> Start Notice Period
            </Button>
          </div>
        );

      case 'NOTICE_PERIOD':
      case 'NOTICE':
        return (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => handleOpenTransition('RELIEVED')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <UserMinus className="mr-2 h-4 w-4" /> Mark as Relieved
            </Button>
          </div>
        );

      case 'RELIEVED':
      case 'RESIGNED':
        return (
          <div className="p-3 bg-purple-50 text-purple-800 rounded-lg text-sm border border-purple-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-purple-600" />
            <span>Employee lifecycle is completed. Record remains available for historical audit and documentation.</span>
          </div>
        );

      case 'TERMINATED':
        return (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm border border-destructive/20 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Employee employment was terminated.</span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Action Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border bg-card shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-foreground">
              Current Lifecycle State
            </h3>
            <Badge variant="default" className="text-xs px-2.5 py-0.5 font-semibold">
              {employee.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage authorized lifecycle transitions, milestone reviews, and exit events.
          </p>
        </div>

        <div className="shrink-0">{renderNextActions()}</div>
      </div>

      {/* Visual Stepper / Timeline */}
      <div className="p-6 rounded-xl border bg-card shadow-sm">
        <h4 className="text-sm font-semibold text-foreground mb-6 uppercase tracking-wider text-muted-foreground">
          Employee Lifecycle Progression
        </h4>

        <div className="relative pl-6 space-y-8 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
          {LIFECYCLE_STEPS.map((step) => {
            const stepOrder = STATUS_ORDER[step.key];
            const isCompleted = currentOrder > stepOrder;
            const isCurrent =
              currentOrder === stepOrder ||
              (step.key === 'CONFIRMED' && employee.status === 'ACTIVE') ||
              (step.key === 'NOTICE_PERIOD' && employee.status === 'NOTICE') ||
              (step.key === 'RELIEVED' && employee.status === 'RESIGNED');
            const isPending = currentOrder < stepOrder && !isCurrent;
            const stepDate = step.getDate(employee);

            return (
              <div key={step.key} className="relative flex items-start gap-4">
                {/* Node marker */}
                <div
                  className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors -ml-[23px] bg-background ${
                    isCompleted
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                      : isCurrent
                      ? 'border-primary ring-4 ring-primary/20 bg-primary text-primary-foreground font-bold'
                      : 'border-muted-foreground/30 text-muted-foreground/40'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isCurrent ? (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  ) : (
                    <Circle className="h-2 w-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 -mt-0.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold text-sm ${
                          isCurrent
                            ? 'text-primary font-bold'
                            : isCompleted
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {step.label}
                      </span>
                      {isCurrent && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-2 py-0 font-medium bg-primary/10 text-primary border-primary/20"
                        >
                          Current
                        </Badge>
                      )}
                    </div>

                    {stepDate && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium bg-muted/50 px-2 py-0.5 rounded border">
                        <Calendar className="h-3 w-3" />
                        {step.dateLabel}: {formatDate(stepDate)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                    {step.description}
                  </p>

                  {/* Special Context Badges */}
                  {step.key === 'NOTICE_PERIOD' && employee.noticePeriodDays && (
                    <p className="text-xs text-orange-600 font-medium mt-1">
                      Duration: {employee.noticePeriodDays} days notice
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lifecycle Transition Modal */}
      {modalOpen && (
        <EmployeeLifecycleModal
          employee={employee}
          targetStatus={targetStatus}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </div>
  );
}

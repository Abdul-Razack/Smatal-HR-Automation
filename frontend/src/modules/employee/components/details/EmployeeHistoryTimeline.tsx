'use client';

import React from 'react';
import { useEmployee } from '../../hooks/useEmployee';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export function EmployeeHistoryTimeline({ employeeId }: { employeeId: string }) {
  const { useEmploymentHistory } = useEmployee();
  const { data: history, isLoading } = useEmploymentHistory(employeeId);

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading history...</div>;
  if (!history || history.length === 0) return <div className="text-sm text-muted-foreground">No employment history found.</div>;

  return (
    <div className="space-y-4">
      <div className="relative border-l border-muted-foreground/20 ml-3 md:ml-4">
        {history.map((record: any, index: number) => {
          const isLatest = index === 0;
          return (
            <div key={record.id} className="mb-8 ml-6 relative">
              <span className={`absolute flex items-center justify-center w-3 h-3 rounded-full -left-[1.68rem] ring-4 ring-background ${isLatest ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
              </span>
              
              <div className="flex flex-col space-y-1">
                <div className="text-sm text-muted-foreground mb-1">
                  {format(new Date(record.effectiveDate), 'PPP')}
                  {record.endDate && ` - ${format(new Date(record.endDate), 'PPP')}`}
                  {isLatest && <Badge variant="secondary" className="ml-2 text-[10px]">Current</Badge>}
                </div>

                <div className="bg-card border rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium">
                    {record.reason}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    {record.departmentId && (
                      <div>
                        <span className="text-muted-foreground">Department:</span> {record.departmentId}
                      </div>
                    )}
                    {record.designationId && (
                      <div>
                        <span className="text-muted-foreground">Designation:</span> {record.designationId}
                      </div>
                    )}
                    {record.branchId && (
                      <div>
                        <span className="text-muted-foreground">Branch:</span> {record.branchId}
                      </div>
                    )}
                    {record.status && (
                      <div>
                        <span className="text-muted-foreground">Status:</span> <Badge variant="outline" className="text-[10px]">{record.status}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

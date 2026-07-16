'use client';

import * as React from 'react';
import { useWorkflowInstance } from '../../hooks/useWorkflowInstance';
import { CheckCircle2, XCircle, Clock, ArrowRightLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function WorkflowHistoryTimeline({ instanceId }: { instanceId: string }) {
  const { useWorkflowHistory } = useWorkflowInstance();
  const { data: history, isLoading } = useWorkflowHistory(instanceId);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!history || history.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No history available for this workflow.</div>;
  }

  const getIcon = (action: string) => {
    switch (action) {
      case 'STARTED':
      case 'ADVANCED':
        return <ArrowRightLeft className="h-5 w-5 text-blue-500" />;
      case 'APPROVED':
      case 'COMPLETED':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'REJECTED':
      case 'CANCELLED':
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-6">
      <div className="relative border-l border-muted-foreground/20 ml-3 space-y-8">
        {history.map((event) => (
          <div key={event.id} className="relative pl-8">
            <div className="absolute -left-[11px] top-1 bg-background rounded-full">
              {getIcon(event.action)}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{event.action}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(event.createdAt).toLocaleString()}
                </span>
              </div>
              
              {event.user && (
                <div className="text-xs text-muted-foreground">
                  By: {event.user.name} ({event.user.email})
                </div>
              )}
              
              {event.stageId && (
                <div className="text-xs text-muted-foreground">
                  Stage ID: {event.stageId}
                </div>
              )}

              {event.remarks && (
                <div className="mt-2 text-sm bg-muted p-3 rounded-md">
                  &quot;{event.remarks}&quot;
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import * as React from 'react';
import { useWorkflowInstance } from '@/modules/workflow/hooks/useWorkflowInstance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, ArrowLeftRight, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { useModalStore } from '@/shared/modals/useModalStore';
import { WorkflowApproveForm } from '@/modules/workflow/components/forms/WorkflowApproveForm';
import { WorkflowRejectForm } from '@/modules/workflow/components/forms/WorkflowRejectForm';

export function EmployeeWorkflowStatus({ employeeId }: { employeeId: string }) {
  const { useWorkflowInstances } = useWorkflowInstance();
  const { data: instances, isLoading } = useWorkflowInstances({ entityType: 'EMPLOYEE', entityId: employeeId });
  const openModal = useModalStore(state => state.openModal);

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading workflows...</div>;

  if (!instances || instances.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          No active or past workflows found for this employee.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {instances.map((instance: any) => {
        const isCompleted = instance.status === 'COMPLETED' || instance.status === 'FAILED' || instance.status === 'CANCELLED';
        
        return (
          <Card key={instance.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">{instance.workflowDefinition?.name || 'Workflow'}</CardTitle>
                <CardDescription>
                  Started on {format(new Date(instance.createdAt), 'PPP')}
                </CardDescription>
              </div>
              <Badge variant={
                instance.status === 'COMPLETED' ? 'default' : 
                instance.status === 'FAILED' ? 'destructive' : 
                instance.status === 'IN_PROGRESS' ? 'secondary' : 'outline'
              }>
                {instance.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="text-sm">
                  <span className="text-muted-foreground mr-2">Current Stage:</span>
                  <span className="font-medium">{instance.currentStage?.name || 'Completed'}</span>
                </div>

                {!isCompleted && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                    <Button 
                      size="sm" 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => openModal({
                        id: 'approve-workflow',
                        type: 'dialog',
                        title: 'Approve Stage',
                        content: <WorkflowApproveForm instanceId={instance.id} />
                      })}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => openModal({
                        id: 'reject-workflow',
                        type: 'dialog',
                        title: 'Reject Stage',
                        content: <WorkflowRejectForm instanceId={instance.id} />
                      })}
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

'use client';

import * as React from 'react';
import { useWorkflowInstance } from '../../hooks/useWorkflowInstance';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Ban } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkflowHistoryTimeline } from './WorkflowHistoryTimeline';
import { useModalStore } from '@/shared/modals/useModalStore';
import { WorkflowApproveForm } from '../forms/WorkflowApproveForm';
import { WorkflowRejectForm } from '../forms/WorkflowRejectForm';
import { WorkflowCancelForm } from '../forms/WorkflowCancelForm';
import { WorkflowReturnForm } from '../forms/WorkflowReturnForm';
import { ProfileDocumentsTab } from '@/modules/document/components/details/ProfileDocumentsTab';

export function WorkflowInstanceDetails({ instanceId }: { instanceId: string }) {
  const { useWorkflowInstanceDetail } = useWorkflowInstance();
  const { data: instance, isLoading } = useWorkflowInstanceDetail(instanceId);
  const openModal = useModalStore((state) => state.openModal);

  if (isLoading) return <div className="p-8 text-center">Loading workflow...</div>;
  if (!instance) return <div className="p-8 text-center">Workflow not found</div>;

  const handleAction = (type: 'approve' | 'reject' | 'return' | 'cancel') => {
    switch(type) {
      case 'approve':
        openModal({ id: 'approve-workflow', type: 'dialog', title: 'Approve Stage', content: <WorkflowApproveForm instanceId={instance.id} /> });
        break;
      case 'reject':
        openModal({ id: 'reject-workflow', type: 'dialog', title: 'Reject Workflow', content: <WorkflowRejectForm instanceId={instance.id} /> });
        break;
      case 'return':
        openModal({ id: 'return-workflow', type: 'dialog', title: 'Send Back', content: <WorkflowReturnForm instanceId={instance.id} previousStages={[]} /> });
        break;
      case 'cancel':
        openModal({ id: 'cancel-workflow', type: 'dialog', title: 'Cancel Workflow', content: <WorkflowCancelForm instanceId={instance.id} /> });
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/hr/workflows">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Workflow: {instance.id.split('-')[0]}
          </h2>
          <p className="text-muted-foreground">Definition ID: {instance.workflowDefinitionId}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={instance.status === 'IN_PROGRESS' || instance.status === 'PENDING' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
            {instance.status}
          </Badge>

          {(instance.status === 'IN_PROGRESS' || instance.status === 'PENDING') && (
            <>
              <Button onClick={() => handleAction('approve')} variant="default" size="sm">
                <CheckCircle className="mr-2 h-4 w-4" /> Approve
              </Button>
              <Button onClick={() => handleAction('reject')} variant="destructive" size="sm">
                <XCircle className="mr-2 h-4 w-4" /> Reject
              </Button>
              <Button onClick={() => handleAction('return')} variant="outline" size="sm">
                <RotateCcw className="mr-2 h-4 w-4" /> Send Back
              </Button>
              <Button onClick={() => handleAction('cancel')} variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                <Ban className="mr-2 h-4 w-4" /> Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger value="overview" className="data-[state=active]:border-b-2 rounded-none data-[state=active]:border-primary px-6 py-3">Overview</TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:border-b-2 rounded-none data-[state=active]:border-primary px-6 py-3">Timeline</TabsTrigger>
          <TabsTrigger value="comments" className="data-[state=active]:border-b-2 rounded-none data-[state=active]:border-primary px-6 py-3">Comments</TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:border-b-2 rounded-none data-[state=active]:border-primary px-6 py-3">Documents</TabsTrigger>
        </TabsList>
        
        <div className="pt-6">
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Instance Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Entity Type</p>
                      <p className="font-medium">{instance.entityType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Entity ID</p>
                      <p className="font-medium">{instance.entityId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Started At</p>
                      <p className="font-medium">{new Date(instance.startedAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completed At</p>
                      <p className="font-medium">{instance.completedAt ? new Date(instance.completedAt).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Stage ID</p>
                      <p className="font-medium">{instance.currentStageId || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Related Entities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {instance.candidateId && (
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm">Candidate</span>
                      <Link href={`/hr/candidates/${instance.candidateId}`} className="text-primary hover:underline text-sm font-medium">
                        View Candidate
                      </Link>
                    </div>
                  )}
                  {instance.employeeId && (
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm">Employee</span>
                      <Link href={`/hr/employees/${instance.employeeId}`} className="text-primary hover:underline text-sm font-medium">
                        View Employee
                      </Link>
                    </div>
                  )}
                  {!instance.candidateId && !instance.employeeId && (
                    <p className="text-sm text-muted-foreground">No linked profiles.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Execution History</CardTitle>
              </CardHeader>
              <CardContent>
                <WorkflowHistoryTimeline instanceId={instance.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <span className="text-muted-foreground text-xl">💬</span>
                </div>
                <h3 className="text-lg font-medium">Comments Unavailable</h3>
                <p className="text-muted-foreground max-w-sm mt-2">
                  The backend API currently does not support workflow comments. This section will be activated once the endpoint is available.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardContent className="p-6">
                <ProfileDocumentsTab entityType="workflow" entityId={instance.id} profileId="" />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

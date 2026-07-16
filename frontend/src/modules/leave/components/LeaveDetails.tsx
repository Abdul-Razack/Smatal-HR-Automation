'use client';

import React from 'react';
import { useLeave, useApproveLeave, useRejectLeave, useCancelLeave } from '../hooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusChip } from '@/components/common/StatusChip';
import { LeaveStatus } from '../types';
import { useRouter } from 'next/navigation';
import { PermissionGuard } from '@/modules/auth/components/PermissionGuard'; // Ensure correct path based on previous grep

export function LeaveDetails({ id }: { id: string }) {
  const router = useRouter();
  const { data: leave, isLoading } = useLeave(id);
  const approveMutation = useApproveLeave();
  const rejectMutation = useRejectLeave();
  const cancelMutation = useCancelLeave();

  if (isLoading) return <div>Loading...</div>;
  if (!leave) return <div>Leave request not found.</div>;

  const handleApprove = async () => {
    await approveMutation.mutateAsync({ id, data: {} });
  };

  const handleReject = async () => {
    const reason = prompt('Reason for rejection:');
    if (reason) {
      await rejectMutation.mutateAsync({ id, data: { reason } });
    }
  };

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel this leave request?')) {
      await cancelMutation.mutateAsync(id);
      router.push('/leave/history');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Leave Request Details</h1>
        <StatusChip status={leave.status as any} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Information</CardTitle>
          <CardDescription>Submitted on {new Date(leave.createdAt).toLocaleString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-sm text-muted-foreground">Start Date</p>
              <p>{new Date(leave.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="font-semibold text-sm text-muted-foreground">End Date</p>
              <p>{new Date(leave.endDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="font-semibold text-sm text-muted-foreground">Duration</p>
              <p>{leave.durationDays} days {leave.isHalfDay ? '(Half Day)' : ''}</p>
            </div>
            <div>
              <p className="font-semibold text-sm text-muted-foreground">Reason</p>
              <p>{leave.reason}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-4">
        {leave.status === LeaveStatus.PENDING && (
          <>
            <PermissionGuard permissions={['Leave.Approve']}>
              <Button onClick={handleApprove} disabled={approveMutation.isPending}>
                {approveMutation.isPending ? 'Approving...' : 'Approve'}
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={rejectMutation.isPending}>
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
              </Button>
            </PermissionGuard>

            <PermissionGuard permissions={['Leave.Delete']}>
              <Button variant="outline" onClick={handleCancel} disabled={cancelMutation.isPending}>
                {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Request'}
              </Button>
            </PermissionGuard>
          </>
        )}
      </div>
    </div>
  );
}

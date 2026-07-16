'use client';

import React from 'react';
import { LeaveList } from '@/modules/leave/components/LeaveList';
import { usePendingApprovals } from '@/modules/leave/hooks';

export default function LeaveApprovalsPage() {
  const { data: pendingLeaves, isLoading } = usePendingApprovals();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Pending Approvals</h1>
      <LeaveList
        data={pendingLeaves || []}
        isLoading={isLoading}
        isApprovalView={true}
      />
    </div>
  );
}

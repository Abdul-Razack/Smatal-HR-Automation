'use client';

import React from 'react';
import { LeaveList } from '@/modules/leave/components/LeaveList';
import { useLeaves } from '@/modules/leave/hooks';
import { useAuthStore } from '@/store';

export default function LeaveHistoryPage() {
  const user = useAuthStore(state => state.currentUser);
  const employeeId = user?.id || '';

  const { data: leaves, isLoading } = useLeaves({ employeeId });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Leave History</h1>
      <LeaveList data={leaves || []} isLoading={isLoading} />
    </div>
  );
}

import React from 'react';
import { ApplyLeaveForm } from '@/modules/leave/components/ApplyLeaveForm';

export default function ApplyLeavePage() {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Apply for Leave</h1>
      <ApplyLeaveForm />
    </div>
  );
}

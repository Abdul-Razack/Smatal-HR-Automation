'use client';

import React from 'react';
import { LeaveTypeForm } from '@/modules/leave/components/LeaveTypeForm';

export default function LeaveTypesPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Leave Types</h1>
      <LeaveTypeForm />
    </div>
  );
}

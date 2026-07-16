'use client';

import React from 'react';
import { PolicyForm } from '@/modules/leave/components/PolicyForm';

export default function LeavePoliciesPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Leave Policies</h1>
      <PolicyForm />
    </div>
  );
}

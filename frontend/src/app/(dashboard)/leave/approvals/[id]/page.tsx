'use client';

import React from 'react';
import { LeaveDetails } from '@/modules/leave/components/LeaveDetails';
import { useParams } from 'next/navigation';

export default function LeaveApprovalDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <LeaveDetails id={id} />
    </div>
  );
}

'use client';

import React from 'react';
import { LeaveCalendar } from '@/modules/leave/components/LeaveCalendar';

export default function LeaveCalendarPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Leave Calendar</h1>
      <LeaveCalendar />
    </div>
  );
}

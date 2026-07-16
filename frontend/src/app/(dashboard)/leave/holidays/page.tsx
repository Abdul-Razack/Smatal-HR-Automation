'use client';

import React from 'react';
import { HolidayForm } from '@/modules/leave/components/HolidayForm';

export default function HolidaysPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Holidays</h1>
      <HolidayForm />
    </div>
  );
}

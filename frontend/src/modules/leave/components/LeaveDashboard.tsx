'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeaves, useHolidays, useLeaveBalance } from '../hooks/useLeaveQueries';
import { LeaveStatus } from '../types';
import { LeaveList } from './LeaveList';
import { LeaveBalanceCards } from './LeaveBalanceCards';
import { useAuthStore } from '@/store';

export function LeaveDashboard() {
  const user = useAuthStore(state => state.currentUser);
  const employeeId = user?.id || '';

  const { data: recentLeaves, isLoading: leavesLoading } = useLeaves({
    employeeId,
    limit: 5,
  });

  const { data: holidays, isLoading: holidaysLoading } = useHolidays({
    year: new Date().getFullYear(),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Leave Dashboard</h1>
      
      {employeeId && <LeaveBalanceCards employeeId={employeeId} />}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {leavesLoading ? (
              <div>Loading...</div>
            ) : (
              <LeaveList
                data={recentLeaves || []}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Holidays</CardTitle>
          </CardHeader>
          <CardContent>
            {holidaysLoading ? (
              <div>Loading...</div>
            ) : (
              <ul className="space-y-2">
                {holidays?.slice(0, 5).map(holiday => (
                  <li key={holiday.id} className="flex justify-between border-b pb-2">
                    <span className="font-medium">{holiday.name}</span>
                    <span className="text-muted-foreground">{new Date(holiday.date).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeaveBalance } from '../hooks/useLeaveQueries';

export function LeaveBalanceCards({ employeeId }: { employeeId: string }) {
  const { data: balances, isLoading } = useLeaveBalance(employeeId);

  if (isLoading) {
    return <div>Loading balances...</div>;
  }

  if (!balances || balances.length === 0) {
    return <div>No leave balances found.</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {balances.map((balance) => (
        <Card key={balance.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Leave Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{balance.availableBalance} days</div>
            <p className="text-xs text-muted-foreground">
              Total Entitlement: {balance.totalEntitlement}
              <br />
              Used: {balance.usedDays} | Pending: {balance.pendingDays}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

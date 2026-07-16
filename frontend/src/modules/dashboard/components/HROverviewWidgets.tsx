'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck } from 'lucide-react';
import { useAnalytics } from '@/modules/analytics/hooks/useAnalytics';

export function HROverviewWidgets() {
  const { useDashboard } = useAnalytics();
  const { data: metrics, isLoading } = useDashboard('HR');

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '--' : metrics?.totalEmployees || 0}</div>
          <p className="text-xs text-muted-foreground">Currently active in system</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '--' : metrics?.totalCandidates || 0}</div>
          <p className="text-xs text-muted-foreground">In recruiting pipeline</p>
        </CardContent>
      </Card>
    </div>
  );
}

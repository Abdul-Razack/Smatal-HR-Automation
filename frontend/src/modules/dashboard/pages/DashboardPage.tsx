'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/modules/analytics/api/analytics.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Building2,
  GitBranch,
  UserCheck,
  UserPlus,
  CheckCircle2,
  Clock,
  TrendingUp,
  CalendarDays,
} from 'lucide-react';

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  isLoading,
  accent,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  isLoading?: boolean;
  accent?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`rounded-md p-2 ${accent || 'bg-primary/10'}`}>
          <Icon className={`h-4 w-4 ${accent ? 'text-white' : 'text-primary'}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">
          {isLoading ? (
            <span className="inline-block h-8 w-16 animate-pulse rounded bg-muted" />
          ) : (
            value
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

function RecentHireRow({
  name,
  businessId,
  joinedAt,
}: {
  name: string;
  businessId: string;
  joinedAt: string;
}) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const date = new Date(joinedAt);
  const formatted = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0">
      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-xs text-muted-foreground">{businessId}</p>
      </div>
      <div className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
        <CalendarDays className="h-3 w-3" />
        {formatted}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: hrMetrics, isLoading: hrLoading } = useQuery({
    queryKey: ['dashboard', 'HR'],
    queryFn: () => analyticsApi.getDashboard('HR'),
  });

  const { data: orgMetrics, isLoading: orgLoading } = useQuery({
    queryKey: ['dashboard', 'ORG'],
    queryFn: () => analyticsApi.getDashboard('ORG'),
  });

  const recentHires = hrMetrics?.recentHires || [];
  const conversionRate =
    hrMetrics?.totalCandidates && hrMetrics.totalCandidates > 0
      ? Math.round(((hrMetrics.convertedCandidates || 0) / hrMetrics.totalCandidates) * 100)
      : 0;

  return (
    <div className="flex-1 space-y-6 p-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground text-sm">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Employees"
          value={hrMetrics?.activeEmployees ?? 0}
          subtitle="Currently in the system"
          icon={UserCheck}
          isLoading={hrLoading}
          accent="bg-blue-500"
        />
        <StatCard
          title="Total Candidates"
          value={hrMetrics?.totalCandidates ?? 0}
          subtitle={`${hrMetrics?.activeCandidates ?? 0} active in pipeline`}
          icon={UserPlus}
          isLoading={hrLoading}
          accent="bg-violet-500"
        />
        <StatCard
          title="Running Workflows"
          value={hrMetrics?.runningWorkflows ?? 0}
          subtitle={`${hrMetrics?.completedWorkflows ?? 0} completed total`}
          icon={GitBranch}
          isLoading={hrLoading}
          accent="bg-amber-500"
        />
        <StatCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          subtitle="Candidates converted to employees"
          icon={TrendingUp}
          isLoading={hrLoading}
          accent="bg-emerald-500"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Converted Candidates"
          value={hrMetrics?.convertedCandidates ?? 0}
          subtitle="Hired & onboarded"
          icon={CheckCircle2}
          isLoading={hrLoading}
        />
        <StatCard
          title="Pending Approvals"
          value={hrMetrics?.pendingApprovals ?? 0}
          subtitle="Workflow stages awaiting review"
          icon={Clock}
          isLoading={hrLoading}
        />
        <StatCard
          title="Completed Workflows"
          value={hrMetrics?.completedWorkflows ?? 0}
          subtitle="All time"
          icon={Users}
          isLoading={hrLoading}
        />
      </div>

      {/* Bottom Panels */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Recent Hires */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <UserCheck className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Recent Hires</CardTitle>
          </CardHeader>
          <CardContent>
            {hrLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                      <div className="h-2 w-20 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentHires.length > 0 ? (
              <div>
                {recentHires.slice(0, 5).map((hire) => (
                  <RecentHireRow
                    key={hire.id}
                    name={hire.name}
                    businessId={hire.businessId}
                    joinedAt={hire.joinedAt}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Users className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No recent hires found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pipeline Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <GitBranch className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Recruitment Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            {hrLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-2 bg-muted animate-pulse rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-5 pt-2">
                {[
                  {
                    label: 'Active Candidates',
                    value: hrMetrics?.activeCandidates ?? 0,
                    total: hrMetrics?.totalCandidates ?? 1,
                    color: 'bg-blue-500',
                  },
                  {
                    label: 'Converted to Employee',
                    value: hrMetrics?.convertedCandidates ?? 0,
                    total: hrMetrics?.totalCandidates ?? 1,
                    color: 'bg-emerald-500',
                  },
                  {
                    label: 'Workflows Running',
                    value: hrMetrics?.runningWorkflows ?? 0,
                    total: Math.max((hrMetrics?.runningWorkflows ?? 0) + (hrMetrics?.completedWorkflows ?? 0), 1),
                    color: 'bg-amber-500',
                  },
                ].map(({ label, value, total, color }) => {
                  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                  return (
                    <div key={label} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-semibold">
                          {value} <span className="text-muted-foreground font-normal">/ {total}</span>
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${color} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-right">{pct}%</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

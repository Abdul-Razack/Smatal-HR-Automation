'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/modules/analytics/api/analytics.api';
import { useCurrentUser } from '@/modules/auth/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  UserCheck,
  CheckCircle2,
  Clock,
  UserMinus,
  CalendarDays,
  FileText,
  Building2,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  AlertCircle,
  Inbox,
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
    <Card className="relative overflow-hidden transition-all hover:shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`rounded-md p-2 ${accent || 'bg-primary/10'}`}>
          <Icon className={`h-4 w-4 ${accent ? 'text-white' : 'text-primary'}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">
          {isLoading ? (
            <span className="inline-block h-8 w-16 animate-pulse rounded bg-muted" />
          ) : (
            value
          )}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function formatDate(dateStr?: string | Date | null) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDaysUntil(dateStr?: string | Date | null) {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return null;
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  return `in ${diffDays}d`;
}

export default function DashboardPage() {
  const currentUser = useCurrentUser();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => analyticsApi.getDashboardSummary(),
  });

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const userName =
    currentUser?.name ||
    currentUser?.email?.split('@')[0] ||
    'HR Administrator';

  const newJoiners = metrics?.newJoinersThisMonth || [];
  const upcomingConfirmations = metrics?.upcomingConfirmations || [];
  const noticePeriodEmployees = metrics?.noticePeriodList || [];
  const recentRelieved = metrics?.recentRelieved || [];

  return (
    <div className="flex-1 space-y-6 p-6 pt-4">
      {/* Header Greeting */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">HR Dashboard</h2>
          <p className="text-muted-foreground text-sm">
            {greeting}, <span className="font-semibold text-foreground">{userName}</span>. Overview
            of your organization&apos;s HR status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/hr/employees">
            <Button size="sm" variant="outline">
              <Users className="h-4 w-4 mr-1.5" />
              Employee Directory
            </Button>
          </Link>
          <Link href="/hr/documents">
            <Button size="sm">
              <FileText className="h-4 w-4 mr-1.5" />
              Generate Document
            </Button>
          </Link>
        </div>
      </div>

      {/* Row 1: Primary Employee Overview */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={metrics?.totalEmployees ?? 0}
          subtitle="All recorded employees"
          icon={Users}
          isLoading={isLoading}
          accent="bg-slate-700"
        />
        <StatCard
          title="Active Employees"
          value={metrics?.activeEmployees ?? 0}
          subtitle="Currently working staff"
          icon={UserCheck}
          isLoading={isLoading}
          accent="bg-blue-600"
        />
        <StatCard
          title="Probation"
          value={metrics?.probationEmployees ?? 0}
          subtitle="Under evaluation period"
          icon={Clock}
          isLoading={isLoading}
          accent="bg-amber-500"
        />
        <StatCard
          title="Confirmed"
          value={metrics?.confirmedEmployees ?? 0}
          subtitle="Permanent staff members"
          icon={CheckCircle2}
          isLoading={isLoading}
          accent="bg-emerald-600"
        />
      </div>

      {/* Row 2: Notice Period & Exit Metrics */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Notice Period"
          value={metrics?.noticePeriodEmployees ?? 0}
          subtitle="Currently serving notice"
          icon={UserMinus}
          isLoading={isLoading}
          accent="bg-orange-600"
        />
        <StatCard
          title="Relieved"
          value={metrics?.relievedEmployees ?? 0}
          subtitle="Exited employees"
          icon={Briefcase}
          isLoading={isLoading}
          accent="bg-zinc-600"
        />
        <StatCard
          title="Pending Resignations"
          value={metrics?.pendingResignations ?? 0}
          subtitle="Awaiting HR / Admin review"
          icon={AlertCircle}
          isLoading={isLoading}
          accent="bg-rose-600"
        />
        <StatCard
          title="Generated Documents"
          value={metrics?.generatedDocuments ?? 0}
          subtitle="Letters & official certificates"
          icon={FileText}
          isLoading={isLoading}
          accent="bg-indigo-600"
        />
      </div>

      {/* Main Content Sections: 2x2 Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Section 1: New Joiners This Month */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-base">New Joiners This Month</CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs">
                {newJoiners.length} {newJoiners.length === 1 ? 'Joiner' : 'Joiners'}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Employees whose official joining date falls within the current calendar month.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : newJoiners.length > 0 ? (
              <div className="divide-y">
                <div className="grid grid-cols-12 px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/30">
                  <div className="col-span-5">Employee</div>
                  <div className="col-span-4">Department / Designation</div>
                  <div className="col-span-3 text-right">Joining Date</div>
                </div>
                {newJoiners.map((emp) => (
                  <div key={emp.id} className="grid grid-cols-12 px-4 py-3 text-sm items-center hover:bg-muted/10">
                    <div className="col-span-5 min-w-0 pr-2">
                      <Link
                        href={`/hr/employees/${emp.id}`}
                        className="font-medium text-foreground hover:text-primary hover:underline truncate block"
                      >
                        {emp.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">{emp.employeeId}</span>
                    </div>
                    <div className="col-span-4 text-xs text-muted-foreground truncate pr-2">
                      <p className="font-medium text-foreground truncate">{emp.designation}</p>
                      <p className="truncate">{emp.department}</p>
                    </div>
                    <div className="col-span-3 text-xs text-right text-muted-foreground whitespace-nowrap">
                      {formatDate(emp.joiningDate)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <Inbox className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm font-medium">No new joiners this month</p>
                <p className="text-xs opacity-75">New employee registrations will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Upcoming Confirmations */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <CardTitle className="text-base">Upcoming Confirmations</CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs">
                {upcomingConfirmations.length} Pending
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Staff currently in probation with confirmation dates approaching in the next 30 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : upcomingConfirmations.length > 0 ? (
              <div className="divide-y">
                <div className="grid grid-cols-12 px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/30">
                  <div className="col-span-5">Employee</div>
                  <div className="col-span-4">Designation</div>
                  <div className="col-span-3 text-right">Confirmation Date</div>
                </div>
                {upcomingConfirmations.map((emp) => (
                  <div key={emp.id} className="grid grid-cols-12 px-4 py-3 text-sm items-center hover:bg-muted/10">
                    <div className="col-span-5 min-w-0 pr-2">
                      <Link
                        href={`/hr/employees/${emp.id}`}
                        className="font-medium text-foreground hover:text-primary hover:underline truncate block"
                      >
                        {emp.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">{emp.employeeId}</span>
                    </div>
                    <div className="col-span-4 text-xs text-muted-foreground truncate pr-2">
                      <span className="font-medium text-foreground">{emp.designation}</span>
                    </div>
                    <div className="col-span-3 text-right whitespace-nowrap">
                      <p className="text-xs font-medium text-foreground">{formatDate(emp.confirmationDate)}</p>
                      <span className="text-[11px] text-amber-600 font-medium">
                        {getDaysUntil(emp.confirmationDate)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mb-2 opacity-40 text-emerald-600" />
                <p className="text-sm font-medium">No upcoming confirmations</p>
                <p className="text-xs opacity-75">No employees in probation due for confirmation within 30 days.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 3: Notice Period */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserMinus className="h-4 w-4 text-orange-600" />
                <CardTitle className="text-base">Notice Period</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs text-orange-700 bg-orange-50 border-orange-200">
                {noticePeriodEmployees.length} Active
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Employees currently serving notice prior to final relief and handover.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : noticePeriodEmployees.length > 0 ? (
              <div className="divide-y">
                <div className="grid grid-cols-12 px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/30">
                  <div className="col-span-5">Employee</div>
                  <div className="col-span-4">Designation</div>
                  <div className="col-span-3 text-right">Last Working Date</div>
                </div>
                {noticePeriodEmployees.map((emp) => (
                  <div key={emp.id} className="grid grid-cols-12 px-4 py-3 text-sm items-center hover:bg-muted/10">
                    <div className="col-span-5 min-w-0 pr-2">
                      <Link
                        href={`/hr/employees/${emp.id}`}
                        className="font-medium text-foreground hover:text-primary hover:underline truncate block"
                      >
                        {emp.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">{emp.employeeId}</span>
                    </div>
                    <div className="col-span-4 text-xs text-muted-foreground truncate pr-2">
                      <span className="font-medium text-foreground">{emp.designation}</span>
                    </div>
                    <div className="col-span-3 text-right whitespace-nowrap">
                      <p className="text-xs font-medium text-foreground">{formatDate(emp.lastWorkingDate)}</p>
                      <span className="text-[11px] text-orange-600 font-medium">
                        {getDaysUntil(emp.lastWorkingDate)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <Inbox className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm font-medium">No employees currently in notice period</p>
                <p className="text-xs opacity-75">Submitted and active notice periods will be tracked here.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 4: Exit & Recently Relieved */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-zinc-600" />
                <CardTitle className="text-base">Exit Summary & Recently Relieved</CardTitle>
              </div>
              <Link href="/hr/exit" className="text-xs text-primary hover:underline flex items-center gap-1">
                Exit Hub <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <CardDescription className="text-xs">
              Recent departures with completed clearances and final relieving documentation.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : recentRelieved.length > 0 ? (
              <div className="divide-y">
                <div className="grid grid-cols-12 px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/30">
                  <div className="col-span-5">Employee</div>
                  <div className="col-span-4">Designation</div>
                  <div className="col-span-3 text-right">Relieved Date</div>
                </div>
                {recentRelieved.map((emp) => (
                  <div key={emp.id} className="grid grid-cols-12 px-4 py-3 text-sm items-center hover:bg-muted/10">
                    <div className="col-span-5 min-w-0 pr-2">
                      <Link
                        href={`/hr/employees/${emp.id}`}
                        className="font-medium text-foreground hover:text-primary hover:underline truncate block"
                      >
                        {emp.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">{emp.employeeId}</span>
                    </div>
                    <div className="col-span-4 text-xs text-muted-foreground truncate pr-2">
                      <span className="font-medium text-foreground">{emp.designation}</span>
                    </div>
                    <div className="col-span-3 text-right text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(emp.relievedDate)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <Inbox className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm font-medium">No recent exits recorded</p>
                <p className="text-xs opacity-75">Completed exit processes and relieved staff will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Security & Tenant Assurance Footer */}
      <div className="rounded-lg border p-4 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Tenant Isolated HR Workspace • Real-Time Database Metrics</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/master/organization" className="hover:underline text-foreground">
            Company Settings
          </Link>
          <span>•</span>
          <Link href="/hr/audit" className="hover:underline text-foreground">
            Audit Logs
          </Link>
          <span>•</span>
          <Link href="/documents/templates" className="hover:underline text-foreground">
            Document Templates
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  UserMinus,
  FileText,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowRight,
  Clock,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useEmployee } from '@/modules/employee/hooks/useEmployee';
import { ExitOverviewData } from '@/modules/employee/types';

export default function ExitResignationPage() {
  const { useExitOverview } = useEmployee();
  const { data: overview, isLoading, refetch } = useExitOverview();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | 'SUBMITTED' | 'NOTICE_PERIOD' | 'COMPLETED'>('ALL');

  const pendingCount = overview?.pendingResignations ?? 0;
  const noticeCount = overview?.activeNoticePeriods ?? 0;
  const completedCount = overview?.completedExits ?? 0;

  const pipeline = (overview?.pipeline || []).filter((item: any) => {
    const matchesSearch =
      searchTerm === '' ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'SUBMITTED') {
      return item.resignationStatus === 'SUBMITTED';
    }
    if (statusFilter === 'NOTICE_PERIOD') {
      return item.lifecycleStatus === 'NOTICE_PERIOD' || item.resignationStatus === 'ACCEPTED';
    }
    if (statusFilter === 'COMPLETED') {
      return item.lifecycleStatus === 'RELIEVED' || item.resignationStatus === 'COMPLETED';
    }
    return true;
  });

  const getResignationBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">Submitted</Badge>;
      case 'ACCEPTED':
        return <Badge variant="default" className="bg-blue-600 text-white">Accepted</Badge>;
      case 'WITHDRAWN':
        return <Badge variant="outline" className="text-gray-500">Withdrawn</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLifecycleBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="outline" className="text-blue-700 border-blue-300">CONFIRMED</Badge>;
      case 'NOTICE_PERIOD':
        return <Badge className="bg-amber-500 text-white">NOTICE PERIOD</Badge>;
      case 'RELIEVED':
        return <Badge className="bg-emerald-600 text-white">RELIEVED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 pt-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Exit & Resignation Management</h2>
          <p className="text-muted-foreground text-sm">
            Live HR separation pipeline: manage employee resignations, notice periods, departmental NOC clearance, and relieving certificates.
          </p>
        </div>
      </div>

      {/* 1. Real Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          className={`cursor-pointer transition-all ${statusFilter === 'SUBMITTED' ? 'ring-2 ring-primary shadow-md' : 'hover:border-primary/50'}`}
          onClick={() => setStatusFilter(statusFilter === 'SUBMITTED' ? 'ALL' : 'SUBMITTED')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Resignations</CardTitle>
            <UserMinus className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting HR acceptance & notice scheduling</p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${statusFilter === 'NOTICE_PERIOD' ? 'ring-2 ring-primary shadow-md' : 'hover:border-primary/50'}`}
          onClick={() => setStatusFilter(statusFilter === 'NOTICE_PERIOD' ? 'ALL' : 'NOTICE_PERIOD')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Notice Periods</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{noticeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Employees serving notice / clearance in progress</p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${statusFilter === 'COMPLETED' ? 'ring-2 ring-primary shadow-md' : 'hover:border-primary/50'}`}
          onClick={() => setStatusFilter(statusFilter === 'COMPLETED' ? 'ALL' : 'COMPLETED')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Exits</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">NOC cleared & formally relieved</p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Interactive Exit Pipeline Workspace */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base">Exit Pipeline Workspace</CardTitle>
              <CardDescription>
                Track employees through Resignation → Notice Period → Clearance → Relieved.
              </CardDescription>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employee or dept..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 text-xs h-9"
                />
              </div>

              <div className="flex rounded-md border p-1 bg-muted/40 text-xs">
                <button
                  type="button"
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${statusFilter === 'ALL' ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setStatusFilter('ALL')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${statusFilter === 'SUBMITTED' ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setStatusFilter('SUBMITTED')}
                >
                  Pending
                </button>
                <button
                  type="button"
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${statusFilter === 'NOTICE_PERIOD' ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setStatusFilter('NOTICE_PERIOD')}
                >
                  Notice
                </button>
                <button
                  type="button"
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${statusFilter === 'COMPLETED' ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setStatusFilter('COMPLETED')}
                >
                  Relieved
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground flex items-center justify-center gap-2">
              <Clock className="h-5 w-5 animate-spin" />
              <span>Loading exit pipeline...</span>
            </div>
          ) : pipeline.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mb-3 text-muted-foreground/60" />
              <h3 className="text-base font-semibold text-foreground">No Exit Records in Filter</h3>
              <p className="text-sm max-w-md mt-1">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'No employees match your current search or status filter.'
                  : 'No active resignations or exit records found. Separation workflows will appear here once initiated.'}
              </p>
              {(searchTerm || statusFilter !== 'ALL') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 text-xs"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('ALL');
                  }}
                >
                  Reset Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Resignation Date</TableHead>
                    <TableHead>Last Working Date</TableHead>
                    <TableHead>Resignation Status</TableHead>
                    <TableHead>Clearance</TableHead>
                    <TableHead>Lifecycle</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pipeline.map((emp: any) => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <div className="font-semibold text-sm text-foreground">{emp.name}</div>
                        <div className="text-xs text-muted-foreground">{emp.employeeNumber}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium">{emp.department}</div>
                        <div className="text-[11px] text-muted-foreground">{emp.designation}</div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {emp.resignationDate ? new Date(emp.resignationDate).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {emp.lastWorkingDate ? (
                          <div className="font-medium text-foreground">
                            {new Date(emp.lastWorkingDate).toLocaleDateString()}
                          </div>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>{getResignationBadge(emp.resignationStatus)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-medium">
                            {emp.clearanceProgress.cleared}/{emp.clearanceProgress.total}
                          </span>
                          {emp.clearanceProgress.isAllCleared ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getLifecycleBadge(emp.lifecycleStatus)}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/hr/employees/${emp.id}?tab=exit`}>
                          <Button size="sm" variant="ghost" className="text-xs gap-1">
                            Manage Exit
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

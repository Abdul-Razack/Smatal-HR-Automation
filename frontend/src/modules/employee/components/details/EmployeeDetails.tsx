'use client';

import * as React from 'react';
import { useEmployee } from '../../hooks/useEmployee';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  UserCheck,
  Edit3,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Briefcase,
  User,
  DollarSign,
  FileText,
  Activity,
  LogOut,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmployeeEditModal } from '../forms/EmployeeEditModal';
import { EmployeeHistoryTimeline } from './EmployeeHistoryTimeline';
import { EmployeeDynamicFieldsTab } from './EmployeeDynamicFieldsTab';
import { EmployeeLifecycleTracker } from '../lifecycle/EmployeeLifecycleTracker';
import { EmployeeLifecycleModal } from '../lifecycle/EmployeeLifecycleModal';
import { EmployeeExitTab } from './EmployeeExitTab';
import { EmployeeDocumentsTab } from './EmployeeDocumentsTab';
import { EmployeeStatus } from '../../types';

export function EmployeeDetails({ employeeId }: { employeeId: string }) {
  const { useEmployeeDetail, activateEmployee } = useEmployee();
  const { data: employee, isLoading } = useEmployeeDetail(employeeId);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [lifecycleModalOpen, setLifecycleModalOpen] = React.useState(false);
  const [targetLifecycleStatus, setTargetLifecycleStatus] = React.useState<EmployeeStatus>('CONFIRMED');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <Clock className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading employee record...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-lg font-medium text-destructive">Employee not found or access restricted.</p>
        <Link href="/hr/employees">
          <Button variant="outline">Back to Employee Directory</Button>
        </Link>
      </div>
    );
  }

  const profile = employee.profile;
  const fullName = profile
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
    : 'Unknown Employee';
  const email = profile?.personalEmail || profile?.email || 'N/A';

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'ACTIVE':
        return 'default';
      case 'PROBATION':
      case 'NOTICE_PERIOD':
      case 'NOTICE':
        return 'secondary';
      case 'JOINED':
      case 'OFFER':
      case 'ONBOARDING':
        return 'outline';
      case 'RELIEVED':
      case 'TERMINATED':
      case 'RESIGNED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const openTransition = (status: EmployeeStatus) => {
    setTargetLifecycleStatus(status);
    setLifecycleModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-4">
          <Link href="/hr/employees">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
              <Badge variant={getStatusBadgeVariant(employee.status)} className="font-semibold">
                {employee.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              Employee ID: {employee.businessId || employee.employeeNumber || 'N/A'}
              {employee.employeeNumber && employee.employeeNumber !== employee.businessId && (
                <span className="ml-2 font-normal text-xs text-muted-foreground">
                  (Code: {employee.employeeNumber})
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Context-Specific Lifecycle Action */}
          {(employee.status === 'OFFER' || employee.status === 'ONBOARDING') && (
            <Button
              variant="default"
              onClick={() => openTransition('JOINED')}
            >
              <UserCheck className="mr-2 h-4 w-4" /> Mark as Joined
            </Button>
          )}

          {employee.status === 'JOINED' && (
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => openTransition('PROBATION')}
            >
              <Clock className="mr-2 h-4 w-4" /> Move to Probation
            </Button>
          )}

          {employee.status === 'PROBATION' && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => openTransition('CONFIRMED')}
            >
              <UserCheck className="mr-2 h-4 w-4" /> Confirm Employee
            </Button>
          )}

          {(employee.status === 'CONFIRMED' || employee.status === 'ACTIVE') && (
            <Button
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
              onClick={() => openTransition('NOTICE_PERIOD')}
            >
              <LogOut className="mr-2 h-4 w-4" /> Start Notice Period
            </Button>
          )}

          {(employee.status === 'NOTICE_PERIOD' || employee.status === 'NOTICE') && (
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => openTransition('RELIEVED')}
            >
              <UserCheck className="mr-2 h-4 w-4" /> Mark as Relieved
            </Button>
          )}

          <Button variant="outline" onClick={() => setEditModalOpen(true)}>
            <Edit3 className="mr-2 h-4 w-4" /> Edit Employee
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full md:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Audit & History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
          <TabsTrigger value="exit">Exit Information</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1: Personal Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Full Name</p>
                  <p className="font-medium text-foreground">{fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email Address
                  </p>
                  <p className="font-medium text-foreground break-all">{email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Phone
                  </p>
                  <p className="font-medium text-foreground">{profile?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Address
                  </p>
                  <p className="font-medium text-foreground">{profile?.address || 'Not provided'}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Date of Birth
                    </p>
                    <p className="font-medium text-foreground">
                      {profile?.dateOfBirth
                        ? new Date(profile.dateOfBirth).toLocaleDateString()
                        : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Gender</p>
                    <p className="font-medium text-foreground">{profile?.gender || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Employment Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Employment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Joining Date</p>
                    <p className="font-medium text-foreground">
                      {employee.joinedDate
                        ? new Date(employee.joinedDate).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Employment Type</p>
                    <p className="font-medium text-foreground">{employee.employmentType || 'Full-time'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> Annual Salary
                  </p>
                  <p className="font-medium text-foreground">
                    {employee.salary !== undefined && employee.salary !== null
                      ? `$${Number(employee.salary).toLocaleString()}`
                      : 'Not disclosed'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Probation End Date</p>
                    <p className="font-medium text-foreground">
                      {employee.probationEndDate
                        ? new Date(employee.probationEndDate).toLocaleDateString()
                        : 'None'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Confirmation Date</p>
                    <p className="font-medium text-foreground">
                      {employee.confirmationDate
                        ? new Date(employee.confirmationDate).toLocaleDateString()
                        : 'Pending'}
                    </p>
                  </div>
                </div>

                {(employee.resignationDate || employee.lastWorkingDate) && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    {employee.resignationDate && (
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Resignation Date</p>
                        <p className="font-medium text-foreground">
                          {new Date(employee.resignationDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {employee.lastWorkingDate && (
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Last Working Date</p>
                        <p className="font-medium text-foreground">
                          {new Date(employee.lastWorkingDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground font-medium">Status</p>
                  <Badge variant={getStatusBadgeVariant(employee.status)} className="mt-1">
                    {employee.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Organization Mapping */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" />
                  Organization Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Department</p>
                  <p className="font-medium text-foreground">
                    {employee.department?.name || 'Unassigned'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Designation</p>
                  <p className="font-medium text-foreground">
                    {employee.designation?.name || 'Unassigned'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Branch / Location</p>
                  <p className="font-medium text-foreground">
                    {employee.branch?.name || 'Headquarters / Main'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Reporting Manager</p>
                  <p className="font-medium text-foreground">
                    {employee.manager?.name || 'No manager assigned'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dynamic Fields if any */}
          {employee.dynamicFields && employee.dynamicFields.length > 0 && (
            <EmployeeDynamicFieldsTab
              employeeId={employee.id}
              existingData={employee.dynamicFields}
            />
          )}
        </TabsContent>

        {/* Tab 2: Employment History & Audit */}
        <TabsContent value="history">
          <EmployeeHistoryTimeline employeeId={employee.id} />
        </TabsContent>

        {/* Tab 3: Documents History & Versioning (Step 11) */}
        <TabsContent value="documents">
          <EmployeeDocumentsTab
            employeeId={employee.id}
            employeeName={
              employee.profile
                ? `${employee.profile.firstName} ${employee.profile.lastName}`
                : undefined
            }
            employeeNumber={employee.employeeNumber}
          />
        </TabsContent>

        {/* Tab 4: Lifecycle Tracker */}
        <TabsContent value="lifecycle">
          <EmployeeLifecycleTracker employee={employee} />
        </TabsContent>

        {/* Tab 5: Exit Information (Step 8) */}
        <TabsContent value="exit">
          <EmployeeExitTab employee={employee} />
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      {editModalOpen && (
        <EmployeeEditModal
          employee={employee}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
        />
      )}

      {/* Lifecycle Modal */}
      {lifecycleModalOpen && (
        <EmployeeLifecycleModal
          employee={employee}
          targetStatus={targetLifecycleStatus}
          open={lifecycleModalOpen}
          onOpenChange={setLifecycleModalOpen}
        />
      )}
    </div>
  );
}

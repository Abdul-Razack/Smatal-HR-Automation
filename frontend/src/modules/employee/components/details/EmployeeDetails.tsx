'use client';

import * as React from 'react';
import { useEmployee } from '../../hooks/useEmployee';
import { ProfileLayout } from '@/modules/profile/components/layout/ProfileLayout';
import { ProfileOverview } from '@/modules/profile/components/widgets/ProfileOverview';
import { ProfileTimeline } from '@/modules/profile/components/widgets/ProfileTimeline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileDocumentsTab } from '@/modules/document/components/details/ProfileDocumentsTab';

import { PermissionGuard } from '@/modules/auth/components/PermissionGuard';
import { EmployeeHistoryTimeline } from './EmployeeHistoryTimeline';
import { EmployeeDynamicFieldsTab } from './EmployeeDynamicFieldsTab';
import { EmployeeWorkflowStatus } from './EmployeeWorkflowStatus';

export function EmployeeDetails({ employeeId }: { employeeId: string }) {
  const { useEmployeeDetail, activateEmployee } = useEmployee();
  const { data: employee, isLoading } = useEmployeeDetail(employeeId);

  if (isLoading) return <div>Loading...</div>;
  if (!employee) return <div>Employee not found</div>;

  const OrgMappingTab = (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Organization Mapping</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Department ID</p>
              <p className="font-medium">{employee.departmentId || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Designation ID</p>
              <p className="font-medium">{employee.designationId || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Branch ID</p>
              <p className="font-medium">{employee.branchId || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reports To (Manager ID)</p>
              <p className="font-medium">{employee.reportsToId || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <PermissionGuard permissions={['Employee.Read']}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/hr/employees">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h2 className="text-2xl font-bold tracking-tight">
              {employee.profile?.firstName || 'Unknown'} {employee.profile?.lastName}
            </h2>
            <p className="text-muted-foreground">EMP ID: {employee.employeeNumber || 'Pending'}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm px-3 py-1">
              Status: {employee.status}
            </Badge>

            {employee.status === 'ONBOARDING' && (
              <PermissionGuard permissions={['Employee.Activate']}>
                <Button onClick={() => activateEmployee.mutate(employee.id)}>
                  <UserCheck className="mr-2 h-4 w-4" /> Activate Employee
                </Button>
              </PermissionGuard>
            )}
          </div>
        </div>

        <ProfileLayout 
          overviewTab={<ProfileOverview profile={employee.profile} />}
          timelineTab={<EmployeeHistoryTimeline employeeId={employee.id} />}
          dynamicFieldsTab={<EmployeeDynamicFieldsTab employeeId={employee.id} existingData={(employee as any).dynamicFields} />}
          documentsTab={<ProfileDocumentsTab entityType="employee" entityId={employee.id} profileId={employee.profileId} />}
          customTabs={[
            { value: 'organization', label: 'Organization', content: OrgMappingTab },
            { value: 'workflows', label: 'Workflows', content: <EmployeeWorkflowStatus employeeId={employee.id} /> }
          ]}
        />
      </div>
    </PermissionGuard>
  );
}

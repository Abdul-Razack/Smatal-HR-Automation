'use client';

import * as React from 'react';
import { useEmployee } from '../../hooks/useEmployee';
import { DataTable } from '@/shared/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Employee } from '../../types';
import { Button } from '@/components/ui/button';
import { Eye, UserX } from 'lucide-react';
import { useModalStore } from '@/shared/modals/useModalStore';
import { EmployeeTerminateForm } from '../forms/EmployeeTerminateForm';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { PermissionGuard } from '@/modules/auth/components/PermissionGuard';

export function EmployeeList() {
  const { useEmployees } = useEmployee();
  const { data: employees = [], isLoading } = useEmployees();
  const openModal = useModalStore((state) => state.openModal);

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'employeeNumber',
      header: 'EMP ID',
    },
    {
      accessorKey: 'profile.firstName',
      header: 'Employee Name',
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.profile?.firstName} {row.original.profile?.lastName}
          <div className="text-xs text-muted-foreground font-normal">{row.original.profile?.email}</div>
        </div>
      )
    },
    {
      accessorKey: 'joinedDate',
      header: 'Joined Date',
      cell: ({ row }) => row.original.joinedDate ? new Date(row.original.joinedDate).toLocaleDateString() : 'N/A'
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'ACTIVE' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          {row.original.status === 'ACTIVE' && (
            <PermissionGuard permissions={['Employee.Terminate']}>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => openModal({
                  id: 'terminate-employee',
                  type: 'side-panel',
                  title: 'Terminate Employee',
                  content: <EmployeeTerminateForm employeeId={row.original.id} />,
                })}
                title="Terminate Employee"
              >
                <UserX className="h-4 w-4" />
              </Button>
            </PermissionGuard>
          )}
          <PermissionGuard permissions={['Employee.Read']}>
            <Link href={`/hr/employees/${row.original.id}`}>
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Directory</h2>
          <p className="text-muted-foreground">Manage active employees and workforce data</p>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={employees} 
        isLoading={isLoading}
        searchKey="employeeNumber"
        searchPlaceholder="Search by Employee ID..."
      />
    </div>
  );
}

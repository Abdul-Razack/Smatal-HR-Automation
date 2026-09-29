'use client';

import * as React from 'react';
import { useEmployee } from '../../hooks/useEmployee';
import { useOrganization } from '@/modules/organization/hooks/useOrganization';
import { DataTable } from '@/shared/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Employee } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, Edit3, UserX, UserPlus, Search, RefreshCw } from 'lucide-react';
import { useModalStore } from '@/shared/modals/useModalStore';
import { EmployeeTerminateForm } from '../forms/EmployeeTerminateForm';
import { EmployeeCreateModal } from '../forms/EmployeeCreateModal';
import { EmployeeEditModal } from '../forms/EmployeeEditModal';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function EmployeeList() {
  const [search, setSearch] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = React.useState<string>('ALL');
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [editingEmployee, setEditingEmployee] = React.useState<Employee | null>(null);

  const { useEmployees } = useEmployee();
  const { useDepartments } = useOrganization();
  const { data: departments = [] } = useDepartments();

  // Query params
  const queryParams: any = { limit: 100 };
  if (selectedStatus && selectedStatus !== 'ALL') {
    queryParams.status = selectedStatus;
  }
  if (selectedDepartment && selectedDepartment !== 'ALL') {
    queryParams.departmentId = selectedDepartment;
  }
  if (search.trim()) {
    queryParams.search = search.trim();
  }

  const { data: employees = [], isLoading, refetch } = useEmployees(queryParams);
  const openModal = useModalStore((state) => state.openModal);

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

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'businessId',
      header: 'EMP ID',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold">
          {row.original.businessId || row.original.employeeNumber || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'profile.firstName',
      header: 'Employee Name',
      cell: ({ row }) => {
        const profile = row.original.profile;
        const name = profile
          ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
          : 'Unknown';
        const email = profile?.personalEmail || profile?.email;
        return (
          <div className="font-medium">
            {name}
            {email && (
              <div className="text-xs text-muted-foreground font-normal">{email}</div>
            )}
          </div>
        );
      },
    },
    {
      id: 'department',
      header: 'Department',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.department?.name || 'Unassigned'}
        </span>
      ),
    },
    {
      id: 'designation',
      header: 'Designation',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.designation?.name || 'Unassigned'}
        </span>
      ),
    },
    {
      accessorKey: 'joinedDate',
      header: 'Joined Date',
      cell: ({ row }) =>
        row.original.joinedDate
          ? new Date(row.original.joinedDate).toLocaleDateString()
          : 'N/A',
    },
    {
      accessorKey: 'employmentType',
      header: 'Employment Type',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground font-medium">
          {row.original.employmentType || 'Full-time'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={getStatusBadgeVariant(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/hr/employees/${row.original.id}`}>
            <Button variant="ghost" size="icon" title="View Details">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditingEmployee(row.original)}
            title="Edit Employee"
          >
            <Edit3 className="h-4 w-4" />
          </Button>

          {row.original.status === 'ACTIVE' && (
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10"
              onClick={() =>
                openModal({
                  id: 'terminate-employee',
                  type: 'side-panel',
                  title: 'Terminate Employee',
                  content: <EmployeeTerminateForm employeeId={row.original.id} />,
                })
              }
              title="Terminate Employee"
            >
              <UserX className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header with Title and Add Employee button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Employees</h2>
          <p className="text-muted-foreground text-sm">
            Central workforce registry, personal records, and employment details
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
          <Button onClick={() => setCreateModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" /> Add Employee
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Employee ID, Name, or Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 w-full"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="JOINED">JOINED</SelectItem>
              <SelectItem value="PROBATION">PROBATION</SelectItem>
              <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
              <SelectItem value="ACTIVE">ACTIVE</SelectItem>
              <SelectItem value="NOTICE_PERIOD">NOTICE PERIOD</SelectItem>
              <SelectItem value="RELIEVED">RELIEVED</SelectItem>
              <SelectItem value="ONBOARDING">ONBOARDING</SelectItem>
              <SelectItem value="TERMINATED">TERMINATED</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Departments</SelectItem>
              {departments.map((dept: any) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={employees}
        isLoading={isLoading}
      />

      {/* Modals */}
      <EmployeeCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      {editingEmployee && (
        <EmployeeEditModal
          employee={editingEmployee}
          open={!!editingEmployee}
          onOpenChange={(open) => !open && setEditingEmployee(null)}
        />
      )}
    </div>
  );
}

'use client';

import * as React from 'react';
import { useOrganization } from '../../hooks/useOrganization';
import { DataTable } from '@/shared/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Department } from '../../types';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Upload } from 'lucide-react';
import { useModalStore } from '@/shared/modals/useModalStore';
import { DepartmentForm } from '../forms/DepartmentForm';

export function DepartmentList() {
  const { useDepartments } = useOrganization();
  const { data: departments = [], isLoading } = useDepartments();
  const openModal = useModalStore((state) => state.openModal);

  const columns: ColumnDef<Department>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'parentId',
      header: 'Parent ID', // Would resolve to name in real app
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => openModal({
              id: 'edit-department',
              type: 'side-panel',
              title: 'Edit Department',
              content: <DepartmentForm initialData={row.original} />,
            })}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Departments</h2>
          <p className="text-muted-foreground">Manage organization departments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openModal({
            id: 'import-department',
            type: 'modal',
            title: 'Import Departments',
            content: <div className="p-6 text-center text-muted-foreground">Import functionality coming soon.</div>,
          })}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button onClick={() => openModal({
            id: 'create-department',
            type: 'side-panel',
            title: 'Create Department',
            content: <DepartmentForm />,
          })}>
            <Plus className="mr-2 h-4 w-4" />
            Add Department
          </Button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={departments} 
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Search departments..."
      />
    </div>
  );
}

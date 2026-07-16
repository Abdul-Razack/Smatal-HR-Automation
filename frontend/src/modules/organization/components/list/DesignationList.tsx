'use client';

import * as React from 'react';
import { useOrganization } from '../../hooks/useOrganization';
import { DataTable } from '@/shared/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Designation } from '../../types';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useModalStore } from '@/shared/modals/useModalStore';
import { DesignationForm } from '../forms/DesignationForm';

export function DesignationList() {
  const { useDesignations } = useOrganization();
  const { data: designations = [], isLoading } = useDesignations();
  const openModal = useModalStore((state) => state.openModal);

  const columns: ColumnDef<Designation>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'level',
      header: 'Level',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon">
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
          <h2 className="text-2xl font-bold tracking-tight">Designations</h2>
          <p className="text-muted-foreground">Manage job titles and hierarchy levels</p>
        </div>
        <Button onClick={() => openModal({
          id: 'create-designation',
          type: 'side-panel',
          title: 'Create Designation',
          content: <DesignationForm />,
        })}>
          <Plus className="mr-2 h-4 w-4" />
          Add Designation
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={designations} 
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Search designations..."
      />
    </div>
  );
}

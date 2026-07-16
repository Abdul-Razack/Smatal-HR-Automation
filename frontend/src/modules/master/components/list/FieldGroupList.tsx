'use client';

import * as React from 'react';
import { useMaster } from '../../hooks/useMaster';
import { DataTable } from '@/shared/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { FieldGroup } from '../../types';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useModalStore } from '@/shared/modals/useModalStore';
import { FieldGroupForm } from '../forms/FieldGroupForm';

export function FieldGroupList() {
  const { useFieldGroups } = useMaster();
  const { data: groups = [], isLoading } = useFieldGroups();
  const openModal = useModalStore((state) => state.openModal);

  const columns: ColumnDef<FieldGroup>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'displayOrder',
      header: 'Display Order',
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
          <h2 className="text-2xl font-bold tracking-tight">Field Groups</h2>
          <p className="text-muted-foreground">Manage dynamic field groupings</p>
        </div>
        <Button onClick={() => openModal({
          id: 'create-field-group',
          type: 'side-panel',
          title: 'Create Field Group',
          content: <FieldGroupForm />,
        })}>
          <Plus className="mr-2 h-4 w-4" />
          Add Group
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={groups} 
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Search field groups..."
      />
    </div>
  );
}

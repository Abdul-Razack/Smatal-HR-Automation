'use client';

import * as React from 'react';
import { useMaster } from '../../hooks/useMaster';
import { DataTable } from '@/shared/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { FieldDefinition } from '../../types';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useModalStore } from '@/shared/modals/useModalStore';
import { FieldDefinitionForm } from '../forms/FieldDefinitionForm';
import { Badge } from '@/components/ui/badge';

export function FieldDefinitionList() {
  const { useFieldDefinitions } = useMaster();
  const { data: fields = [], isLoading } = useFieldDefinitions();
  const openModal = useModalStore((state) => state.openModal);

  const columns: ColumnDef<FieldDefinition>[] = [
    {
      accessorKey: 'machineKey',
      header: 'Machine Key',
    },
    {
      accessorKey: 'displayName',
      header: 'Display Name',
    },
    {
      accessorKey: 'dataType',
      header: 'Data Type',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.dataType}</Badge>
      )
    },
    {
      accessorKey: 'entityType',
      header: 'Entity Type',
    },
    {
      accessorKey: 'isRequired',
      header: 'Required',
      cell: ({ row }) => (
        row.original.isRequired ? <Badge>Yes</Badge> : <Badge variant="secondary">No</Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              openModal({
                id: 'edit-field-definition',
                type: 'side-panel',
                title: 'Edit Field Definition',
                content: <FieldDefinitionForm initialData={row.original} />,
              })
            }
            title="Edit Field"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() =>
              alert('Field definition deletion is restricted when template mappings or employee data are bound to this key.')
            }
            title="Delete Field"
          >
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
          <h2 className="text-2xl font-bold tracking-tight">Field Definitions</h2>
          <p className="text-muted-foreground">Manage dynamic fields and data mapping</p>
        </div>
        <Button onClick={() => openModal({
          id: 'create-field-definition',
          type: 'side-panel',
          title: 'Create Field Definition',
          content: <FieldDefinitionForm />,
        })}>
          <Plus className="mr-2 h-4 w-4" />
          Add Field
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={fields} 
        isLoading={isLoading}
        searchKey="displayName"
        searchPlaceholder="Search fields..."
      />
    </div>
  );
}

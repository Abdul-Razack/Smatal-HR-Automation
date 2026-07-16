'use client';

import * as React from 'react';
import { useOrganization } from '../../hooks/useOrganization';
import { DataTable } from '@/shared/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Branch } from '../../types';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useModalStore } from '@/shared/modals/useModalStore';
import { BranchForm } from '../forms/BranchForm';
import { Badge } from '@/components/ui/badge';

export function BranchList() {
  const { useBranches } = useOrganization();
  const { data: branches = [], isLoading } = useBranches();
  const openModal = useModalStore((state) => state.openModal);

  const columns: ColumnDef<Branch>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span>{row.original.name}</span>
          {row.original.isHeadquarters && <Badge variant="secondary">HQ</Badge>}
        </div>
      )
    },
    {
      accessorKey: 'city',
      header: 'City',
    },
    {
      accessorKey: 'country',
      header: 'Country',
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
          <h2 className="text-2xl font-bold tracking-tight">Branches</h2>
          <p className="text-muted-foreground">Manage company office locations</p>
        </div>
        <Button onClick={() => openModal({
          id: 'create-branch',
          type: 'side-panel',
          title: 'Create Branch',
          content: <BranchForm />,
        })}>
          <Plus className="mr-2 h-4 w-4" />
          Add Branch
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={branches} 
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Search branches..."
      />
    </div>
  );
}

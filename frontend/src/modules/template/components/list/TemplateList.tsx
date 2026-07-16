'use client';

import * as React from 'react';
import { useTemplate } from '../../hooks/useTemplate';
import { DataTable } from '@/shared/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Template } from '../../types';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Upload } from 'lucide-react';
import { useModalStore } from '@/shared/modals/useModalStore';
import { TemplateForm } from '../forms/TemplateForm';

export function TemplateList() {
  const { useTemplates } = useTemplate();
  const { data: templates = [], isLoading } = useTemplates();
  const openModal = useModalStore((state) => state.openModal);

  const columns: ColumnDef<Template>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'type',
      header: 'Type',
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
              id: 'edit-template',
              type: 'side-panel',
              title: 'Edit Template',
              content: <TemplateForm initialData={row.original} />,
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
          <h2 className="text-2xl font-bold tracking-tight">Templates</h2>
          <p className="text-muted-foreground">Manage dynamic document templates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openModal({
            id: 'import-template',
            type: 'modal',
            title: 'Import Templates',
            content: <div className="p-6 text-center text-muted-foreground">Import functionality coming soon.</div>,
          })}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button onClick={() => openModal({
            id: 'create-template',
            type: 'side-panel',
            title: 'Create Template',
            content: <TemplateForm />,
          })}>
            <Plus className="mr-2 h-4 w-4" />
            Add Template
          </Button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={templates} 
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Search templates..."
      />
    </div>
  );
}

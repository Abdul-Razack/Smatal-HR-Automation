'use client';

import * as React from 'react';
import { useMaster } from '../../hooks/useMaster';
import { DataTable } from '@/shared/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { DocumentType } from '../../types';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useModalStore } from '@/shared/modals/useModalStore';
import { DocumentTypeForm } from '../forms/DocumentTypeForm';

export function DocumentTypeList() {
  const { useDocumentTypes } = useMaster();
  const { data: docTypes = [], isLoading } = useDocumentTypes();
  const openModal = useModalStore((state) => state.openModal);

  const columns: ColumnDef<DocumentType>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'description',
      header: 'Description',
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
                id: 'edit-document-type',
                type: 'side-panel',
                title: 'Edit Document Type',
                content: <DocumentTypeForm initialData={row.original} />,
              })
            }
            title="Edit Document Type"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() =>
              alert('Document type deletion is restricted when existing employee documents or templates reference this type.')
            }
            title="Delete Document Type"
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
          <h2 className="text-2xl font-bold tracking-tight">Document Types</h2>
          <p className="text-muted-foreground">Manage accepted document categories</p>
        </div>
        <Button onClick={() => openModal({
          id: 'create-document-type',
          type: 'side-panel',
          title: 'Create Document Type',
          content: <DocumentTypeForm />,
        })}>
          <Plus className="mr-2 h-4 w-4" />
          Add Document Type
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={docTypes} 
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Search document types..."
      />
    </div>
  );
}

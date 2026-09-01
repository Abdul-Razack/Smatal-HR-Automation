'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Download } from 'lucide-react';
import { useModalStore } from '@/shared/modals/useModalStore';
import { DocumentGenerateForm } from '../forms/DocumentGenerateForm';
import { GenerateDocumentFormData } from '../../schemas';
import { useDocument } from '../../hooks/useDocument';
import { DataTable } from '@/shared/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { GeneratedDocumentDto } from '../../types';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface ProfileDocumentsTabProps {
  entityType: 'candidate' | 'employee' | 'workflow';
  entityId: string;
  profileId: string;
}

export function ProfileDocumentsTab({ entityType, entityId, profileId }: ProfileDocumentsTabProps) {
  const openModal = useModalStore((state) => state.openModal);

  const filters: any = { 
    entityType: entityType.toUpperCase(),
    entityId 
  };

  const { useGeneratedDocuments } = useDocument();
  const { data: documents = [], isLoading } = useGeneratedDocuments(filters);

  const handleGenerate = () => {
    const defaultValues: Partial<GenerateDocumentFormData> = {
      entityType: entityType.toUpperCase(),
      entityId,
    };
    
    if (entityType === 'workflow') {
      defaultValues.workflowInstanceId = entityId;
    }

    openModal({
      id: 'generate-document',
      title: 'Generate Document',
      type: 'dialog',
      content: <DocumentGenerateForm defaultValues={defaultValues} />,
    });
  };

  const columns: ColumnDef<GeneratedDocumentDto>[] = [
    {
      accessorKey: 'businessId',
      header: 'Document ID',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'GENERATED' || row.original.status === 'SIGNED' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      )
    },
    {
      accessorKey: 'generatedAt',
      header: 'Date',
      cell: ({ row }) => {
        const dateStr = (row.original as any).generatedAt || row.original.createdAt;
        return dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A';
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const snapshots = (row.original as any).snapshots;
        const latestSnapshot = snapshots?.[snapshots.length - 1];
        
        return (
          <div className="flex items-center justify-end gap-2">
            {latestSnapshot?.fileUrl && (
              <a href={latestSnapshot.fileUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" title="Download">
                  <Download className="h-4 w-4" />
                </Button>
              </a>
            )}
            <Link href={`/hr/documents/${row.original.id}`}>
              <Button variant="ghost" size="icon" title="View Details">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Related Documents</h3>
        <Button onClick={handleGenerate}>
          <Plus className="mr-2 h-4 w-4" /> Generate New
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={documents} 
        isLoading={isLoading}
        searchKey="businessId"
        searchPlaceholder="Search documents..."
      />
    </div>
  );
}

'use client';

import * as React from 'react';
import { useDocument } from '../../hooks/useDocument';
import { DataTable } from '@/shared/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { GeneratedDocumentDto } from '../../types';
import { Button } from '@/components/ui/button';
import { Eye, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function DocumentList() {
  const { useGeneratedDocuments } = useDocument();
  const { data: documents = [], isLoading } = useGeneratedDocuments();

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
      header: 'Generated Date',
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Document Directory</h2>
          <p className="text-muted-foreground">Manage all generated documents across the organization</p>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={documents} 
        isLoading={isLoading}
        searchKey="businessId"
        searchPlaceholder="Search by Document ID..."
      />
    </div>
  );
}

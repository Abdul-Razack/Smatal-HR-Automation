'use client';

import * as React from 'react';
import { Eye, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/DataTable';
import { StatusChip } from '@/components/common/StatusChip';
import { GenerateDocumentDialog } from '@/components/common/GenerateDocumentDialog';
import { DocumentViewerModal } from '@/components/common/DocumentViewerModal';
import { useGeneratedDocuments, useGenerateDocument } from '@/modules/document/hooks/useDocumentQueries';
import { DocumentApiService } from '@/modules/document/api/DocumentApiService';
import { GeneratedDocumentSummaryDto } from '@/modules/document/types';
import { ColumnDef } from '@tanstack/react-table';

export default function GeneratedDocumentsPage() {
  const [page, setPage] = React.useState(1);
  const pageSize = 10;
  const [isGenerateOpen, setIsGenerateOpen] = React.useState(false);
  const [viewingDocumentId, setViewingDocumentId] = React.useState<string | null>(null);

  const { data, isLoading } = useGeneratedDocuments({ page, pageSize });

  const columns: ColumnDef<GeneratedDocumentSummaryDto>[] = [
    {
      accessorKey: 'businessId',
      header: 'Document ID',
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.businessId}</span>,
    },
    {
      accessorKey: 'profileId',
      header: 'Profile ID',
      cell: ({ row }) => <span className="font-mono text-sm text-muted-foreground">{row.original.profileId}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusChip status={row.original.status} />,
    },
    {
      accessorKey: 'snapshotCount',
      header: 'Snapshots (Files)',
    },
    {
      accessorKey: 'createdAt',
      header: 'Generated At',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              title="Preview Real PDF"
              onClick={() => setViewingDocumentId(row.original.id)}
            >
              <Eye className="w-4 h-4 text-muted-foreground hover:text-primary" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              title="Download PDF"
              onClick={async () => {
                try {
                  await DocumentApiService.downloadDocumentFile(row.original.id, 'pdf', `${row.original.businessId}.pdf`);
                } catch (e: any) {
                  alert(e?.message || 'Download failed');
                }
              }}
            >
              <FileDown className="w-4 h-4 text-muted-foreground hover:text-primary" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Generated Documents</h2>
          <p className="text-muted-foreground">
            Track and download documents generated for candidates and employees.
          </p>
        </div>
        <Button onClick={() => setIsGenerateOpen(true)}>
          Test Generation
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.items || []}
        pageCount={data?.totalCount ? Math.ceil(data.totalCount / pageSize) : 1}
        isLoading={isLoading}
        onPaginationChange={(newPage) => setPage(newPage)}
      />

      <GenerateDocumentDialog 
        open={isGenerateOpen} 
        onOpenChange={setIsGenerateOpen} 
      />

      <DocumentViewerModal 
        documentId={viewingDocumentId} 
        onClose={() => setViewingDocumentId(null)} 
      />
    </>
  );
}

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/DataTable';
import { StatusChip } from '@/components/common/StatusChip';
import { PermissionGuard } from '@/modules/auth/components/PermissionGuard';
import { useTemplates } from '@/modules/document/hooks/useDocumentQueries';
import { TemplateSummaryDto } from '@/modules/document/types';
import { ColumnDef } from '@tanstack/react-table';

export default function TemplatesPage() {
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const { data, isLoading } = useTemplates({ page, pageSize });

  const columns: ColumnDef<TemplateSummaryDto>[] = [
    {
      accessorKey: 'businessId',
      header: 'ID',
    },
    {
      accessorKey: 'name',
      header: 'Template Name',
    },
    {
      accessorKey: 'documentTypeName',
      header: 'Document Type',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">
          {row.original.documentTypeName || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusChip status={row.original.status} />,
    },
    {
      accessorKey: 'versionCount',
      header: 'Versions',
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last Updated',
      cell: ({ row }) => new Date(row.original.updatedAt).toLocaleDateString(),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <Link href={`/documents/templates/${row.original.id}`}>
            <Button variant="outline" size="sm">Manage</Button>
          </Link>
        );
      },
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Document Templates</h2>
          <p className="text-muted-foreground">
            Manage reusable templates for generating DOCX and PDF documents.
          </p>
        </div>
        <PermissionGuard permissions={['DocumentTemplate.Create']} fallback={null}>
          <Link href="/documents/templates/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Template
            </Button>
          </Link>
        </PermissionGuard>
      </div>

      <DataTable
        columns={columns}
        data={data?.items || []}
        pageCount={data?.totalCount ? Math.ceil(data.totalCount / pageSize) : 1}
        isLoading={isLoading}
        onPaginationChange={(newPage) => setPage(newPage)}
      />
    </>
  );
}

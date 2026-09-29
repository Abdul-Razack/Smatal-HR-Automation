'use client';

import * as React from 'react';
import { useAudit } from '../hooks/useAudit';
import { DataTable } from '@/shared/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { AuditLog } from '../types';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export function AuditLogViewer() {
  const [entityFilter, setEntityFilter] = React.useState('');
  // Use debounced value in real app, keeping it simple here
  const { useAuditHistory } = useAudit();
  const { data, isLoading } = useAuditHistory({ 
    entityBusinessId: entityFilter || undefined,
    limit: 100
  });

  const columns: any[] = [
    {
      accessorKey: 'createdAt',
      header: 'Timestamp',
      cell: ({ row }: any) => new Date(row.getValue('createdAt')).toLocaleString()
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }: any) => (
        <Badge variant="outline" className="font-mono text-xs">
          {row.getValue('action')}
        </Badge>
      )
    },
    {
      accessorKey: 'entityType',
      header: 'Entity Type',
    },
    {
      accessorKey: 'entityBusinessId',
      header: 'Entity ID',
      cell: ({ row }: any) => <span className="font-mono text-xs">{row.getValue('entityBusinessId')}</span>
    },
    {
      accessorKey: 'userId',
      header: 'User ID',
      cell: ({ row }: any) => <span className="font-mono text-xs">{row.getValue('userId')}</span>
    },
    {
      accessorKey: 'remarks',
      header: 'Remarks',
    },
    {
      id: 'changes',
      header: 'State Changes',
      cell: ({ row }: any) => {
        const hasBefore = !!row.original.beforeState;
        const hasAfter = !!row.original.afterState;
        if (!hasBefore && !hasAfter) return <span className="text-muted-foreground text-xs">No State Changes</span>;
        
        return (
          <div className="flex gap-2">
            {hasBefore && <Badge variant="secondary" className="text-xs">Before</Badge>}
            {hasAfter && <Badge className="text-xs">After</Badge>}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Audit Logs</h2>
          <p className="text-muted-foreground">System-wide immutable activity logs</p>
        </div>
        <div className="flex items-center gap-2">
          <Input 
            placeholder="Filter by Entity ID..."
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="w-64 h-8"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={Array.isArray(data) ? data : (data?.items || [])}
        isLoading={isLoading}
        searchKey="entityBusinessId"
      />
    </div>
  );
}

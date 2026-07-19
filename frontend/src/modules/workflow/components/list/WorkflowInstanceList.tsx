'use client';

import * as React from 'react';
import { useWorkflowInstance } from '../../hooks/useWorkflowInstance';
import { DataTable } from '@/shared/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { WorkflowInstance } from '../../types/instance';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

export function WorkflowInstanceList() {
  const [statusFilter, setStatusFilter] = React.useState<string>('IN_PROGRESS');
  const { useWorkflowInstances } = useWorkflowInstance();
  const { data: instances = [], isLoading } = useWorkflowInstances({ status: statusFilter });

  const columns: ColumnDef<WorkflowInstance>[] = [
    {
      accessorKey: 'id',
      header: 'Workflow ID',
      cell: ({ row }) => <span className="font-medium">{row.original.id.split('-')[0]}...</span>
    },
    {
      accessorKey: 'entityType',
      header: 'Entity Type',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'IN_PROGRESS' || row.original.status === 'PENDING' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      )
    },
    {
      accessorKey: 'startedAt',
      header: 'Started At',
      cell: ({ row }) => new Date(row.original.startedAt).toLocaleDateString()
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          <Link href={`/hr/workflows/${row.original.id}`}>
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workflow Execution</h2>
          <p className="text-muted-foreground">Monitor and manage active approval pipelines</p>
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList>
          <TabsTrigger value="IN_PROGRESS">Active</TabsTrigger>
          <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
          <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
          <TabsTrigger value="FAILED">Failed</TabsTrigger>
        </TabsList>
      </Tabs>

      <DataTable 
        columns={columns} 
        data={instances} 
        isLoading={isLoading}
        searchKey="id"
        searchPlaceholder="Search by ID..."
      />
    </div>
  );
}

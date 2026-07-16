'use client';

import React from 'react';
import { useInterview } from '../../hooks/useInterview';
import { DataTable } from '@/shared/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Interview } from '../../types';
import { Button } from '@/components/ui/button';
import { Plus, Eye, MoreHorizontal, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useModalStore } from '@/shared/modals/useModalStore';

export function InterviewList({ candidateId }: { candidateId: string }) {
  const { useInterviews } = useInterview();
  const { data: interviews = [], isLoading } = useInterviews(candidateId);
  const openModal = useModalStore((state) => state.openModal);

  const columns: ColumnDef<Interview>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'type',
      header: 'Type',
    },
    {
      accessorKey: 'scheduledAt',
      header: 'Date & Time',
      cell: ({ row }) => (
        <div>
          {new Date(row.original.scheduledAt).toLocaleString()}
          <div className="text-xs text-muted-foreground">{row.original.durationMinutes} mins</div>
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'COMPLETED' ? 'default' : row.original.status === 'CANCELLED' ? 'destructive' : 'secondary'}>
          {row.original.status}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Interviews</h3>
          <p className="text-sm text-muted-foreground">Manage interviews for this candidate.</p>
        </div>
        <Button onClick={() => openModal({
          id: 'schedule-interview',
          type: 'side-panel',
          title: 'Schedule Interview',
          content: <div className="p-4">Schedule Interview Form Placeholder</div>,
        })}>
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Interview
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={interviews} 
        isLoading={isLoading}
        searchKey="title"
        searchPlaceholder="Search interviews..."
      />
    </div>
  );
}

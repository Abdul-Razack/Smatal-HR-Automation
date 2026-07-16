'use client';

import React from 'react';
import { DataTable } from '@/components/common/DataTable';
import { LeaveRequest, LeaveStatus } from '../types';
import { ColumnDef } from '@tanstack/react-table';
import { StatusChip } from '@/components/common/StatusChip';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface LeaveListProps {
  data: LeaveRequest[];
  isLoading?: boolean;
  pageCount?: number;
  onPaginationChange?: (page: number, pageSize: number) => void;
  isApprovalView?: boolean;
}

export function LeaveList({ data, isLoading, pageCount, onPaginationChange, isApprovalView = false }: LeaveListProps) {
  const columns: ColumnDef<LeaveRequest>[] = [
    {
      accessorKey: 'leaveTypeId',
      header: 'Leave Type',
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }) => new Date(row.original.startDate).toLocaleDateString(),
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ row }) => new Date(row.original.endDate).toLocaleDateString(),
    },
    {
      accessorKey: 'durationDays',
      header: 'Duration',
      cell: ({ row }) => `${row.original.durationDays} days`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusChip status={row.original.status as any} />
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const id = row.original.id;
        const href = isApprovalView ? `/leave/approvals/${id}` : `/leave/${id}`;
        return (
          <Button variant="outline" size="sm" asChild>
            <Link href={href}>View</Link>
          </Button>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      pageCount={pageCount}
      onPaginationChange={onPaginationChange}
    />
  );
}

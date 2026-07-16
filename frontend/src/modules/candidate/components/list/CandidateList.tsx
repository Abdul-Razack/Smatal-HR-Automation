'use client';

import * as React from 'react';
import { useCandidate } from '../../hooks/useCandidate';
import { DataTable } from '@/shared/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Candidate } from '../../types';
import { Button } from '@/components/ui/button';
import { Plus, Eye, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { useModalStore } from '@/shared/modals/useModalStore';
import { CandidateCreateForm } from '../forms/CandidateCreateForm';
import { CandidateConvertForm } from '../forms/CandidateConvertForm';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { PermissionGuard } from '@/modules/auth/components/PermissionGuard';

export function CandidateList() {
  const { useCandidates } = useCandidate();
  const { data: candidates = [], isLoading } = useCandidates();
  const openModal = useModalStore((state) => state.openModal);

  const columns: ColumnDef<Candidate>[] = [
    {
      accessorKey: 'profile.firstName',
      header: 'Candidate Name',
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.profile?.firstName} {row.original.profile?.lastName}
          <div className="text-xs text-muted-foreground font-normal">{row.original.profile?.email}</div>
        </div>
      )
    },
    {
      accessorKey: 'source',
      header: 'Source',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'SELECTED' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          {row.original.status === 'SELECTED' && (
            <Button 
              variant="outline" 
              size="sm"
              className="text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => openModal({
                id: 'convert-candidate',
                type: 'side-panel',
                title: 'Convert to Employee',
                content: <CandidateConvertForm candidateId={row.original.id} />,
              })}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Convert
            </Button>
          )}
          <PermissionGuard permissions={['Candidate.View']}>
            <Link href={`/ats/candidates/${row.original.id}`}>
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          </PermissionGuard>
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
          <h2 className="text-2xl font-bold tracking-tight">Candidates</h2>
          <p className="text-muted-foreground">Manage recruitment pipeline and candidate profiles</p>
        </div>
        <PermissionGuard permissions={['Candidate.Create']}>
          <Button onClick={() => openModal({
            id: 'create-candidate',
            type: 'side-panel',
            title: 'Add New Candidate',
            content: <CandidateCreateForm />,
          })}>
            <Plus className="mr-2 h-4 w-4" />
            Add Candidate
          </Button>
        </PermissionGuard>
      </div>

      <DataTable 
        columns={columns} 
        data={candidates} 
        isLoading={isLoading}
        searchKey="profile.firstName"
        searchPlaceholder="Search candidates..."
      />
    </div>
  );
}

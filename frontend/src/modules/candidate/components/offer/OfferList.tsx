'use client';

import React from 'react';
import { useOffer } from '../../hooks/useOffer';
import { DataTable } from '@/shared/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Offer } from '../../types';
import { Button } from '@/components/ui/button';
import { Plus, Eye, MoreHorizontal, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useModalStore } from '@/shared/modals/useModalStore';

export function OfferList({ candidateId }: { candidateId: string }) {
  const { useOffers } = useOffer();
  const { data: offers = [], isLoading } = useOffers(candidateId);
  const openModal = useModalStore((state) => state.openModal);

  const columns: ColumnDef<Offer>[] = [
    {
      accessorKey: 'businessId',
      header: 'Offer ID',
    },
    {
      accessorKey: 'baseSalary',
      header: 'Base Salary',
      cell: ({ row }) => (
        <div>{row.original.currency} {row.original.baseSalary.toLocaleString()}</div>
      )
    },
    {
      accessorKey: 'joiningDate',
      header: 'Joining Date',
      cell: ({ row }) => row.original.joiningDate ? new Date(row.original.joiningDate).toLocaleDateString() : '-'
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'ACCEPTED' ? 'default' : row.original.status === 'REJECTED' ? 'destructive' : 'secondary'}>
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
          <h3 className="text-lg font-medium">Offers</h3>
          <p className="text-sm text-muted-foreground">Manage offers for this candidate.</p>
        </div>
        <Button onClick={() => openModal({
          id: 'generate-offer',
          type: 'side-panel',
          title: 'Generate Offer',
          content: <div className="p-4">Generate Offer Form Placeholder</div>,
        })}>
          <Plus className="mr-2 h-4 w-4" />
          Generate Offer
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={offers} 
        isLoading={isLoading}
        searchKey="businessId"
        searchPlaceholder="Search offers..."
      />
    </div>
  );
}

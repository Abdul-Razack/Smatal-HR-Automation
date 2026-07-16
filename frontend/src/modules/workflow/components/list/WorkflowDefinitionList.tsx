'use client';

import * as React from 'react';
import { useWorkflow } from '../../hooks/useWorkflow';
import { DataTable } from '@/shared/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { WorkflowDefinition } from '../../types';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Send } from 'lucide-react';
import { useModalStore } from '@/shared/modals/useModalStore';
import { WorkflowDefinitionForm } from '../forms/WorkflowDefinitionForm';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function WorkflowDefinitionList() {
  const { useWorkflows, publishWorkflow } = useWorkflow();
  const { data: workflows = [], isLoading } = useWorkflows();
  const openModal = useModalStore((state) => state.openModal);

  const columns: ColumnDef<WorkflowDefinition>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'processCode',
      header: 'Process Code',
    },
    {
      accessorKey: 'entityType',
      header: 'Entity Type',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={status === 'PUBLISHED' ? 'default' : 'secondary'}>
            {status}
          </Badge>
        );
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          {row.original.status === 'DRAFT' && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => publishWorkflow.mutate(row.original.id)}
              title="Publish Workflow"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workflows</h2>
          <p className="text-muted-foreground">Manage approval processes and routing</p>
        </div>
        <Button onClick={() => openModal({
          id: 'create-workflow',
          type: 'side-panel',
          title: 'Create Workflow Definition',
          content: <WorkflowDefinitionForm />,
        })}>
          <Plus className="mr-2 h-4 w-4" />
          Add Workflow
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={workflows} 
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Search workflows..."
      />
    </div>
  );
}

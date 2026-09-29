'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { workflowDefinitionSchema, WorkflowDefinitionFormData } from '../../schemas';
import { DynamicFormRenderer } from '@/shared/forms/DynamicFormRenderer';
import { FormFieldConfig } from '@/shared/types';
import { useWorkflow } from '../../hooks/useWorkflow';
import { useModalStore } from '@/shared/modals/useModalStore';

export function WorkflowDefinitionForm({ initialData }: { initialData?: any } = {}) {
  const { createWorkflow } = useWorkflow();
  const closeModal = useModalStore((state) => state.closeModal);
  
  const form = useForm<WorkflowDefinitionFormData>({
    resolver: zodResolver(workflowDefinitionSchema),
    defaultValues: {
      name: initialData?.name || '',
      entityType: initialData?.entityType || 'Document',
      processCode: initialData?.processCode || '',
      description: initialData?.description || '',
    },
  });

  const fields: FormFieldConfig[] = [
    { name: 'name', label: 'Workflow Name', type: 'text', required: true, placeholder: 'e.g. Leave Approval' },
    { name: 'processCode', label: 'Process Code', type: 'text', required: true, placeholder: 'e.g. LEAVE_APP' },
    { name: 'entityType', label: 'Entity Type', type: 'select', required: true, options: [
      { label: 'Document', value: 'Document' },
      { label: 'Employee', value: 'Employee' },
      { label: 'Candidate', value: 'Candidate' },
    ] },
    { name: 'description', label: 'Description', type: 'textarea' },
  ];

  const onSubmit = (data: WorkflowDefinitionFormData) => {
    createWorkflow.mutate(data, {
      onSuccess: () => {
        closeModal('create-workflow');
      }
    });
  };

  return (
    <DynamicFormRenderer
      form={form}
      fields={fields}
      onSubmit={onSubmit}
      isSubmitting={createWorkflow.isPending}
      submitLabel="Save Workflow"
    />
  );
}

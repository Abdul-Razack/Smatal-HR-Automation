'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { rejectWorkflowSchema, RejectWorkflowFormData } from '../../schemas/instance';
import { DynamicFormRenderer } from '@/shared/forms/DynamicFormRenderer';
import { FormFieldConfig } from '@/shared/types';
import { useWorkflowInstance } from '../../hooks/useWorkflowInstance';
import { useModalStore } from '@/shared/modals/useModalStore';

export function WorkflowRejectForm({ instanceId }: { instanceId: string }) {
  const { reject } = useWorkflowInstance();
  const closeModal = useModalStore((state) => state.closeModal);
  
  const form = useForm<RejectWorkflowFormData>({
    resolver: zodResolver(rejectWorkflowSchema),
    defaultValues: {
      reason: '',
    },
  });

  const fields: FormFieldConfig[] = [
    { name: 'reason', label: 'Reason for Rejection', type: 'textarea', required: true },
  ];

  const onSubmit = (data: RejectWorkflowFormData) => {
    reject.mutate({ id: instanceId, reason: data.reason }, {
      onSuccess: () => {
        closeModal('reject-workflow');
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm mb-6">
        <strong>Warning:</strong> Rejecting will halt this workflow and mark the entire instance as FAILED.
      </div>
      <DynamicFormRenderer
        form={form}
        fields={fields}
        onSubmit={onSubmit}
        isSubmitting={reject.isPending}
        submitLabel="Confirm Rejection"
      />
    </div>
  );
}

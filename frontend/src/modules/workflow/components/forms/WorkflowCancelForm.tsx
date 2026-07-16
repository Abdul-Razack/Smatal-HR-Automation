'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cancelWorkflowSchema, CancelWorkflowFormData } from '../../schemas/instance';
import { DynamicFormRenderer } from '@/shared/forms/DynamicFormRenderer';
import { FormFieldConfig } from '@/shared/types';
import { useWorkflowInstance } from '../../hooks/useWorkflowInstance';
import { useModalStore } from '@/shared/modals/useModalStore';

export function WorkflowCancelForm({ instanceId }: { instanceId: string }) {
  const { cancel } = useWorkflowInstance();
  const closeModal = useModalStore((state) => state.closeModal);
  
  const form = useForm<CancelWorkflowFormData>({
    resolver: zodResolver(cancelWorkflowSchema),
    defaultValues: {
      reason: '',
    },
  });

  const fields: FormFieldConfig[] = [
    { name: 'reason', label: 'Reason for Cancellation', type: 'textarea', required: true },
  ];

  const onSubmit = (data: CancelWorkflowFormData) => {
    cancel.mutate({ id: instanceId, reason: data.reason }, {
      onSuccess: () => {
        closeModal('cancel-workflow');
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm mb-6">
        <strong>Warning:</strong> Cancelling this workflow stops all active processing immediately. This action cannot be undone.
      </div>
      <DynamicFormRenderer
        form={form}
        fields={fields}
        onSubmit={onSubmit}
        isSubmitting={cancel.isPending}
        submitLabel="Confirm Cancellation"
      />
    </div>
  );
}

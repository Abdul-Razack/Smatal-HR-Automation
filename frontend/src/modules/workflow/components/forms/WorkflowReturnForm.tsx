'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { returnWorkflowSchema, ReturnWorkflowFormData } from '../../schemas/instance';
import { DynamicFormRenderer } from '@/shared/forms/DynamicFormRenderer';
import { FormFieldConfig } from '@/shared/types';
import { useWorkflowInstance } from '../../hooks/useWorkflowInstance';
import { useModalStore } from '@/shared/modals/useModalStore';

// Assuming we pass available previous stages as a prop
export function WorkflowReturnForm({ instanceId, previousStages }: { instanceId: string, previousStages: { id: string, name: string }[] }) {
  const { returnStage } = useWorkflowInstance();
  const closeModal = useModalStore((state) => state.closeModal);
  
  const form = useForm<ReturnWorkflowFormData>({
    resolver: zodResolver(returnWorkflowSchema),
    defaultValues: {
      targetStageId: '',
      reason: '',
    },
  });

  const fields: FormFieldConfig[] = [
    { 
      name: 'targetStageId', 
      label: 'Return To Stage', 
      type: 'select', 
      required: true,
      options: previousStages.map(s => ({ label: s.name, value: s.id }))
    },
    { name: 'reason', label: 'Reason for Return', type: 'textarea', required: true },
  ];

  const onSubmit = (data: ReturnWorkflowFormData) => {
    returnStage.mutate({ id: instanceId, targetStageId: data.targetStageId, reason: data.reason }, {
      onSuccess: () => {
        closeModal('return-workflow');
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 text-amber-900 border border-amber-200 p-4 rounded-md text-sm mb-6">
        Sending a workflow back will require the target stage to be re-approved.
      </div>
      <DynamicFormRenderer
        form={form}
        fields={fields}
        onSubmit={onSubmit}
        isSubmitting={returnStage.isPending}
        submitLabel="Send Back"
      />
    </div>
  );
}

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { approveWorkflowSchema, ApproveWorkflowFormData } from '../../schemas/instance';
import { DynamicFormRenderer } from '@/shared/forms/DynamicFormRenderer';
import { FormFieldConfig } from '@/shared/types';
import { useWorkflowInstance } from '../../hooks/useWorkflowInstance';
import { useModalStore } from '@/shared/modals/useModalStore';

export function WorkflowApproveForm({ instanceId }: { instanceId: string }) {
  const { approve } = useWorkflowInstance();
  const closeModal = useModalStore((state) => state.closeModal);
  
  const form = useForm<ApproveWorkflowFormData>({
    resolver: zodResolver(approveWorkflowSchema),
    defaultValues: {
      remarks: '',
    },
  });

  const fields: FormFieldConfig[] = [
    { name: 'remarks', label: 'Remarks (Optional)', type: 'textarea' },
  ];

  const onSubmit = (data: ApproveWorkflowFormData) => {
    approve.mutate({ id: instanceId, remarks: data.remarks }, {
      onSuccess: () => {
        closeModal('approve-workflow');
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-green-50 text-green-900 p-4 rounded-md text-sm mb-6">
        Approving this stage will automatically advance the workflow to the next pending stage or complete the process if this is the final step.
      </div>
      <DynamicFormRenderer
        form={form}
        fields={fields}
        onSubmit={onSubmit}
        isSubmitting={approve.isPending}
        submitLabel="Confirm Approval"
      />
    </div>
  );
}

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { terminateEmployeeSchema, TerminateEmployeeFormData } from '../../schemas';
import { DynamicFormRenderer } from '@/shared/forms/DynamicFormRenderer';
import { FormFieldConfig } from '@/shared/types';
import { useEmployee } from '../../hooks/useEmployee';
import { useModalStore } from '@/shared/modals/useModalStore';

export function EmployeeTerminateForm({ employeeId }: { employeeId: string }) {
  const { terminateEmployee } = useEmployee();
  const closeModal = useModalStore((state) => state.closeModal);
  
  const form = useForm<TerminateEmployeeFormData>({
    resolver: zodResolver(terminateEmployeeSchema),
    defaultValues: {
      terminationDate: new Date().toISOString().split('T')[0],
      reason: '',
    },
  });

  const fields: FormFieldConfig[] = [
    { name: 'terminationDate', label: 'Last Working Day', type: 'date', required: true },
    { name: 'reason', label: 'Reason for Termination', type: 'textarea', required: true },
  ];

  const onSubmit = (data: TerminateEmployeeFormData) => {
    terminateEmployee.mutate({ id: employeeId, data }, {
      onSuccess: () => {
        closeModal('terminate-employee');
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-md text-sm mb-6">
        <strong>Warning:</strong> Terminating an employee will revoke their active access to the system.
      </div>
      <DynamicFormRenderer
        form={form}
        fields={fields}
        onSubmit={onSubmit}
        isSubmitting={terminateEmployee.isPending}
        submitLabel="Confirm Termination"
      />
    </div>
  );
}

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { departmentSchema, DepartmentFormData } from '../../schemas';
import { DynamicFormRenderer } from '@/shared/forms/DynamicFormRenderer';
import { FormFieldConfig } from '@/shared/types';
import { useOrganization } from '../../hooks/useOrganization';
import { useModalStore } from '@/shared/modals/useModalStore';

interface DepartmentFormProps {
  initialData?: any;
}

export function DepartmentForm({ initialData }: DepartmentFormProps) {
  const { createDepartment } = useOrganization();
  const closeModal = useModalStore((state) => state.closeModal);
  
  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      parentId: initialData?.parentId || '',
    },
  });

  const fields: FormFieldConfig[] = [
    { name: 'name', label: 'Department Name', type: 'text', required: true, placeholder: 'e.g. Human Resources' },
    { name: 'code', label: 'Department Code', type: 'text', required: true, placeholder: 'e.g. HR' },
    { name: 'parentId', label: 'Parent Department', type: 'text', placeholder: 'Parent ID' },
  ];

  const onSubmit = (data: DepartmentFormData) => {
    createDepartment.mutate(data, {
      onSuccess: () => {
        closeModal('create-department');
      }
    });
  };

  return (
    <DynamicFormRenderer
      form={form}
      fields={fields}
      onSubmit={onSubmit}
      isSubmitting={createDepartment.isPending}
      submitLabel="Save Department"
    />
  );
}

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { designationSchema, DesignationFormData } from '../../schemas';
import { DynamicFormRenderer } from '@/shared/forms/DynamicFormRenderer';
import { FormFieldConfig } from '@/shared/types';
import { useOrganization } from '../../hooks/useOrganization';
import { useModalStore } from '@/shared/modals/useModalStore';

export function DesignationForm() {
  const { createDesignation } = useOrganization();
  const closeModal = useModalStore((state) => state.closeModal);
  
  const form = useForm<DesignationFormData>({
    resolver: zodResolver(designationSchema),
    defaultValues: {
      name: '',
      code: '',
      level: 1,
    },
  });

  const fields: FormFieldConfig[] = [
    { name: 'name', label: 'Designation Name', type: 'text', required: true, placeholder: 'e.g. Senior Engineer' },
    { name: 'code', label: 'Designation Code', type: 'text', required: true, placeholder: 'e.g. SE' },
    { name: 'level', label: 'Level (Hierarchy)', type: 'number', required: true },
  ];

  const onSubmit = (data: DesignationFormData) => {
    createDesignation.mutate(data, {
      onSuccess: () => {
        closeModal('create-designation');
      }
    });
  };

  return (
    <DynamicFormRenderer
      form={form}
      fields={fields}
      onSubmit={onSubmit}
      isSubmitting={createDesignation.isPending}
      submitLabel="Save Designation"
    />
  );
}

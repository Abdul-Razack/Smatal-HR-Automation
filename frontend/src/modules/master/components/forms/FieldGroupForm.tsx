'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { fieldGroupSchema, FieldGroupFormData } from '../../schemas';
import { DynamicFormRenderer } from '@/shared/forms/DynamicFormRenderer';
import { FormFieldConfig } from '@/shared/types';
import { useMaster } from '../../hooks/useMaster';
import { useModalStore } from '@/shared/modals/useModalStore';

export function FieldGroupForm() {
  const { createFieldGroup } = useMaster();
  const closeModal = useModalStore((state) => state.closeModal);
  
  const form = useForm<FieldGroupFormData>({
    resolver: zodResolver(fieldGroupSchema),
    defaultValues: {
      name: '',
      description: '',
      displayOrder: 1,
    },
  });

  const fields: FormFieldConfig[] = [
    { name: 'name', label: 'Group Name', type: 'text', required: true, placeholder: 'e.g. Personal Details' },
    { name: 'displayOrder', label: 'Display Order', type: 'number' },
    { name: 'description', label: 'Description', type: 'textarea' },
  ];

  const onSubmit = (data: FieldGroupFormData) => {
    createFieldGroup.mutate(data, {
      onSuccess: () => {
        closeModal('create-field-group');
      }
    });
  };

  return (
    <DynamicFormRenderer
      form={form}
      fields={fields}
      onSubmit={onSubmit}
      isSubmitting={createFieldGroup.isPending}
      submitLabel="Save Field Group"
    />
  );
}

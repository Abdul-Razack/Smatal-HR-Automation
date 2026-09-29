'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { fieldDefinitionSchema, FieldDefinitionFormData } from '../../schemas';
import { DynamicFormRenderer } from '@/shared/forms/DynamicFormRenderer';
import { FormFieldConfig } from '@/shared/types';
import { useMaster } from '../../hooks/useMaster';
import { useModalStore } from '@/shared/modals/useModalStore';

export function FieldDefinitionForm({ initialData }: { initialData?: any } = {}) {
  const { createFieldDefinition } = useMaster();
  const closeModal = useModalStore((state) => state.closeModal);
  
  const form = useForm<FieldDefinitionFormData>({
    resolver: zodResolver(fieldDefinitionSchema),
    defaultValues: {
      machineKey: initialData?.machineKey || '',
      displayName: initialData?.displayName || '',
      dataType: initialData?.dataType || 'text',
      entityType: initialData?.entityType || 'Employee',
      isRequired: initialData?.isRequired || false,
    },
  });

  const fields: FormFieldConfig[] = [
    { name: 'displayName', label: 'Display Name', type: 'text', required: true },
    { name: 'machineKey', label: 'Machine Key', type: 'text', required: true },
    { name: 'dataType', label: 'Data Type', type: 'select', required: true, options: [
      { label: 'Text', value: 'text' },
      { label: 'Number', value: 'number' },
      { label: 'Date', value: 'date' },
      { label: 'Select', value: 'select' },
      { label: 'File', value: 'file' },
    ]},
    { name: 'entityType', label: 'Entity Type', type: 'select', required: true, options: [
      { label: 'Employee', value: 'Employee' },
      { label: 'Candidate', value: 'Candidate' },
    ]},
    { name: 'groupId', label: 'Field Group ID', type: 'text' },
    { name: 'isRequired', label: 'Is Required?', type: 'switch' },
    { name: 'defaultValue', label: 'Default Value', type: 'text' },
    { name: 'displayOrder', label: 'Display Order', type: 'number' },
    { name: 'description', label: 'Help Text / Description', type: 'textarea' },
  ];

  const onSubmit = (data: FieldDefinitionFormData) => {
    createFieldDefinition.mutate(data, {
      onSuccess: () => {
        closeModal('create-field-definition');
      }
    });
  };

  return (
    <DynamicFormRenderer
      form={form}
      fields={fields}
      onSubmit={onSubmit}
      isSubmitting={createFieldDefinition.isPending}
      submitLabel="Save Field Definition"
      gridCols={2}
    />
  );
}

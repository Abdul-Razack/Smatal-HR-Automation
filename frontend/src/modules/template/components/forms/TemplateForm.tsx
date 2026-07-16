'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { templateSchema, TemplateFormData } from '../../schemas';
import { DynamicFormRenderer } from '@/shared/forms/DynamicFormRenderer';
import { FormFieldConfig } from '@/shared/types';
import { useTemplate } from '../../hooks/useTemplate';
import { useModalStore } from '@/shared/modals/useModalStore';

interface TemplateFormProps {
  initialData?: any;
}

export function TemplateForm({ initialData }: TemplateFormProps) {
  const { createTemplate } = useTemplate();
  const closeModal = useModalStore((state) => state.closeModal);
  
  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      type: initialData?.type || 'OfferLetter',
      description: initialData?.description || '',
    },
  });

  const fields: FormFieldConfig[] = [
    { name: 'name', label: 'Template Name', type: 'text', required: true, placeholder: 'e.g. Standard Offer Letter' },
    { name: 'code', label: 'Template Code', type: 'text', required: true, placeholder: 'e.g. TPL_OFFER_01' },
    { name: 'type', label: 'Document Type', type: 'select', required: true, options: [
      { label: 'Offer Letter', value: 'OfferLetter' },
      { label: 'Contract', value: 'Contract' },
      { label: 'Policy', value: 'Policy' },
    ]},
    { name: 'description', label: 'Description', type: 'textarea' },
  ];

  const onSubmit = (data: TemplateFormData) => {
    createTemplate.mutate(data, {
      onSuccess: () => {
        closeModal('create-template');
      }
    });
  };

  return (
    <DynamicFormRenderer
      form={form}
      fields={fields}
      onSubmit={onSubmit}
      isSubmitting={createTemplate.isPending}
      submitLabel="Save Template"
    />
  );
}

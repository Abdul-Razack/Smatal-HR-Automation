'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { documentTypeSchema, DocumentTypeFormData } from '../../schemas';
import { DynamicFormRenderer } from '@/shared/forms/DynamicFormRenderer';
import { FormFieldConfig } from '@/shared/types';
import { useMaster } from '../../hooks/useMaster';
import { useModalStore } from '@/shared/modals/useModalStore';

export function DocumentTypeForm() {
  const { createDocumentType } = useMaster();
  const closeModal = useModalStore((state) => state.closeModal);
  
  const form = useForm<DocumentTypeFormData>({
    resolver: zodResolver(documentTypeSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
    },
  });

  const fields: FormFieldConfig[] = [
    { name: 'name', label: 'Type Name', type: 'text', required: true, placeholder: 'e.g. Identity Proof' },
    { name: 'code', label: 'Type Code', type: 'text', required: true, placeholder: 'e.g. ID_PROOF' },
    { name: 'description', label: 'Description', type: 'textarea' },
  ];

  const onSubmit = (data: DocumentTypeFormData) => {
    createDocumentType.mutate(data, {
      onSuccess: () => {
        closeModal('create-document-type');
      }
    });
  };

  return (
    <DynamicFormRenderer
      form={form}
      fields={fields}
      onSubmit={onSubmit}
      isSubmitting={createDocumentType.isPending}
      submitLabel="Save Document Type"
    />
  );
}

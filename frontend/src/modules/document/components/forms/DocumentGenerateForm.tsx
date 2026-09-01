'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateDocumentSchema, GenerateDocumentFormData } from '../../schemas';
import { DynamicFormRenderer } from '@/shared/forms/DynamicFormRenderer';
import { FormFieldConfig } from '@/shared/types';
import { useDocument } from '../../hooks/useDocument';
import { useModalStore } from '@/shared/modals/useModalStore';

interface DocumentGenerateFormProps {
  defaultValues?: Partial<GenerateDocumentFormData>;
}

export function DocumentGenerateForm({ defaultValues }: DocumentGenerateFormProps) {
  const { generateDocument } = useDocument();
  const closeModal = useModalStore((state) => state.closeModal);
  const form = useForm<GenerateDocumentFormData>({
    resolver: zodResolver(generateDocumentSchema),
    defaultValues: {
      documentTypeId: '',
      entityType: defaultValues?.entityType || 'CANDIDATE',
      entityId: defaultValues?.entityId || '',
      workflowInstanceId: defaultValues?.workflowInstanceId || '',
    },
  });

  const fields: FormFieldConfig[] = [
    { name: 'documentTypeId', label: 'Document Type ID', type: 'text', required: true, description: 'Enter the UUID of the Document Type' },
    { name: 'entityType', label: 'Entity Type', type: 'text', required: true, description: 'E.g., CANDIDATE or EMPLOYEE' },
    { name: 'entityId', label: 'Entity ID', type: 'text', required: true },
    { name: 'workflowInstanceId', label: 'Workflow Instance ID (Optional)', type: 'text' },
  ];

  const onSubmit = (data: GenerateDocumentFormData) => {
    generateDocument.mutate(data, {
      onSuccess: () => {
        closeModal('generate-document');
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-muted p-4 rounded-md text-sm mb-6">
        Generating a document will resolve all dynamic placeholders based on the provided IDs. Ensure the correct entities are mapped.
      </div>
      <DynamicFormRenderer
        form={form}
        fields={fields}
        onSubmit={onSubmit}
        isSubmitting={generateDocument.isPending}
        submitLabel="Generate Document"
      />
    </div>
  );
}

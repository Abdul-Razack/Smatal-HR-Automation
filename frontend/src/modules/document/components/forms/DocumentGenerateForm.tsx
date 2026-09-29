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
  const { generateDocument, useDocumentTypes } = useDocument();
  const { data: documentTypes = [] } = useDocumentTypes({ isActive: true });
  const closeModal = useModalStore((state) => state.closeModal);
  const form = useForm<GenerateDocumentFormData>({
    resolver: zodResolver(generateDocumentSchema),
    defaultValues: {
      documentTypeId: defaultValues?.documentTypeId || '',
      entityType: defaultValues?.entityType || 'EMPLOYEE',
      entityId: defaultValues?.entityId || '',
      workflowInstanceId: defaultValues?.workflowInstanceId || '',
    },
  });

  const fields: FormFieldConfig[] = [
    {
      name: 'documentTypeId',
      label: 'Document Type',
      type: documentTypes.length > 0 ? 'select' : 'text',
      required: true,
      placeholder: 'Select Document Type',
      options: documentTypes.map((dt) => ({
        value: dt.id,
        label: `${dt.name} (${dt.code})`,
      })),
      description: 'Select the official document type to generate',
    },
    {
      name: 'entityType',
      label: 'Entity Type',
      type: 'text',
      required: true,
      readonly: true,
      description: 'Entity to resolve placeholders for (e.g. EMPLOYEE)',
    },
    {
      name: 'entityId',
      label: 'Entity ID',
      type: 'text',
      required: true,
      readonly: true,
      description: 'Target employee or candidate UUID',
    },
    {
      name: 'workflowInstanceId',
      label: 'Workflow Instance ID (Optional)',
      type: 'text',
    },
  ];

  const onSubmit = (data: GenerateDocumentFormData) => {
    const cleanData: GenerateDocumentFormData = {
      ...data,
      workflowInstanceId: data.workflowInstanceId?.trim() ? data.workflowInstanceId.trim() : undefined,
    };
    generateDocument.mutate(cleanData, {
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

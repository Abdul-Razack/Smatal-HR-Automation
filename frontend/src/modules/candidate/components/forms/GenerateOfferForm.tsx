'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DynamicFormRenderer } from '@/shared/forms/DynamicFormRenderer';
import { FormFieldConfig } from '@/shared/types';
import { useOffer } from '../../hooks/useOffer';
import { useModalStore } from '@/shared/modals/useModalStore';

const generateOfferSchema = z.object({
  documentTypeId: z.string().min(1, 'Document Type is required'),
  baseSalary: z.coerce.number().min(1, 'Base Salary must be greater than 0'),
  currency: z.string().min(1, 'Currency is required'),
  joiningDate: z.string().optional(),
  validUntil: z.string().optional(),
  notes: z.string().optional(),
});

type GenerateOfferFormData = z.infer<typeof generateOfferSchema>;

interface GenerateOfferFormProps {
  candidateId: string;
}

export function GenerateOfferForm({ candidateId }: GenerateOfferFormProps) {
  const { generateOffer } = useOffer();
  const closeModal = useModalStore((state) => state.closeModal);
  
  const form = useForm<GenerateOfferFormData>({
    resolver: zodResolver(generateOfferSchema),
    defaultValues: {
      documentTypeId: '',
      baseSalary: 0,
      currency: 'USD',
      joiningDate: '',
      validUntil: '',
      notes: '',
    },
  });

  const fields: FormFieldConfig[] = [
    { name: 'documentTypeId', label: 'Document Type ID', type: 'text', required: true, description: 'Enter the UUID of the Document Type for the Offer Letter' },
    { name: 'baseSalary', label: 'Base Salary', type: 'number', required: true },
    { name: 'currency', label: 'Currency', type: 'text', required: true, description: 'e.g., USD, EUR' },
    { name: 'joiningDate', label: 'Joining Date', type: 'date' },
    { name: 'validUntil', label: 'Valid Until', type: 'date' },
    { name: 'notes', label: 'Notes (Optional)', type: 'text' },
  ];

  const onSubmit = (data: GenerateOfferFormData) => {
    generateOffer.mutate({
      candidateId,
      data,
    }, {
      onSuccess: () => {
        closeModal('generate-offer');
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-muted p-4 rounded-md text-sm mb-6">
        Generating an offer will trigger an approval workflow. Once approved, the document engine will generate the offer letter asynchronously.
      </div>
      <DynamicFormRenderer
        form={form}
        fields={fields}
        onSubmit={onSubmit}
        isSubmitting={generateOffer.isPending}
        submitLabel="Submit Offer for Approval"
      />
    </div>
  );
}

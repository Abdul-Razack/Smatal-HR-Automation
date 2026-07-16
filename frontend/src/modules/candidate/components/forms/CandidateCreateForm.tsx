'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCandidateSchema, CreateCandidateFormData } from '../../schemas';
import { DynamicFormRenderer } from '@/shared/forms/DynamicFormRenderer';
import { FormFieldConfig } from '@/shared/types';
import { useCandidate } from '../../hooks/useCandidate';
import { useModalStore } from '@/shared/modals/useModalStore';

export function CandidateCreateForm() {
  const { createCandidate } = useCandidate();
  const closeModal = useModalStore((state) => state.closeModal);
  
  const form = useForm<CreateCandidateFormData>({
    resolver: zodResolver(createCandidateSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      source: '',
      notes: '',
    },
  });

  const fields: FormFieldConfig[] = [
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true },
    { name: 'email', label: 'Email Address', type: 'text', required: true },
    { name: 'source', label: 'Application Source', type: 'select', options: [
      { label: 'LinkedIn', value: 'LinkedIn' },
      { label: 'Direct', value: 'Direct' },
      { label: 'Referral', value: 'Referral' },
      { label: 'Agency', value: 'Agency' },
    ]},
    { name: 'notes', label: 'Initial Notes', type: 'textarea' },
  ];

  const onSubmit = (data: CreateCandidateFormData) => {
    createCandidate.mutate(data, {
      onSuccess: () => {
        closeModal('create-candidate');
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 p-4 rounded-md text-sm text-muted-foreground mb-6">
        Creating a candidate will automatically provision a new Profile record in the system.
      </div>
      <DynamicFormRenderer
        form={form}
        fields={fields}
        onSubmit={onSubmit}
        isSubmitting={createCandidate.isPending}
        submitLabel="Create Candidate"
        gridCols={2}
      />
    </div>
  );
}

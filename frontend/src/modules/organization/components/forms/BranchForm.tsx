'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { branchSchema, BranchFormData } from '../../schemas';
import { DynamicFormRenderer } from '@/shared/forms/DynamicFormRenderer';
import { FormFieldConfig } from '@/shared/types';
import { useOrganization } from '../../hooks/useOrganization';
import { useModalStore } from '@/shared/modals/useModalStore';

export function BranchForm({ initialData }: { initialData?: any } = {}) {
  const { createBranch } = useOrganization();
  const closeModal = useModalStore((state) => state.closeModal);
  
  const form = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      isHeadquarters: initialData?.isHeadquarters || false,
      addressLine1: initialData?.addressLine1 || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      country: initialData?.country || '',
    },
  });

  const fields: FormFieldConfig[] = [
    { name: 'name', label: 'Branch Name', type: 'text', required: true, placeholder: 'e.g. New York Office' },
    { name: 'code', label: 'Branch Code', type: 'text', required: true, placeholder: 'e.g. NY01' },
    { name: 'isHeadquarters', label: 'Is Headquarters?', type: 'switch' },
    { name: 'addressLine1', label: 'Address Line 1', type: 'text' },
    { name: 'city', label: 'City', type: 'text' },
    { name: 'state', label: 'State / Province', type: 'text' },
    { name: 'country', label: 'Country', type: 'text' },
  ];

  const onSubmit = (data: BranchFormData) => {
    createBranch.mutate(data, {
      onSuccess: () => {
        closeModal('create-branch');
      }
    });
  };

  return (
    <DynamicFormRenderer
      form={form}
      fields={fields}
      onSubmit={onSubmit}
      isSubmitting={createBranch.isPending}
      submitLabel="Save Branch"
      gridCols={2}
    />
  );
}

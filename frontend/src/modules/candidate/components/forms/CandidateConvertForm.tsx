'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { convertCandidateSchema, ConvertCandidateFormData } from '../../schemas';
import { DynamicFormRenderer } from '@/shared/forms/DynamicFormRenderer';
import { FormFieldConfig } from '@/shared/types';
import { useCandidate } from '../../hooks/useCandidate';
import { useModalStore } from '@/shared/modals/useModalStore';
import { useOrganization } from '@/modules/organization/hooks/useOrganization';
import { useRouter } from 'next/navigation';

export function CandidateConvertForm({ candidateId }: { candidateId: string }) {
  const { convertCandidate } = useCandidate();
  const closeModal = useModalStore((state) => state.closeModal);
  const router = useRouter();

  // Load Organization lookups
  const { useDepartments, useBranches, useDesignations } = useOrganization();
  const { data: depts = [] } = useDepartments();
  const { data: branches = [] } = useBranches();
  const { data: desigs = [] } = useDesignations();
  
  const form = useForm<ConvertCandidateFormData>({
    resolver: zodResolver(convertCandidateSchema),
    defaultValues: {
      joinedDate: new Date().toISOString().split('T')[0],
      departmentId: '',
      designationId: '',
      branchId: '',
      employeeNumber: '',
    },
  });

  const fields: FormFieldConfig[] = [
    { name: 'employeeNumber', label: 'Employee Number (Optional)', type: 'text', placeholder: 'Auto-generated if blank' },
    { name: 'joinedDate', label: 'Joining Date', type: 'date', required: true },
    { name: 'departmentId', label: 'Department', type: 'select', required: true, options: depts.map(d => ({ label: d.name, value: d.id })) },
    { name: 'designationId', label: 'Designation', type: 'select', required: true, options: desigs.map(d => ({ label: d.name, value: d.id })) },
    { name: 'branchId', label: 'Branch / Location', type: 'select', required: true, options: branches.map(b => ({ label: b.name, value: b.id })) },
    { name: 'probationEndDate', label: 'Probation End Date', type: 'date' },
  ];

  const onSubmit = (data: ConvertCandidateFormData) => {
    convertCandidate.mutate({ id: candidateId, data }, {
      onSuccess: (res) => {
        closeModal('convert-candidate');
        // Redirect to new employee record
        router.push(`/hr/employees/${res.employeeId}`);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-green-50 text-green-900 border border-green-200 p-4 rounded-md text-sm mb-6">
        <strong>Ready for Onboarding!</strong> Convert this candidate into an active employee record. This action cannot be undone.
      </div>
      <DynamicFormRenderer
        form={form}
        fields={fields}
        onSubmit={onSubmit}
        isSubmitting={convertCandidate.isPending}
        submitLabel="Complete Conversion"
        gridCols={1}
      />
    </div>
  );
}

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useMaster } from '@/modules/master/hooks/useMaster';
import { useEmployee } from '../../hooks/useEmployee';
import { DynamicFormRenderer } from '@/shared/forms/DynamicFormRenderer';
import { FormFieldConfig } from '@/shared/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function EmployeeDynamicFieldsTab({ employeeId, existingData = {} }: { employeeId: string; existingData?: Record<string, any> }) {
  const { useFieldDefinitions } = useMaster();
  const { updateEmployee } = useEmployee();
  
  const { data: fieldDefinitions, isLoading } = useFieldDefinitions();

  const form = useForm({
    defaultValues: existingData,
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading custom fields...</div>;
  }

  // Filter fields that are applicable to EMPLOYEE entity
  const employeeFields = fieldDefinitions?.filter((fd: any) => fd.entityType === 'EMPLOYEE') || [];

  if (employeeFields.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">No dynamic fields configured for Employee.</div>
        </CardContent>
      </Card>
    );
  }

  // Convert Master API FieldDefinition to FormFieldConfig
  const formConfigs: FormFieldConfig[] = employeeFields.map((fd: any) => ({
    name: fd.name,
    label: fd.label,
    type: fd.type.toLowerCase(),
    required: fd.isRequired,
    placeholder: `Enter ${fd.label.toLowerCase()}`,
    options: fd.options,
    colSpan: 1,
  }));

  const onSubmit = (data: any) => {
    const formattedFields = Object.keys(data).map(key => {
      const fieldDef = employeeFields.find((fd: any) => fd.name === key);
      return {
        fieldDefinitionId: fieldDef?.id as string,
        value: data[key]
      };
    }).filter(f => f.fieldDefinitionId);

    updateEmployee.mutate({ id: employeeId, data: { dynamicFields: formattedFields } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Fields</CardTitle>
        <CardDescription>Manage additional information tracked for this employee.</CardDescription>
      </CardHeader>
      <CardContent>
        <DynamicFormRenderer
          form={form}
          fields={formConfigs}
          onSubmit={onSubmit}
          isSubmitting={updateEmployee.isPending}
          submitLabel="Save Custom Fields"
          gridCols={2}
        />
      </CardContent>
    </Card>
  );
}

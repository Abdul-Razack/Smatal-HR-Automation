'use client';

import * as React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormFieldConfig } from '../types';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DynamicFormRendererProps {
  form: UseFormReturn<any>;
  fields: FormFieldConfig[];
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  gridCols?: 1 | 2 | 3 | 4;
}

export function DynamicFormRenderer({
  form,
  fields,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Submit',
  gridCols = 1,
}: DynamicFormRendererProps) {
  
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[gridCols];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className={cn('grid gap-6', gridColsClass)}>
          {fields.map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem className={cn(field.colSpan && `col-span-${field.colSpan}`)}>
                  <FormLabel>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </FormLabel>
                  <FormControl>
                    {renderFieldControl(field, formField)}
                  </FormControl>
                  {field.description && (
                    <FormDescription>{field.description}</FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function renderFieldControl(config: FormFieldConfig, field: any) {
  const commonProps = {
    placeholder: config.placeholder,
    disabled: config.disabled,
    readOnly: config.readonly,
  };

  switch (config.type) {
    case 'text':
    case 'email':
    case 'password':
    case 'number':
    case 'phone':
    case 'time':
    case 'date':
      return (
        <Input 
          type={config.type} 
          {...field} 
          {...commonProps} 
          value={field.value ?? ''} 
        />
      );
    case 'textarea':
      return (
        <Textarea 
          {...field} 
          {...commonProps} 
          value={field.value ?? ''} 
        />
      );
    case 'select':
      return (
        <Select 
          onValueChange={field.onChange} 
          defaultValue={field.value}
          disabled={config.disabled}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder={config.placeholder || 'Select an option'} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {config.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value.toString()}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case 'radio':
      return (
        <RadioGroup
          onValueChange={field.onChange}
          defaultValue={field.value}
          className="flex flex-col space-y-1"
          disabled={config.disabled}
        >
          {config.options?.map((opt) => (
            <FormItem className="flex items-center space-x-3 space-y-0" key={opt.value}>
              <FormControl>
                <RadioGroupItem value={opt.value.toString()} />
              </FormControl>
              <FormLabel className="font-normal">
                {opt.label}
              </FormLabel>
            </FormItem>
          ))}
        </RadioGroup>
      );
    case 'checkbox':
      return (
        <div className="flex items-center space-x-3 space-y-0 mt-2">
          <Checkbox
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={config.disabled}
          />
        </div>
      );
    case 'switch':
      return (
        <div className="flex items-center space-x-3 space-y-0 mt-2">
          <Switch
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={config.disabled}
          />
        </div>
      );
    // Placeholder implementations for advanced fields requested by user
    case 'file':
    case 'image':
      return (
        <Input 
          type="file" 
          accept={config.type === 'image' ? 'image/*' : undefined}
          disabled={config.disabled}
          onChange={(e) => field.onChange(e.target.files)}
        />
      );
    default:
      return <Input type="text" {...field} {...commonProps} />;
  }
}

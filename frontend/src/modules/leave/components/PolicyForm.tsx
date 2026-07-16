'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export function PolicyForm() {
  const form = useForm({
    defaultValues: {
      name: '',
      annualEntitlement: 0,
      accrualType: 'MONTHLY',
    },
  });

  const onSubmit = (data: any) => {
    console.log(data);
    // Submit policy logic here
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Policy Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Standard Annual Leave" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="annualEntitlement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Annual Entitlement (Days)</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save Policy</Button>
      </form>
    </Form>
  );
}

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
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
import { useCreateTemplate } from '@/modules/document/hooks/useDocumentQueries';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDocument } from '@/modules/document/hooks/useDocument';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  documentTypeId: z.string().min(1, { message: 'Document Type is required.' }),
  description: z.string().optional(),
});

export default function CreateTemplatePage() {
  const router = useRouter();
  const createTemplate = useCreateTemplate();
  const { useDocumentTypes } = useDocument();
  const { data: docTypes = [], isLoading: isDocTypesLoading } = useDocumentTypes({ isActive: true });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      documentTypeId: '',
      description: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const created = await createTemplate.mutateAsync(values);
      toast.success('Template created successfully');
      router.push(`/documents/templates/${created.id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create template');
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center gap-2">
        <Link href="/documents/templates">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 font-medium shadow-sm hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Templates</span>
          </Button>
        </Link>
      </div>

      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create Template</h2>
        <p className="text-muted-foreground">
          Define a new document template. You will be able to edit and customize it in the browser editor.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Offer Letter - Software Engineer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="documentTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isDocTypesLoading ? "Loading document types..." : "Select a document type"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {docTypes.map((dt: any) => (
                      <SelectItem key={dt.id} value={dt.id}>
                        {dt.name} ({dt.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the HR document type this template belongs to.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Optional description..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTemplate.isPending}>
              {createTemplate.isPending ? 'Creating...' : 'Create Template'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

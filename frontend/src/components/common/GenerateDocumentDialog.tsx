'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { useGenerateDocument } from '@/modules/document/hooks/useDocumentQueries';

const formSchema = z.object({
  templateId: z.string().min(1, { message: 'Template ID is required.' }),
  profileId: z.string().min(1, { message: 'Profile ID is required.' }),
  candidateId: z.string().optional(),
  employeeId: z.string().optional(),
});

interface GenerateDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTemplateId?: string;
  defaultProfileId?: string;
}

export function GenerateDocumentDialog({
  open,
  onOpenChange,
  defaultTemplateId = '',
  defaultProfileId = '',
}: GenerateDocumentDialogProps) {
  const router = useRouter();
  const generateDocument = useGenerateDocument();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateId: defaultTemplateId,
      profileId: defaultProfileId,
      candidateId: '',
      employeeId: '',
    },
  });

  // Update form if defaults change
  React.useEffect(() => {
    form.reset({
      templateId: defaultTemplateId,
      profileId: defaultProfileId,
      candidateId: '',
      employeeId: '',
    });
  }, [defaultTemplateId, defaultProfileId, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await generateDocument.mutateAsync(values);
      toast.success('Document generation started!');
      onOpenChange(false);
      // Optional: Navigate to the document viewer or tracking page
      router.push(`/documents/generated`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to generate document');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Document</DialogTitle>
          <DialogDescription>
            Select a template and profile to generate a document. The process will run asynchronously.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="templateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template ID</FormLabel>
                  <FormControl>
                    <Input placeholder="TPL-XXXX" {...field} />
                  </FormControl>
                  <FormDescription>
                    The template to use for generation.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profileId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile ID</FormLabel>
                  <FormControl>
                    <Input placeholder="PROF-XXXX" {...field} />
                  </FormControl>
                  <FormDescription>
                    The target profile context (e.g., candidate profile).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="candidateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Candidate ID (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="CAND-XXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="EMP-XXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end pt-4 space-x-2">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={generateDocument.isPending}>
                {generateDocument.isPending ? 'Initiating...' : 'Generate'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

import { z } from 'zod';

export const generateDocumentSchema = z.object({
  documentTypeId: z.string().min(1, 'Document Type is required'),
  entityType: z.string().min(1, 'Entity Type is required'),
  entityId: z.string().min(1, 'Entity ID is required'),
  workflowInstanceId: z.string().optional(),
});

export type GenerateDocumentFormData = z.infer<typeof generateDocumentSchema>;

import { z } from 'zod';

export const generateDocumentSchema = z.object({
  templateId: z.string().min(1, 'Template is required'),
  profileId: z.string().min(1, 'Profile ID is required'),
  candidateId: z.string().optional(),
  employeeId: z.string().optional(),
  workflowInstanceId: z.string().optional(),
  workflowStageId: z.string().optional(),
});

export type GenerateDocumentFormData = z.infer<typeof generateDocumentSchema>;

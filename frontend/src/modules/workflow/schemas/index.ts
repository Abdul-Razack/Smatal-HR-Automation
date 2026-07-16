import { z } from 'zod';

export const workflowDefinitionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  entityType: z.string().min(1, 'Entity Type is required'),
  processCode: z.string().min(1, 'Process Code is required'),
  description: z.string().optional(),
});
export type WorkflowDefinitionFormData = z.infer<typeof workflowDefinitionSchema>;

export const workflowStageSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  displayOrder: z.coerce.number().min(1, 'Order must be positive'),
  description: z.string().optional(),
  isTerminal: z.boolean().default(false),
  isFinal: z.boolean().default(false),
});
export type WorkflowStageFormData = z.infer<typeof workflowStageSchema>;

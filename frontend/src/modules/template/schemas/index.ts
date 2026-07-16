import { z } from 'zod';

export const templateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  type: z.string().min(1, 'Type is required'),
  description: z.string().optional(),
});
export type TemplateFormData = z.infer<typeof templateSchema>;

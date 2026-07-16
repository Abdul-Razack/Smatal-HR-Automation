import { z } from 'zod';

export const documentTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional(),
});
export type DocumentTypeFormData = z.infer<typeof documentTypeSchema>;

export const fieldGroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  displayOrder: z.coerce.number().optional(),
});
export type FieldGroupFormData = z.infer<typeof fieldGroupSchema>;

export const fieldDefinitionSchema = z.object({
  machineKey: z.string().min(1, 'Machine key is required'),
  displayName: z.string().min(1, 'Display name is required'),
  dataType: z.string().min(1, 'Data type is required'),
  entityType: z.string().min(1, 'Entity type is required'),
  isRequired: z.boolean().default(false),
  description: z.string().optional(),
  defaultValue: z.string().optional(),
  displayOrder: z.coerce.number().optional(),
  groupId: z.string().uuid().optional(),
});
export type FieldDefinitionFormData = z.infer<typeof fieldDefinitionSchema>;

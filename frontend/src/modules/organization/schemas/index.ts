import { z } from 'zod';

export const departmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  parentId: z.string().uuid().optional(),
});
export type DepartmentFormData = z.infer<typeof departmentSchema>;

export const branchSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  isHeadquarters: z.boolean().default(false),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});
export type BranchFormData = z.infer<typeof branchSchema>;

export const designationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  level: z.coerce.number().min(1, 'Level must be at least 1'),
});
export type DesignationFormData = z.infer<typeof designationSchema>;

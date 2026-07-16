import { z } from 'zod';

export const createCandidateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  source: z.string().optional(),
  referredBy: z.string().optional(), // uuid
  notes: z.string().optional(),
});
export type CreateCandidateFormData = z.infer<typeof createCandidateSchema>;

export const convertCandidateSchema = z.object({
  joinedDate: z.string().min(1, 'Joined date is required'),
  departmentId: z.string().optional(),
  designationId: z.string().optional(),
  branchId: z.string().optional(),
  reportsToId: z.string().optional(),
  employeeNumber: z.string().optional(),
  probationEndDate: z.string().optional(),
});
export type ConvertCandidateFormData = z.infer<typeof convertCandidateSchema>;

import { z } from 'zod';

export const updateEmployeeSchema = z.object({
  departmentId: z.string().optional(),
  designationId: z.string().optional(),
  branchId: z.string().optional(),
  reportsToId: z.string().optional(),
  employeeNumber: z.string().optional(),
});
export type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>;

export const terminateEmployeeSchema = z.object({
  terminationDate: z.string().min(1, 'Termination date is required'),
  reason: z.string().min(1, 'Reason is required'),
});
export type TerminateEmployeeFormData = z.infer<typeof terminateEmployeeSchema>;

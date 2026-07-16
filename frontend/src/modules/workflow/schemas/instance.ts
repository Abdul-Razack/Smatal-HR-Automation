import { z } from 'zod';

export const approveWorkflowSchema = z.object({
  remarks: z.string().optional(),
});
export type ApproveWorkflowFormData = z.infer<typeof approveWorkflowSchema>;

export const rejectWorkflowSchema = z.object({
  reason: z.string().min(1, 'Reason is required for rejection'),
});
export type RejectWorkflowFormData = z.infer<typeof rejectWorkflowSchema>;

export const returnWorkflowSchema = z.object({
  targetStageId: z.string().min(1, 'Target stage is required'),
  reason: z.string().min(1, 'Reason is required'),
});
export type ReturnWorkflowFormData = z.infer<typeof returnWorkflowSchema>;

export const cancelWorkflowSchema = z.object({
  reason: z.string().min(1, 'Reason is required for cancellation'),
});
export type CancelWorkflowFormData = z.infer<typeof cancelWorkflowSchema>;

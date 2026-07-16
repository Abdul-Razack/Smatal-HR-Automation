import { z } from 'zod';
import { LeaveDurationType } from '../types';

export const applyLeaveSchema = z.object({
  leaveTypeId: z.string().min(1, 'Leave Type is required'),
  startDate: z.string().min(1, 'Start Date is required'),
  endDate: z.string().min(1, 'End Date is required'),
  durationType: z.nativeEnum(LeaveDurationType),
  reason: z.string().min(5, 'Reason must be at least 5 characters long'),
  attachmentUrl: z.string().optional(),
}).refine(data => new Date(data.startDate) <= new Date(data.endDate), {
  message: 'End Date cannot be before Start Date',
  path: ['endDate'],
});

export type ApplyLeaveFormValues = z.infer<typeof applyLeaveSchema>;

export const approveLeaveSchema = z.object({
  reason: z.string().optional(),
});

export type ApproveLeaveFormValues = z.infer<typeof approveLeaveSchema>;

export const rejectLeaveSchema = z.object({
  reason: z.string().min(3, 'Reason for rejection is required'),
});

export type RejectLeaveFormValues = z.infer<typeof rejectLeaveSchema>;

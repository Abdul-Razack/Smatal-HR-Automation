import { z } from 'zod';
import { commonValidations } from '@/utils/validation';

export const loginSchema = z.object({
  email: commonValidations.email,
  password: z.string().min(1, { message: 'Password is required' }),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;

import { cpfValidation } from '@/utils/validation-helpers/cpf';
import { z } from 'zod';

export const loginSchema = z.object({
  document: cpfValidation,
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

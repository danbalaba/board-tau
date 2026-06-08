'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { isForbiddenPassword } from '@/lib/password-blacklist';

// ── Security-grade Zod schema for the Change Password form ──────────────────
// Prevents weak passwords and XSS injection attempts.
// ─────────────────────────────────────────────────────────────────────────────

const NO_HTML = /^(?!.*<[^>]+>).+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;

export const changePasswordSchema = z.object({
  oldPassword: z
    .string(),
    
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters.')
    .max(100, 'New password must be less than 100 characters.')
    .regex(PASSWORD_REGEX, 'Password must contain uppercase, lowercase, number, and special character.')
    .regex(NO_HTML, 'Password must not contain HTML tags.')
    .refine((val) => !isForbiddenPassword(val), {
      message: 'This password is too common/easy to guess. Please choose a stronger one.',
    }),

  confirmPassword: z
    .string()
    .min(1, 'Please confirm your new password.'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Inferred TypeScript type from schema
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

// Export resolver for react-hook-form
export const changePasswordResolver = zodResolver(changePasswordSchema);

import { z } from 'zod';
import { isForbiddenPassword } from '@/lib/password-blacklist';

// ── Security-grade Zod schemas for Auth ──────────────────────────────────────
// These are shared between the Client (Forms) and the Server (Actions/API)
// ─────────────────────────────────────────────────────────────────────────────

const NO_HTML = /^(?!.*<[^>]+>).+$/;
const LETTERS_ONLY = /^[A-Za-z\s]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;

// Signup Schema (Strict)
export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Full name is required.')
    .max(50, 'Name is too long.')
    .regex(/^[a-zA-Z\s'.-]+$/, 'Name can only contain letters, spaces, hyphens, dots, and apostrophes.')
    .regex(NO_HTML, 'Name must not contain HTML tags.')
    .refine((val) => {
      const parts = val.split(/\s+/);
      if (parts.length < 2) return false;
      if (parts[0].length < 2) return false;
      return parts.every(part => /[a-zA-Z]/.test(part));
    }, 'Please enter a valid full name (at least first and last name, containing letters).'),
  
  email: z
    .string()
    .email('Please enter a valid email address.')
    .min(1, 'Email is required.'),
    
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(PASSWORD_REGEX, 'Complexity required: Uppercase, Lowercase, Number, and Special Char.')
    .refine((val) => !isForbiddenPassword(val), {
      message: 'This password is too common/easy to guess. Please choose a stronger one.',
    }),
});

// Login Schema (Simple)
export const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address.')
    .min(1, 'Email is required.'),
  
  password: z
    .string()
    .min(1, 'Password is required.'),
});

// OTP Schema
export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'Verification code must be exactly 6 digits.')
    .regex(/^\d+$/, 'Verification code must only contain numbers.'),
});

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address.')
    .min(1, 'Email is required.'),
});

// Reset Password Schema
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(PASSWORD_REGEX, 'Complexity required: Uppercase, Lowercase, Number, and Special Char.')
    .refine((val) => !isForbiddenPassword(val), {
      message: 'This password is too common/easy to guess. Please choose a stronger one.',
    }),
  confirmPassword: z
    .string()
    .min(1, 'Confirm password is required.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export type SignupFormValues = z.infer<typeof signupSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type OtpFormValues = z.infer<typeof otpSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

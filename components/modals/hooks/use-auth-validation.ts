'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { 
  signupSchema, 
  loginSchema, 
  otpSchema,
  SignupFormValues,
  LoginFormValues,
  OtpFormValues
} from '@/lib/validations/auth';

export type { SignupFormValues, LoginFormValues, OtpFormValues };

// ── Client-side Resolvers ────────────────────────────────────────────────────
// These are used by react-hook-form in the AuthModal
// ─────────────────────────────────────────────────────────────────────────────

export const signupResolver = zodResolver(signupSchema);
export const loginResolver = zodResolver(loginSchema);
export const otpResolver = zodResolver(otpSchema);

export { signupSchema, loginSchema, otpSchema };

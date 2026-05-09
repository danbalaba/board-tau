'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// ── Security-grade Zod schema for the Edit Profile form ──────────────────────
// All fields are validated client-side. Coordinates are never included.
// XSS-safe: no HTML allowed in any string field.
// ─────────────────────────────────────────────────────────────────────────────

const NO_HTML = /^(?!.*<[^>]+>).+$/;
const PH_PHONE = /^(09|9|639)\d{9}$/;

export const editProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Full name must be at least 2 characters.')
    .max(100, 'Full name must be less than 100 characters.')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes.')
    .regex(NO_HTML, 'Name must not contain HTML tags.'),

  phoneNumber: z
    .string()
    .min(1, 'Phone number is required.')
    .transform((val) => val.replace(/[^0-9]/g, '')) // strip non-digits
    .refine(
      (cleaned) => cleaned.length >= 10 && cleaned.length <= 13 && PH_PHONE.test(cleaned),
      'Enter a valid Philippine mobile number (e.g. 0917 123 4567 or +63 917 123 4567).'
    ),

  city: z
    .string({ message: 'City is required.' })
    .min(1, 'City is required.')
    .max(100, 'City must be less than 100 characters.')
    .regex(NO_HTML, 'City must not contain HTML tags.'),

  region: z
    .string({ message: 'Region is required.' })
    .min(1, 'Region is required.')
    .max(100, 'Region must be less than 100 characters.')
    .regex(NO_HTML, 'Region must not contain HTML tags.'),

  address: z
    .string({ message: 'Home address is required.' })
    .min(1, 'Home address is required.')
    .max(255, 'Address must be less than 255 characters.')
    .regex(NO_HTML, 'Address must not contain HTML tags.'),

  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters.')
    .regex(NO_HTML, 'Bio must not contain HTML tags.')
    .optional()
    .or(z.literal('')),
});

// Inferred TypeScript type from schema
export type EditProfileFormValues = z.infer<typeof editProfileSchema>;

// Export resolver for react-hook-form
export const editProfileResolver = zodResolver(editProfileSchema);

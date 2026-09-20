import { z } from 'zod';

export const roomAddSchema = z.object({
  listingId: z.string().min(1, 'Please select a building'),
  name: z.string().trim().min(1, 'Room name is required').max(50, 'Room name is too long'),
  roomType: z.string().min(1, 'Please select a room category'),
  bathroomArrangement: z.string().min(1, 'Please select a bathroom setup'),
  kitchenSetup: z.string().min(1, 'Please select a kitchen setup'),
  
  price: z
    .union([z.string(), z.number()])
    .refine((val) => val !== '' && val !== undefined && val !== null, { message: 'Monthly rate is required' })
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 500, { message: 'Price must be at least ₱500' })
    .refine((val) => val <= 50000, { message: 'Price cannot exceed ₱50,000' }),
    
  reservationFee: z
    .union([z.string(), z.number()])
    .refine((val) => val !== '' && val !== undefined && val !== null, { message: 'Reservation fee is required' })
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 500, { message: 'Fee must be at least ₱500' })
    .refine((val) => val <= 50000, { message: 'Fee cannot exceed ₱50,000' }),
    
  bedType: z.string().min(1, 'Bed type is required'),
  
  bedCount: z
    .union([z.string(), z.number()])
    .refine((val) => val !== '' && val !== undefined && val !== null, { message: 'Bed count is required' })
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 1, { message: 'Bed count must be at least 1' })
    .refine((val) => val <= 10, { message: 'Bed count cannot exceed 10' }),
    
  size: z
    .union([z.string(), z.number()])
    .refine((val) => val !== '' && val !== undefined && val !== null, { message: 'Size is required' })
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 5, { message: 'Size must be at least 5 sqm' })
    .refine((val) => val <= 100, { message: 'Size cannot exceed 100 sqm' }),
    
  description: z.string().trim().min(20, 'Description needs at least 20 chars'),
});

export const validateField = (fieldName: string, value: any): string | null => {
  try {
    const fieldSchema = (roomAddSchema.shape as any)[fieldName];
    if (!fieldSchema) return null;

    const result = fieldSchema.safeParse(value);
    if (!result.success) {
      const issue = result.error.issues[0];
      return issue ? issue.message : 'Invalid field';
    }
    return null;
  } catch {
    return null;
  }
};

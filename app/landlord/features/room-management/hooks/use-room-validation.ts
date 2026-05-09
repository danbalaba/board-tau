import * as z from 'zod';

export const roomValidationSchema = z.object({
  listingId: z.string().min(1, 'Please select a parent property'),
  name: z.string().min(1, 'Room name/number is required').max(50, 'Name too long'),
  description: z.string().min(20, 'Please provide a short description (min 20 chars)').max(500),
  roomType: z.enum(['SOLO', 'BEDSPACE']),
  bathroomArrangement: z.enum(['PRIVATE_CR', 'SHARED_OCCUPANTS', 'COMMON_CR']),
  bedType: z.string().min(1, 'Bed type is required'),
  price: z.preprocess((val) => Number(val), z.number().min(1, 'Price must be at least 1 PHP')),
  reservationFee: z.preprocess((val) => Number(val), z.number().min(0)),
  capacity: z.preprocess((val) => Number(val), z.number().min(1, 'Capacity must be at least 1')),
  availableSlots: z.preprocess((val) => Number(val), z.number().min(1)),
  size: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional()),
  amenities: z.array(z.string()),
  images: z.array(z.string()).min(1, 'At least one image is required').max(5, 'Maximum 5 images allowed')
});

export type RoomValidationValues = z.infer<typeof roomValidationSchema>;

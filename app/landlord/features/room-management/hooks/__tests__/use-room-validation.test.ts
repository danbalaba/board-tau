import { roomValidationSchema } from '../use-room-validation';

describe('Room Validation Schema', () => {
  const validData = {
    listingId: 'listing-123',
    name: 'Room 101',
    description: 'This is a very nice room with enough characters to pass validation.',
    roomType: 'SOLO',
    bathroomArrangement: 'PRIVATE_CR',
    bedType: 'SINGLE',
    price: 5000,
    reservationFee: 1000,
    capacity: 1,
    availableSlots: 1,
    size: 20,
    amenities: ['wifi', 'aircon'],
    images: ['img1.jpg']
  };

  it('validates a correct payload', () => {
    const result = roomValidationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('fails if listingId is missing', () => {
    const result = roomValidationSchema.safeParse({ ...validData, listingId: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Please select a parent property');
    }
  });

  it('fails if name is too short', () => {
    const result = roomValidationSchema.safeParse({ ...validData, name: '' });
    expect(result.success).toBe(false);
  });

  it('fails if description is less than 20 chars', () => {
    const result = roomValidationSchema.safeParse({ ...validData, description: 'Too short' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Please provide a short description (min 20 chars)');
    }
  });

  it('fails if price is less than 1', () => {
    const result = roomValidationSchema.safeParse({ ...validData, price: 0 });
    expect(result.success).toBe(false);
  });

  it('fails if capacity is less than 1', () => {
    const result = roomValidationSchema.safeParse({ ...validData, capacity: 0 });
    expect(result.success).toBe(false);
  });

  it('fails if images are missing', () => {
    const result = roomValidationSchema.safeParse({ ...validData, images: [] });
    expect(result.success).toBe(false);
  });
});

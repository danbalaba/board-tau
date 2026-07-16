import { validateCreateListingStep } from '../create-listing';

describe('create-listing validation', () => {
  it('validates step 0 (PROPERTY_BASICS)', () => {
    const formData = {
      businessInfo: {
        businessName: 'Joes Boarding',
        businessType: 'boarding-house',
        yearsExperience: '1-2',
        businessDescription: 'A'.repeat(100),
      },
      propertyInfo: {
        propertyName: 'Joes Place',
        description: 'B'.repeat(100),
        price: '1500',
      },
    };

    const res = validateCreateListingStep(0, formData);
    expect(res.valid).toBe(true);
    expect(res.errors).toEqual([]);
  });

  it('fails step 0 with invalid data', () => {
    const formData = {
      businessInfo: { businessName: 'A', businessDescription: 'short' },
      propertyInfo: { propertyName: 'B', description: 'short', price: '100' },
    };

    const res = validateCreateListingStep(0, formData);
    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);
    expect(res.errors.some(e => e.field === 'businessInfo.businessName')).toBe(true);
    expect(res.errors.some(e => e.field === 'propertyInfo.price')).toBe(true);
  });

  it('validates step 1 (LOCATION)', () => {
    const formData = {
      location: {
        address: '123 Street',
        city: 'City',
        province: 'Province',
        zipCode: '1234',
        coordinates: [121, 14],
      },
    };
    const res = validateCreateListingStep(1, formData);
    expect(res.valid).toBe(true);
  });

  it('fails step 1 with invalid data', () => {
    const formData = { location: { zipCode: 'abc' } };
    const res = validateCreateListingStep(1, formData);
    expect(res.valid).toBe(false);
    expect(res.errors.some(e => e.field === 'location.address')).toBe(true);
  });

  it('validates step 2 (PROPERTY CONFIGURATION)', () => {
    const formData = {
      propertyConfig: {
        totalRooms: '10',
        bathroomCount: '2',
      },
    };
    const res = validateCreateListingStep(2, formData);
    expect(res.valid).toBe(true);
  });

  it('validates step 3 (ROOM INVENTORY)', () => {
    const formData = {
      propertyConfig: {
        rooms: [
          {
            roomType: 'Single',
            bedType: 'Single Bed',
            bathroomArrangement: 'Shared',
            price: '2000',
            reservationFee: '1000',
            bedCount: '1',
            size: '10',
          },
        ],
      },
    };
    const res = validateCreateListingStep(3, formData);
    expect(res.valid).toBe(true);
  });

  it('fails step 3 with invalid room data', () => {
    const formData = {
      propertyConfig: {
        rooms: [
          {
            price: '100', // invalid price
          },
        ],
      },
    };
    const res = validateCreateListingStep(3, formData);
    expect(res.valid).toBe(false);
    expect(res.errors.some(e => e.field === 'propertyConfig.rooms[0].roomType')).toBe(true);
    expect(res.errors.some(e => e.field === 'propertyConfig.rooms[0].price')).toBe(true);
  });

  it('validates step 4 (IMAGES)', () => {
    const formData = {
      propertyImages: {
        property: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
        rooms: {
          '0': ['room1.jpg'],
        },
      },
      propertyConfig: {
        rooms: [{}], // 1 room
      },
    };
    const res = validateCreateListingStep(4, formData);
    expect(res.valid).toBe(true);
  });

  it('fails step 4 with missing images', () => {
    const formData = {
      propertyImages: {
        property: ['img1.jpg'],
      },
    };
    const res = validateCreateListingStep(4, formData);
    expect(res.valid).toBe(false);
    expect(res.errors.some(e => e.field === 'propertyImages.property')).toBe(true);
  });

  it('validates step 5 (DOCUMENTS)', () => {
    const formData = {
      documents: {
        governmentId: 'id.jpg',
        businessPermit: 'permit.jpg',
        landTitle: 'title.jpg',
        barangayClearance: 'clearance.jpg',
        fireSafetyCertificate: 'fire.jpg',
      },
    };
    const res = validateCreateListingStep(5, formData);
    expect(res.valid).toBe(true);
  });
});

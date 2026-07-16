import { autoCategorizeListing } from '../categorizer';

describe('categorizer', () => {
  it('returns default Student-Friendly when no categories match', () => {
    const categories = autoCategorizeListing({});
    expect(categories).toContain('Student-Friendly');
  });

  it('categorizes as Budget-Friendly if lowest price is <= 3000', () => {
    const categories = autoCategorizeListing({ price: 2500 });
    expect(categories).toContain('Budget-Friendly');
  });

  it('finds lowest price from rooms for Budget-Friendly', () => {
    const categories = autoCategorizeListing({
      price: 5000,
      rooms: [{ price: 3000 }, { price: 4000 }]
    });
    expect(categories).toContain('Budget-Friendly');
  });

  it('categorizes as Student-Friendly if wifi and study/quiet enabled', () => {
    const categories1 = autoCategorizeListing({ amenities: ['wifi'], studyFriendly: true });
    expect(categories1).toContain('Student-Friendly');

    const categories2 = autoCategorizeListing({ amenities: ['WIFI'], quietEnvironment: true });
    expect(categories2).toContain('Student-Friendly');
  });

  it('categorizes as Premium if >= 8000, has AC and SOLO room', () => {
    const categories = autoCategorizeListing({
      price: 8500,
      amenities: ['ac'],
      rooms: [{ roomType: 'SOLO' }]
    });
    expect(categories).toContain('Premium');
  });

  it('categorizes as Family-Friendly if visitors allowed', () => {
    const categories = autoCategorizeListing({ visitorsAllowed: true });
    expect(categories).toContain('Family-Friendly');
  });

  it('categorizes as Pet-Friendly if pets allowed', () => {
    const categories = autoCategorizeListing({ petsAllowed: true });
    expect(categories).toContain('Pet-Friendly');
  });

  it('categorizes as Apartment if businessType includes apartment', () => {
    const categories = autoCategorizeListing({ businessInfo: { businessType: 'Apartment Building' } });
    expect(categories).toContain('Apartment');
  });

  it('categorizes as Short-Term / Flexible Lease if flexibleLease is true', () => {
    const categories = autoCategorizeListing({ flexibleLease: true });
    expect(categories).toContain('Short-Term / Flexible Lease');
  });

  it('categorizes as Quiet / Study Environment if noCurfew is false and quietEnvironment is true', () => {
    const categories = autoCategorizeListing({ noCurfew: false, quietEnvironment: true });
    expect(categories).toContain('Quiet / Study Environment');
  });
});

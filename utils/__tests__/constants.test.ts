import {
  categories,
  LISTINGS_BATCH,
  menuItems,
  TAU_COORDINATES,
  roomTypeOptions,
  stayDurationOptions
} from '../constants';

describe('constants', () => {
  it('exports valid categories array', () => {
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
  });

  it('exports LISTINGS_BATCH number', () => {
    expect(typeof LISTINGS_BATCH).toBe('number');
  });

  it('exports valid menuItems', () => {
    expect(Array.isArray(menuItems)).toBe(true);
  });

  it('exports valid TAU_COORDINATES tuple', () => {
    expect(Array.isArray(TAU_COORDINATES)).toBe(true);
    expect(TAU_COORDINATES).toHaveLength(2);
  });

  it('exports valid roomTypeOptions', () => {
    expect(Array.isArray(roomTypeOptions)).toBe(true);
  });

  it('exports valid stayDurationOptions', () => {
    expect(Array.isArray(stayDurationOptions)).toBe(true);
  });
});

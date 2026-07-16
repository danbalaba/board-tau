import { buildSearchUrl } from '../searchUrlBuilder';
import { ROOM_TYPES } from '@/data/roomTypes';

jest.mock('query-string', () => ({
  parse: jest.fn((str) => {
    if (!str) return {};
    const obj: Record<string, string> = {};
    str.split('&').forEach((part: string) => {
      const [k, v] = part.split('=');
      if (k && v) obj[k] = v;
    });
    return obj;
  }),
  stringifyUrl: jest.fn(({ url, query }, options) => {
    const params: string[] = [];
    for (const [k, v] of Object.entries(query)) {
      if (options?.skipNull && (v === null || v === undefined)) continue;
      if (Array.isArray(v)) {
        v.forEach(val => params.push(`${k}=${val}`));
      } else {
        params.push(`${k}=${v}`);
      }
    }
    const str = params.join('&');
    return str ? `${url}?${str}` : url;
  }),
}));

jest.mock('@/data/colleges', () => ({
  colleges: [
    { value: 'tau', label: 'TAU', latlng: [15.635, 120.415] }
  ]
}));

describe('searchUrlBuilder', () => {
  it('builds a simple url with no params', () => {
    const url = buildSearchUrl({}, null);
    expect(url).toBe('/');
  });

  it('preserves existing query parameters', () => {
    const searchParams = new URLSearchParams('foo=bar&baz=1');
    const url = buildSearchUrl({}, searchParams);
    expect(url).toContain('foo=bar');
    expect(url).toContain('baz=1');
  });

  it('includes college and geolocation if provided', () => {
    const url = buildSearchUrl({ college: 'tau' }, null);
    expect(url).toContain('college=tau');
    expect(url).toContain('originLat=15.635');
    expect(url).toContain('originLng=120.415');
  });

  it('serializes array parameters correctly', () => {
    const url = buildSearchUrl({ categories: ['Apartment', 'Premium'] }, null);
    expect(url).toContain('categories=Apartment');
    expect(url).toContain('categories=Premium');
  });

  it('serializes boolean rules and advanced filters', () => {
    const url = buildSearchUrl({
      rules: ['female-only', 'visitors-allowed'],
      advanced: ['cctv', 'floodFree']
    }, null);

    expect(url).toContain('femaleOnly=true');
    expect(url).toContain('visitorsAllowed=true');
    expect(url).toContain('cctv=true');
    expect(url).toContain('floodFree=true');
  });

  it('ignores capacity if roomType is SOLO', () => {
    const url = buildSearchUrl({
      roomType: ROOM_TYPES.SOLO,
      capacity: '4'
    }, null);

    expect(url).not.toContain('capacity=');
    expect(url).toContain('roomType=SOLO');
  });
});

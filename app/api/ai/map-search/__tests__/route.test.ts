/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '../route';
import { executeComplexSearch } from '@/services/listing/search.service';

// Mock the search service
jest.mock('@/services/listing/search.service', () => ({
  executeComplexSearch: jest.fn(),
}));

describe('POST /api/ai/map-search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if no query is provided', async () => {
    const req = new NextRequest('http://localhost/api/ai/map-search', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe('Missing query parameter');
  });

  it('should return 400 for invalid bounds format', async () => {
    const req = new NextRequest('http://localhost/api/ai/map-search', {
      method: 'POST',
      body: JSON.stringify({
        query: 'cheap places',
        bounds: 'invalid,bounds,format',
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain('Validation error');
  });

  it('should return 200 and listings for valid inputs', async () => {
    // Mock the backend service to return fake data
    (executeComplexSearch as jest.Mock).mockResolvedValueOnce({
      listings: [{ id: '1', title: 'Test Listing' }],
      total: 1,
    });

    const req = new NextRequest('http://localhost/api/ai/map-search', {
      method: 'POST',
      body: JSON.stringify({
        query: 'cheap places with wifi near engineering building',
        bounds: '-122.4,37.7,-122.3,37.8',
        limit: 10,
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.listings).toHaveLength(1);
    expect(json.listings[0].title).toBe('Test Listing');
    expect(executeComplexSearch).toHaveBeenCalledWith({
      query: 'cheap places with wifi near engineering building',
      bounds: '-122.4,37.7,-122.3,37.8',
      limit: 10,
      isMap: true,
    });
  });

  it('should return 500 on internal server error', async () => {
    (executeComplexSearch as jest.Mock).mockRejectedValueOnce(new Error('DB Error'));

    const req = new NextRequest('http://localhost/api/ai/map-search', {
      method: 'POST',
      body: JSON.stringify({
        query: 'test query',
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe('Internal Server Error');
  });
});

/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '../route';

// Mock the Google Generative AI module
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            maxPrice: 3000,
            amenities: ['WiFi'],
            roomType: 'SOLO'
          })
        }
      })
    })
  }))
}));

describe('POST /api/ai/map-search', () => {
  it('should return 400 if no query is provided', async () => {
    const req = new NextRequest('http://localhost/api/ai/map-search', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe('Invalid query string');
  });

  it('should return 400 if query is too long', async () => {
    const req = new NextRequest('http://localhost/api/ai/map-search', {
      method: 'POST',
      body: JSON.stringify({
        query: 'a'.repeat(501),
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe('Query too long');
  });

  it('should parse query using generative AI', async () => {
    const req = new NextRequest('http://localhost/api/ai/map-search', {
      method: 'POST',
      body: JSON.stringify({
        query: 'cheap places with wifi and solo',
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.params.maxPrice).toBe('3000');
    expect(json.params.amenities).toBe('WiFi');
    expect(json.params.roomType).toBe('SOLO');
  });
});

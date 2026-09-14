/**
 * @jest-environment node
 */

// Mock the AI Provider module
jest.mock('@/lib/ai/ai-provider', () => ({
  generateAIResponse: jest.fn().mockResolvedValue({
    data: {
      maxPrice: 3000,
      amenities: ['WiFi'],
      roomType: 'SOLO'
    },
    rawText: JSON.stringify({ maxPrice: 3000, amenities: ['WiFi'], roomType: 'SOLO' }),
    provider: 'groq'
  })
}));

// Mock the Redis cache module to avoid network requests during tests
jest.mock('@/lib/redis', () => ({
  cache: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(true),
    generateKey: jest.fn().mockReturnValue('mock-cache-key'),
  }
}));

// Mock the dynamic taxonomy service to avoid database connection delays in tests
jest.mock('@/services/taxonomy', () => ({
  getActivePropertyTypes: jest.fn().mockResolvedValue([{ name: 'Boarding House' }, { name: 'Apartment' }]),
  getActiveAttributes: jest.fn().mockResolvedValue([{ name: 'WiFi' }, { name: 'Air Conditioning' }]),
  getActiveCampusColleges: jest.fn().mockResolvedValue([{ code: 'CET', name: 'College of Engineering' }]),
  getActiveRoomTypes: jest.fn().mockResolvedValue([{ name: 'Solo Room' }, { name: 'Bedspace' }]),
}));

import { NextRequest } from 'next/server';
import { POST } from '../route';

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
  }, 15000);
});


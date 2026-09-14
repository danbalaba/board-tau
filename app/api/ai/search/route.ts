import { NextResponse } from 'next/server';
import { z } from 'zod';
import redis, { cache } from '@/lib/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { sanitizeSearchQuery, detectPromptInjection } from '@/lib/security/sanitize';
import { generateAIResponse } from '@/lib/ai/ai-provider';
import {
  getActivePropertyTypes,
  getActiveAttributes,
  getActiveCampusColleges,
  getActiveRoomTypes,
} from '@/services/taxonomy';

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true,
});

// Flexible Zod Schema supporting dynamic Super Admin taxonomy
const aiResponseSchema = z.object({
  q: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().max(100000).optional(),
  roomType: z.string().optional(),
  propertyTypes: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  college: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  rules: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  let query = "";
  try {
    const body = await request.json();
    query = body.query;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Invalid query string' }, { status: 400 });
    }

    if (query.length > 500) {
      return NextResponse.json({ error: 'Query too long' }, { status: 400 });
    }
    
    query = sanitizeSearchQuery(query, 500);

    // OWASP Prompt Injection Check
    const injectionCheck = detectPromptInjection(query);
    if (injectionCheck.isInjection) {
      return NextResponse.json({
        success: true,
        params: {},
        rawParamsString: "",
        _blocked: true
      });
    }

    const normalizedQuery = query.trim().toLowerCase();
    const cacheKey = `ai-search:${normalizedQuery}`;

    // 1. Check Redis Cache First
    const cachedResponse = await cache.get(cacheKey);
    if (cachedResponse) {
      return NextResponse.json(cachedResponse);
    }

    // Fetch cached Super Admin dynamic taxonomy from Redis (< 5ms)
    const [propTypes, attributes, colleges, roomTypes] = await Promise.all([
      getActivePropertyTypes().catch(() => []),
      getActiveAttributes().catch(() => []),
      getActiveCampusColleges().catch(() => []),
      getActiveRoomTypes().catch(() => []),
    ]);

    const validPropertyTypeNames = propTypes.map((p: any) => p.name).join(", ") || "Boarding House, Apartment, Dormitory, Transient House, Agri-Hostel";
    const validCollegeCodes = colleges.map((c: any) => `${c.code} (${c.name})`).join(", ") || "TAU, CBM, CVM, CAF, CAS, CET, LHS, CED";
    const validRoomTypeNames = roomTypes.map((r: any) => r.name).join(", ") || "Solo Room, Bedspace, Studio Unit, 1-Bedroom Unit, 2-Bedroom Unit";
    const validAttributes = attributes.slice(0, 30).map((a: any) => a.name).join(", ") || "WiFi, Air Conditioning, Parking, Kitchen, Hot Shower";

    const prompt = `
Extract structured search parameters from the user query for BoardTAU student housing search.

Available System Taxonomy Context:
- Property Types: [${validPropertyTypeNames}]
- Room Types: [${validRoomTypeNames}]
- Campus Colleges/Landmarks: [${validCollegeCodes}]
- Dynamic Attributes: [${validAttributes}]

User query: "${query}"

Return ONLY a valid JSON object matching this schema:
{ 
  "q": "string (general search keywords)", 
  "minPrice": number, 
  "maxPrice": number, 
  "roomType": "string (e.g. SOLO, BEDSPACE, Studio Unit, 1-Bedroom Unit)", 
  "propertyTypes": ["string"],
  "college": "string (e.g. CBM, CVM, CET, TAU)",
  "amenities": ["string"],
  "rules": ["string"],
  "features": ["string"]
}
If a value is not mentioned, omit the key. Do not include markdown codeblocks.
`;

    const aiResult = await generateAIResponse({
      prompt,
      schema: aiResponseSchema,
      spanName: "ai_search",
    });

    const validatedData = aiResult.data || {};

    // Convert the validated object into flat URLSearchParams format for the frontend
    const urlParams = new URLSearchParams();
    if (validatedData.q) urlParams.set('q', validatedData.q);
    if (validatedData.minPrice) urlParams.set('minPrice', validatedData.minPrice.toString());
    if (validatedData.maxPrice) urlParams.set('maxPrice', validatedData.maxPrice.toString());
    if (validatedData.roomType) urlParams.set('roomType', validatedData.roomType);
    if (validatedData.college) urlParams.set('college', validatedData.college);
    
    const selectedProps = validatedData.propertyTypes || validatedData.categories;
    if (selectedProps && selectedProps.length > 0) {
      urlParams.set('categories', selectedProps.join(','));
    }

    const combinedAttributes = [
      ...(validatedData.amenities || []),
      ...(validatedData.rules || []),
      ...(validatedData.features || []),
    ];
    if (combinedAttributes.length > 0) {
      urlParams.set('amenities', combinedAttributes.join(','));
    }

    const finalResponse = {
      success: true,
      params: Object.fromEntries(urlParams.entries()),
      rawParamsString: urlParams.toString(),
      provider: aiResult.provider,
    };

    // Save to Redis Cache (30 days TTL)
    await cache.set(cacheKey, finalResponse, 2592000);

    return NextResponse.json(finalResponse);

  } catch (error: any) {
    console.error('[AI_MAP_SEARCH_ERROR]', error);
    
    // Fallback parser when AI fails
    const urlParams = new URLSearchParams();
    const qLower = query.toLowerCase();
    
    // Extract price
    const priceMatch = qLower.match(/\b\d{3,5}\b/);
    if (priceMatch) {
      urlParams.set('maxPrice', priceMatch[0]);
    }
    
    // Extract room type
    if (qLower.includes('solo') || qLower.includes('single')) urlParams.set('roomType', 'SOLO');
    if (qLower.includes('bedspace') || qLower.includes('shared')) urlParams.set('roomType', 'BEDSPACE');
    if (qLower.includes('studio')) urlParams.set('roomType', 'Studio Unit');
    if (qLower.includes('apartment')) urlParams.set('categories', 'Apartment');
    
    // Extract basic amenities
    const foundAmenities = [];
    if (qLower.includes('wifi') || qLower.includes('internet')) foundAmenities.push('WiFi');
    if (qLower.includes('ac') || qLower.includes('aircon')) foundAmenities.push('Air Conditioning');
    
    if (foundAmenities.length > 0) {
      urlParams.set('amenities', foundAmenities.join(','));
    }
    
    const stopWords = ["find", "me", "a", "looking", "for", "under", "max", "below", "with", "has", "have", "and", "boarding", "house", "places", "place"];
    const cleanQ = qLower.split(/\s+/)
      .filter(word => !stopWords.includes(word) && !/^\d+$/.test(word))
      .join(" ")
      .trim();
    if (cleanQ) urlParams.set('q', cleanQ);
    
    return NextResponse.json({
      success: true,
      params: Object.fromEntries(urlParams.entries()),
      rawParamsString: urlParams.toString(),
      _fallback: true
    });
  }
}

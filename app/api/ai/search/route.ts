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

// Flexible Zod Schema supporting dynamic Super Admin taxonomy & location proximity
const aiResponseSchema = z.object({
  q: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().max(100000).optional(),
  roomType: z.string().optional(),
  propertyTypes: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  college: z.string().optional(),
  distance: z.number().min(0.1).max(100).optional(),
  isWalkingDistance: z.boolean().optional(),
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
  "q": "string (property title, landlord name, landmark, address, or search keywords)", 
  "minPrice": number, 
  "maxPrice": number (if 'cheap' or 'budget' is mentioned without a number, set maxPrice to 3000), 
  "roomType": "string (e.g. SOLO, BEDSPACE, Studio Unit, 1-Bedroom Unit)", 
  "propertyTypes": ["string"],
  "college": "string (e.g. CBM, CVM, CET, TAU)",
  "distance": number (max search radius/distance in km: e.g. 1 for walking distance/near, 0.5 for 500m, 2 for 2km),
  "isWalkingDistance": boolean (true if query mentions 'walking distance', 'walkable', 'close to', 'near'),
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

    // 1. Location & Real-World GIS Road Calculation Resolution
    let extractedDistance = validatedData.distance;
    if (!extractedDistance && (validatedData.isWalkingDistance || normalizedQuery.includes('walking distance') || normalizedQuery.includes('walkable'))) {
      extractedDistance = 1.0; // Default 1km walking distance threshold
    } else if (!extractedDistance && (normalizedQuery.includes('near') || normalizedQuery.includes('close to'))) {
      extractedDistance = 1.5; // Default 1.5km proximity threshold
    }

    if (extractedDistance) {
      urlParams.set('distance', extractedDistance.toString());
    }

    if (validatedData.college) {
      urlParams.set('college', validatedData.college);
      const cleanColQuery = validatedData.college.toLowerCase().trim();
      const collegeMatch = colleges.find((c: any) => 
        c.code?.toLowerCase() === cleanColQuery ||
        c.name?.toLowerCase().includes(cleanColQuery) ||
        cleanColQuery.includes(c.code?.toLowerCase() || "")
      );

      if (collegeMatch && typeof collegeMatch.latitude === "number" && typeof collegeMatch.longitude === "number") {
        urlParams.set('originLat', collegeMatch.latitude.toString());
        urlParams.set('originLng', collegeMatch.longitude.toString());
        urlParams.set('collegeCode', collegeMatch.code);

        // Apply GIS Road Winding Factor (1.15x for walking <1km, 1.35x for road routes >1km)
        const targetDist = extractedDistance || 1.5;
        const roadFactor = targetDist < 1 ? 1.15 : 1.35;
        const estimatedRoadDistanceKm = Number((targetDist * roadFactor).toFixed(2));
        const estimatedWalkMin = Math.ceil((estimatedRoadDistanceKm * 1000) / 80); // ~80m/min walking speed

        urlParams.set('roadDistanceKm', estimatedRoadDistanceKm.toString());
        urlParams.set('estimatedWalkMin', estimatedWalkMin.toString());
      }
    }
    
    const selectedProps = validatedData.propertyTypes || validatedData.categories;
    if (selectedProps && selectedProps.length > 0) {
      urlParams.set('categories', selectedProps.join(','));
    }

    // 2. Dynamic Attribute Taxonomy Resolution (resolves names to Super Admin attribute IDs)
    const combinedAttributeNames = [
      ...(validatedData.amenities || []),
      ...(validatedData.rules || []),
      ...(validatedData.features || []),
    ];

    if (combinedAttributeNames.length > 0) {
      urlParams.set('amenities', combinedAttributeNames.join(','));

      const resolvedAttrIds: string[] = [];
      combinedAttributeNames.forEach((nameStr: string) => {
        const cleanName = nameStr.toLowerCase().trim();
        const found = attributes.find((attr: any) =>
          attr.name?.toLowerCase() === cleanName ||
          attr.code?.toLowerCase() === cleanName ||
          attr.value?.toLowerCase() === cleanName ||
          cleanName.includes(attr.name?.toLowerCase() || "")
        );
        if (found && found.id && !resolvedAttrIds.includes(found.id)) {
          resolvedAttrIds.push(found.id);
        }
      });

      if (resolvedAttrIds.length > 0) {
        urlParams.set('attributes', resolvedAttrIds.join(','));
      }
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

    // Extract distance & location proximity fallback
    const kmMatch = qLower.match(/(\d+(\.\d+)?)\s*km/);
    const meterMatch = qLower.match(/(\d+)\s*m\b/);
    if (kmMatch) {
      urlParams.set('distance', kmMatch[1]);
    } else if (meterMatch) {
      urlParams.set('distance', (Number(meterMatch[1]) / 1000).toString());
    } else if (qLower.includes('walking distance') || qLower.includes('walkable')) {
      urlParams.set('distance', '1');
    } else if (qLower.includes('near') || qLower.includes('close to')) {
      urlParams.set('distance', '1.5');
    }
    
    // Extract basic amenities
    const foundAmenities = [];
    if (qLower.includes('wifi') || qLower.includes('internet')) foundAmenities.push('WiFi');
    if (qLower.includes('ac') || qLower.includes('aircon')) foundAmenities.push('Air Conditioning');
    
    if (foundAmenities.length > 0) {
      urlParams.set('amenities', foundAmenities.join(','));
    }
    
    const stopWords = ["find", "me", "a", "looking", "for", "under", "max", "below", "with", "has", "have", "and", "boarding", "house", "places", "place", "near", "close", "to", "walking", "distance"];
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

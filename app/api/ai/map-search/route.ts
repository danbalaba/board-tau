import { NextResponse } from 'next/server';
import { z } from 'zod';

// Define the exact shape we expect the AI to return.
// This prevents Prompt Injections where the AI returns arbitrary, malicious JSON.
const aiResponseSchema = z.object({
  q: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().max(100000).optional(),
  roomType: z.enum(['SOLO', 'BEDSPACE']).optional(),
  amenities: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Invalid query string' }, { status: 400 });
    }

    if (query.length > 500) {
      return NextResponse.json({ error: 'Query too long' }, { status: 400 });
    }

    // TODO: Connect this to your actual ChatBot/AI provider (OpenAI, Gemini, etc.)
    // Example:
    // const aiRawJsonString = await myAiProvider.ask(
    //   `Extract search parameters from this text and return ONLY valid JSON matching this schema: 
    //    { q: string, minPrice: number, maxPrice: number, roomType: "SOLO" | "BEDSPACE", amenities: string[], categories: string[] }.
    //    Text: "${query}"`
    // );
    
    // For now, we simulate a smart AI response based on the query to allow you to test it.
    let simulatedAiResult: any = {};
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('cheap') || lowerQuery.includes('budget')) {
      simulatedAiResult.maxPrice = 3000;
    }
    if (lowerQuery.includes('wifi')) {
      simulatedAiResult.amenities = ['WiFi'];
    }
    if (lowerQuery.includes('solo')) {
      simulatedAiResult.roomType = 'SOLO';
    }

    // STRICT VALIDATION
    // We pass the simulated (or real) AI JSON into Zod.
    // If the AI hallucinated or tried to inject malicious keys, Zod will strip them or throw an error.
    const validatedData = aiResponseSchema.parse(simulatedAiResult);

    // Convert the validated object into flat URLSearchParams format for the frontend
    const urlParams = new URLSearchParams();
    if (validatedData.q) urlParams.set('q', validatedData.q);
    if (validatedData.minPrice) urlParams.set('minPrice', validatedData.minPrice.toString());
    if (validatedData.maxPrice) urlParams.set('maxPrice', validatedData.maxPrice.toString());
    if (validatedData.roomType) urlParams.set('roomType', validatedData.roomType);
    if (validatedData.amenities && validatedData.amenities.length > 0) {
      urlParams.set('amenities', validatedData.amenities.join(','));
    }
    if (validatedData.categories && validatedData.categories.length > 0) {
      urlParams.set('categories', validatedData.categories.join(','));
    }

    return NextResponse.json({
      success: true,
      params: Object.fromEntries(urlParams.entries()),
      rawParamsString: urlParams.toString()
    });

  } catch (error: any) {
    console.error('[AI_MAP_SEARCH_ERROR]', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'AI returned invalid or malicious data schema', details: (error as any).errors }, { status: 502 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

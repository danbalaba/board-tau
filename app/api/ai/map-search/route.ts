import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "edge";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

    const prompt = `
Extract search parameters from the following user query for a boarding house search application.
Return ONLY a valid JSON object matching this schema: 
{ 
  "q": "string (general search terms)", 
  "minPrice": "number", 
  "maxPrice": "number", 
  "roomType": "SOLO" | "BEDSPACE", 
  "amenities": ["string"], 
  "categories": ["string"] 
}
If a value is not mentioned, omit the key. Do not include markdown formatting or extra text.

User query: "${query}"
`;

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Clean up potential markdown formatting from Gemini
    if (text.startsWith('\`\`\`json')) text = text.replace('\`\`\`json', '');
    if (text.startsWith('\`\`\`')) text = text.replace('\`\`\`', '');
    if (text.endsWith('\`\`\`')) text = text.substring(0, text.length - 3).trim();

    let aiParsedResult = {};
    try {
      aiParsedResult = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON:", text);
      return NextResponse.json({ error: 'AI returned invalid JSON' }, { status: 502 });
    }

    // STRICT VALIDATION
    // We pass the AI JSON into Zod.
    // If the AI hallucinated or tried to inject malicious keys, Zod will strip them or throw an error.
    const validatedData = aiResponseSchema.parse(aiParsedResult);

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

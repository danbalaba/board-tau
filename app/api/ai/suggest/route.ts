import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { listings, searchParams } = await req.json();

    if (!listings || listings.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    // Build a compact listing summary for the prompt (avoid sending too much data)
    const listingSummaries = listings.slice(0, 6).map((l: any, i: number) => ({
      index: i + 1,
      id: l.id,
      title: l.title,
      price: l.price,
      region: l.region,
      amenities: l.amenities_list?.slice(0, 5).join(", ") || "N/A",
      roomTypes: l.rooms?.map((r: any) => r.roomType).join(", ") || "N/A",
      rating: l.rating || null,
    }));

    // Build a human-readable description of what the user searched for
    const userWants: string[] = [];
    if (searchParams.roomType) userWants.push(`${searchParams.roomType} room`);
    if (searchParams.amenities) userWants.push(searchParams.amenities);
    if (searchParams.roomAmenities) userWants.push(searchParams.roomAmenities);
    if (searchParams.maxPrice) userWants.push(`budget up to ₱${searchParams.maxPrice}/month`);
    if (searchParams.categories) userWants.push(`${searchParams.categories} environment`);
    const userQuery = userWants.length > 0 ? userWants.join(", ") : "a comfortable boarding house";

    const prompt = `
You are a helpful assistant for BoardTAU, a boarding house search platform for Filipino students.

A student searched for: "${userQuery}".
No exact matches were found, so we are showing them the closest alternatives.

Here are ${listingSummaries.length} alternatives:
${listingSummaries.map((l: any) => `${l.index}. ID: "${l.id}" | "${l.title}" | ₱${l.price}/mo | ${l.region} | Amenities: ${l.amenities} | Rooms: ${l.roomTypes}`).join("\n")}

For each listing, write ONE very short sentence (max 10 words) in English that explains why it's a good alternative for this student's needs. Be warm, helpful, and specific to the student's search.

Return ONLY a valid JSON array with no extra text:
[{ "id": "listing_id_here", "reason": "Your short reason here." }]
`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Extract JSON from the response (handle potential markdown code blocks)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("Gemini returned unexpected format:", text);
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ suggestions });
  } catch (err: any) {
    console.error("AI Suggest API Error:", err.message);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}

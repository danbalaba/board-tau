import { NextResponse } from "next/server";
import { getActivePropertyTypes } from "@/services/taxonomy";

export async function GET() {
  try {
    const propertyTypes = await getActivePropertyTypes();
    return NextResponse.json(propertyTypes, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch property types" }, { status: 500 });
  }
}

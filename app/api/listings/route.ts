import { NextRequest, NextResponse } from "next/server";
import { getListings } from "@/services/user/listings";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query: { [key: string]: string | string[] | undefined | null } = {};

    searchParams.forEach((value, key) => {
      if (key.endsWith("[]")) {
        const actualKey = key.slice(0, -2);
        if (!query[actualKey]) query[actualKey] = [];
        (query[actualKey] as string[]).push(value);
      } else {
        if (query[key]) {
          if (!Array.isArray(query[key])) query[key] = [query[key] as string];
          (query[key] as string[]).push(value);
        } else {
          query[key] = value;
        }
      }
    });

    // The service now handles its own Redis caching and stable key generation
    const result = await getListings(query);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in listings API route:", error);
    return NextResponse.json(
      {
        type: "error",
        message: "Error fetching listings",
        listings: [],
        nextCursor: null
      },
      { status: 500 }
    );
  }
}

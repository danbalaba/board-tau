import { NextRequest, NextResponse } from "next/server";
import { getListings } from "@/services/user/listings";
import { cache } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const query: { [key: string]: string | string[] | undefined | null } = {};

    // Handle both single and multiple values for parameters
    searchParams.forEach((value, key) => {
      if (key.endsWith("[]")) {
        const actualKey = key.slice(0, -2);
        if (!query[actualKey]) {
          query[actualKey] = [];
        }
        (query[actualKey] as string[]).push(value);
      } else {
        // If parameter already exists, convert to array
        if (query[key]) {
          if (!Array.isArray(query[key])) {
            query[key] = [query[key] as string];
          }
          (query[key] as string[]).push(value);
        } else {
          query[key] = value;
        }
      }
    });

    // Create cache key from query parameters
    const cacheKey = `listings:${JSON.stringify(query)}`;

    // Try to get from cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      console.log("Serving listings from cache");
      return NextResponse.json(cachedData);
    }

    // Fetch from database if not in cache
    const result = await getListings(query);

    // Ensure response structure includes message and type correctly
    const response = {
      type: result.type || "exact",
      message: result.message || (result.type === "closest" ? "No exact match, showing closest listings" : "Exact matches found"),
      listings: result.listings,
      nextCursor: result.nextCursor,
    };

    // Cache the response for 10 minutes
    await cache.set(cacheKey, response, 600);

    console.log("Serving listings from database");
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      {
        type: "exact",
        message: "Error fetching listings",
        listings: [],
        nextCursor: null
      },
      { status: 500 }
    );
  }
}

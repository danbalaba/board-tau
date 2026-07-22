import { NextRequest, NextResponse } from "next/server";
import { getListings } from "@/services/user/listings";
import { executeComplexSearch } from "@/services/listing/search.service";
import { cache } from "@/lib/redis";

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

    // Logic to determine if we should use the Complex Search Engine (Heuristic)
    const isComplexSearch = !!(query.cctv || query.security24h || query.originLat || query.category);

    // Generate deterministic cache key based on the sorted query parameters
    const cacheKeyParams = Object.keys(query).sort().reduce((acc, key) => {
      acc[key] = query[key];
      return acc;
    }, {} as Record<string, any>);
    
    const cacheKey = cache.generateKey("api:listings", cacheKeyParams);
    
    // Check Redis Cache First
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    let result;
    if (isComplexSearch) {
      const cursorStr = query.cursor as string;
      if (cursorStr && cursorStr.startsWith("page:")) {
        query.page = cursorStr.split(":")[1];
      }
      
      const searchResponse = await executeComplexSearch(query as any);
      result = {
        listings: searchResponse.data,
        nextCursor: searchResponse.nextCursor
      };
    } else {
      result = await getListings(query);
    }

    // Cache the result in Redis for 5 minutes (300 seconds)
    // Short cache time because listing availability or prices might change
    await cache.set(cacheKey, result, 300);

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

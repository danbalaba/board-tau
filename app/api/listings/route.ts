import { NextRequest, NextResponse } from "next/server";
import { getListings } from "@/services/user/listings";

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

    const result = await getListings(query);

    // Ensure response structure includes message and type correctly
    const response = {
      type: result.type || "exact",
      message: result.message || (result.type === "closest" ? "No exact match, showing closest listings" : "Exact matches found"),
      listings: result.listings,
      nextCursor: result.nextCursor,
    };

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

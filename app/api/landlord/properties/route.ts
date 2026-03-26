import { NextRequest, NextResponse } from "next/server";
import {
  getLandlordProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  updateListingStatus,
} from "@/services/landlord/properties";
import { cache } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor") || undefined;

    // Create cache key
    const cacheKey = cursor ? `landlord:properties:${cursor}` : "landlord:properties";

    // Try to get from cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      console.log("Serving landlord properties from cache");
      return NextResponse.json(cachedData);
    }

    const result = await getLandlordProperties({ cursor });

    const response = {
      success: true,
      data: result,
    };

    // Cache the response for 15 minutes
    await cache.set(cacheKey, response, 900);

    console.log("Serving landlord properties from database");
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch properties",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("POST /api/landlord/properties payload:", JSON.stringify(data, null, 2));

    const result = await createProperty(data);

    if (result.success) {
      // Invalidate property cache
      await cache.del("landlord:properties");
      // Also invalidate listings cache since properties might be listed
      await cache.del("listings:{}");

      return NextResponse.json({
        success: true,
        data: result.data,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create property",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("id");

    if (!propertyId) {
      return NextResponse.json(
        {
          success: false,
          error: "Property ID is required",
        },
        { status: 400 }
      );
    }

    const data = await request.json();

    const result = await updateProperty(propertyId, data);

    if (result.success) {
      // Invalidate property cache
      await cache.del("landlord:properties");
      // Also invalidate listings cache since properties might be listed
      await cache.del("listings:{}");

      return NextResponse.json({
        success: true,
        data: result.data,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update property",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("id");

    if (!propertyId) {
      return NextResponse.json(
        {
          success: false,
          error: "Property ID is required",
        },
        { status: 400 }
      );
    }

    const result = await deleteProperty(propertyId);

    if (result.success) {
      // Invalidate property cache
      await cache.del("landlord:properties");
      // Also invalidate listings cache since properties might be listed
      await cache.del("listings:{}");

      return NextResponse.json({
        success: true,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete property",
      },
      { status: 500 }
    );
  }
}

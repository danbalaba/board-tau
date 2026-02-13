import { NextRequest, NextResponse } from "next/server";
import {
  getLandlordProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  updateListingStatus,
} from "@/services/landlord/properties";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor") || undefined;

    const result = await getLandlordProperties({ cursor });

    return NextResponse.json({
      success: true,
      data: result,
    });
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

    const result = await createProperty(data);

    if (result.success) {
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

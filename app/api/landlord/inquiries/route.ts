import { NextRequest, NextResponse } from "next/server";
import {
  getLandlordInquiries,
  getInquiryDetails,
  respondToInquiry,
} from "@/services/landlord/inquiries";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor") || undefined;
    const status = searchParams.get("status") || undefined;

    const result = await getLandlordInquiries({ cursor, status });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch inquiries",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inquiryId = searchParams.get("id");

    if (!inquiryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Inquiry ID is required",
        },
        { status: 400 }
      );
    }

    const { status, message } = await request.json();

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid status (approved/rejected) is required",
        },
        { status: 400 }
      );
    }

    const result = await respondToInquiry(inquiryId, status, message);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error responding to inquiry:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to respond to inquiry",
      },
      { status: 500 }
    );
  }
}

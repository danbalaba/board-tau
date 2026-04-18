import { NextRequest, NextResponse } from "next/server";
import validator from "validator";
import {
  getLandlordInquiries,
  getInquiryDetails,
  respondToInquiry,
  deleteInquiry,
} from "@/services/landlord/inquiries";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor") || undefined;
    const status = searchParams.get("status") || undefined;
    const includeArchived = searchParams.get("isArchived") === "true";

    const result = await getLandlordInquiries({ cursor, status, includeArchived });

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

    // Sanitize using validator.escape() — fully trusted HTML entity encoding
    // This converts all HTML special characters to safe entities,
    // preventing both XSS and the incomplete multi-char sanitization CodeQL warning
    // that a regex-based approach (e.g. /&lt;[^&gt;]*&gt;?/gm) produces.
    const sanitizedMessage = typeof message === 'string'
      ? validator.escape(message.trim())
      : undefined;

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid status (APPROVED/REJECTED) is required",
        },
        { status: 400 }
      );
    }

    const result = await respondToInquiry(inquiryId, status, sanitizedMessage);

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

export async function DELETE(request: NextRequest) {
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

    const result = await deleteInquiry(inquiryId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete inquiry",
      },
      { status: 500 }
    );
  }
}

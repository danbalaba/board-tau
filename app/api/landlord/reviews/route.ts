import { NextRequest, NextResponse } from "next/server";
import {
  getLandlordReviews,
  getReviewDetails,
  respondToReview,
} from "@/services/landlord/reviews";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor") || undefined;
    const status = searchParams.get("status") || undefined;
    const id = searchParams.get("id");

    if (id) {
      // Get single review details
      const result = await getReviewDetails(id);
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // Get all reviews
    const result = await getLandlordReviews({ cursor, status });
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch reviews",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("id");

    if (!reviewId) {
      return NextResponse.json(
        {
          success: false,
          error: "Review ID is required",
        },
        { status: 400 }
      );
    }

    const { response } = await request.json();

    if (!response || typeof response !== "string" || response.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Response text is required",
        },
        { status: 400 }
      );
    }

    const result = await respondToReview(reviewId, response.trim());

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error responding to review:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to respond to review",
      },
      { status: 500 }
    );
  }
}

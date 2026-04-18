import { NextResponse } from "next/server";
import { getCurrentUser } from "@/services/user";
import { db } from "@/lib/db";
import { cache } from "@/lib/redis";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    const { reviewId } = await params;

    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!reviewId || typeof reviewId !== "string") {
      return new NextResponse("Invalid ID", { status: 400 });
    }

    const review = await db.review.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!review) {
      return new NextResponse("Review not found", { status: 404 });
    }

    let likedIds = [...((review as any).likedIds || [])];

    if (likedIds.includes(currentUser.id)) {
      likedIds = likedIds.filter((id: string) => id !== currentUser.id);
    } else {
      likedIds.push(currentUser.id);
    }

    const updatedReview = await db.review.update({
      where: {
        id: reviewId,
      },
      data: {
        likedIds,
      } as any,
    });

    // ⚡ INVALIDATE CACHE: Clear the listing cache so the fresh reviews are fetched on reload
    if (review.listingId) {
      await cache.del(`listing:id:${review.listingId}`);
    }

    return NextResponse.json(updatedReview);
  } catch (error: any) {
    console.log("REVIEW_LIKE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

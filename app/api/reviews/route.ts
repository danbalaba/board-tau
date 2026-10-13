import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendNewReviewEmail, sendReviewReceiptEmail } from "@/services/email/notifications";
import { getPostHogClient } from "@/lib/posthog-server";
import { createNotification, broadcastStatusChange } from "@/services/notification";
import { encryptEntityId } from "@/lib/encryption";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const currentUser = session?.user;

    if (!currentUser || !currentUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { hasPermission } = await import("@/lib/rbac");
    const permitted = await hasPermission(currentUser.id, "CREATE_REVIEW");
    if (!permitted) {
      return NextResponse.json({ error: "Forbidden: Missing permission CREATE_REVIEW" }, { status: 403 });
    }

    const body = await request.json();
    const { 
      listingId, 
      reservationId, 
      rating, 
      comment, 
      images,
      videos,
      cleanliness,
      accuracy,
      communication,
      location,
      value
    } = body;

    // 1. Basic Validation
    if (!listingId || rating === undefined || cleanliness === undefined || accuracy === undefined || communication === undefined || location === undefined || value === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ... existing reservation checks ...
    const reservation = await db.reservation.findUnique({
      where: { id: reservationId },
      include: {
        reviews: true,
        user: { select: { email: true, name: true } }
      }
    }) as any;

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    if (reservation.userId !== currentUser.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (reservation.status !== "COMPLETED") {
       return NextResponse.json({ error: "You can only review completed stays" }, { status: 400 });
    }

    // 3. Enforce Single Review per Reservation (since DB unique constraint was removed for MongoDB compatibility)
    if ((reservation as any).reviews.length > 0) {
       return NextResponse.json({ error: "You have already reviewed this stay" }, { status: 400 });
    }

    // 4. Create the Review
    const review = await db.review.create({
      data: {
        listingId,
        userId: currentUser.id,
        reservationId,
        rating,
        comment,
        images: images || [],
        videos: videos || [],
        cleanliness,
        accuracy,
        communication,
        location,
        value,
        status: "approved" // Auto-approve for verified stays
      } as any
    });

    // 5. Synchronize Listing Average Rating via Native Aggregation
    let landlordIdForCache: string | undefined;
    try {
      const ratingAggregation = await db.review.aggregate({
        where: { listingId, status: "approved" },
        _avg: { rating: true },
        _count: { rating: true },
      });

      const newAvgRating = ratingAggregation._avg.rating ?? null;
      const reviewCount = ratingAggregation._count.rating;

      await db.listing.update({
        where: { id: listingId },
        data: {
          rating: newAvgRating,
          reviewCount: reviewCount,
        },
      });
    } catch (updateErr) {
      console.error("Failed to sync listing rating:", updateErr);
    }

    // 6. Create Persistent Notification for Landlord & Broadcast Event via Pusher
    try {
      const listing = await db.listing.findUnique({
        where: { id: listingId },
        select: { userId: true, title: true }
      });

      if (listing) {
        landlordIdForCache = listing.userId;

        // Create in-app notification for Landlord & trigger Pusher "new-notification" event
        await createNotification({
          userId: listing.userId,
          type: "review",
          title: "New Review Received",
          description: `${currentUser.name || 'A guest'} left a ${rating}-star review for ${listing.title}`,
          link: `/landlord/reviews?id=${encryptEntityId(review.id)}`
        });

        // Broadcast real-time status change to Landlord dashboard review hub
        await broadcastStatusChange({
          tenantId: currentUser.id,
          landlordId: listing.userId,
          entityType: "review",
          entityId: review.id,
          status: "created",
          payload: {
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            images: review.images,
            videos: review.videos,
            status: review.status,
            createdAt: review.createdAt,
            listing: {
              id: listingId,
              title: listing.title,
            },
            user: {
              id: currentUser.id,
              name: currentUser.name || null,
              email: currentUser.email || "",
              image: currentUser.image || null,
            }
          }
        });

        // 7 & 8. Send Email Notifications asynchronously (non-blocking)
        (async () => {
          try {
            const landlord = await db.user.findUnique({
              where: { id: listing.userId },
              select: { email: true, name: true }
            });

            const emailPromises: Promise<any>[] = [];
            if (landlord && landlord.email) {
              emailPromises.push(
                sendNewReviewEmail(
                  landlord,
                  { name: currentUser.name },
                  { title: listing.title },
                  rating,
                  comment
                )
              );
            }

            if (reservation.user && reservation.user.email) {
              emailPromises.push(
                sendReviewReceiptEmail(
                  { email: reservation.user.email, name: reservation.user.name },
                  { title: listing.title },
                  rating
                )
              );
            }

            await Promise.allSettled(emailPromises);
          } catch (emailErr) {
            console.error("Background review email error:", emailErr);
          }
        })().catch((err) => console.error("Unhandled review email error:", err));

        // Create In-App Notification for Guest
        await createNotification({
          userId: currentUser.id,
          type: "reservation",
          title: "Review Submitted",
          description: `You have successfully rated your stay at ${listing.title}.`,
          link: `/reservations?id=${encryptEntityId(reservationId)}`
        });
      }
    } catch (notifError) {
      console.error("Failed to create landlord notification record/email:", notifError);
    }

    // 9. Invalidate Cache & Revalidate Path
    try {
      const { invalidateListingCaches } = await import("@/lib/redis");
      const { revalidatePath } = await import("next/cache");
      
      await invalidateListingCaches({
        listingId,
        landlordId: landlordIdForCache,
      });
      revalidatePath(`/listings/${listingId}`);
    } catch (cacheError) {
      console.error("Cache invalidation failed:", cacheError);
    }

    // Track review submission server-side (non-blocking flush)
    try {
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: currentUser.id,
        event: "review_submitted",
        properties: {
          listing_id: listingId,
          reservation_id: reservationId,
          rating,
          has_comment: !!comment,
          has_images: (images || []).length > 0,
        },
      });
      posthog.flush().catch((phErr) => console.error("PostHog flush error:", phErr));
    } catch (phErr) {
      console.error("PostHog review_submitted capture failed:", phErr);
    }

    return NextResponse.json(review);
  } catch (error: any) {
    console.error("[REVIEWS_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

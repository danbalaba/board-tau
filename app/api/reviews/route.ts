import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendNewReviewEmail, sendReviewReceiptEmail } from "@/services/email/notifications";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const currentUser = session?.user;

    if (!currentUser || !currentUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    if (!listingId || !rating || !cleanliness || !accuracy || !communication || !location || !value) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ... existing reservation checks ...
    const reservation = await db.reservation.findUnique({
      where: { id: reservationId },
      include: {
        reviews: true
      } as any
    });

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

    // 5. Synchronize Listing Average Rating
    const allReviews = await db.review.findMany({
      where: { listingId: listingId, status: "approved" },
      select: { rating: true }
    });
    
    let newAvgRating: number | null = null;
    if (allReviews.length > 0) {
       newAvgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    }

    try {
      await db.listing.update({
        where: { id: listingId },
        data: {
          rating: newAvgRating,
          reviewCount: allReviews.length
        }
      });
    } catch (updateErr) {
      console.error("Failed to sync listing rating:", updateErr);
    }

    // 6. Create Persistent Notification for Landlord
    try {
      const listing = await db.listing.findUnique({
        where: { id: listingId },
        select: { userId: true, title: true }
      });

      if (listing) {
        await (db as any).notification.create({
          data: {
            userId: listing.userId,
            type: "review",
            title: "New Review Recieved",
            description: `${currentUser.name || 'A guest'} left a ${rating}-star review for ${listing.title}`,
            link: `/landlord/reviews`,
            isRead: false
          }
        });

        // 6. Send Email Notification to Landlord
        const landlord = await db.user.findUnique({
          where: { id: listing.userId },
          select: { email: true, name: true }
        });

        if (landlord && landlord.email) {
          await sendNewReviewEmail(
            landlord,
            { name: currentUser.name },
            { title: listing.title },
            rating,
            comment
          );
        }

        // 7. Send Receipt Email to Guest
        if (currentUser && currentUser.email) {
           await sendReviewReceiptEmail(
              { email: currentUser.email, name: currentUser.name },
              { title: listing.title },
              rating
           );
        }

        // 8. Create In-App Notification for Guest (The "Red Dot" flow)
        await (db as any).notification.create({
          data: {
            userId: currentUser.id,
            type: "reservation",
            title: "Review Submitted",
            description: `You have successfully rated your stay at ${listing.title}.`,
            link: `/reservations?id=${reservationId}`,
            isRead: false
          }
        });
      }
    } catch (notifError) {
      console.error("Failed to create landlord notification record/email:", notifError);
    }

    // 9. Invalidate Cache & Revalidate Path
    try {
      const { cache } = await import("@/lib/redis");
      const { revalidatePath } = await import("next/cache");
      
      await cache.del(`listing:id:${listingId}`);
      await cache.delPattern("listings:*");
      revalidatePath(`/listings/${listingId}`);
    } catch (cacheError) {
      console.error("Cache invalidation failed:", cacheError);
    }

    return NextResponse.json(review);
  } catch (error: any) {
    console.error("[REVIEWS_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

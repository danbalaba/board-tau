"use server";

import { db } from "@/lib/db";
import { requireLandlord } from "@/lib/landlord";
import { createNotification } from "@/services/notification";
import { sendReviewResponseEmail } from "@/services/email/notifications";

export const getLandlordReviews = async (args?: {
  cursor?: string;
  status?: string;
}) => {
  const landlord = await requireLandlord();

  const { cursor, status } = args || {};

  // Optimization: Fetch listing IDs first to avoid relational filter memory overhead in MongoDB
  const listings = await db.listing.findMany({
    where: { userId: landlord.id },
    select: { id: true }
  });

  const listingIds = listings.map(l => l.id);

  const where: any = {
    listingId: { in: listingIds }
  };

  if (status) {
    where.status = status;
  }

  const reviews = await db.review.findMany({
    where,
    take: 20 + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      listing: {
        select: {
          id: true,
          title: true,
          imageSrc: true,
        },
      },
    },
  });

  const nextCursor = reviews.length > 20 ? reviews[20 - 1].id : null;
  const list = reviews.slice(0, 20);

  return { reviews: list, nextCursor };
};

export const getReviewDetails = async (reviewId: string) => {
  const landlord = await requireLandlord();

  const review = await db.review.findFirst({
    where: {
      id: reviewId,
      listing: {
        userId: landlord.id,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      listing: {
        select: {
          id: true,
          title: true,
          imageSrc: true,
        },
      },
    },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  return review;
};

export const respondToReview = async (reviewId: string, response: string) => {
  const landlord = await requireLandlord();

  const review = await db.review.findFirst({
    where: {
      id: reviewId,
      listing: {
        userId: landlord.id,
      },
    },
    include: {
      user: { select: { email: true, name: true } }
    }
  });

  if (!review) {
    throw new Error("Review not found");
  }

  const updatedReview = await db.review.update({
    where: { id: reviewId },
    data: {
      response,
      respondedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      listing: { 
        select: { 
          id: true,
          title: true,
          imageSrc: true
        } 
      }
    }
  });

  // Notify the user about the landlord's response
  await createNotification({
    userId: review.userId,
    type: "review",
    title: "New review response",
    description: `The landlord of ${updatedReview.listing.title} has responded to your review.`,
    link: `/my-reviews?id=${updatedReview.id}`, // Matching the student dashboard path with ID
  });

  // Invalidate Cache & Revalidate Path
  try {
    const { cache } = await import("@/lib/redis");
    const { revalidatePath } = await import("next/cache");
    
    await cache.del(`listing:id:${review.listingId}`);
    await cache.delPattern("listings:*");
    revalidatePath(`/listings/${review.listingId}`);
    revalidatePath("/listings");
  } catch (cacheError) {
    console.error("Cache invalidation failed:", cacheError);
  }

  // 3. Send Email Notification to Tenant
  try {
    if (review.user && (review.user as any).email) {
      await sendReviewResponseEmail(
        review.user,
        updatedReview.listing,
        response
      );
    }
  } catch (emailError) {
    console.error("Failed to send review response email:", emailError);
  }

  return updatedReview;
};

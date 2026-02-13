"use server";

import { db } from "@/lib/db";
import { requireLandlord } from "@/lib/landlord";

export const getLandlordReviews = async (args?: {
  cursor?: string;
  status?: string;
}) => {
  const landlord = await requireLandlord();

  const { cursor, status } = args || {};

  const where: any = {
    listing: {
      userId: landlord.id,
    },
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
  });

  // TODO: Send notification to user

  return updatedReview;
};

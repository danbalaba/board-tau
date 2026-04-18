"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/services/user/user";

export const getMyReviews = async () => {
  const user = await getCurrentUser();
  if (!user) return [];

  const reviews = await db.review.findMany({
    where: {
      userId: user.id
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      listing: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return reviews;
};

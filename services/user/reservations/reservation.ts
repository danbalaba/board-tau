"use server";
import { revalidatePath } from "next/cache";
import { Listing, Reservation } from "@prisma/client";

import { db } from "@/lib/db";
import { LISTINGS_BATCH } from "@/utils/constants";
import { getCurrentUser } from "../user";
import { stripe } from "@/lib/stripe";

export const getReservations = async (args: Record<string, string>) => {
  try {
    const { listingId, userId, authorId, cursor } = args;

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (listingId) {
      where.listingId = listingId;
    }

    if (authorId) {
      where.listing = { userId: authorId };
    }

    const filterQuery: any = {
      where,
      take: LISTINGS_BATCH,
      include: {
        listing: true,
      },
      orderBy: { createdAt: "desc" },
    };

    if (cursor) {
      filterQuery.cursor = { id: cursor };
      filterQuery.skip = 1;
    }

    const reservations = (await db.reservation.findMany({
      ...filterQuery,
    })) as (Reservation & { listing: Listing })[];

    const nextCursor =
      reservations.length === LISTINGS_BATCH
        ? reservations[LISTINGS_BATCH - 1].id
        : null;

    const listings = reservations.map((reservation) => {
      const { id, startDate, endDate, totalPrice, listing } = reservation;

      return {
        ...listing,
        reservation: { id, startDate, endDate, totalPrice },
      };
    });

    return {
      listings,
      nextCursor,
    };
  } catch (error: any) {
    console.log(error?.message);
    return {
      listings: [],
      nextCursor: null,
    };
  }
};

export const createReservation = async ({
  listingId,
  startDate,
  endDate,
  totalPrice,
  userId
}: {
  listingId: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  totalPrice: number;
  userId: string
}) => {
  try {
    console.log('Creating reservation with data:', { listingId, startDate, endDate, totalPrice, userId })

    if (!listingId || !startDate || !endDate || !totalPrice)
      throw new Error("Invalid data");

    const reservation = await db.reservation.create({
      data: {
        userId,
        listingId,
        startDate,
        endDate,
        totalPrice,
      },
    });

    console.log('Reservation created successfully:', reservation)

    revalidatePath(`/listings/${listingId}`);

    return reservation;
  } catch (error: any) {
    console.error('Error creating reservation:', error)
    throw new Error(error?.message);
  }
};

export const deleteReservation = async (reservationId: string) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error("Unauthorized");
    }

    if (!reservationId || typeof reservationId !== "string") {
      throw new Error("Invalid ID");
    }


    const reservation = await db.reservation.findUnique({
      where: {
        id: reservationId,
      }
    });

    if (!reservation) {
      throw new Error("Reservation not found!");
    }

    await db.reservation.deleteMany({
      where: {
        id: reservationId,
        OR: [
          { userId: currentUser.id },
          { listing: { userId: currentUser.id } },
        ],
      },
    });

    revalidatePath("/reservations");
    revalidatePath(`/listings/${reservation.listingId}`);
    revalidatePath("/trips");

    return reservation;
  } catch (error: any) {
    throw new Error(error.message)
  }
};


export const createPaymentSession = async ({
  listingId,
  startDate,
  endDate,
  totalPrice,
}: {
  listingId: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  totalPrice: number;
}) => {
  if (!listingId || !startDate || !endDate || !totalPrice)
    throw new Error("Invalid data");

  const listing = await db.listing.findUnique({
    where: { id: listingId }
  })

  if (!listing) throw new Error("Listing not found!");

  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Please log in to reserve!");
  }

  // Try to create Stripe payment session
  try {
    // Check if Stripe is properly configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('pk_')) {
      throw new Error("Stripe configuration error - using direct reservation instead");
    }

    const product = await stripe.products.create({
      name: listing.title, // Use actual listing title instead of generic "Listing"
      description: `Reservation for ${listing.title}`,
      images: [listing.imageSrc],
      default_price_data: {
        currency: "PHP",
        unit_amount: totalPrice * 100
      }
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:3000');

     const stripeSession = await stripe.checkout.sessions.create({
        success_url: `${baseUrl}/reservations`,
       cancel_url: `${baseUrl}/listings/${listing.id}`,
       payment_method_types: ['card'],
       mode: 'payment',
       metadata: {
         listingId,
         startDate: String(startDate),
         endDate: String(endDate),
         totalPrice: String(totalPrice),
         userId: user.id
       },
       line_items: [{ price: product.default_price as string, quantity: 1 }],
       // Customize Stripe checkout branding
       allow_promotion_codes: true,
       locale: 'auto',
       shipping_address_collection: { allowed_countries: [] },
     });

    return { url: stripeSession.url }
  } catch (stripeError: any) {
    console.error("Stripe payment session creation failed:", stripeError);
    // Fallback to direct reservation creation if Stripe fails
    await createReservation({
      listingId,
      startDate,
      endDate,
      totalPrice,
      userId: user.id
    });
    return null; // Indicate reservation created directly
  }
}

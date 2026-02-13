import React, { Suspense } from "react";

import EmptyState from "@/components/common/EmptyState";
import Heading from "@/components/common/Heading";
import ListingCard from "@/components/listings/ListingCard";
import LoadMore from "@/components/listings/LoadMore";

import { getCurrentUser } from "@/services/user";
import { getReservations } from "@/services/reservation";
import { getFavorites } from "@/services/favorite";
import { db } from "@/lib/db";

const ReservationPage = async () => {
  const user = await getCurrentUser();
  const favorites = await getFavorites();

  if (!user) return <EmptyState title="Unauthorized" subtitle="Please login" />;

  // Debug: Get all reservations first to check if any exist
  const allReservations = await db.reservation.findMany({
    include: { listing: true },
  });
  console.log('All reservations in DB:', allReservations);

  // Get both guest reservations (user made) and host reservations (on user's properties)
  const guestReservations = await getReservations({
    userId: user.id,
  });

  const hostReservations = await getReservations({
    authorId: user.id,
  });

  console.log('Guest reservations:', guestReservations.listings);
  console.log('Host reservations:', hostReservations.listings);

  const hasGuestReservations = guestReservations.listings.length > 0;
  const hasHostReservations = hostReservations.listings.length > 0;

  if (!hasGuestReservations && !hasHostReservations)
    return (
      <EmptyState
        title="No reservations found"
        subtitle={`No reservations found for user ${user.id}. Total reservations in DB: ${allReservations.length}`}
      />
    );

  return (
    <section className="main-container">
      <Heading title="My Reservations" subtitle="Manage your boarding house reservations" backBtn/>

      {/* Guest Reservations */}
      {hasGuestReservations && (
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-6">My Bookings</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-6 xl:gap-5">
            {guestReservations.listings.map((listing) => {
              const { reservation, ...data } = listing;
              const hasFavorited = favorites.includes(listing.id);
              return (
                <ListingCard
                  key={reservation.id}
                  data={data}
                  reservation={reservation}
                  hasFavorited={hasFavorited}
                />
              );
            })}
            {guestReservations.nextCursor ? (
              <Suspense fallback={<></>}>
                <LoadMore
                  nextCursor={guestReservations.nextCursor}
                  fnArgs={{ userId: user.id }}
                  queryFn={getReservations}
                  queryKey={["guest-reservations", user.id]}
                  favorites={favorites}
                />
              </Suspense>
            ) : null}
          </div>
        </div>
      )}

      {/* Host Reservations */}
      {hasHostReservations && (
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-6">Reservations on My Properties</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-6 xl:gap-5">
            {hostReservations.listings.map((listing) => {
              const { reservation, ...data } = listing;
              const hasFavorited = favorites.includes(listing.id);
              return (
                <ListingCard
                  key={reservation.id}
                  data={data}
                  reservation={reservation}
                  hasFavorited={hasFavorited}
                />
              );
            })}
            {hostReservations.nextCursor ? (
              <Suspense fallback={<></>}>
                <LoadMore
                  nextCursor={hostReservations.nextCursor}
                  fnArgs={{ authorId: user.id }}
                  queryFn={getReservations}
                  queryKey={["host-reservations", user.id]}
                  favorites={favorites}
                />
              </Suspense>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
};

export default ReservationPage;

import React from "react";

import EmptyState from "@/components/common/EmptyState";
import ListingGallery from "@/components/listings/detail/ListingGallery";
import ListingHeader from "@/components/listings/detail/ListingHeader";
import ListingDetailsClient from "@/components/listings/detail/ListingDetailsClient";
import ListingReviews from "@/components/listings/detail/ListingReviews";

import { getCurrentUser } from "@/services/user";
import { getListingById } from "@/services/listing";
import { categories } from "@/utils/constants";
import { db } from "@/lib/db";

interface IParams {
  listingId: string;
}

const ListingPage = async ({ params }: { params: Promise<IParams> }) => {
  const { listingId } = await params;
  const listing = await getListingById(listingId);
  const currentUser = await getCurrentUser();

  if (!listing) return <EmptyState />;



  const {
    title,
    imageSrc,
    images,
    country,
    region,
    id,
    user: owner,
    price,
    description,
    roomCount,
    guestCount,
    bathroomCount,
    latlng,
    amenities,
    roomType,
    reservations,
    rating,
    reviewCount,
    bedType,
    rooms,
  } = listing;

  const normalizedImages = (images && images.length > 0)
    ? images.map((img: any) => ({ url: img.url, caption: img.caption ?? undefined, order: img.order ?? 0 }))
    : [{ url: imageSrc, caption: title, order: 0 }];

  const category = categories.find((cate) => cate.label === listing.category);

  const categoryData = category
    ? {
        label: category.label,
        description: category.description,
      }
    : null;

  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Gallery Section - Full Width */}
      <ListingGallery title={title} images={normalizedImages} listingId={id} />

      {/* Main Content - Centered Container */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
        {/* Header Section */}
        <ListingHeader title={title} region={region} country={country} rating={rating || 4.8} reviewCount={reviewCount || 0} />

        {/* Main Content Grid */}
        <ListingDetailsClient
          id={id}
          price={price}
          reservations={reservations}
          user={currentUser}
          title={title}
          owner={owner}
          category={categoryData}
          description={description}
          roomCount={roomCount}
          guestCount={guestCount}
          bathroomCount={bathroomCount}
          latlng={latlng}
          amenities={amenities}
          roomType={roomType ?? ""}
          bedType={bedType}
          rating={rating ?? undefined}
          reviewCount={reviewCount}
          images={normalizedImages}
          reviews={listing.reviews}
          rooms={rooms}
        />
      </div>
    </div>
  );
};

export default ListingPage;

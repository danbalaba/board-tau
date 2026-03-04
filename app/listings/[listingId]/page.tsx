import React from "react";

import EmptyState from "@/components/common/EmptyState";
import ListingGallery from "@/components/listings/detail/ListingGallery";
import ListingHeader from "@/components/listings/detail/ListingHeader";
import ListingDetailsClient from "@/components/listings/detail/ListingDetailsClient";
import ListingReviews from "@/components/listings/detail/ListingReviews";

import { getCurrentUser } from "@/services/user";
import { getListingById } from "@/services/user/listings";
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
    bathroomCount,
    latitude,
    longitude,
    amenities: listingAmenities,
    reservations,
    rating,
    reviewCount,
    rooms,
  } = listing;

  // Convert new amenities object to string array for backward compatibility
  const amenities = [];
  if (listingAmenities?.wifi) amenities.push("WiFi");
  if (listingAmenities?.parking) amenities.push("Parking");
  if (listingAmenities?.pool) amenities.push("Pool");
  if (listingAmenities?.gym) amenities.push("Gym");
  if (listingAmenities?.airConditioning) amenities.push("Air conditioning");
  if (listingAmenities?.laundry) amenities.push("Laundry area");

  const normalizedImages = (images && images.length > 0)
    ? images.map((img: any) => ({ url: img.url, caption: img.caption ?? undefined, order: img.order ?? 0 }))
    : [{ url: imageSrc, caption: title, order: 0 }];

  const category = categories.find((cate) =>
    listing.categories?.some((lc: any) => lc.category?.name === cate.value)
  );

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
           bathroomCount={bathroomCount}
           latlng={[listing.latitude || 0, listing.longitude || 0]}
           amenities={amenities}
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

import React from "react";

import EmptyState from "@/components/common/EmptyState";
import ListingGallery from "@/components/listings/detail/ListingGallery";
import ListingHeader from "@/components/listings/detail/ListingHeader";
import ListingDetailsClient from "@/components/listings/detail/ListingDetailsClient";
import ListingReviews from "@/components/listings/detail/ListingReviews";

import { getCurrentUser } from "@/services/user";
import { getListingById } from "@/services/user/listings";
import { getFavorites } from "@/services/user/favorites/favorite";
import { categories } from "@/utils/constants";
import { db } from "@/lib/db";
import { calculateAverageRating } from "@/utils/helper";

interface IParams {
  listingId: string;
}

const ListingPage = async ({ params }: { params: Promise<IParams> }) => {
  const { listingId } = await params;
  const listing = await getListingById(listingId);
  const currentUser = await getCurrentUser();
  const favoriteIds = currentUser ? await getFavorites() : [];

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
    features,
  } = listing;

  // Convert new amenities object to string array for backward compatibility
  const amenities = [...(listing.amenities_list || [])];
  if (listingAmenities?.wifi) if (!amenities.includes("WiFi")) amenities.push("WiFi");
  if (listingAmenities?.parking) if (!amenities.includes("Parking")) amenities.push("Parking");
  if (listingAmenities?.pool) if (!amenities.includes("Pool")) amenities.push("Pool");
  if (listingAmenities?.gym) if (!amenities.includes("Gym")) amenities.push("Gym");
  if (listingAmenities?.airConditioning) if (!amenities.includes("Air conditioning")) amenities.push("Air conditioning");
  if (listingAmenities?.laundry) if (!amenities.includes("Laundry area")) amenities.push("Laundry area");

  // Add features to amenities array for display
  if (features?.cctv) if (!amenities.includes("CCTV")) amenities.push("CCTV");
  if (features?.security24h) if (!amenities.includes("Security guard")) amenities.push("Security guard");
  if (features?.nearTransport) if (!amenities.includes("Near transport")) amenities.push("Near transport");
  if (features?.studyFriendly) if (!amenities.includes("Study friendly")) amenities.push("Study friendly");
  if (features?.fireSafety) if (!amenities.includes("Fire safety")) amenities.push("Fire safety");
  if (features?.quietEnvironment) if (!amenities.includes("Quiet environment")) amenities.push("Quiet environment");
  if (features?.flexibleLease) if (!amenities.includes("Flexible lease")) amenities.push("Flexible lease");

  const normalizedImages = (images && images.length > 0)
    ? images.map((img: any) => ({ 
        url: img.url, 
        caption: img.caption ?? undefined, 
        order: img.order ?? 0,
        roomType: img.roomType ?? undefined 
      }))
    : [{ url: imageSrc, caption: title, order: 0 }];

  const category = categories.find((cate) =>
    listing.categories?.some((lc: any) => lc.category?.name === cate.value)
  );

  const categoryData = category
    ? {
        label: category.label,
        description: category.description,
        value: category.value,
      }
    : null;

  // Guaranteed true average based on fetched reviews
  const actualRating = calculateAverageRating(listing.reviews || [], listing.rating);

  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Gallery Section - Full Width */}
      <ListingGallery title={title} images={normalizedImages} listingId={id} hasFavorited={favoriteIds.includes(id)} />

      {/* Main Content - Centered Container */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
        {/* Header Section */}
        <ListingHeader
          title={title}
          region={region}
          country={country}
          rating={actualRating > 0 ? actualRating : 4.8}
          reviewCount={listing.reviews?.length || 0}
          listingId={id}
          hasFavorited={favoriteIds.includes(id)}
          category={categoryData}
        />

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
            rules={listing.rules}
            features={listing.features}
            rating={actualRating > 0 ? actualRating : undefined}
            reviewCount={listing.reviews?.length || 0}
            images={normalizedImages}
            reviews={listing.reviews}
            rooms={rooms}
            region={region}
            country={country}
          />
      </div>
    </div>
  );
};

export default ListingPage;

import React from "react";
import { Metadata } from "next";
import EmptyState from "@/components/common/EmptyState";
import ListingGallery from "@/components/listings/detail/ListingGallery";
import ListingHeader from "@/components/listings/detail/ListingHeader";
import ListingDetailsClient from "@/components/listings/detail/ListingDetailsClient";
import ListingReviews from "@/components/listings/detail/ListingReviews";

import { getCurrentUser } from "@/services/user";
import { getListingById } from "@/services/user/listings";
import { getFavorites } from "@/services/user/favorites/favorite";

import { db } from "@/lib/db";
import { calculateAverageRating } from "@/utils/helper";

interface IParams {
  listingId: string;
}

export async function generateMetadata({ params }: { params: Promise<IParams> }): Promise<Metadata> {
  const { listingId } = await params;
  const listing = await getListingById(listingId);

  if (!listing) {
    return {
      title: "Listing Not Found",
      description: "The boarding house you are looking for does not exist.",
    };
  }

  const title = `${listing.title} | BoardTAU`;
  // Clean description for meta tags (max 160 chars is standard for SEO)
  const description = listing.description.length > 155 
    ? listing.description.substring(0, 155) + "..." 
    : listing.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: listing.imageSrc }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [listing.imageSrc],
    },
  };
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

  const amenities: string[] = [
    ...(Array.isArray(listingAmenities) ? listingAmenities : []),
    ...(Array.isArray((listing as any).amenities_list) ? (listing as any).amenities_list : []),
    ...(Array.isArray((listing as any).amenities) ? (listing as any).amenities : []),
  ];

  // Extract dynamic attributes from listingLinks
  const dynamicAmenities = listing.listingLinks
    ?.map((link: any) => link.attribute?.id || link.attributeId || `${link.attribute?.label || link.attribute?.name}${link.attribute?.icon ? `|${link.attribute?.icon}` : ''}`)
    .filter(Boolean) || [];
  
  amenities.push(...dynamicAmenities);

  const dynamicFeatures = listing.listingLinks
    ?.filter((link: any) => link.attribute.category === 'FEATURE' || link.attribute.type === 'FEATURE')
    .map((link: any) => `${link.attribute.label || link.attribute.name}${link.attribute.icon ? `|${link.attribute.icon}` : ''}`) || [];

  const featuresObj = {
    ...features,
    customFeatures: [...(features?.customFeatures || []), ...dynamicFeatures]
  };

  const dynamicRules = listing.listingLinks
    ?.filter((link: any) => link.attribute.category === 'RULE' || link.attribute.type === 'RULE')
    .map((link: any) => `${link.attribute.label || link.attribute.name}${link.attribute.icon ? `|${link.attribute.icon}` : ''}`) || [];

  const rulesObj = {
    ...(listing.rules || {}),
    customRules: [...((listing.rules as any)?.customRules || []), ...dynamicRules]
  };

  const normalizedImages = (images && images.length > 0)
    ? images.map((img: any) => ({ 
        url: img.url, 
        caption: img.caption ?? undefined, 
        order: img.order ?? 0,
        roomType: img.roomType ?? undefined 
      }))
    : [{ url: imageSrc, caption: title, order: 0 }];

  const categoriesData = listing.propertyType ? [{
    label: listing.propertyType.name,
    description: listing.propertyType.description || "",
    value: listing.propertyType.name,
    icon: listing.propertyType.icon,
  }] : [];

  // Guaranteed true average based on fetched reviews
  const actualRating = calculateAverageRating(listing.reviews || [], (listing.reviews?.length || 0) > 0 ? listing.rating : null);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://board-tau-rho.vercel.app";

  // JSON-LD Schema Markup for Google Rich Snippets (LodgingBusiness = qualifies for star ratings in search)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": title,
    "image": [imageSrc, ...(images?.map((img: any) => img.url) || [])].filter(Boolean),
    "description": description,
    "url": `${baseUrl}/listings/${id}`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": region,
      "addressLocality": "Camiling",
      "addressRegion": "Tarlac",
      "addressCountry": "PH",
      "postalCode": "2306"
    },
    ...(latitude && longitude ? {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": latitude,
        "longitude": longitude
      }
    } : {}),
    ...(reviewCount > 0 && actualRating ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": actualRating.toFixed(1),
        "reviewCount": reviewCount,
        "bestRating": "5",
        "worstRating": "1"
      }
    } : {}),
    "priceRange": `₱${price}/month`,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "PHP",
      "price": price,
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": price,
        "priceCurrency": "PHP",
        "unitText": "MON"
      },
      "availability": "https://schema.org/InStock",
      "url": `${baseUrl}/listings/${id}`
    },
    "amenityFeature": amenities.map((a) => ({
      "@type": "LocationFeatureSpecification",
      "name": a,
      "value": true
    })),
    "numberOfRooms": roomCount,
    "numberOfBathroomsTotal": bathroomCount,
    ...(actualRating ? {
      "starRating": {
        "@type": "Rating",
        "ratingValue": actualRating.toFixed(1)
      }
    } : {})
  };

  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Gallery Section - Full Width */}
      <ListingGallery title={title} images={normalizedImages} listingId={id} hasFavorited={favoriteIds.includes(id)} />

      {/* Main Content - Centered Container */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
        {/* Header Section */}
        <ListingHeader
          title={title}
          region={region}
          country={country}
          rating={actualRating || 0}
          reviewCount={listing.reviews?.length || 0}
          listingId={id}
          hasFavorited={favoriteIds.includes(id)}
          categories={categoriesData}
        />

        {/* Main Content Grid */}
          <ListingDetailsClient
            id={id}
            price={price}
            reservations={reservations}
            user={currentUser}
            title={title}
            owner={owner}
            categories={categoriesData}
            description={description}
            roomCount={roomCount}
            bathroomCount={bathroomCount}
            latlng={[listing.latitude || 0, listing.longitude || 0]}
            amenities={amenities}
            rules={rulesObj}
            features={featuresObj}
            rating={actualRating || undefined}
            reviewCount={listing.reviews?.length || 0}
            images={normalizedImages}
            reviews={listing.reviews}
            rooms={rooms.map((r: any) => {
              const roomAmenities = r.roomLinks?.map((link: any) => `${link.attribute.label}${link.attribute.icon ? `|${link.attribute.icon}` : ''}`) || [];
              return {
                ...r,
                roomType: r.roomTypeDefinition ? (r.roomTypeDefinition.isFlatRate ? 'SOLO' : 'BEDSPACE') : (r.capacity === 1 ? 'SOLO' : 'BEDSPACE'),
                amenities: [...(r.amenityNames || []), ...roomAmenities]
              };
            })}
            region={region}
            country={country}
            leaseContract={listing.leaseContracts?.[0] || null}
          />
      </div>
    </div>
  );
};

export default ListingPage;

import React, { FC } from "react";
import { executeComplexSearch } from "@/services/listing/search.service";
import HeroSection from "@/components/home/HeroSection";
import ListingsGrid from "@/components/listings/ListingsGrid";
import Categories from "@/components/navbar/Categories";
import EmptyState from "@/components/common/EmptyState";
import LoadingAnimation from "@/components/common/LoadingAnimation";
import AIFallbackAlert from "@/components/listings/AIFallbackAlert";

import { getListings } from "@/services/user/listings";
import { getFavorites } from "@/services/user/favorites";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MapFloatingButton from "@/components/map/MapFloatingButton";

export const dynamic = "force-dynamic";

interface HomeProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

const Home: FC<HomeProps> = async ({ searchParams }) => {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  // Redirect admins and landlords to their respective dashboards
  if (user?.role === "ADMIN" || user?.role === "admin") {
    redirect("/admin");
  } else if (user?.role === "LANDLORD" || user?.role === "landlord") {
    redirect("/landlord");
  }

  const resolved = searchParams == null ? undefined : await searchParams;
  const searchParamsObj = resolved
    ? Object.fromEntries(
        Object.entries(resolved)
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
      )
    : {};

  // Show loading state while fetching data
  let result, favorites, isRelaxed = false;
  try {
    if (searchParamsObj && Object.keys(searchParamsObj).length > 0) {
      const searchResponse = await executeComplexSearch(searchParamsObj as any);
      result = { listings: searchResponse.data, nextCursor: searchResponse.nextCursor };
      isRelaxed = searchResponse.relaxed;
    } else {
      result = await getListings(resolved);
    }

    favorites = await getFavorites();
  } catch (error) {
    console.error("Error fetching listings:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          title="Error Loading Listings"
          subtitle="We're having trouble loading the listings. Please try again later."
        />
      </div>
    );
  }

  return (
    <>
      <HeroSection />

      <section className="container mx-auto px-4 mb-12 mt-12">
        <Categories />
      </section>

      {!result.listings || result.listings.length === 0 ? (
        <div className="pb-32">
          <EmptyState
            title="No Listings found"
            subtitle="We couldn't find any properties matching your current filters."
          />
        </div>
      ) : (
        <>
          {isRelaxed && (
            <AIFallbackAlert searchParams={searchParamsObj} />
          )}

          <ListingsGrid
            listings={result.listings}
            nextCursor={result.nextCursor || undefined}
            favorites={favorites}
            searchParamsObj={searchParamsObj}
          />
        </>
      )}

      {/* Floating Map Trigger */}
      <MapFloatingButton listings={result.listings || []} />
    </>
  );
};

export default Home;

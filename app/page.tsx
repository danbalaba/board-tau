import React, { FC } from "react";
import { executeComplexSearch } from "@/services/listing/search.service";
import HeroSection from "@/components/home/HeroSection";
import ListingsGrid from "@/components/listings/ListingsGrid";
import Categories from "@/components/navbar/Categories";
import EmptyState from "@/components/common/EmptyState";
import LoadingAnimation from "@/components/common/LoadingAnimation";

import { getListings } from "@/services/user/listings";
import { getFavorites } from "@/services/user/favorites";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface HomeProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

const Home: FC<HomeProps> = async ({ searchParams }) => {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  // Redirect admins and landlords to their respective dashboards
  if (user?.role === "ADMIN") {
    redirect("/admin");
  } else if (user?.role === "LANDLORD") {
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
  // Note: In Next.js, async components will automatically show loading.tsx
  // But we'll add a placeholder here if needed

  // Wrap data fetching in try-catch for error handling
  let result, favorites, isRelaxed = false;
  try {
    // If there are search parameters, trigger the Enterprise Heuristic Backend Engine
    if (searchParamsObj && Object.keys(searchParamsObj).length > 0) {
      const searchResponse = await executeComplexSearch(searchParamsObj as any);
      result = { listings: searchResponse.data, nextCursor: null };
      isRelaxed = searchResponse.relaxed;
    } else {
      // Default Feed behavior
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

  if (!result.listings || result.listings.length === 0) {
    return (
      <EmptyState
        title="No Listings found"
        subtitle="Looks like you have no properties."
      />
    );
  }

  return (
    <>
      <HeroSection />

      <section className="container mx-auto px-4 mb-12 mt-12">
        <Categories />
      </section>

      {isRelaxed && (
        <div className="container mx-auto px-4 mb-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 font-medium">
                  We couldn't find exact matches for your strict filters. Here are some great boarding houses slightly outside your constraints!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <ListingsGrid
        listings={result.listings}
        nextCursor={result.nextCursor || undefined}
        favorites={favorites}
        searchParamsObj={searchParamsObj}
      />
    </>
  );
};

export default Home;

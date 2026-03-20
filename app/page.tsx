import React, { FC } from "react";
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
  let result, favorites;
  try {
    result = await getListings(resolved);
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

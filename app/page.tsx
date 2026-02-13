import React, { FC } from "react";
import HeroSection from "@/components/home/HeroSection";
import ListingsGrid from "@/components/listings/ListingsGrid";
import Categories from "@/components/navbar/Categories";
import EmptyState from "@/components/common/EmptyState";

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
  if (user?.role === "admin") {
    redirect("/admin");
  } else if (user?.role === "landlord") {
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

  const result = await getListings(resolved);
  const favorites = await getFavorites();

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

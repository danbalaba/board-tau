import React, { Suspense } from "react";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

import EmptyState from "@/components/common/EmptyState";
import Heading from "@/components/common/Heading";

import { getCurrentUser } from "@/services/user";
import { getFavoriteListings } from "@/services/user/favorites/favorite";
import FavoritesClient from "@/components/favorites/FavoritesClient";

const FavoritesPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    return <EmptyState title="Unauthorized" subtitle="Please login" />;
  }

  // Security: If user is a LANDLORD, redirect to their landlord dashboard
  if (user.role === "LANDLORD") {
    return redirect("/landlord/properties"); // Favorites don't really apply to landlord management, send to properties
  }

  if (user.role === "ADMIN") {
    return redirect("/admin");
  }

  const favorites = await getFavoriteListings();

  return (
    <Suspense fallback={<EmptyState title="Loading Favorites..." subtitle="Please wait while we retrieve your saved listings" />}>
      <FavoritesClient initialFavorites={favorites} />
    </Suspense>
  );
};

export default FavoritesPage;

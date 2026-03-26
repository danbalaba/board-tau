import React from "react";

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

  const favorites = await getFavoriteListings();

  return <FavoritesClient initialFavorites={favorites} />;
};

export default FavoritesPage;

"use client";

import React, { useState, useMemo, useEffect } from "react";
import ModernLoader from "@/components/common/ModernLoader";
import { useRouter } from "next/navigation";
import Heading from "@/components/common/Heading";
import ListingCard from "@/components/listings/ListingCard";
import Button from "@/components/common/Button";
import { Search, Filter, ArrowUpDown, Clock, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import ModernSelect from "@/components/common/ModernSelect";
import { Listing } from "@prisma/client";

interface FavoritesClientProps {
  initialFavorites: Listing[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const sortOptions = [
  { value: "newest", label: "Newest", icon: <Clock size={16} /> },
  { value: "oldest", label: "Oldest", icon: <Clock size={16} className="opacity-50" /> },
  { value: "price-high", label: "Price: High", icon: <DollarSign size={16} /> },
  { value: "price-low", label: "Price: Low", icon: <DollarSign size={16} className="opacity-50" /> },
];

const FavoritesClient: React.FC<FavoritesClientProps> = ({
  initialFavorites,
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Initial mount and "air-gap" buffer
    const timer = setTimeout(() => {
      setIsMounted(true);
      setIsLoading(true);

      const contentTimer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(contentTimer);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Handle Loading state during filtering/sorting/searching
  useEffect(() => {
    if (!isMounted) return;

    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600); // Quick sync feel

    return () => clearTimeout(timer);
  }, [searchQuery, regionFilter, sortBy, isMounted]);

  // Get unique regions for filtering
  const regionOptions = useMemo(() => {
    const regions = Array.from(new Set(initialFavorites.map(f => f.region).filter(Boolean)));
    return [
      { value: "all", label: "All Regions" },
      ...regions.map(r => ({ value: r as string, label: r as string }))
    ];
  }, [initialFavorites]);

  // Filter and sort favorites
  const filteredFavorites = useMemo(() => {
    let filtered = [...initialFavorites];

    // Filter by region
    if (regionFilter !== "all") {
      filtered = filtered.filter(f => f.region === regionFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(f =>
        f.title.toLowerCase().includes(query) ||
        (f.region && f.region.toLowerCase().includes(query)) ||
        (f.country && f.country.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "price-high") {
        return b.price - a.price;
      } else if (sortBy === "price-low") {
        return a.price - b.price;
      }
      return 0;
    });

    return filtered;
  }, [initialFavorites, regionFilter, searchQuery, sortBy]);

  if (!isMounted) return null;

  return (
    <section className="main-container">
      <Heading
        title="Favorites"
        subtitle="List of places you favorited!"
        backBtn
      />

      {/* Filters and Search - Always visible so user can interact */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 mb-10 flex flex-col md:flex-row items-center gap-4 bg-white/50 dark:bg-gray-800/50 p-4 rounded-2xl backdrop-blur-md border border-gray-100 dark:border-gray-700/50 shadow-sm"
      >
        {/* Search */}
        <div className="relative flex-[5]">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by title or region..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-transparent rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-all"
          />
        </div>

        {/* Region Filter */}
        <ModernSelect
          instanceId="region-filter"
          options={regionOptions}
          value={regionFilter}
          onChange={setRegionFilter}
          icon={<Filter size={18} />}
          className="md:w-max min-w-[200px]"
        />

        {/* Sort */}
        <ModernSelect
          instanceId="sort-filter"
          options={sortOptions}
          value={sortBy}
          onChange={setSortBy}
          icon={<ArrowUpDown size={18} />}
          className="md:w-max min-w-[204px]"
        />
      </motion.div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <ModernLoader text="Organizing your favorites..." />
        </div>
      ) : (
        <>
          {/* Favorites Grid */}
          {filteredFavorites.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-xl font-bold text-text-primary dark:text-gray-100 mb-2">
                {initialFavorites.length === 0 ? "No Favorites Found" : "No Matches Found"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {initialFavorites.length === 0 
                  ? "Looks like you have no favorite listings. Start exploring boarding houses to find your favorites." 
                  : "Try adjusting your filters to find what you're looking for."}
              </p>
              {initialFavorites.length === 0 && (
                <Button onClick={() => router.push("/")}>
                  Explore Listings
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-6 xl:gap-5 mt-8">
              {filteredFavorites.map((listing) => {
                   return <ListingCard key={listing.id} data={listing} hasFavorited />;
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default FavoritesClient;

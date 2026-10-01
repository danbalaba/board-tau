"use client";

import React, { useState, useMemo, useEffect } from "react";
import ModernLoader from "@/components/common/ModernLoader";
import { useRouter } from "next/navigation";
import Heading from "@/components/common/Heading";
import ListingCard from "@/components/listings/ListingCard";
import Button from "@/components/common/Button";
import { Search, Filter, ArrowUpDown, Clock, DollarSign, Check } from "lucide-react";
import { cn } from "@/utils/helper";
import { motion } from "framer-motion";
import ModernSelect from "@/components/common/ModernSelect";
import { Listing } from "@prisma/client";
import { UserMobileFilterSheet } from "@/components/common/UserMobileFilterSheet";

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

import { useSearchParams } from "next/navigation";

const FavoritesClient: React.FC<FavoritesClientProps> = ({
  initialFavorites,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightedId = searchParams.get("id");
  
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

      {/* Filters and Search - Responsive Layout */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 mb-10 flex flex-col md:flex-row items-center gap-4 bg-white/50 dark:bg-gray-800/50 p-4 rounded-2xl backdrop-blur-md border border-gray-100 dark:border-gray-700/50 shadow-sm relative z-20"
      >
        {/* Search & Mobile Filter Trigger */}
        <div className="flex items-center gap-2 w-full md:flex-[5]">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by title or region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-transparent rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-all text-sm"
            />
          </div>

          {/* Mobile Filter Sheet Drawer */}
          <UserMobileFilterSheet
            activeFilterCount={(regionFilter !== "all" ? 1 : 0) + (sortBy !== "newest" ? 1 : 0)}
            onClearAll={() => {
              setRegionFilter("all");
              setSortBy("newest");
            }}
          >
            <div className="space-y-6">
              {/* Region Section */}
              <div className="space-y-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Filter size={14} className="text-primary" /> Region Filter
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {regionOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRegionFilter(opt.value)}
                      className={cn(
                        "px-3.5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all flex items-center justify-between cursor-pointer",
                        regionFilter === opt.value
                          ? "bg-primary/10 text-primary border-primary/30 font-black shadow-xs"
                          : "bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200/60 dark:border-gray-700/60 hover:bg-gray-100"
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {regionFilter === opt.value && <Check size={14} strokeWidth={3} className="text-primary shrink-0 ml-1" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Section */}
              <div className="space-y-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <ArrowUpDown size={14} className="text-primary" /> Sort Order
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSortBy(opt.value)}
                      className={cn(
                        "px-3.5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all flex items-center justify-between cursor-pointer",
                        sortBy === opt.value
                          ? "bg-primary/10 text-primary border-primary/30 font-black shadow-xs"
                          : "bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200/60 dark:border-gray-700/60 hover:bg-gray-100"
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {sortBy === opt.value && <Check size={14} strokeWidth={3} className="text-primary shrink-0 ml-1" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </UserMobileFilterSheet>
        </div>

        {/* Desktop Inline Filters */}
        <div className="hidden md:flex items-center gap-4">
          <ModernSelect
            instanceId="region-filter"
            options={regionOptions}
            value={regionFilter}
            onChange={setRegionFilter}
            icon={<Filter size={18} />}
            className="w-max min-w-[200px]"
          />

          <ModernSelect
            instanceId="sort-filter"
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
            icon={<ArrowUpDown size={18} />}
            className="w-max min-w-[204px]"
          />
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <ModernLoader text="Organizing your favorites..." />
        </div>
      ) : (
        <>
          {/* Favorites Grid */}
          {filteredFavorites.length === 0 ? (
            <div className="text-center py-20 px-6 bg-gray-50/50 dark:bg-gray-900/20 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <Search className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2">
                {initialFavorites.length === 0 ? "No Favorites Found" : "No Matches Found"}
              </h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">
                {initialFavorites.length === 0 
                  ? "Looks like you have no favorite listings. Start exploring boarding houses to find your favorites." 
                  : "Try adjusting your filters to find what you're looking for."}
              </p>
              {initialFavorites.length === 0 && (
                <Button 
                  onClick={() => router.push("/")}
                  className="w-auto sm:w-max mx-auto rounded-xl px-10 py-3 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                >
                  Explore Listings
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-8 xl:gap-6 mt-8">
              {filteredFavorites.map((listing) => {
                   return (
                    <ListingCard 
                      key={listing.id} 
                      data={listing} 
                      hasFavorited 
                      isHighlighted={listing.id === highlightedId}
                    />
                   );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default FavoritesClient;

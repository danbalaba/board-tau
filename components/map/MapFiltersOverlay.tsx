"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Building, Wifi, DollarSign, Users, SlidersHorizontal, Navigation, Map as MapIcon, History, Loader2 } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAISearchStore } from "@/hooks/use-ai-search-store";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";

const SearchModal = dynamic(() => import("@/components/modals/SearchModal"), { ssr: false });

export default function MapFiltersOverlay() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { recentQueries, addQuery } = useAISearchStore();
  
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  
  const filters = [
    { id: "college", label: "Any College", icon: Building },
    { id: "price", label: "Under ₱2k", icon: DollarSign, isActive: searchParams.get("maxPrice") === "2000" },
    { id: "wifi", label: "Free WiFi", icon: Wifi, isActive: searchParams.get("amenities")?.includes("WiFi") },
    { id: "female", label: "Female Only", icon: Users, isActive: searchParams.get("femaleOnly") === "true" },
  ];

  const handleQuickFilter = (filterId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (filterId === "price") {
      if (params.get("maxPrice") === "2000") params.delete("maxPrice");
      else params.set("maxPrice", "2000");
    }
    if (filterId === "wifi") {
      let amenities = params.get("amenities") ? params.get("amenities")!.split(",") : [];
      if (amenities.includes("WiFi")) amenities = amenities.filter(a => a !== "WiFi");
      else amenities.push("WiFi");
      if (amenities.length > 0) params.set("amenities", amenities.join(","));
      else params.delete("amenities");
    }
    if (filterId === "female") {
      if (params.get("femaleOnly") === "true") params.delete("femaleOnly");
      else params.set("femaleOnly", "true");
    }
    params.set("_bust", Date.now().toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSearch = async (e: React.FormEvent, overrideQuery?: string) => {
    e.preventDefault();
    const queryToUse = overrideQuery || searchQuery;
    if (!queryToUse.trim()) return;

    setIsAILoading(true);
    try {
      addQuery(queryToUse);
      // Fetch parsed filters from the AI backend
      const res = await fetch('/api/ai/map-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToUse })
      });
      const data = await res.json();
      
      const params = new URLSearchParams(searchParams.toString());
      
      // Clear old filters before applying AI filters
      ['q', 'maxPrice', 'amenities', 'femaleOnly', 'category'].forEach(k => params.delete(k));
      
      if (data.filters) {
        if (data.filters.q) params.set('q', data.filters.q);
        if (data.filters.maxPrice) params.set('maxPrice', data.filters.maxPrice.toString());
        if (data.filters.amenities && data.filters.amenities.length > 0) params.set('amenities', data.filters.amenities.join(','));
        if (data.filters.femaleOnly) params.set('femaleOnly', 'true');
        if (data.filters.category && data.filters.category.length > 0) {
          data.filters.category.forEach((c: string) => params.append('category', c));
        }
      } else {
        // Fallback if AI fails or returns empty filters
        params.set("q", queryToUse.trim());
      }
      
      params.set("_bust", Date.now().toString());
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      setIsSearchFocused(false);
    } catch (error) {
      console.error("AI Search Error:", error);
      // Fallback
      const params = new URLSearchParams(searchParams.toString());
      params.set("q", queryToUse.trim());
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <div className="absolute top-4 md:top-8 left-16 md:left-24 right-16 md:right-24 z-[101] pointer-events-none flex flex-col gap-3">
      
      {/* Search Bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md mx-auto pointer-events-auto"
      >
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200/50 dark:border-gray-700/50 rounded-full flex items-center px-4 py-3 gap-3 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)]">
          {isAILoading ? (
            <Loader2 className="text-primary animate-spin shrink-0" size={20} />
          ) : (
            <Search className="text-gray-400 shrink-0" size={20} />
          )}
          <form onSubmit={handleSearch} className="flex-1 relative">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="Ask AI: 'Cheap boarding house near TAU with wifi'" 
              className="bg-transparent border-none outline-none text-sm font-medium w-full text-gray-800 dark:text-gray-100 placeholder-gray-500"
            />
          </form>
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1 shrink-0"></div>
          <button 
            onClick={() => setShowDirections(!showDirections)}
            className={`p-1.5 rounded-full transition-colors shrink-0 ${showDirections ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500'}`}
            title="Directions"
          >
            <Navigation size={18} />
          </button>
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1 shrink-0"></div>
          <button 
            onClick={() => setShowSearchModal(true)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500 shrink-0"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
        
        {/* AI Recent Searches Dropdown */}
        <AnimatePresence>
          {isSearchFocused && recentQueries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50"
            >
              <div className="p-3">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-2 uppercase tracking-wider">
                  Recent Searches
                </div>
                {recentQueries.map((q) => (
                  <div
                    key={q.id}
                    onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                    onClick={() => {
                      setSearchQuery(q.query);
                      handleSearch({ preventDefault: () => {} } as any, q.query);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
                  >
                    <History size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{q.query}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick Filter Pills */}
      <motion.div 
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full overflow-x-auto no-scrollbar pointer-events-auto"
      >
        <div className="flex items-center justify-center gap-2 px-2 pb-2 w-max mx-auto md:w-full md:mx-0">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = filter.isActive;
            return (
              <button
                key={filter.id}
                onClick={() => handleQuickFilter(filter.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all shadow-sm
                  ${isActive 
                    ? 'bg-primary border-primary text-white shadow-primary/25' 
                    : 'bg-white/90 dark:bg-slate-800/90 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 backdrop-blur-sm'
                  }`}
              >
                <Icon size={14} className={isActive ? 'text-white' : 'text-primary'} />
                {filter.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      <AnimatePresence>
        {showSearchModal && <SearchModal onCloseModal={() => setShowSearchModal(false)} />}
      </AnimatePresence>
      
      {/* Directions Panel UI */}
      <AnimatePresence>
        {showDirections && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md mx-auto pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl border border-blue-200 dark:border-blue-900/50 rounded-2xl p-4 flex flex-col gap-3 relative"
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-sm text-gray-800 dark:text-white flex items-center gap-2">
                <Navigation size={16} className="text-blue-500" />
                Walking Directions
              </h3>
              <button onClick={() => setShowDirections(false)} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Close</button>
            </div>
            
            <div className="flex flex-col gap-2 relative">
              <div className="absolute left-[15px] top-[18px] bottom-[18px] w-0.5 bg-gray-200 dark:bg-gray-700 z-0"></div>
              
              <div className="flex items-center gap-3 z-10">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                  <MapPin size={14} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 bg-gray-50 dark:bg-slate-800 rounded-lg px-3 py-2 border border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Starting Point (Click a listing)</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {searchParams.get("listingId") ? `Listing #${searchParams.get("listingId")?.substring(0, 5)}...` : "Select a boarding house..."}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 z-10">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapIcon size={14} className="text-primary" />
                </div>
                <div className="flex-1 bg-gray-50 dark:bg-slate-800 rounded-lg px-3 py-2 border border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Destination</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">Tarlac Agricultural University (TAU)</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

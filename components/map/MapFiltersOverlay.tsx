"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Building, Wifi, DollarSign, Users, SlidersHorizontal, Navigation, Map as MapIcon, History, Loader2, X } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAISearchStore } from "@/hooks/use-ai-search-store";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import Modal from "@/components/modals/Modal";
import { Listing } from "@prisma/client";
import { colleges } from "@/data/colleges";

const SearchModal = dynamic(() => import("@/components/modals/SearchModal"), { ssr: false });

interface MapFiltersOverlayProps {
  selectedListing?: Listing | null;
  showDirections?: boolean;
  setShowDirections?: (show: boolean) => void;
  onGetDirections?: (startLngLat: [number, number], endLngLat: [number, number]) => void;
}

export default function MapFiltersOverlay({ 
  selectedListing, 
  showDirections = false, 
  setShowDirections = () => {},
  onGetDirections = () => {}
}: MapFiltersOverlayProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { recentQueries, addQuery, removeQuery, clearQueries } = useAISearchStore();
  
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [destinationCollege, setDestinationCollege] = useState("tau");
  
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
      
      if (data.params) {
        if (data.params.q) params.set('q', data.params.q);
        if (data.params.maxPrice) params.set('maxPrice', data.params.maxPrice.toString());
        if (data.params.amenities && data.params.amenities.length > 0) params.set('amenities', data.params.amenities);
        if (data.params.femaleOnly) params.set('femaleOnly', 'true');
        if (data.params.categories && data.params.categories.length > 0) {
          params.set('category', data.params.categories);
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
        className="w-full max-w-md mx-auto pointer-events-auto relative"
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
            className={`p-2 sm:p-2.5 rounded-xl transition-all shadow-sm shrink-0 border ${
              showDirections 
                ? 'bg-blue-500 border-blue-600 text-white shadow-blue-500/25' 
                : 'bg-white/90 dark:bg-slate-800/90 border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
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
                <div className="flex justify-between items-center mb-2 px-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Recent Searches
                  </span>
                  <button 
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      clearQueries();
                    }}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                {recentQueries.map((q) => (
                  <div
                    key={q.id}
                    onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                    onClick={() => {
                      setSearchQuery(q.query);
                      handleSearch({ preventDefault: () => {} } as any, q.query);
                    }}
                    className="flex justify-between items-center px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <History size={16} className="text-gray-400 shrink-0" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{q.query}</span>
                    </div>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuery(q.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all shrink-0"
                      title="Remove from history"
                    >
                      <X size={14} />
                    </button>
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
      
      <Modal 
        isOpen={showSearchModal} 
        onClose={() => setShowSearchModal(false)}
        width="lg"
        hasFixedFooter
        noPadding
      >
        <SearchModal onCloseModal={() => setShowSearchModal(false)} />
      </Modal>
      
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
                    {selectedListing ? selectedListing.title : "Select a boarding house..."}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 z-10">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapIcon size={14} className="text-primary" />
                </div>
                <div className="flex-1 bg-gray-50 dark:bg-slate-800 rounded-lg px-3 py-1.5 border border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Destination</p>
                  <select 
                    value={destinationCollege}
                    onChange={(e) => setDestinationCollege(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-gray-800 dark:text-gray-200 outline-none truncate cursor-pointer"
                  >
                    {colleges.filter(c => c.value !== 'any').map(c => (
                      <option key={c.value} value={c.value} className="text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-800">
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <button 
                disabled={!selectedListing}
                onClick={() => {
                  if (selectedListing && selectedListing.latitude && selectedListing.longitude) {
                    const dest = colleges.find(c => c.value === destinationCollege);
                    if (dest) {
                      onGetDirections([selectedListing.longitude, selectedListing.latitude], [dest.latlng[1], dest.latlng[0]]);
                    }
                  }
                }}
                className={`mt-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  selectedListing 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg hover:shadow-blue-600/20 active:scale-[0.98]' 
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                }`}
              >
                Get Directions
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

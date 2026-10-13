"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Building, Wifi, DollarSign, Users, SlidersHorizontal, Navigation, Map as MapIcon, History, Loader2, X, MousePointerClick, GraduationCap, Sparkles } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAISearchStore } from "@/hooks/use-ai-search-store";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import Modal from "@/components/modals/Modal";
import { Listing } from "@prisma/client";
import { sanitizeSearchQuery } from "@/lib/security/sanitize";
import ModernLoader from "@/components/common/ModernLoader";

const SearchModal = dynamic(() => import("@/components/modals/SearchModal"), { ssr: false });

interface MapFiltersOverlayProps {
  selectedListing?: Listing | null;
  selectedLandmark?: any | null;
  showDirections?: boolean;
  setShowDirections?: (show: boolean) => void;
  directionsPhase?: "start" | "destination" | null;
  onGetDirections?: (startLngLat: [number, number], endLngLat: [number, number]) => void;
  onSearchSubmitted?: () => void;
}

export default function MapFiltersOverlay({ 
  selectedListing,
  selectedLandmark,
  showDirections = false, 
  setShowDirections = () => {},
  directionsPhase = null,
  onGetDirections = () => {},
  onSearchSubmitted
}: MapFiltersOverlayProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { recentQueries, addQuery, removeQuery, clearQueries } = useAISearchStore();
  
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);

  const handleClearSearch = () => {
    setSearchQuery("");
    const params = new URLSearchParams(searchParams.toString());
    ['q', 'maxPrice', 'amenities', 'femaleOnly', 'category'].forEach(k => params.delete(k));
    params.set("_bust", Date.now().toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  
  const handleSearch = async (e: React.FormEvent, overrideQuery?: string, cachedParams?: Record<string, string>) => {
    e.preventDefault();
    let queryToUse = overrideQuery || searchQuery;
    queryToUse = sanitizeSearchQuery(queryToUse, 100);
    if (!queryToUse.trim()) return;

    // If we have cached parameters from a previous search, use them instantly!
    if (cachedParams) {
      setIsAILoading(true);
      const params = new URLSearchParams(searchParams.toString());
      ['q', 'maxPrice', 'amenities', 'femaleOnly', 'category'].forEach(k => params.delete(k));
      
      Object.entries(cachedParams).forEach(([key, val]) => {
        if (val) params.set(key, val);
      });
      
      params.set("_bust", Date.now().toString());
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      
      // Still bump the query to the top of the history list
      addQuery(queryToUse, cachedParams);
      setIsSearchFocused(false);
      onSearchSubmitted?.();
      
      // Keep loading overlay active briefly for UX consistency
      setTimeout(() => {
        setIsAILoading(false);
      }, 800);
      return;
    }

    // Heuristic: only trigger AI for natural language queries
    const words = queryToUse.split(/\s+/);
    const aiKeywords = ['under', 'near', 'with', 'cheap', 'expensive', 'below', 'max', 'min', 'budget', 'around', 'close', 'walking', 'studio', 'bedspace', 'solo'];
    const isAiQuery = words.length > 3 || aiKeywords.some(kw => queryToUse.toLowerCase().includes(kw));

    if (!isAiQuery) {
      const params = new URLSearchParams(searchParams.toString());
      ['maxPrice', 'amenities', 'femaleOnly', 'category'].forEach(k => params.delete(k));
      params.set("q", queryToUse.trim());
      params.set("_bust", Date.now().toString());
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      
      addQuery(queryToUse, { q: queryToUse.trim() });
      setIsSearchFocused(false);
      onSearchSubmitted?.();
      return;
    }

    setIsAILoading(true);
    try {
      // Fetch parsed filters from the AI backend
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToUse })
      });
      const data = await res.json();
      
      const params = new URLSearchParams(searchParams.toString());
      
      // Clear old filters before applying AI filters
      ['q', 'maxPrice', 'amenities', 'femaleOnly', 'category'].forEach(k => params.delete(k));
      
      let paramsToCache: Record<string, string> = {};

      if (data.params && Object.keys(data.params).length > 0) {
        if (data.params.q) { params.set('q', data.params.q); paramsToCache.q = data.params.q; }
        if (data.params.maxPrice) { params.set('maxPrice', data.params.maxPrice.toString()); paramsToCache.maxPrice = data.params.maxPrice.toString(); }
        if (data.params.amenities && data.params.amenities.length > 0) { params.set('amenities', data.params.amenities); paramsToCache.amenities = data.params.amenities; }
        if (data.params.femaleOnly) { params.set('femaleOnly', 'true'); paramsToCache.femaleOnly = 'true'; }
        if (data.params.categories && data.params.categories.length > 0) {
          params.set('category', data.params.categories);
          paramsToCache.category = data.params.categories;
        }
      } else {
        // Fallback if AI fails or returns empty filters
        params.set("q", queryToUse.trim());
        paramsToCache.q = queryToUse.trim();
      }
      
      // Cache the result so we don't have to hit the API next time
      addQuery(queryToUse, paramsToCache);

      params.set("_bust", Date.now().toString());
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      setIsSearchFocused(false);
      onSearchSubmitted?.();
    } catch (error) {
      console.error("AI Search Error:", error);
      // Fallback
      addQuery(queryToUse);
      const params = new URLSearchParams(searchParams.toString());
      params.set("q", queryToUse.trim());
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      onSearchSubmitted?.();
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <div className="absolute top-4 md:top-8 left-4 md:left-24 right-20 md:right-24 z-[201] pointer-events-none flex flex-col gap-3">
      
      {/* Search Bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md mx-auto pointer-events-auto relative"
      >
        <div className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-950/10 dark:shadow-black/50 border border-slate-200 dark:border-slate-800 rounded-full flex items-center px-4 h-12 gap-3 transition-all hover:border-slate-300 dark:hover:border-slate-700">
          {isAILoading ? (
            <Loader2 className="text-primary animate-spin shrink-0" size={19} />
          ) : (
            <Search className="text-slate-400 shrink-0" size={19} />
          )}
          <form onSubmit={handleSearch} className="flex-1 relative">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="Ask AI: 'Cheap boarding house near TAU with wifi'" 
              className="bg-transparent border-none outline-none text-sm font-medium w-full text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 pr-6"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
              >
                <X size={14} />
              </button>
            )}
          </form>
          <div className="hidden md:block w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1 shrink-0"></div>
          <button
            onClick={() => setShowDirections(!showDirections)}
            className={`hidden md:flex items-center justify-center p-2 rounded-xl transition-all shrink-0 border ${
              showDirections 
                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-500/20' 
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Directions"
          >
            <Navigation size={17} />
          </button>
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1 shrink-0"></div>
          <button 
            onClick={() => setShowSearchModal(true)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white shrink-0"
            title="Filter settings"
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
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 divide-y divide-slate-100 dark:divide-slate-800"
            >
              <div className="p-3">
                <div className="flex justify-between items-center mb-2 px-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
                      handleSearch({ preventDefault: () => {} } as any, q.query, q.params);
                    }}
                    className="flex justify-between items-center px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <History size={16} className="text-slate-400 shrink-0" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{q.query}</span>
                    </div>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuery(q.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all shrink-0"
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
        width="full"
        hasFixedFooter
        noPadding
      >
        <SearchModal initialShowWizard={false} isMapOverlay={true} onCloseModal={() => setShowSearchModal(false)} />
      </Modal>

      {/* Mobile Directions FAB */}
      <AnimatePresence>
        {!showDirections && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-24 right-4 z-[101] md:hidden pointer-events-auto"
          >
            <button
              onClick={() => setShowDirections(true)}
              className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-600/40 transition-colors border-2 border-white dark:border-slate-800 active:scale-95"
              title="Get Directions"
            >
              <Navigation size={22} className="ml-[-2px] mb-[2px]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Directions Panel UI */}
      <AnimatePresence>
        {showDirections && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.y > 50 || velocity.y > 200) {
                if (setShowDirections) setShowDirections(false);
              }
            }}
            className="fixed bottom-0 left-0 right-0 z-[500] md:relative md:bottom-auto md:left-auto md:right-auto w-full md:max-w-md mx-auto pointer-events-auto bg-white dark:bg-slate-900 shadow-2xl shadow-slate-950/20 dark:shadow-black/70 border-t md:border border-slate-200 dark:border-slate-800 rounded-t-3xl md:rounded-2xl pt-5 pb-10 px-5 md:p-5 flex flex-col gap-3.5"
          >
            {/* Mobile Drag Handle Indicator */}
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-1 md:hidden" />
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Navigation size={15} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                    Walking Directions
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Select boarding house and college campus
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowDirections(false)} 
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors"
                title="Close directions"
              >
                <X size={14} />
              </button>
            </div>
            
            <div className="flex flex-col gap-2.5 relative pt-0.5">
              <div className="absolute left-[15px] top-[20px] bottom-[20px] w-0.5 bg-slate-200 dark:bg-slate-700 z-0"></div>
              
              {/* Step 1: Starting Point */}
              <div className="flex items-center gap-3 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  directionsPhase === "start" 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-4 ring-blue-500/15' 
                    : selectedListing
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                }`}>
                  <MapPin size={15} />
                </div>
                <div className={`flex-1 rounded-xl px-3.5 py-2.5 border transition-all ${
                  directionsPhase === "start"
                    ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-500/80 dark:border-blue-500 shadow-sm ring-2 ring-blue-500/10'
                    : selectedListing
                      ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80'
                }`}>
                  <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-0.5">
                    Starting Point
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
                    {selectedListing 
                      ? selectedListing.title 
                      : <span className="text-blue-600 dark:text-blue-400 italic flex items-center gap-1.5 font-normal"><MousePointerClick size={15} /> Tap a boarding house on the map</span>
                    }
                  </p>
                </div>
              </div>
              
              {/* Step 2: Destination */}
              <div className="flex items-center gap-3 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  directionsPhase === "destination" 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30 ring-4 ring-emerald-500/15' 
                    : selectedLandmark
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                }`}>
                  <GraduationCap size={15} />
                </div>
                <div className={`flex-1 rounded-xl px-3.5 py-2.5 border transition-all ${
                  directionsPhase === "destination"
                    ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500/80 dark:border-emerald-500 shadow-sm ring-2 ring-emerald-500/10'
                    : selectedLandmark
                      ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80'
                }`}>
                  <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-0.5">
                    Destination
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
                    {directionsPhase === "destination"
                      ? <span className="text-emerald-600 dark:text-emerald-400 italic flex items-center gap-1.5 font-normal"><GraduationCap size={15} /> Tap a college on the map</span>
                      : (directionsPhase === null && selectedLandmark)
                        ? <span className="text-slate-900 dark:text-slate-100 font-semibold">{selectedLandmark.name}</span>
                        : (directionsPhase === null && selectedListing)
                          ? <span className="text-slate-400 dark:text-slate-500 italic text-xs font-normal">Waiting for college selection...</span>
                          : <span className="text-slate-400 dark:text-slate-500 italic text-xs font-normal">Select a starting point first</span>
                    }
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Loading Overlay */}
      <AnimatePresence>
        {isAILoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/95 dark:bg-slate-950/95 pointer-events-auto p-4"
          >
            {/* Top Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 z-[10000]">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary via-emerald-400 to-primary"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
              />
            </div>

            <ModernLoader
              text="BoardTAU AI Scanning"
              subtitle="Finding the best matching properties based on your request..."
              mascotSrc="/assets/mascot/kerby-global-search.png"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

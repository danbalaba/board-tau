"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Building, Wifi, DollarSign, Users, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";

const SearchModal = dynamic(() => import("@/components/modals/SearchModal"), { ssr: false });

export default function MapFiltersOverlay() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    else params.delete("q");
    params.set("_bust", Date.now().toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
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
          <Search className="text-gray-400 shrink-0" size={20} />
          <form onSubmit={handleSearch} className="flex-1">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search landmarks, areas, or colleges..." 
              className="bg-transparent border-none outline-none text-sm font-medium w-full text-gray-800 dark:text-gray-100 placeholder-gray-500"
            />
          </form>
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1 shrink-0"></div>
          <button 
            onClick={() => setShowSearchModal(true)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500 shrink-0"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
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
    </div>
  );
}

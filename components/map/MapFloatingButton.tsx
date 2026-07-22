"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaMap } from "react-icons/fa";
import { motion } from "framer-motion";
import MapModal from "./MapModal";
import { Listing } from "@prisma/client";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { cn } from "@/lib/utils";

interface MapFloatingButtonProps {
  listings?: Listing[]; // Fallback
}

export default function MapFloatingButton({ listings: initialListings }: MapFloatingButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mapListings, setMapListings] = useState<Listing[]>(initialListings || []);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const lastFetchedParams = useRef<string | null>(null);
  const scrollDirection = useScrollDirection();
  const isHiddenOnMobile = scrollDirection === "up" || scrollDirection === "";

  // Fetch all map listings when the modal is opened
  useEffect(() => {
    if (!isModalOpen) return;

    const fetchAllListingsForMap = async () => {
      const currentParamsStr = searchParams.toString();
      if (mapListings.length > 0 && lastFetchedParams.current === currentParamsStr) {
        return; // Already cached for these filters!
      }

      setIsLoading(true);
      try {
        const currentParams = new URLSearchParams(currentParamsStr);
        currentParams.set("isMap", "true");
        currentParams.set("limit", "100"); // Ensure we get all 50+ listings, not just first page

        const res = await axios.get(`/api/listings?${currentParams.toString()}`);
        if (res.data?.listings) {
          setMapListings(res.data.listings);
          lastFetchedParams.current = currentParamsStr;
        } else if (Array.isArray(res.data)) {
          setMapListings(res.data);
          lastFetchedParams.current = currentParamsStr;
        }
      } catch (error) {
        console.error("Failed to fetch map listings", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllListingsForMap();
  }, [isModalOpen, searchParams]);

  return (
    <>
      <div className={cn(
        "fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-[50] transition-transform duration-300 ease-in-out",
        isHiddenOnMobile && !isModalOpen ? "translate-y-48 md:translate-y-0" : "translate-y-0"
      )}>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.92 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={() => setIsModalOpen(true)}
          className="relative overflow-hidden group bg-primary/90 dark:bg-primary/80 backdrop-blur-xl text-white px-7 py-3.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 dark:border-white/10 flex items-center gap-2.5 font-semibold text-sm hover:shadow-[0_12px_40px_rgba(47,125,109,0.3)] transition-all"
        >
          {/* Subtle gloss effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <span className="relative z-10 tracking-wide">
            {isLoading ? "Loading Map..." : "Show map"}
          </span>
          <FaMap className="relative z-10 text-[16px]" />
        </motion.button>
      </div>

      <MapModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        listings={mapListings}
        onSearchArea={async (bounds) => {
          setIsLoading(true);
          try {
            const currentParams = new URLSearchParams(searchParams.toString());
            currentParams.set("isMap", "true");
            currentParams.set("limit", "200");
            currentParams.set("_bust", Date.now().toString()); // Cache buster
            
            // Pass bounding box parameters to the backend
            currentParams.set("bounds", bounds.toBBoxString());
            
            const res = await axios.get(`/api/listings?${currentParams.toString()}`);
            if (res.data?.listings) {
              setMapListings(res.data.listings);
            }
          } catch (error) {
            console.error("Failed to fetch new map listings", error);
          } finally {
            setIsLoading(false);
          }
        }}
      />
    </>
  );
}

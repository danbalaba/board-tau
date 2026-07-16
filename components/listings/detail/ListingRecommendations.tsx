"use client";

import React, { useEffect, useState, useRef } from "react";
import { Listing } from "@prisma/client";
import ListingCard, { ListingSkeleton } from "../ListingCard";
import { Sparkles } from "lucide-react";
import ThreeDListingCarousel from "../../ui/3d-listing-carousel";

interface ListingRecommendationsProps {
  listingId: string;
  currentUser?: any; // To pass into ListingCard for favorites
}

export const ListingRecommendations: React.FC<ListingRecommendationsProps> = ({
  listingId,
  currentUser
}) => {
  const [recommendations, setRecommendations] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(`/api/listings/${listingId}/recommendations`);
        const data = await response.json();
        if (data.data) {
          setRecommendations(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [listingId]);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [recommendations]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  if (!isLoading && recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-12 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-2 text-[#2f7d6d] opacity-90 justify-center md:justify-start">
        <Sparkles size={16} />
        <span className="text-xs font-black uppercase tracking-[0.2em]">AI Suggestions</span>
      </div>
      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
        Similar Places You Might Like
      </h2>

      <div className="relative w-full overflow-hidden pt-4 pb-12">
        {isLoading ? (
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory justify-center">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="w-[300px] flex-shrink-0">
                <ListingSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <ThreeDListingCarousel 
            listings={recommendations} 
            currentUser={currentUser} 
            autoplay={true}
          />
        )}
      </div>
    </section>
  );
};

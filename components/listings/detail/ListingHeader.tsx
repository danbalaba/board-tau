"use client";

import React from "react";
import { FaStar } from "react-icons/fa";

interface ListingHeaderProps {
  title: string;
  region: string | null;
  country: string | null;
  rating: number;
  reviewCount: number;
}

const ListingHeader: React.FC<ListingHeaderProps> = ({
  title,
  region,
  country,
  rating,
  reviewCount,
}) => {
  const handleReviewClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const reviewsSection = document.getElementById("reviews-section");
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="pb-6 border-b border-border dark:border-gray-700">
      <h1 className="text-4xl font-bold text-text-primary dark:text-gray-100 mb-2">{title}</h1>
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-4">
        <p className="text-lg text-text-secondary dark:text-gray-400">
          {region}, {country}
        </p>
      </div>

      {/* Rating and Reviews */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <FaStar className="text-2xl text-yellow-400 dark:text-yellow-400" />
          <div>
            <span className="font-semibold text-lg text-text-primary dark:text-gray-100">{rating.toFixed(1)}</span>
            <span className="text-text-secondary dark:text-gray-400 text-sm ml-2">•</span>
            <button
              onClick={handleReviewClick}
              className="text-primary hover:underline text-sm ml-2 font-medium"
            >
              {reviewCount} reviews
            </button>
          </div>
        </div>
      </div>

      {/* Summary Badges */}
      <div className="flex flex-wrap gap-3 mt-4">
        <span className="text-sm text-text-secondary dark:text-gray-400">• Cleanliness</span>
        <span className="text-sm text-text-secondary dark:text-gray-400">• Location</span>
        <span className="text-sm text-text-secondary dark:text-gray-400">• Value</span>
        <span className="text-sm text-text-secondary dark:text-gray-400">• Safety</span>
      </div>
    </div>
  );
};

export default ListingHeader;

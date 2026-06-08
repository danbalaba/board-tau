import React from "react";
import { ListingSkeleton } from "./ListingCard";

interface LoadingGridProps {
  count?: number;
}

const LoadingGrid: React.FC<LoadingGridProps> = ({ count = 8 }) => {
  return (
    <div 
      className="
        main-container 
        pt-14 
        md:pt-16 
        grid 
        grid-cols-2 
        sm:grid-cols-2 
        md:grid-cols-3 
        lg:grid-cols-4 
        xl:grid-cols-5 
        2xl:grid-cols-6 
        gap-4 
        lg:gap-8 
        xl:gap-6
      "
    >
      {Array.from({ length: count }).map((_, i) => (
        <ListingSkeleton key={i} />
      ))}
    </div>
  );
};

export default LoadingGrid;

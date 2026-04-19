import React from "react";
import HeroSection from "@/components/home/HeroSection";
import Categories from "@/components/navbar/Categories";
import LoadingGrid from "@/components/listings/LoadingGrid";

const LoadingPage = () => {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Replicate the Home Page Layout */}
      <HeroSection />

      <section className="container mx-auto px-4 mb-12 mt-12 bg-white dark:bg-[#020817]">
        <Categories />
      </section>

      {/* The Skeleton Grid */}
      <section className="pb-20">
        <LoadingGrid count={10} />
      </section>
    </main>
  );
};

export default LoadingPage;

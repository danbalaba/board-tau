"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useLoading } from "./LoadingContext";
import LoadingAnimation from "../common/LoadingAnimation";

const GlobalLoadingOverlay: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLoading, startLoading, stopLoading } = useLoading();

  useEffect(() => {
    startLoading();

    const timer = setTimeout(() => {
      stopLoading();
    }, 1500); // Show loading for at least 1.5 seconds

    return () => clearTimeout(timer);
  }, [pathname, searchParams, startLoading, stopLoading]);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <LoadingAnimation text="Loading..." size="large" />
    </div>
  );
};

export default GlobalLoadingOverlay;

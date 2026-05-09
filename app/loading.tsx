"use client";

import { useEffect } from "react";
import { useLoading } from "@/components/loading/LoadingContext";

/**
 * Root Loading Trigger
 * This file is "Invisible". Its only job is to tell our Global Context 
 * to show the high-fidelity Glass Overlay. 
 * 
 * We do this to prevent "Flickering" and to allow the Glass Overlay 
 * to stay on screen for a minimum amount of time for a premium feel.
 */
const LoadingPage = () => {
  const { startLoading } = useLoading();

  useEffect(() => {
    startLoading();
  }, [startLoading]);

  return null;
};

export default LoadingPage;

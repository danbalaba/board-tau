"use client";

import { useEffect } from "react";
import { useLoading } from "@/components/loading/LoadingContext";

/**
 * Landlord Dashboard Loading Trigger
 * Tells our Global Context to show the premium Glass Overlay 
 * during transitions between dashboard segments.
 */
const LandlordLoading = () => {
  const { startLoading } = useLoading();

  useEffect(() => {
    startLoading();
  }, [startLoading]);

  return null;
};

export default LandlordLoading;

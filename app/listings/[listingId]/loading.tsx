"use client";

import React, { useEffect } from "react";
import { useLoading } from "@/components/loading/LoadingContext";

const Loading = () => {
  const { startLoading } = useLoading();

  useEffect(() => {
    startLoading();
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, [startLoading]);

  return null;
};

export default Loading;

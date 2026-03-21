"use client";

import React, { useLayoutEffect } from "react";
import LoadingAnimation from "@/components/common/LoadingAnimation";

const Loading = () => {
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <LoadingAnimation text="Loading Property Details..." size="large" />
    </div>
  );
};

export default Loading;

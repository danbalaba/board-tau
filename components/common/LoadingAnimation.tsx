"use client";

import React from "react";
import { ThreeDots } from "react-loader-spinner";
import { cn } from "@/utils/helper";

interface LoadingAnimationProps {
  text?: string;
  size?: "small" | "medium" | "large";
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  text = "Loading...",
  size = "medium",
}) => {
  const sizeConfig = {
    small: {
      height: "40",
      width: "40",
      radius: "5",
      text: "text-sm",
      container: "p-4",
    },
    medium: {
      height: "60",
      width: "60",
      radius: "7",
      text: "text-lg",
      container: "p-8",
    },
    large: {
      height: "80",
      width: "80",
      radius: "9",
      text: "text-xl",
      container: "p-12",
    },
  };

  const config = sizeConfig[size];

  return (
    <div className={cn("flex flex-col items-center justify-center", config.container)}>
      {/* Three Dots Loader */}
      <ThreeDots
        visible={true}
        height={config.height}
        width={config.width}
        color="#2f7d6d"
        radius={config.radius}
        ariaLabel="three-dots-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />

      {/* Loading Text */}
      {text && (
        <div className={cn("mt-4 text-center", config.text, "text-muted-foreground")}>
          {text}
        </div>
      )}
    </div>
  );
};

export default LoadingAnimation;

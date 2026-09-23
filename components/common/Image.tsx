"use client";
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/utils/helper";

const CustomImage = ({
  imageSrc,
  fill = false,
  alt,
  className,
  priority = false,
  effect,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}: {
  imageSrc: string;
  fill?: boolean;
  alt: string;
  className?: string;
  priority?: boolean;
  effect?: "zoom";
  sizes?: string;
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <Image
      fill={fill}
      className={cn(
        `transition duration-300`,
        effect === "zoom" && "scale-95",
        isImageLoaded ? "opacity-100 scale-100" : "opacity-0",
        className
      )}
      src={imageSrc}
      alt={alt}
      onLoad={() => setIsImageLoaded(true)}
      priority={priority}
      sizes={fill ? sizes : undefined}
      unoptimized
    />
  );
};

export default CustomImage;

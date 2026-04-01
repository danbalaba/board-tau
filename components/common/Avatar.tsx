import React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { IconUser } from "@tabler/icons-react";

interface AvatarProps {
  src: string | null | undefined;
  alt?: string;
  className?: string;
}

/**
 * Only allow http, https, or blob URLs as image sources.
 * Explicitly rejects data: URIs and any other schemes to prevent XSS.
 */
const getSafeImageSrc = (src: string | null | undefined): string | undefined => {
  if (!src) return undefined;
  const lower = src.toLowerCase();
  const isSafeProtocol = lower.startsWith('http://') || 
                         lower.startsWith('https://') || 
                         lower.startsWith('blob:');

  if (isSafeProtocol && !/[<>"]/.test(src)) {
    return src;
  }
  return undefined;
};

const Avatar: React.FC<AvatarProps> = ({ src, alt = "Avatar", className }) => {
  return (
    <AvatarPrimitive.Root className={`relative flex h-full w-full min-h-[28px] min-w-[28px] shrink-0 overflow-hidden rounded-full ${className || ""}`}>
      <AvatarPrimitive.Image
        src={getSafeImageSrc(src)}
        alt={alt}
        className="aspect-square h-full w-full object-cover"
      />
      <AvatarPrimitive.Fallback
        delayMs={0}
        className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500"
      >
        <IconUser size={18} />
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
};

export default Avatar;

import React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { IconUser } from "@tabler/icons-react";

interface AvatarProps {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  name?: string | null;
}

/**
 * Validates and sanitizes image sources.
 * Updated to be much more permissive to avoid blocking valid Google/Cloudinary URLs.
 */
const getSafeImageSrc = (src: string | null | undefined): string | undefined => {
  if (!src || typeof src !== 'string' || src.length > 2048) return undefined;

  const lower = src.toLowerCase();
  const isSafeProtocol = lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('blob:') || lower.startsWith('data:');
  const isRelative = src.startsWith('/');

  if (isSafeProtocol || isRelative) {
    // Allow all common URI characters to prevent breaking Google/CDN links
    return src;
  }

  return undefined;
};

const Avatar: React.FC<AvatarProps> = ({ src, alt = "Avatar", className, name }) => {
  const initials = name?.trim() ? name.trim().charAt(0).toUpperCase() : null;

  return (
    <AvatarPrimitive.Root className={`relative flex shrink-0 overflow-hidden rounded-full border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 ${className || "h-8 w-8"}`}>
      <AvatarPrimitive.Image
        src={getSafeImageSrc(src)}
        alt={alt}
        referrerPolicy="no-referrer"
        className="aspect-square h-full w-full object-cover"
      />
      <AvatarPrimitive.Fallback
        delayMs={0}
        className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-blue-500/10 text-primary font-black"
      >
        {initials ? (
          <span className="text-[0.8rem] uppercase tracking-tighter leading-none select-none">
            {initials}
          </span>
        ) : (
          <IconUser size="60%" strokeWidth={2.5} />
        )}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
};

export default Avatar;

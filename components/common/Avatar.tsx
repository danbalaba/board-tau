import React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { IconUser } from "@tabler/icons-react";

interface AvatarProps {
  src: string | null | undefined;
  alt?: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt = "Avatar", className }) => {
  return (
    <AvatarPrimitive.Root className={`relative flex h-full w-full min-h-[28px] min-w-[28px] shrink-0 overflow-hidden rounded-full ${className || ""}`}>
      <AvatarPrimitive.Image
        src={src || undefined}
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

import React from "react";
import Image from "next/image";

interface AvatarProps {
  src: string | null | undefined;
  alt?: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt = "Avatar", className }) => {
  return (
    <Image
      className={`rounded-full select-none ${className || ""}`}
      height="28"
      width="28"
      alt={alt}
      src={src || "/images/placeholder.jpg"}
      unoptimized
    />
  );
};

export default Avatar;

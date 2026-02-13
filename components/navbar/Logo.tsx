"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const Logo = () => {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    // If already on home page, just scroll to top
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    } else {
      // If on other page, navigate to home
      router.push("/");
    }
  };

  if (!mounted) {
    return (
      <Link href="/" onClick={handleLogoClick} className="h-[35px] w-[150px] relative hidden md:block ">
        <Image
          src="/images/TauBOARD-Light.png"
          alt="logo"
          fill
          sizes="150px"
          priority
          unoptimized
        />
      </Link>
    );
  }

  const isDark = theme === "dark";

  return (
    <Link href="/" onClick={handleLogoClick} className="h-[35px] w-[150px] relative hidden md:block ">
      <Image
        src={isDark ? "/images/TauBOARD-Dark.png" : "/images/TauBOARD-Light.png"}
        alt="logo"
        fill
        sizes="150px"
        priority
        unoptimized
      />
    </Link>
  );
};

export default Logo;

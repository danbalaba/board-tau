"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLoading } from "@/components/loading/LoadingContext";

const Logo = () => {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { startLoading } = useLoading();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    const hasParams = typeof window !== 'undefined' && window.location.search !== '';

    // If on home page with no filters, scroll to top
    if (pathname === "/" && !hasParams) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    } else {
      // Trigger global loading overlay only when navigating
      startLoading();
      
      // If on home page with filters, or on another page, navigate to home (clearing params)
      router.push("/");
    }
  };

  if (!mounted) {
    return (
      <Link href="/" onClick={handleLogoClick} className={`h-[35px] w-[150px] relative ${pathname === "/" ? "hidden md:block" : "block"}`}>
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
    <Link href="/" onClick={handleLogoClick} className={`h-[35px] w-[150px] relative ${pathname === "/" ? "hidden md:block" : "block"}`}>
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

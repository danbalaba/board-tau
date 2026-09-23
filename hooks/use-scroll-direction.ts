"use client";

import { useState, useEffect, useRef } from "react";

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | "">("");
  const lastYRef = useRef(0);

  useEffect(() => {
    let ticking = false;

    const updateScrollDirection = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastYRef.current;

      if (currentY <= 10) {
        setScrollDirection("");
      } else if (Math.abs(diff) > 5) {
        if (diff > 0) {
          setScrollDirection("down");
        } else {
          setScrollDirection("up");
        }
      }

      lastYRef.current = currentY > 0 ? currentY : 0;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrollDirection;
}

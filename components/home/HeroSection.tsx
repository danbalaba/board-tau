"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { headlineFadeIn, subtitleFadeIn, searchBarEntrance } from "@/utils/motion";
import SearchManager from "@/components/navbar/SearchManager";

export default function HeroSection() {
  const [isScrolled, setIsScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const body = document.body;
      const isLocked = body.classList.contains("fixed") || body.style.position === 'fixed' || document.documentElement.style.overflow === 'hidden';
      let scrollTop = window.scrollY;
      
      if (isLocked && body.style.top) {
        scrollTop = Math.abs(parseFloat(body.style.top)) || 0;
      }

      setIsScrolled(scrollTop > 80);
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    
    // Also listen to DOM mutations to catch when a modal locks the body
    const observer = new MutationObserver(() => {
      handleScroll();
    });
    
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-[60vh] md:min-h-[550px] overflow-hidden pt-24 md:pt-28">
      {/* Dark Mode Static Background */}
      <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]" />

      {/* Light Mode - Bold Base Gradient Atmosphere */}
      <div className="absolute inset-0 dark:hidden bg-gradient-to-br from-[#e6f4f1] via-[#f0f9ff] to-[#f8fafc]" />

      {/* Light Mode - Intense Green Glow Layer */}
      <div 
        className="absolute inset-0 dark:hidden opacity-[0.25] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 20% 35%, #86efac 0%, transparent 55%)" }}
      />

      {/* Light Mode - Vibrant Blue Atmospheric Layer */}
      <div 
        className="absolute inset-0 dark:hidden opacity-[0.2] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 90% 90%, #7dd3fc 0%, transparent 60%)" }}
      />

      {/* Light Mode - Blurred Green Shape Behind Headline */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1000px] h-[600px] dark:hidden blur-[80px] md:blur-[120px] opacity-[0.45] pointer-events-none transform-gpu"
        style={{ background: "radial-gradient(ellipse, #bbf7d0 0%, transparent 70%)" }}
      />

      {/* Light Mode - Blurred Blue Shape Behind Search Bar */}
      <div 
        className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-[900px] h-[400px] dark:hidden blur-[70px] md:blur-[100px] opacity-[0.4] pointer-events-none transform-gpu"
        style={{ background: "radial-gradient(ellipse, #bae6fd 0%, transparent 70%)" }}
      />

      {/* Enhanced Vignette */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 dark:to-black/30 pointer-events-none" />

      {/* Noise Texture - More Visible */}
      <div
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Main Radial Highlight Behind Headline */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] md:w-[1400px] h-[800px] md:h-[1400px] bg-white/40 dark:bg-gray-800/30 rounded-full blur-[80px] md:blur-[120px] pointer-events-none transform-gpu opacity-80" />

      {/* Secondary Radial Light for Search Bar */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-[600px] md:w-[1000px] h-[400px] md:h-[600px] bg-white/40 dark:bg-gray-800/20 rounded-full blur-[60px] md:blur-[100px] pointer-events-none transform-gpu opacity-80" />

      <motion.div
        className="relative main-container h-full min-h-[60vh] md:min-h-[550px] flex flex-col items-center"
        initial="hidden"
        animate="show"
      >
        {/* Main content with parallax */}
        <motion.div
          className="flex-1 flex flex-col items-center justify-start w-full max-w-5xl text-center pt-12 md:pt-20 pb-8 md:pb-12"
        >
          <motion.h1
            variants={headlineFadeIn}
            initial="hidden"
            animate="show"
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 drop-shadow-lg"
            style={{
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.05), 0 0 60px rgba(47, 125, 109, 0.08)'
            }}
          >
            Find your perfect boarding house
          </motion.h1>
          <motion.p
            variants={subtitleFadeIn}
            initial="hidden"
            animate="show"
            className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-600 dark:text-gray-300 leading-relaxed"
            style={{
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
            }}
          >
            Discover comfortable and affordable accommodations near your university
          </motion.p>
        </motion.div>

        {/* Search bar with floating animation */}
        <motion.div
          variants={searchBarEntrance}
          initial="hidden"
          animate={{
            scale: isScrolled ? 0.95 : 1,
            opacity: isScrolled ? 0.95 : 1,
            y: isScrolled ? -10 : 0,
          }}
          transition={{
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
            delayChildren: 0.05,
            staggerChildren: 0.03
          }}
          className="w-full absolute bottom-0 left-0 pb-8 md:pb-12"
        >
          <div className="w-full max-w-5xl mx-auto px-4">
            <SearchManager isScrolled={isScrolled} />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

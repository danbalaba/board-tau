"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { headlineFadeIn, subtitleFadeIn, searchBarEntrance } from "@/utils/motion";
import SearchManager from "@/components/navbar/SearchManager";

export default function HeroSection() {
  const [isScrolled, setIsScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const y2 = useTransform(scrollY, [0, 500], [0, 50]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-[60vh] md:min-h-[550px] overflow-hidden">
      {/* Light Mode Animated Background with Depth */}
      <motion.div
        className="absolute inset-0 hidden dark:block"
        animate={{
          background: [
            "linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #0f172a 50%, #1e293b 75%, #0f172a 100%)",
            "linear-gradient(135deg, #1e293b 0%, #0f172a 25%, #1e293b 50%, #0f172a 75%, #1e293b 100%)",
            "linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #0f172a 50%, #1e293b 75%, #0f172a 100%)"
          ]
        }}
        transition={{ duration: 12, repeat: Infinity, repeatType: "reverse" }}
      />

      {/* Light Mode - Bold Base Gradient Atmosphere */}
      <motion.div
        className="absolute inset-0 dark:hidden"
        animate={{
          background: [
            "linear-gradient(135deg, #e6f4f1 0%, #f0f9ff 25%, #f8fafc 50%, #f0f9ff 75%, #e6f4f1 100%)",
            "linear-gradient(135deg, #f0f9ff 0%, #f8fafc 25%, #e6f4f1 50%, #f8fafc 75%, #f0f9ff 100%)",
            "linear-gradient(135deg, #e6f4f1 0%, #f0f9ff 25%, #f8fafc 50%, #f0f9ff 75%, #e6f4f1 100%)"
          ]
        }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
      />

      {/* Light Mode - Intense Green Glow Layer */}
      <motion.div
        className="absolute inset-0 dark:hidden opacity-[0.25]"
        animate={{
          background: [
            "radial-gradient(ellipse at 20% 35%, #86efac 0%, transparent 55%)",
            "radial-gradient(ellipse at 80% 65%, #bbf7d0 0%, transparent 55%)",
            "radial-gradient(ellipse at 50% 20%, #86efac 0%, transparent 55%)"
          ]
        }}
        transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
      />

      {/* Light Mode - Vibrant Blue Atmospheric Layer */}
      <motion.div
        className="absolute inset-0 dark:hidden opacity-[0.2]"
        animate={{
          background: [
            "radial-gradient(ellipse at 90% 90%, #7dd3fc 0%, transparent 60%)",
            "radial-gradient(ellipse at 10% 10%, #bae6fd 0%, transparent 60%)",
            "radial-gradient(ellipse at 70% 80%, #7dd3fc 0%, transparent 60%)"
          ]
        }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
      />

      {/* Light Mode - Blurred Green Shape Behind Headline */}
      <motion.div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] dark:hidden blur-[120px] opacity-[0.45]"
        animate={{
          background: [
            "radial-gradient(ellipse, #bbf7d0 0%, transparent 70%)",
            "radial-gradient(ellipse, #86efac 0%, transparent 70%)",
            "radial-gradient(ellipse, #bbf7d0 0%, transparent 70%)"
          ],
          scale: [1, 1.15, 1],
          y: [0, -25, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, repeatType: "reverse" }}
      />

      {/* Light Mode - Blurred Blue Shape Behind Search Bar */}
      <motion.div
        className="absolute bottom-32 left-1/2 -translate-x-1/2 w-[900px] h-[400px] dark:hidden blur-[100px] opacity-[0.4]"
        animate={{
          background: [
            "radial-gradient(ellipse, #bae6fd 0%, transparent 70%)",
            "radial-gradient(ellipse, #7dd3fc 0%, transparent 70%)",
            "radial-gradient(ellipse, #bae6fd 0%, transparent 70%)"
          ],
          scale: [1, 1.1, 1],
          y: [0, 15, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
      />

      {/* Enhanced Vignette */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 dark:to-black/30" />

      {/* Noise Texture - More Visible */}
      <div
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Main Radial Highlight Behind Headline */}
      <motion.div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] bg-gradient-radial from-white/50 to-transparent dark:from-gray-800/40 rounded-full blur-3xl pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />

      {/* Secondary Radial Light for Search Bar */}
      <motion.div
        className="absolute bottom-32 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-radial from-white/40 to-transparent dark:from-gray-800/30 rounded-full blur-2xl pointer-events-none"
        animate={{
          y: [0, -20, 0],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />

      <motion.div
        className="relative main-container h-full min-h-[60vh] md:min-h-[550px] flex flex-col items-center"
        initial="hidden"
        animate="show"
      >
        {/* Main content with parallax */}
        <motion.div
          className="flex-1 flex flex-col items-center justify-start w-full max-w-5xl text-center pt-12 md:pt-20 pb-8 md:pb-12"
          style={{ y: y2 }}
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

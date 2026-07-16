"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Loader2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AIFallbackAlertProps {
  searchParams: Record<string, any>;
}

export default function AIFallbackAlert({ searchParams }: AIFallbackAlertProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchRecommendation() {
      try {
        const response = await fetch("/api/ai/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ searchParams }),
        });
        
        if (response.ok && isMounted) {
          const data = await response.json();
          setMessage(data.message || "We couldn't find an exact match for your strict filters, so we are showing you the closest alternatives.");
        }
      } catch (error) {
        console.error("AI Fallback Error:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    
    fetchRecommendation();
    
    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 mb-8">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-orange-500/10 border border-primary/20 p-5 shadow-sm"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles className="w-24 h-24 text-primary" />
        </div>
        
        <div className="flex gap-4 relative z-10">
          <div className="flex-shrink-0 mt-1">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5 justify-center min-h-[40px]">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              AI Recommendation
              {isLoading && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
            </h3>
            
            <div className="text-[15px] font-medium text-gray-700 dark:text-gray-300">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.p
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-gray-500 dark:text-gray-400"
                  >
                    Analyzing your filters to suggest the best alternatives...
                  </motion.p>
                ) : (
                  <motion.p
                    key="message"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {message || "We couldn't find an exact match, but here are some excellent alternatives slightly outside your constraints."}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

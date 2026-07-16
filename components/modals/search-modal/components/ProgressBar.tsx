import { FaCheck } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface ProgressBarProps {
  steps: { id: number; label: string }[];
  currentStepId: number;
}

export default function ProgressBar({ steps, currentStepId }: ProgressBarProps) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") return window.innerWidth < 768;
    return false;
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const displayStep = steps.findIndex(s => s.id === currentStepId) + 1;
  const totalSteps = steps.length;

  const ITEM_WIDTH = isMobile ? (100 / 3) : 25; // 3 items on mobile, 4 on desktop

  // We center the active step when possible.
  let startIndex = displayStep - 2;
  if (startIndex < 0) startIndex = 0;
  
  // Calculate max start index so the track doesn't scroll past the end
  const maxStartIndex = Math.max(0, totalSteps - (isMobile ? 3 : 4));
  if (startIndex > maxStartIndex) startIndex = maxStartIndex;

  const translateX = `-${startIndex * ITEM_WIDTH}%`;

  return (
    <div className="w-full flex justify-center pt-6 pb-4 border-b border-gray-100 dark:border-gray-800/60 bg-white dark:bg-gray-900 px-6 overflow-hidden">
      <div className="relative w-full max-w-2xl">
        
        {/* The Sliding Track */}
        <motion.div 
          className="flex items-center"
          animate={{ x: translateX }}
          transition={{ type: "spring", stiffness: 250, damping: 30, mass: 0.8 }}
        >
          <AnimatePresence mode="popLayout">
            {steps.map((stepObj, index) => {
              const step = index + 1;
              const isPast = displayStep > step;
              const isCurrent = displayStep === step;

              return (
                <motion.div 
                  key={stepObj.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.8, width: "0%" }}
                  animate={{ opacity: 1, scale: 1, width: isMobile ? "33.333%" : "25%" }}
                  exit={{ opacity: 0, scale: 0.5, width: "0%" }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  className="flex-shrink-0 flex flex-col items-center justify-center relative"
                >
                  
                  {/* Connecting Line to the next step */}
                  {step < totalSteps && (
                    <div className="absolute top-[15px] left-[50%] w-full h-[3px] bg-gray-200 dark:bg-gray-700 rounded-full">
                      <motion.div 
                        className="h-full bg-primary rounded-full"
                        style={{ transformOrigin: "left" }}
                        initial={false}
                        animate={{ scaleX: displayStep > step ? 1 : 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      />
                    </div>
                  )}

                  <div className="flex flex-col items-center gap-3 bg-white dark:bg-gray-900 px-4 relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isCurrent
                          ? "bg-primary text-white shadow-md shadow-primary/20 ring-4 ring-primary/10 scale-110"
                          : isPast
                          ? "bg-primary text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {isPast ? <FaCheck size={12} /> : step}
                    </div>
                    <span
                      className={`text-sm font-semibold whitespace-nowrap transition-colors duration-300 ${
                        isCurrent
                          ? "text-gray-900 dark:text-white"
                          : isPast
                          ? "text-primary/70"
                          : "text-gray-400"
                      }`}
                    >
                      {stepObj.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import Button from "@/components/common/Button";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StepButtonProps {
  step: number;
  totalSteps: number;
  isFilled: boolean;
  onNext: () => void;
}

export default function StepButton({ step, totalSteps, isFilled, onNext }: StepButtonProps) {
  const isSummary = step === totalSteps;
  const [isSubmit, setIsSubmit] = useState(false);

  useEffect(() => {
    if (isSummary) {
      // Add a tiny delay before allowing the button to be submitted,
      // preventing accidental double-clicks from skipping the Summary Step.
      const timer = setTimeout(() => setIsSubmit(true), 150);
      return () => clearTimeout(timer);
    } else {
      setIsSubmit(false);
    }
  }, [isSummary]);

  return (
    <button
      type={isSubmit ? "submit" : "button"}
      className={`w-full flex items-center gap-2 justify-center px-4 py-3 rounded-xl font-black text-sm transition-all active:scale-95 ${
        isFilled
          ? "bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25"
          : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
      }`}
      disabled={!isFilled || (isSummary && !isSubmit)}
      onClick={isSummary ? undefined : onNext}
    >
      <AnimatePresence mode="popLayout">
        {isSummary ? (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="whitespace-nowrap font-black uppercase"
          >
            SEARCH PROPERTIES
          </motion.div>
        ) : (
          <span className="whitespace-nowrap font-black uppercase flex items-center gap-2">CONTINUE</span>
        )}
      </AnimatePresence>
    </button>
  );
}

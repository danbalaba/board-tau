"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ServerCrash, RefreshCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Decorative top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50" />

        <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-6 border border-rose-500/20 shadow-inner">
          <ServerCrash size={36} strokeWidth={2.5} />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-3 font-outfit">
          Something went wrong!
        </h2>
        
        <p className="text-slate-500 dark:text-slate-400 text-[15px] leading-relaxed mb-8 px-2">
          We've encountered an unexpected error on this page. Our technical team has been automatically notified.
        </p>

        <button
          onClick={() => reset()}
          className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
        >
          <RefreshCcw size={18} />
          Try again
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { ErrorPageMascotPanel } from "@/components/error/ErrorPageMascotPanel";
import { ServerCrash, RefreshCcw, Wrench, Home } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    Sentry.captureException(error);
  }, [error]);

  if (!mounted) {
    return (
      <div className="min-h-[70vh] w-full flex items-center justify-center p-6">
        <div className="w-10 h-10 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin" />
      </div>
    );
  }

  return (
    <div data-error-page="true" className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 overflow-y-auto font-sans">
      {/* Background ambient light */}
      <div className="hidden dark:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-rose-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="w-full max-w-[1700px] mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch relative z-10 my-auto">
        {/* Left Column: Kerby Hero Mascot Panel */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col h-full min-h-[320px] sm:min-h-[420px]">
          <ErrorPageMascotPanel
            imageSrc="/assets/mascot/kerby-500-mechanic.png"
            altText="Kerby Mechanic Mascot"
            speechText="Oops! An unexpected error occurred in the Admin system, but I'm on it with my wrench to fix it!"
            speechIcon={<Wrench className="w-4 h-4 text-rose-500" />}
          />
        </div>

        {/* Right Column: Error Code, Notice & Action Controls */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-between p-6 sm:p-8 md:p-12 lg:p-14 rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 backdrop-blur-2xl shadow-2xl h-full min-h-[300px] sm:min-h-[420px] relative overflow-hidden">
          {/* Decorative top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-80" />

          <div>
            {/* Top Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-4 sm:mb-6">
              <ServerCrash className="w-4 h-4" />
              <span>Admin System Error • 500</span>
            </div>

            {/* Title with Responsive 500 Watermark */}
            <div className="relative mb-4 sm:mb-8">
              <div className="absolute -top-6 sm:-top-10 left-0 pointer-events-none select-none overflow-hidden opacity-25 dark:opacity-20">
                <span className="text-5xl sm:text-8xl md:text-[180px] lg:text-[210px] font-black text-slate-400 dark:text-slate-600 leading-none font-mono tracking-tighter">
                  500
                </span>
              </div>
              <h2 className="relative z-10 text-xl sm:text-4xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight font-outfit pt-3 sm:pt-8">
                Admin Error Occurred
              </h2>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-lg md:text-2xl leading-relaxed mb-4 sm:mb-8 max-w-2xl font-normal">
              We encountered an unexpected server error while loading this admin module.
            </p>

            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3.5 sm:p-5 md:p-6 mb-4 sm:mb-8">
              <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-base md:text-lg leading-relaxed font-medium">
                Our engineering team has been automatically notified of this issue.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-4 sm:pt-8 border-t border-slate-200/80 dark:border-slate-800">
            <Link
              href="/admin/overview"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-2.5 px-6 sm:px-8 py-3 sm:py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm sm:text-base rounded-xl sm:rounded-2xl transition-all duration-200"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Back to Overview</span>
            </Link>

            <button
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-2.5 px-6 sm:px-9 py-3 sm:py-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl transition-all duration-200 active:scale-95 sm:ml-auto"
            >
              <RefreshCcw className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

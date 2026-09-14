"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { ServerCrash, RefreshCcw } from "lucide-react";
import { LoadingProvider } from "@/components/loading/LoadingContext";
import { ErrorPageMascotPanel } from "@/components/error/ErrorPageMascotPanel";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 md:p-8 font-sans">
        <LoadingProvider>
          <div className="w-full max-w-[1700px] mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch relative z-10 my-auto">
            {/* Left Column: Kerby Hero Mascot Panel */}
            <div className="lg:col-span-5 flex flex-col h-full min-h-[320px] sm:min-h-[420px]">
              <ErrorPageMascotPanel
                imageSrc="/assets/mascot/kerby-500-mechanic.png"
                altText="Kerby Mechanic Mascot"
                speechText="A critical system error occurred! Don't panic, I'm working to recover the application session."
                speechIcon={<ServerCrash className="w-4 h-4 text-rose-500" />}
              />
            </div>

            {/* Right Column: Error Code, Notice & Action Controls */}
            <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 md:p-12 lg:p-14 rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 backdrop-blur-2xl shadow-2xl h-full min-h-[300px] sm:min-h-[420px] relative overflow-hidden">
              {/* Decorative top gradient line */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-80" />

              <div>
                {/* Title with Responsive 500 Watermark */}
                <div className="relative mb-6 sm:mb-8">
                  <div className="absolute -top-6 sm:-top-10 left-0 pointer-events-none select-none overflow-hidden opacity-25 dark:opacity-20">
                    <span className="text-6xl sm:text-8xl md:text-[180px] lg:text-[210px] font-black text-slate-400 dark:text-slate-600 leading-none font-mono tracking-tighter">
                      500
                    </span>
                  </div>
                  <h2 className="relative z-10 text-2xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight font-outfit pt-4 sm:pt-8">
                    Critical System Error
                  </h2>
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl font-normal">
                  A critical error occurred in the application root structure.
                </p>

                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 md:p-6 mb-8">
                  <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed font-medium">
                    Our core development team has been automatically alerted of this issue.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-slate-200/80 dark:border-slate-800">
                <button
                  onClick={() => reset()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95 sm:ml-auto"
                >
                  <RefreshCcw className="w-5 h-5" />
                  <span>Try to recover</span>
                </button>
              </div>
            </div>
          </div>
        </LoadingProvider>
      </body>
    </html>
  );
}

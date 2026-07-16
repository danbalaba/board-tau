"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      router.back();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, router]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      
      {/* Background ambient light (Dark mode only, permanent) */}
      <div className="hidden dark:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[80px] pointer-events-none" />

      <div className="mb-8 relative z-10">
        <h1 className="text-[180px] font-black text-slate-300 dark:text-slate-700 leading-none select-none tracking-tighter drop-shadow-sm">
          404
        </h1>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-4 font-outfit">
        Page Not Found
      </h2>
      
      <p className="text-slate-500 dark:text-slate-400 text-lg max-w-[400px] mb-4 leading-relaxed">
        Oops! The boarding house or page you're looking for doesn't exist or has been moved.
      </p>

      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-10 bg-slate-100 dark:bg-slate-800/50 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
        Auto-redirecting back in <span className="text-primary font-bold text-base">{countdown}</span> seconds...
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-[400px]">
        <button
          onClick={() => router.back()}
          className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <ArrowLeft size={18} />
          Go Back
        </button>
        <Link
          href="/"
          className="flex-1 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          <Home size={18} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}

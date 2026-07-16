"use client";

import Link from "next/link";
import { Lock, ArrowLeft, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
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
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background ambient light (Dark mode only, permanent) */}
      <div className="hidden dark:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[80px] pointer-events-none" />

      <div className="mb-6 relative z-10">
        <h1 className="text-[180px] font-black text-slate-300 dark:text-slate-700 leading-none select-none tracking-tighter drop-shadow-sm">
          401
        </h1>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-4 font-outfit flex items-center gap-2">
        Access Denied
      </h2>
      
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4 flex items-start gap-3 max-w-[420px]">
        <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={20} />
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          You do not have the required permissions to view this page. If you believe this is a mistake, please contact the administrators.
        </p>
      </div>

      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8 bg-slate-100 dark:bg-slate-800/50 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
        Auto-redirecting back in <span className="text-primary font-bold text-base">{countdown}</span> seconds...
      </p>

      <button
        onClick={() => router.back()}
        className="py-3.5 px-8 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
      >
        <ArrowLeft size={18} />
        Go Back Now
      </button>
    </div>
  );
}

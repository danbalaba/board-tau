"use client";

import Link from "next/link";
import { Lock, ArrowLeft, ShieldAlert, Home, Building2, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { ErrorPageMascotPanel } from "@/components/error/ErrorPageMascotPanel";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState(15);

  const role = (session?.user as any)?.role;

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdminRole = role === "ADMIN" || role === "SUPER_ADMIN" || role === "admin" || role === "super_admin";
  const isLandlordRole = role === "LANDLORD" || role === "landlord";

  useEffect(() => {
    if (!mounted) return;
    if (countdown <= 0) {
      if (isAdminRole) {
        router.push("/admin/overview");
      } else if (isLandlordRole) {
        router.push("/landlord");
      } else {
        router.push("/");
      }
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, router, mounted, isAdminRole, isLandlordRole]);

  if (!mounted) {
    return (
      <div className="min-h-[80vh] w-full flex items-center justify-center p-6">
        <div className="w-10 h-10 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
      </div>
    );
  }

  const portalHref = isAdminRole ? "/admin/overview" : isLandlordRole ? "/landlord" : "/";
  const portalLabel = isAdminRole ? "Return to Admin Overview" : isLandlordRole ? "Return to Landlord Dashboard" : "Return to Home";
  const PortalIcon = isAdminRole ? LayoutDashboard : isLandlordRole ? Building2 : Home;

  return (
    <div data-error-page="true" className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 overflow-y-auto font-sans">
      {/* Background ambient light (Dark mode only) */}
      <div className="hidden dark:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="w-full max-w-[1700px] mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch relative z-10 my-auto">
        {/* Left Column: Kerby Hero Mascot Panel */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col h-full min-h-[320px] sm:min-h-[420px]">
          <ErrorPageMascotPanel
            imageSrc="/assets/mascot/kerby-401-security.png"
            altText="Kerby Security Officer Mascot"
            speechText="Halt! You need security clearance or administrator permissions to access this page on BoardTAU."
            speechIcon={<ShieldAlert className="w-4 h-4 text-amber-500" />}
          />
        </div>

        {/* Right Column: Error Code, Notice & Action Controls */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-between p-6 sm:p-8 md:p-12 lg:p-14 rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 backdrop-blur-2xl shadow-2xl h-full min-h-[300px] sm:min-h-[420px]">
          <div>
            {/* Top Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-4 sm:mb-6">
              <Lock className="w-4 h-4" />
              <span>Security Clearance Required • 401</span>
            </div>

            {/* Title with Responsive 401 Watermark */}
            <div className="relative mb-4 sm:mb-8">
              <div className="absolute -top-6 sm:-top-10 left-0 pointer-events-none select-none overflow-hidden opacity-25 dark:opacity-20">
                <span className="text-5xl sm:text-8xl md:text-[180px] lg:text-[210px] font-black text-slate-400 dark:text-slate-600 leading-none font-mono tracking-tighter">
                  401
                </span>
              </div>
              <h2 className="relative z-10 text-xl sm:text-4xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight font-outfit pt-3 sm:pt-8">
                Access Denied
              </h2>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-lg md:text-2xl leading-relaxed mb-4 sm:mb-8 max-w-2xl font-normal">
              You do not have the required permissions to view this protected area of BoardTAU.
            </p>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 sm:p-5 md:p-6 mb-4 sm:mb-8 flex items-start gap-3 sm:gap-4">
              <ShieldAlert className="text-amber-500 shrink-0 mt-0.5 w-5 h-5 sm:w-7 sm:h-7" />
              <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-base md:text-lg leading-relaxed font-medium">
                If you believe this is a mistake or require host/admin privileges, please contact the platform administrators.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4 sm:pt-8 border-t border-slate-200/80 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <button
                onClick={() => router.back()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-2.5 px-6 sm:px-8 py-3 sm:py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm sm:text-base rounded-xl sm:rounded-2xl transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Go Back</span>
              </button>

              <Link
                href={portalHref}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-2.5 px-6 sm:px-9 py-3 sm:py-4 bg-[#2f7d6d] hover:bg-[#256356] text-white font-semibold text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl transition-all duration-200 active:scale-95 sm:ml-auto"
              >
                <PortalIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{portalLabel}</span>
              </Link>
            </div>

            <div className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-center w-full">
              Auto-redirecting back to <span className="font-bold text-amber-600 dark:text-amber-400">{portalLabel}</span> in <span className="text-amber-600 dark:text-amber-400 font-bold text-xs sm:text-base">{countdown}</span> seconds...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

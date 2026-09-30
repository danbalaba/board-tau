"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { IconUserOff, IconGavel, IconArrowLeft, IconAlertTriangle, IconMail, IconHome } from "@tabler/icons-react";
import { ErrorPageMascotPanel } from "@/components/error/ErrorPageMascotPanel";
import { pusherClient } from "@/lib/pusher-client";
import toast from "react-hot-toast";
import { verifyRestrictionToken } from "@/lib/security-tokens";

export default function AccountSuspendedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const token = searchParams.get("token");
  const payload = verifyRestrictionToken(token);
  const email = payload?.email || searchParams.get("email");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!email) return;

    const channelName = `user-status-${email}`;
    pusherClient.subscribe(channelName);

    pusherClient.bind("account-restored", (data: any) => {
      if (data.status === "active") {
        toast.success("Account Restored! Redirecting to login...", {
          duration: 4000,
          position: "top-center",
        });

        setTimeout(() => {
          router.push("/?auth=login");
        }, 2000);
      }
    });

    return () => {
      pusherClient.unsubscribe(channelName);
      pusherClient.unbind("account-restored");
    };
  }, [email, router]);

  if (!mounted) {
    return (
      <div className="min-h-[80vh] w-full flex items-center justify-center p-6">
        <div className="w-10 h-10 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div data-error-page="true" className="w-full min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Background ambient light (Dark mode only) */}
      <div className="hidden dark:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="w-full max-w-[1700px] mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch relative z-10 my-auto">
        {/* Left Column: Kerby Hero Mascot Panel */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col h-full min-h-[320px] sm:min-h-[420px]">
          <ErrorPageMascotPanel
            imageSrc="/assets/mascot/kerby-suspended-warning.png"
            altText="Kerby Account Suspended Warning Mascot"
            speechText="Hold on! Your account has been temporarily suspended due to multiple cancellation policy violations (1st Offense Notice)."
            speechIcon={<IconAlertTriangle className="w-4 h-4 text-amber-500" />}
          />
        </div>

        {/* Right Column: Error Code, Notice & Action Controls */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-between p-6 sm:p-8 md:p-12 lg:p-14 rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 backdrop-blur-2xl shadow-2xl h-full min-h-[300px] sm:min-h-[420px] relative overflow-hidden">
          {/* Decorative top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-80" />

          <div>
            {/* Top Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-4 sm:mb-6">
              <IconUserOff className="w-4 h-4" />
              <span>Security Restriction • 1st Offense Notice</span>
            </div>

            {/* Title with Responsive SUSPENDED Watermark */}
            <div className="relative mb-4 sm:mb-8">
              <div className="absolute -top-6 sm:-top-10 left-0 pointer-events-none select-none overflow-hidden opacity-20 dark:opacity-15">
                <span className="text-4xl sm:text-7xl md:text-[130px] lg:text-[150px] font-black text-slate-400 dark:text-slate-600 leading-none font-mono tracking-tighter">
                  SUSPENDED
                </span>
              </div>
              <h2 className="relative z-10 text-xl sm:text-4xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight font-outfit pt-3 sm:pt-8">
                Account <span className="text-amber-500">Suspended</span>
              </h2>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-lg md:text-2xl leading-relaxed mb-4 sm:mb-8 max-w-2xl font-normal">
              Your account has been temporarily restricted due to policy violations or excessive automated cancellations.
            </p>

            <div className="space-y-4 mb-6 sm:mb-8">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 sm:gap-4">
                <div className="p-2 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl shrink-0 mt-0.5">
                  <IconGavel className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                    Status: Temporarily Restricted
                  </h4>
                  <p className="text-xs sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    This is a 1st offense suspension. Your existing booking records remain intact, but active booking privileges are paused until reviewed or unsuspended by an administrator.
                  </p>
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 sm:gap-4">
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl shrink-0 mt-0.5">
                  <IconMail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                    Need Help or Want to Appeal?
                  </h4>
                  <p className="text-xs sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    If you believe this restriction was applied in error, please contact our support team at{" "}
                    <a
                      href="mailto:support@boardtau.com"
                      className="text-amber-600 dark:text-amber-400 font-bold underline underline-offset-4 hover:text-amber-500 transition-colors"
                    >
                      support@boardtau.com
                    </a>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4 sm:pt-8 border-t border-slate-200/80 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <a
                href="mailto:support@boardtau.com"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-lg shadow-amber-500/20 transition-all duration-200 active:scale-95 uppercase tracking-wider"
              >
                <IconMail className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Contact Support</span>
              </a>

              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm sm:text-base rounded-xl sm:rounded-2xl transition-all duration-200 sm:ml-auto"
              >
                <IconHome className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Return to Home</span>
              </Link>
            </div>

            <div className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-center w-full">
              BoardTAU Security Protocol • Automated Account Protection
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

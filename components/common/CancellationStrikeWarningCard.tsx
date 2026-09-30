"use client";

import React from "react";
import { AlertTriangle, ShieldAlert, Info, Flame } from "lucide-react";

interface StrikeStatus {
  activeStrikes: number;
  suspensionCount: number;
  nextStrike: number;
  willSuspend: boolean;
  willBan: boolean;
}

interface CancellationStrikeWarningCardProps {
  strikeStatus: StrikeStatus | null;
  isLoading?: boolean;
}

export const CancellationStrikeWarningCard: React.FC<CancellationStrikeWarningCardProps> = ({
  strikeStatus,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 animate-pulse flex items-center gap-3 my-3">
        <div className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-600" />
        <div className="h-4 w-3/4 bg-slate-300 dark:bg-slate-600 rounded" />
      </div>
    );
  }

  if (!strikeStatus) return null;

  const { activeStrikes, nextStrike, willSuspend, willBan } = strikeStatus;

  // Scenario 1: Will trigger PERMANENT LIFETIME BAN
  if (willBan) {
    return (
      <div className="w-full p-4 sm:p-5 rounded-2xl bg-rose-50 border-2 border-rose-400 text-rose-950 dark:bg-rose-950/40 dark:border-rose-500/50 dark:text-rose-200 shadow-md shadow-rose-500/10 flex items-start gap-3.5 sm:gap-4 my-3 font-sans transition-all">
        <div className="p-2.5 bg-rose-600 text-white rounded-xl shrink-0 mt-0.5 shadow-md">
          <Flame className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xs">
              FINAL WARNING • LIFETIME BAN
            </span>
            <span className="text-xs font-mono font-bold text-rose-800 dark:text-rose-300 opacity-90">
              Active Strikes: {activeStrikes}/3
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold leading-relaxed text-rose-950 dark:text-rose-200">
            🚨 <span className="font-extrabold underline">FINAL WARNING</span>: You have <span className="font-black text-rose-700 dark:text-rose-300">{activeStrikes} active strikes</span> and a previous suspension. Confirming this cancellation will trigger an <span className="font-black text-rose-700 dark:text-rose-300 uppercase">IMMEDIATE PERMANENT LIFETIME BAN</span>!
          </p>
        </div>
      </div>
    );
  }

  // Scenario 2: Will trigger TEMPORARY SUSPENSION (1st Offense)
  if (willSuspend) {
    return (
      <div className="w-full p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 dark:bg-amber-950/40 dark:border-amber-500/50 dark:text-amber-200 shadow-md shadow-amber-500/10 flex items-start gap-3.5 sm:gap-4 my-3 font-sans transition-all">
        <div className="p-2.5 bg-amber-600 dark:bg-amber-500 text-white rounded-xl shrink-0 mt-0.5 shadow-md">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-amber-600 dark:bg-amber-500 text-white font-black text-[10px] uppercase tracking-widest shadow-xs">
              CRITICAL WARNING • SUSPENSION IMPENDING
            </span>
            <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-300 opacity-90">
              Active Strikes: {activeStrikes}/3
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold leading-relaxed text-amber-950 dark:text-amber-200">
            ⚠️ <span className="font-extrabold underline">CRITICAL WARNING</span>: You currently have <span className="font-black text-amber-700 dark:text-amber-300">{activeStrikes} active strikes</span> in the last 7 days. Confirming this cancellation will reach 3 strikes and trigger an <span className="font-black text-amber-700 dark:text-amber-300 uppercase">IMMEDIATE ACCOUNT SUSPENSION</span> (1st Offense Notice)!
          </p>
        </div>
      </div>
    );
  }

  // Scenario 3: Currently has 1 strike (Next will be Strike 2)
  if (activeStrikes === 1) {
    return (
      <div className="w-full p-4 rounded-2xl bg-orange-50 border border-orange-300 text-orange-950 dark:bg-orange-950/30 dark:border-orange-500/40 dark:text-orange-200 flex items-start gap-3.5 my-3 font-sans transition-all">
        <div className="p-2 bg-orange-600 dark:bg-orange-500 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-orange-600 dark:bg-orange-500 text-white font-black text-[9px] uppercase tracking-wider">
              POLICY WARNING
            </span>
            <span className="text-xs font-mono font-bold text-orange-800 dark:text-orange-300 opacity-90">
              Strike {nextStrike} of 3
            </span>
          </div>
          <p className="text-xs font-semibold leading-relaxed text-orange-950 dark:text-orange-200">
            You currently have <span className="font-bold text-orange-700 dark:text-orange-300">1 active strike</span>. Confirming this cancellation will be your <span className="font-bold">2nd strike</span> in the last 7 days. 1 more cancellation will result in account suspension.
          </p>
        </div>
      </div>
    );
  }

  // Scenario 4: Currently has 0 strikes (Next will be Strike 1)
  return (
    <div className="w-full p-3.5 sm:p-4 rounded-2xl bg-blue-50 border border-blue-300 text-blue-950 dark:bg-blue-950/30 dark:border-blue-500/30 dark:text-blue-200 flex items-start gap-3 my-3 font-sans transition-all">
      <div className="p-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg shrink-0 mt-0.5 shadow-xs">
        <Info className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="px-1.5 py-0.5 rounded bg-blue-600 dark:bg-blue-500 text-white font-bold text-[9px] uppercase tracking-wider">
            POLICY NOTICE
          </span>
          <span className="text-[11px] font-mono font-semibold text-blue-800 dark:text-blue-300 opacity-90">
            Strike {nextStrike} of 3
          </span>
        </div>
        <p className="text-xs font-medium leading-relaxed text-blue-950 dark:text-blue-200">
          Cancelling inquiries or reservations adds 1 strike to your account. Accumulating <span className="font-bold text-blue-900 dark:text-blue-300">3 strikes in 7 days</span> will result in account suspension.
        </p>
      </div>
    </div>
  );
};


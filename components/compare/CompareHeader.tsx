"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft, X, LayoutGrid, Table2, Sparkles, FileSpreadsheet } from "lucide-react";

interface CompareHeaderProps {
  viewMode: "CARDS" | "TABLE";
  setViewMode: (mode: "CARDS" | "TABLE") => void;
  onClose: () => void;
  activeTab: "DATA" | "AI";
  setActiveTab: (tab: "DATA" | "AI") => void;
  onExportCsv?: () => void;
}

export const CompareHeader: React.FC<CompareHeaderProps> = ({
  viewMode,
  setViewMode,
  onClose,
  activeTab,
  setActiveTab,
  onExportCsv
}) => {
  return (
    <>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="p-2 sm:p-2.5 rounded-xl bg-primary/15 text-primary dark:text-emerald-400 border border-primary/30 shrink-0">
            <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate">
              Compare Options
            </h2>
            <p className="hidden sm:block text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
              Side-by-side listing comparison & AI housing advisor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Export to Excel / CSV Sheet Button */}
          {onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2f7d6d] hover:bg-[#256558] text-white font-bold text-xs transition shadow-2xs cursor-pointer active:scale-95"
              title="Export comparison to Excel / CSV spreadsheet"
            >
              <FileSpreadsheet size={15} />
              <span>Export Sheet</span>
            </button>
          )}

          {/* Desktop View Mode Toggle Controls */}
          <div className="hidden md:flex items-center gap-1 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-xl border border-slate-300/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setViewMode("CARDS")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "CARDS"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <LayoutGrid size={13} />
              <span>Card View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("TABLE")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "TABLE"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Table2 size={13} />
              <span>Table View</span>
            </button>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full hover:bg-slate-200/60 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            title="Close Compare"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Bar: Tab Navigation + View Mode Switcher */}
      <div className="flex md:hidden items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 gap-2">
        {/* Main Tab Switcher (Property Specs vs Kerby AI) */}
        <div className="relative flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex-1">
          <button 
            type="button"
            className={`relative flex-1 py-1.5 px-2 text-xs font-extrabold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer z-10 ${
              activeTab === "DATA" 
                ? "text-[#2f7d6d] dark:text-emerald-400" 
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
            onClick={() => setActiveTab("DATA")}
          >
            {activeTab === "DATA" && (
              <motion.div
                layoutId="activeCompareTabPill"
                className="absolute inset-0 bg-white dark:bg-slate-900 rounded-lg shadow-xs -z-10"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
              />
            )}
            <Table2 size={14} className="shrink-0" />
            <span className="truncate">Property Specs</span>
          </button>
          <button 
            type="button"
            className={`relative flex-1 py-1.5 px-2 text-xs font-extrabold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer z-10 ${
              activeTab === "AI" 
                ? "text-[#2f7d6d] dark:text-emerald-400" 
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
            onClick={() => setActiveTab("AI")}
          >
            {activeTab === "AI" && (
              <motion.div
                layoutId="activeCompareTabPill"
                className="absolute inset-0 bg-white dark:bg-slate-900 rounded-lg shadow-xs -z-10"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
              />
            )}
            <Sparkles size={14} className="shrink-0 text-amber-500 dark:text-amber-400" />
            <span className="truncate">Kerby AI</span>
          </button>
        </div>

        {/* Mobile View & Export Controls - Active during Data Sheet view */}
        {activeTab === "DATA" && (
          <div className="flex items-center gap-1.5 shrink-0">
            {onExportCsv && (
              <button
                type="button"
                onClick={onExportCsv}
                className="py-1.5 px-2.5 rounded-xl bg-[#2f7d6d] text-white font-bold text-xs transition shadow-2xs cursor-pointer flex items-center gap-1 shrink-0 active:scale-95"
                title="Export Sheet"
              >
                <FileSpreadsheet size={14} />
                <span>Export</span>
              </button>
            )}
            <div className="flex items-center gap-0.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("CARDS")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "CARDS"
                    ? "bg-white dark:bg-slate-900 text-primary dark:text-emerald-400 shadow-xs font-bold"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
                title="Card View"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("TABLE")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "TABLE"
                    ? "bg-white dark:bg-slate-900 text-primary dark:text-emerald-400 shadow-xs font-bold"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
                title="Table View"
              >
                <Table2 size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

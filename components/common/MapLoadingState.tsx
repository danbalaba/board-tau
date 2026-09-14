import React from "react";
import { MapPin, Sparkles } from "lucide-react";

interface MapLoadingStateProps {
  label?: string;
  height?: string;
}

export const MapLoadingState: React.FC<MapLoadingStateProps> = ({
  label = "Interactive TAU Campus Map",
  height = "h-full min-h-[220px]",
}) => {
  return (
    <div
      className={`w-full ${height} rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 relative overflow-hidden flex items-center justify-center p-6 shadow-inner`}
    >
      {/* Subtle Background Glow Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-slate-300/40 dark:border-slate-700/40 opacity-40" />
        <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full border border-slate-200/30 dark:border-slate-800/30 opacity-20" />
      </div>

      {/* Floating Glass Center Card */}
      <div className="relative z-10 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border border-white/60 dark:border-white/15 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col items-center gap-3 text-center max-w-xs transition-all">
        <div className="w-12 h-12 rounded-2xl bg-[#2f7d6d]/15 dark:bg-emerald-500/20 border border-[#2f7d6d]/30 dark:border-emerald-500/30 flex items-center justify-center text-[#2f7d6d] dark:text-emerald-400 shadow-inner">
          <MapPin className="w-6 h-6 text-[#2f7d6d] dark:text-emerald-400" />
        </div>

        <div>
          <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center justify-center gap-1.5 tracking-tight">
            {label} <Sparkles className="w-3.5 h-3.5 text-[#2f7d6d] dark:text-emerald-400 fill-[#2f7d6d] dark:fill-emerald-400" />
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-snug">
            Loading college landmarks & GPS coordinates...
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapLoadingState;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Clock, AlertTriangle, Lock } from 'lucide-react';

export function useKYCLockout() {
  const [remainingMs, setRemainingMs] = useState<number>(0);

  useEffect(() => {
    const checkLockout = () => {
      let targetTime = 0;
      try {
        const stored = localStorage.getItem('kycLockoutUntil');
        if (stored) {
          targetTime = parseInt(stored, 10);
        }
      } catch (e) {}

      const diff = targetTime - Date.now();
      if (diff <= 0) {
        setRemainingMs(0);
        try {
          localStorage.removeItem('kycLockoutUntil');
        } catch (e) {}
      } else {
        setRemainingMs(diff);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    window.addEventListener('storage', checkLockout);
    window.addEventListener('kycLockoutTriggered', checkLockout);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkLockout);
      window.removeEventListener('kycLockoutTriggered', checkLockout);
    };
  }, []);

  const isLockedOut = remainingMs > 0;
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return { isLockedOut, remainingMs, timerText };
}

interface KYCLockoutBadgeProps {
  lockoutRemainingSeconds?: number;
  className?: string;
  onLockoutExpired?: () => void;
}

export const KYCLockoutBadge: React.FC<KYCLockoutBadgeProps> = ({
  lockoutRemainingSeconds,
  className = '',
  onLockoutExpired,
}) => {
  const { isLockedOut, timerText } = useKYCLockout();

  useEffect(() => {
    if (lockoutRemainingSeconds && lockoutRemainingSeconds > 0) {
      const targetTime = Date.now() + lockoutRemainingSeconds * 1000;
      try {
        localStorage.setItem('kycLockoutUntil', targetTime.toString());
        window.dispatchEvent(new Event('kycLockoutTriggered'));
      } catch (e) {}
    }
  }, [lockoutRemainingSeconds]);

  if (!isLockedOut) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        className={`p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 backdrop-blur-md text-amber-800 dark:text-amber-200 shadow-xl ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
            <ShieldAlert size={20} className="animate-pulse" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-100 flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-500" />
                KYC Verification Locked
              </h4>
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold bg-amber-500/20 px-2.5 py-1 rounded-full text-amber-700 dark:text-amber-300 border border-amber-500/30">
                <Clock size={12} className="animate-spin" />
                {timerText}
              </span>
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-300/80 leading-relaxed">
              Too many failed attempts. Verification is locked. Please wait until the timer expires before retrying.
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Full Lockout Card Overlay that replaces camera view when locked out
 */
export const KYCLockoutCard: React.FC<{ timerText: string }> = ({ timerText }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-50/95 via-amber-50/90 to-slate-100/95 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-black/95 text-slate-900 dark:text-white text-center rounded-[2.5rem] border-4 border-amber-400/40 dark:border-amber-500/30 shadow-2xl relative overflow-hidden transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent pointer-events-none" />
      
      <div className="p-4 rounded-3xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 mb-4 border border-amber-500/30 shadow-inner">
        <Lock size={36} className="animate-pulse text-amber-600 dark:text-amber-400" />
      </div>

      <h4 className="text-sm font-black uppercase tracking-wider text-amber-900 dark:text-amber-200 mb-1.5">
        Identity Verification Locked
      </h4>
      
      <p className="text-xs text-amber-800/90 dark:text-slate-300 max-w-[240px] leading-relaxed mb-5 font-medium">
        Multiple failed verification attempts detected. To protect system security, camera scan is temporarily locked.
      </p>

      <div className="inline-flex items-center gap-2 bg-amber-500/20 dark:bg-amber-500/20 px-4 py-2 rounded-full border border-amber-500/40 text-amber-900 dark:text-amber-300 font-mono font-bold text-xs sm:text-sm shadow-sm">
        <Clock size={16} className="animate-spin text-amber-600 dark:text-amber-400" />
        <span>Locked: {timerText} remaining</span>
      </div>
    </div>
  );
};

export default KYCLockoutBadge;

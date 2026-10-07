'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, KeyRound, X, Mail, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import OtpInput from '@/components/inputs/OtpInput';
import SpinnerMini from '@/components/common/Loader';
import { sendOTP, verifyOTP } from '@/services/user/otp/otp';
import { validateOTP } from '@/lib/validators';
import { toast } from '@/app/admin/components/ui/sonner';

interface AuditOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminEmail: string;
  onSuccess: () => void;
}

interface OtpFormData {
  otp: string;
}

export function AuditOtpModal({ isOpen, onClose, adminEmail, onSuccess }: AuditOtpModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [resendCooldown, setResendCooldown] = useState(30);
  const [otpAttemptLimitReached, setOtpAttemptLimitReached] = useState(false);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
  } = useForm<OtpFormData>({
    mode: 'onChange',
    defaultValues: {
      otp: '',
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const mainContainers = document.querySelectorAll('main, [data-slot="sidebar-inset"]');
    const containerStyles: Array<{ el: HTMLElement; overflow: string }> = [];

    mainContainers.forEach((el) => {
      const htmlEl = el as HTMLElement;
      containerStyles.push({ el: htmlEl, overflow: htmlEl.style.overflow });
      htmlEl.style.overflow = 'hidden';
    });

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      containerStyles.forEach(({ el, overflow }) => {
        el.style.overflow = overflow;
      });
    };
  }, [isOpen]);

  // Dispatch OTP on modal open
  useEffect(() => {
    if (isOpen && adminEmail) {
      reset({ otp: '' });
      setResendCooldown(30);
      setOtpAttemptLimitReached(false);
      setLockoutCountdown(0);

      sendOTP(adminEmail).then((res) => {
        if (res?.error) {
          const match = res.error.match(/Please wait (\d+) seconds/);
          if (match) {
            const secs = parseInt(match[1]);
            setResendCooldown(secs);
            toast.info(`Active verification code already sent. Resend available in ${secs}s.`);
          } else {
            toast.error(res.error);
          }
        } else {
          toast.success(`Security verification code sent to ${adminEmail}`);
        }
      });
    }
  }, [isOpen, adminEmail, reset]);

  // Resend cooldown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Lockout timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (lockoutCountdown > 0) {
      interval = setInterval(() => {
        setLockoutCountdown((prev) => {
          if (prev <= 1) {
            setOtpAttemptLimitReached(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutCountdown]);

  const handleResend = () => {
    if (!adminEmail || resendCooldown > 0 || otpAttemptLimitReached || isPending) return;

    startTransition(async () => {
      try {
        const res = await sendOTP(adminEmail);
        if (res?.error) {
          const match = res.error.match(/Please wait (\d+) seconds/);
          if (match) {
            const secs = parseInt(match[1]);
            setResendCooldown(secs);
            toast.error(res.error);
          } else {
            toast.error(res.error);
          }
        } else {
          setResendCooldown(30);
          toast.success('New security OTP sent to your admin email!');
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to resend security OTP');
      }
    });
  };

  const onSubmit = (data: OtpFormData) => {
    const { otp } = data;
    const otpErr = validateOTP(otp);
    if (otpErr) {
      setError('otp', { message: otpErr });
      return;
    }

    startTransition(async () => {
      try {
        const res = await verifyOTP(adminEmail, otp);
        if (res?.error) {
          const countdownMatch = res.error.match(/Please try again in (\d+) second\(s\)/);
          if (countdownMatch) {
            const secs = parseInt(countdownMatch[1]);
            setLockoutCountdown(secs);
            setOtpAttemptLimitReached(true);
            toast.error(res.error);
          } else {
            toast.error(res.error);
          }
          return;
        }

        toast.success('Authentication successful! Payload unlocked.');
        onSuccess();
        onClose();
      } catch (err: any) {
        toast.error(err.message || 'Verification failed');
      }
    });
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[10010] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-colors"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
                  <KeyRound size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Admin Verification
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    2-Factor Authorization Gate
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Email Banner */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-1.5 text-center">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <Mail size={14} className="text-amber-500" /> Authorized Admin
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {adminEmail || 'admin@boardtau.com'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                A 6-digit one-time code was dispatched to your inbox.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <OtpInput
                id="otp"
                label="Enter 6-Digit Security Code"
                disabled={isPending || otpAttemptLimitReached}
                register={register}
                errors={errors}
                watch={watch}
                required
                length={6}
              />

              {/* Resend Cooldown Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isPending || resendCooldown > 0 || otpAttemptLimitReached}
                  className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 hover:underline disabled:text-slate-400 dark:disabled:text-slate-600 disabled:no-underline cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  {resendCooldown > 0
                    ? `Resend available in ${resendCooldown}s`
                    : otpAttemptLimitReached
                    ? `Locked for ${lockoutCountdown}s`
                    : "Didn't receive code? Resend"}
                </button>
              </div>

              {lockoutCountdown > 0 && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs text-center font-bold flex items-center justify-center gap-2">
                  <ShieldAlert size={16} />
                  <span>Security Lockout: {lockoutCountdown}s remaining</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 h-11 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !watch('otp') || watch('otp').length !== 6 || otpAttemptLimitReached}
                  className="w-1/2 h-11 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isPending ? (
                    <SpinnerMini className="w-4 h-4 text-white" />
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Unlock Payload</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

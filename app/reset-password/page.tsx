"use client";

import React, { useState, useTransition, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, ResetPasswordFormValues } from "@/lib/validations/auth";
import { resetPassword } from "@/services/user/password-reset";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import Heading from "@/components/common/Heading";
import AuthInput from "@/components/inputs/AuthInput";
import Button from "@/components/common/Button";
import SpinnerMini from "@/components/common/Loader";
import Link from "next/link";
import { FaLock, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { motion, AnimatePresence, type Variants } from "framer-motion";

// ── Shared Variants ──────────────────────────────────────────────────────────

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const iconVariants: Variants = {
  hidden: { scale: 0.6, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 280, damping: 18, delay: 0.2 },
  },
};

// ── Main Content ─────────────────────────────────────────────────────────────

const ResetPasswordContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const responsiveToast = useResponsiveToast();

  const [token, setToken] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    // 🛡️ 1. Capture token immediately on mount
    const urlToken = searchParams.get("token");

    // 🛡️ 2. Fallback: If searchParams is empty (common during hydration bugs), check raw URL
    if (!urlToken && typeof window !== "undefined") {
      const rawParams = new URLSearchParams(window.location.search);
      const rawToken = rawParams.get("token");
      if (rawToken) setToken(rawToken);
    } else if (urlToken) {
      setToken(urlToken);
    }

    setIsMounted(true);
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = (data: ResetPasswordFormValues) => {
    startTransition(async () => {
      try {
        if (!token) throw new Error("Reset token is missing or has expired.");
        const result = await resetPassword(token, data.password);
        if (result?.error) {
          responsiveToast.error(result.error);
        } else if (result?.success) {
          setIsSuccess(true);
          responsiveToast.success("Password reset successfully!");
          setTimeout(() => router.push("/"), 3000);
        }
      } catch (error: any) {
        responsiveToast.error(error.message || "Failed to reset password.");
      }
    });
  };

  // 🛡️ While mounting, show a centered spinner
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <SpinnerMini className="w-10 h-10 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  // 🛡️ Invalid / missing token state
  if (!token && !isSuccess) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-900/50 p-3 sm:p-4">
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate={mounted ? "visible" : "hidden"}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden p-6 sm:p-10 text-center border border-slate-200 dark:border-slate-800"
        >
          <motion.div variants={stagger} initial="hidden" animate={mounted ? "visible" : "hidden"}>
            <motion.div variants={iconVariants} className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center">
                <FaExclamationTriangle className="w-8 h-8 text-red-500" />
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Heading
                title="Invalid Link"
                subtitle="This password reset link is missing or invalid. Please request a new one."
                center
              />
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8">
              <Link href="/forgot-password">
                <Button className="w-full">Request New Link</Button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ── Main Card ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-slate-900/50 p-3 sm:p-4">
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate={mounted ? "visible" : "hidden"}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
      >
        <div className="p-6 sm:p-10">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              /* ── Form State ── */
              <motion.div
                key="form"
                variants={stagger}
                initial="hidden"
                animate={mounted ? "visible" : "hidden"}
                exit={{ opacity: 0, y: -16, transition: { duration: 0.25 } }}
              >
                {/* Icon */}
                <motion.div variants={iconVariants} className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                    <FaLock className="w-8 h-8 text-blue-500" />
                  </div>
                </motion.div>

                {/* Heading */}
                <motion.div variants={fadeUp}>
                  <Heading
                    title="Create New Password"
                    subtitle="Your new password must be different from previous passwords."
                    center
                  />
                </motion.div>

                {/* Form */}
                <motion.form
                  variants={fadeUp}
                  onSubmit={handleSubmit(onSubmit)}
                  className="mt-8 space-y-6"
                >
                  <AuthInput
                    id="password"
                    label="New Password"
                    type="password"
                    disabled={isPending}
                    register={register}
                    errors={errors}
                    required
                    watch={watch}
                    placeholder="••••••••"
                  />

                  <AuthInput
                    id="confirmPassword"
                    label="Confirm New Password"
                    type="password"
                    disabled={isPending}
                    register={register}
                    errors={errors}
                    required
                    watch={watch}
                    placeholder="••••••••"
                  />

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full flex items-center justify-center h-12"
                  >
                    {isPending ? <SpinnerMini className="w-5 h-5" /> : "Reset Password"}
                  </Button>
                </motion.form>
              </motion.div>
            ) : (
              /* ── Success State ── */
              <motion.div
                key="success"
                variants={stagger}
                initial="hidden"
                animate={mounted ? "visible" : "hidden"}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                {/* Pulsing check icon */}
                <motion.div variants={iconVariants} className="flex items-center justify-center mb-6">
                  <motion.div
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center"
                  >
                    <FaCheckCircle className="w-8 h-8 text-green-500" />
                  </motion.div>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <Heading
                    title="Success!"
                    subtitle="Your password has been securely updated."
                    center
                  />
                </motion.div>

                <motion.p variants={fadeUp} className="mt-4 text-slate-500 text-sm">
                  Redirecting you to the home page...
                </motion.p>

                <motion.div variants={fadeUp} className="mt-8">
                  <SpinnerMini className="w-8 h-8 mx-auto text-blue-500" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

// ── Page Shell ───────────────────────────────────────────────────────────────

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-900/50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <SpinnerMini className="w-10 h-10 text-blue-500" />
          </motion.div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

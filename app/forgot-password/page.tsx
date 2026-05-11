"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordFormValues } from "@/lib/validations/auth";
import { requestPasswordReset } from "@/services/user/password-reset";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import Heading from "@/components/common/Heading";
import AuthInput from "@/components/inputs/AuthInput";
import Button from "@/components/common/Button";
import SpinnerMini from "@/components/common/Loader";
import Link from "next/link";
import { FaEnvelope, FaChevronLeft } from "react-icons/fa";
import { motion, AnimatePresence, type Variants } from "framer-motion";

// Shared animation variants
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

const ForgotPasswordPage = () => {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const responsiveToast = useResponsiveToast();

  useEffect(() => { setMounted(true); }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    startTransition(async () => {
      try {
        const result = await requestPasswordReset(data.email);
        if (result.success) {
          setIsSuccess(true);
          responsiveToast.success("Reset link sent! Please check your email.");
        }
      } catch (error: any) {
        responsiveToast.error(error.message);
      }
    });
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-slate-900/50 p-3 sm:p-4 transition-colors duration-500">
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate={mounted ? "visible" : "hidden"}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
      >
        <div className="p-6 sm:p-10">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={mounted ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-500 transition-colors mb-8"
            >
              <FaChevronLeft className="w-3 h-3" />
              Back to Home
            </Link>
          </motion.div>

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
                <motion.div
                  variants={iconVariants}
                  className="flex items-center justify-center mb-6"
                >
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                    <FaEnvelope className="w-8 h-8 text-blue-500" />
                  </div>
                </motion.div>

                {/* Heading */}
                <motion.div variants={fadeUp}>
                  <Heading
                    title="Forgot Password?"
                    subtitle="No worries! Enter your email and we'll send you a link to reset your password."
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
                    id="email"
                    label="Email Address"
                    disabled={isPending}
                    register={register}
                    errors={errors}
                    required
                    watch={watch}
                    placeholder="your-email@example.com"
                  />

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full flex items-center justify-center h-12"
                  >
                    {isPending ? <SpinnerMini className="w-5 h-5" /> : "Send Reset Link"}
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
                {/* Animated check icon */}
                <motion.div
                  variants={iconVariants}
                  className="flex items-center justify-center mb-6"
                >
                  <motion.div
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center"
                  >
                    <FaEnvelope className="w-8 h-8 text-green-500" />
                  </motion.div>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <Heading
                    title="Check your email"
                    subtitle="We've sent a password reset link to your email address."
                    center
                  />
                </motion.div>

                <motion.p
                  variants={fadeUp}
                  className="mt-4 text-slate-500 text-sm"
                >
                  If you don't see it, check your spam folder.
                </motion.p>

                <motion.div variants={fadeUp} className="mt-8">
                  <Link href="/">
                    <Button outline className="w-full">
                      Return Home
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;

"use client";
import React, { useTransition, useState, useEffect } from "react";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaCheckCircle } from "react-icons/fa";
import { LogIn, UserPlus, ShieldCheck, X } from "lucide-react";
import { motion, useDragControls } from "framer-motion";
import { useResponsiveToast } from "../common/ResponsiveToast";
import Link from "next/link";
import Heading from "../common/Heading";
import AuthInput from "../inputs/AuthInput";
import OtpInput from "../inputs/OtpInput";
import Button from "../common/Button";
import Modal from "./Modal";
import SpinnerMini from "../common/Loader";
import { registerUser } from "@/services/auth";
import { sendOTP, verifyOTP } from "@/services/user/otp";
import { validateOTP } from "@/lib/validators";
import { createRestrictionToken } from "@/lib/security-tokens";
import {
  signupResolver,
  loginResolver,
  otpResolver,
  SignupFormValues,
  LoginFormValues,
  OtpFormValues
} from "./hooks/use-auth-validation";

const AuthModal = ({
  name,
  onCloseModal,
}: {
  name?: string;
  onCloseModal?: () => void;
}) => {
  const responsiveToast = useResponsiveToast();
  const [isLoading, startTransition] = useTransition();
  const [title, setTitle] = useState(name || "");
  const [isOTPModal, setIsOTPModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpAttemptLimitReached, setOtpAttemptLimitReached] = useState(false);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);

  const dragControls = useDragControls();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isLoginModal = title === "Login";
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
    setFocus,
  } = useForm<SignupFormValues | LoginFormValues | OtpFormValues>({
    resolver: (isOTPModal ? otpResolver : isLoginModal ? loginResolver : signupResolver) as any,
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      name: "",
      otp: "",
    },
  });
   const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoginModal) {
        setFocus("email");
      } else if (isOTPModal) {
        setFocus("otp");
      } else {
        setFocus("name");
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isLoginModal, isOTPModal, setFocus]);

  const onToggle = () => {
    const newTitle = isLoginModal ? "Sign up" : "Login";
    setTitle(newTitle);
    reset();
  };

  const onSubmit = (data: any) => {
    const { email, password, name, otp } = data;

    startTransition(async () => {
      try {
        if (isOTPModal) {
          // Verify OTP
            try {
              // Client-side validation for OTP
              const otpError = validateOTP(otp);
              if (otpError) {
                setError("otp", { message: otpError });
                return;
              }

              const result = await verifyOTP(userEmail, otp);

              if (result?.error) {
                throw new Error(result.error);
              }

              responsiveToast.success("Email verified successfully!");
              setIsOTPModal(false);
              setTitle("Login");
              setOtpAttemptLimitReached(false);
              setLockoutCountdown(0);
              reset();
            } catch (error: any) {
              // Check if OTP attempt limit was reached and extract countdown
              const countdownMatch = error.message.match(/Please try again in (\d+) second\(s\)/);
              if (countdownMatch) {
                const countdownSeconds = parseInt(countdownMatch[1]);
                setLockoutCountdown(countdownSeconds);
                setOtpAttemptLimitReached(true);
                responsiveToast.error(error.message, {
                  duration: Math.min(countdownSeconds, 5) * 1000, // Max 5 seconds
                });
              } else if (error.message.includes("attempt(s) remaining")) {
                // Show remaining attempts with shorter duration
                responsiveToast.error(error.message, {
                  duration: 3000,
                });
              } else if (error.message.includes("temporarily locked")) {
                onCloseModal?.();
                router.push(`/auth/locked?email=${encodeURIComponent(userEmail)}&secure=1`);
              } else {
                responsiveToast.error(error.message);
              }
            }
        } else if (isLoginModal) {
          // Login
          const callback = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });

          // Check if NextAuth redirected to a restriction page or returned a restriction error
          const targetUrl = callback?.url || "";
          const targetError = callback?.error || "";

          if (
            targetUrl.includes("AccountSuspended") || 
            targetUrl.includes("/auth/suspended") || 
            targetError.includes("AccountSuspended")
          ) {
            onCloseModal?.();
            window.location.href = `/api/auth/error?error=AccountSuspended:${encodeURIComponent(email)}`;
            return;
          }

          if (
            targetUrl.includes("AccountBanned") || 
            targetUrl.includes("/auth/banned") || 
            targetError.includes("AccountBanned")
          ) {
            onCloseModal?.();
            window.location.href = `/api/auth/error?error=AccountBanned:${encodeURIComponent(email)}`;
            return;
          }

          if (
            targetUrl.includes("AccountLocked") || 
            targetUrl.includes("/auth/locked") || 
            targetError.includes("AccountLocked")
          ) {
            responsiveToast.error(
              "Access Denied: Your account is currently under a 24-hour security lock due to multiple failed OTP attempts. Please try again later or contact support.",
              { duration: 5000 }
            );
            setTimeout(() => {
              onCloseModal?.();
              window.location.href = `/api/auth/error?error=AccountLocked:${encodeURIComponent(email)}`;
            }, 2000);
            return;
          }

          if (callback?.error) {
            // If login failed because email is not verified, open OTP modal
            if (callback.error.includes("Email not verified")) {
              setUserEmail(email);
              setIsOTPModal(true);
              setResendCooldown(30);
              responsiveToast.error("Please verify your email first");
            } else {
              throw new Error(callback.error);
            }
          } else if (callback?.ok) {
            responsiveToast.success("You've successfully logged in.", {
              duration: 3000,
            });
            onCloseModal?.();

            // Fetch fresh user role with cache-busting to determine post-login redirect
            let role: string | undefined;
            try {
              const response = await fetch(`/api/auth/session?t=${Date.now()}`, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' },
              });
              const sessionData = await response.json();
              role = sessionData?.user?.role?.toUpperCase();
            } catch (err) {
              console.warn('[AuthModal] Failed to fetch session post-login', err);
            }

            const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
            const callbackUrl = urlParams?.get('callbackUrl');

            if (callbackUrl && callbackUrl !== '/') {
              router.push(callbackUrl);
            } else if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
              router.push('/admin');
              router.refresh();
            } else if (role === 'LANDLORD' || role === 'HOST') {
              router.push('/landlord');
              router.refresh();
            } else {
              router.refresh(); // Default to refresh for regular tenants
            }
          }
        } else {
          // Signup
          const result = await registerUser({ email, password, name });
          
          if (result?.error) {
            throw new Error(result.error);
          }

          setUserEmail(email);
          setIsOTPModal(true);
          setResendCooldown(30);
          responsiveToast.success("OTP sent to your email!");
        }
      } catch (error: any) {
        if (error.message.includes("AccountLocked")) {
          const email = watch("email") || userEmail;
          responsiveToast.error(
            "Access Denied: Your account is currently under a 24-hour security lock due to multiple failed OTP attempts. Please try again later or contact support.",
            { duration: 5000 }
          );

          setTimeout(() => {
            onCloseModal?.();
            window.location.href = `/api/auth/error?error=AccountLocked:${encodeURIComponent(email || userEmail)}`;
          }, 2000);
        } else if (error.message.includes("AccountSuspended")) {
          const parts = error.message.split(":");
          const targetEmail = parts.length > 1 && parts[1] ? parts[1] : (watch("email") || userEmail);
          onCloseModal?.();
          window.location.href = `/api/auth/error?error=AccountSuspended:${encodeURIComponent(targetEmail)}`;
        } else if (error.message.includes("AccountBanned")) {
          const parts = error.message.split(":");
          const targetEmail = parts.length > 1 && parts[1] ? parts[1] : (watch("email") || userEmail);
          onCloseModal?.();
          window.location.href = `/api/auth/error?error=AccountBanned:${encodeURIComponent(targetEmail)}`;
        } else {
          responsiveToast.error(error.message);
        }
        if (isLoginModal) {
          reset();
          setError("email", {});
          setError("password", {});
          setTimeout(() => {
            setFocus("email");
          }, 100);
        }
      }
    });
  };

  const resendOTP = async () => {
    startTransition(async () => {
      try {
        const result = await sendOTP(userEmail);
        if (result?.error) {
          throw new Error(result.error);
        }
        setResendCooldown(30);
        responsiveToast.success("New OTP sent to your email!", {
          duration: 4000,
        });
        setOtpAttemptLimitReached(false); // Reset attempt limit state
      } catch (error: any) {
        // Parse error message to extract cooldown time
        const cooldownMatch = error.message.match(/Please wait (\d+) seconds/);
        if (cooldownMatch) {
          const cooldownSeconds = parseInt(cooldownMatch[1]);
          setResendCooldown(cooldownSeconds);
          responsiveToast.error(error.message, {
            duration: cooldownSeconds * 1000, // Show toast for duration of cooldown
          });
        } else {
          responsiveToast.error(error.message);
          setResendCooldown(0); // Clear cooldown if there's an error
        }
      }
    });
  };

  // Cooldown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Lockout countdown timer effect
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

  return (
    <motion.div
      drag={isMobile ? "y" : false}
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.05, bottom: 0.8 }}
      onDragEnd={(e, { offset, velocity }) => {
        if (isMobile && (offset.y > 70 || velocity.y > 250)) {
          onCloseModal?.();
        }
      }}
      className="h-full w-full bg-white dark:bg-gray-900 rounded-t-[32px] sm:rounded-card overflow-hidden border-t sm:border border-gray-100 dark:border-gray-800 shadow-2xl flex flex-col min-h-0"
    >
      {/* Sleek Top Drag Handle Bar on Mobile (matching SearchModal & UserMobileFilterSheet) */}
      <div 
        onPointerDown={(e) => isMobile && dragControls.start(e)}
        className="w-full pt-3.5 pb-1 flex items-center justify-center shrink-0 touch-none sm:hidden cursor-grab active:cursor-grabbing"
      >
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors" />
      </div>

      {/* Top Header Bar matching SearchModal & UserMobileFilterSheet */}
      <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 text-primary dark:text-emerald-400 border border-primary/20 shrink-0">
            {isOTPModal ? (
              <ShieldCheck className="w-5 h-5" />
            ) : isLoginModal ? (
              <LogIn className="w-5 h-5" />
            ) : (
              <UserPlus className="w-5 h-5" />
            )}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              {isOTPModal ? "Verify Email" : isLoginModal ? "BoardTAU Login" : "Create Account"}
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
              {isOTPModal
                ? "Security verification"
                : isLoginModal
                ? "Welcome back! Login to your account"
                : "Join the BoardTAU community"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCloseModal}
          className="p-2 rounded-full hover:bg-gray-200/60 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Modal Content Body */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 pb-8 custom-scrollbar">
        <form
          className="flex flex-col gap-4 sm:gap-5 w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          {isOTPModal ? (
            <>
              <div className="flex items-center justify-center mb-2 sm:mb-4">
                <FaEnvelope className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
              </div>
              <Heading
                title="Check your email"
                subtitle="We've sent a verification code to your email"
              />
              <div className="text-center mb-3 sm:mb-4 bg-primary/5 py-2 px-3 rounded-xl border border-primary/10 backdrop-blur-sm">
                <p className="text-xs sm:text-sm font-bold text-primary dark:text-emerald-400 tracking-wide truncate">{userEmail}</p>
              </div>
                <OtpInput
                  id="otp"
                  label="Verification Code"
                  disabled={isLoading || otpAttemptLimitReached}
                  register={register}
                  errors={errors}
                  watch={watch}
                  required
                  length={6}
                />
                <div className="flex justify-center mt-3 sm:mt-4">
                    <button
                      type="button"
                      onClick={resendOTP}
                      className="text-sm sm:text-xs text-primary hover:text-primary/90 dark:text-emerald-400 dark:hover:text-emerald-300 font-black uppercase tracking-widest disabled:text-gray-500 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 cursor-pointer py-1.5"
                      disabled={isLoading || resendCooldown > 0 || otpAttemptLimitReached}
                    >
                      {resendCooldown > 0
                        ? `New code in ${resendCooldown}s`
                        : otpAttemptLimitReached
                        ? `Locked for ${lockoutCountdown}s`
                        : "Didn't get it? Resend"}
                    </button>
                </div>
                {lockoutCountdown > 0 && (
                  <div className="text-center text-rose-500 font-black text-xs sm:text-[10px] uppercase tracking-widest my-3 bg-rose-500/5 py-2.5 sm:py-2 rounded-lg border border-rose-500/10">
                    Security Lockout: {lockoutCountdown} seconds remaining
                  </div>
                )}
                <div className="mt-4 sm:mt-6">
                  <Button
                    type="submit"
                    className="flex items-center justify-center h-[52px] sm:h-[46px] w-full rounded-2xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white font-extrabold uppercase tracking-wider text-sm sm:text-sm cursor-pointer transition-all active:scale-[0.99]"
                    disabled={isLoading || !watch("otp") || watch("otp").length !== 6 || otpAttemptLimitReached}
                  >
                    {isLoading ? <SpinnerMini className="w-5 h-5" /> : "Verify Identity"}
                  </Button>
                </div>
            </>
          ) : (
            <>
              <Heading
                title={!isLoginModal ? "Welcome to BoardTAU" : "Welcome back"}
                subtitle={
                  title === "Sign up"
                    ? "Create an account!"
                    : "Login to your account!"
                }
              />

              {!isLoginModal && (
                <AuthInput
                  id="name"
                  label="Full Name"
                  disabled={isLoading}
                  register={register}
                  errors={errors}
                  required
                  watch={watch}
                  placeholder="John Doe"
                />
              )}

              <AuthInput
                id="email"
                label="Email"
                disabled={isLoading}
                register={register}
                errors={errors}
                required
                watch={watch}
                placeholder="email@boardtau.com"
              />

              <AuthInput
                id="password"
                label="Password"
                type="password"
                disabled={isLoading}
                register={register}
                errors={errors}
                required
                watch={watch}
                placeholder="••••••••"
              />

              {isLoginModal && (
                <div className="flex justify-end -mt-1 sm:-mt-2">
                  <Link
                    href="/forgot-password"
                    onClick={() => onCloseModal?.()}
                    className="text-sm sm:text-xs text-primary hover:underline font-extrabold sm:font-bold transition-colors py-1 inline-block"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              <Button
                type="submit"
                className="flex items-center justify-center h-[52px] sm:h-[46px] w-full rounded-2xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white font-extrabold uppercase tracking-wider text-sm sm:text-sm cursor-pointer transition-all active:scale-[0.99]"
              >
                {isLoading ? <SpinnerMini className="w-5 h-5" /> : "Continue"}
              </Button>
            </>
          )}
        </form>

        {!isOTPModal && (
          <div className="flex flex-col gap-3.5 sm:gap-4 mt-4 pt-1">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
              <span className="flex-shrink mx-3 text-xs sm:text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">or</span>
              <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
            </div>
            <Button
              outline
              onClick={async () => {
                setIsOAuthLoading(true);
                const returnUrl = `${window.location.pathname}${window.location.search}`;
                signIn("google", { callbackUrl: returnUrl });
              }}
              disabled={isOAuthLoading}
              className="flex flex-row justify-center gap-3 sm:gap-2.5 items-center px-4 py-4 sm:py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm sm:text-sm font-bold shadow-xs active:scale-[0.99] cursor-pointer"
            >
              <FcGoogle className="w-6 h-6 sm:w-5 sm:h-5 shrink-0" />
              <span className="text-sm sm:text-sm font-bold">
                {isOAuthLoading ? "Signing in..." : "Continue with Google"}
              </span>
              {isOAuthLoading && <SpinnerMini className="w-4 h-4" />}
            </Button>
            <Button
              outline
              onClick={async () => {
                setIsOAuthLoading(true);
                const returnUrl = `${window.location.pathname}${window.location.search}`;
                signIn("facebook", { callbackUrl: returnUrl });
              }}
              disabled={isOAuthLoading}
              className="flex flex-row justify-center gap-3 sm:gap-2.5 items-center px-4 py-4 sm:py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm sm:text-sm font-bold shadow-xs active:scale-[0.99] cursor-pointer"
            >
              <FaFacebook className="w-6 h-6 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
              <span className="text-sm sm:text-sm font-bold">
                {isOAuthLoading ? "Signing in..." : "Continue with Facebook"}
              </span>
              {isOAuthLoading && <SpinnerMini className="w-4 h-4" />}
            </Button>
            <div className="text-neutral-500 dark:text-gray-400 text-center mt-3 sm:mt-2 pb-2">
              <div className="flex items-center justify-center flex-wrap gap-1 text-sm sm:text-xs">
                <span>
                  {!isLoginModal
                    ? "Already have an account?"
                    : "First time using BoardTAU?"}
                </span>
                <button
                  type="button"
                  onClick={onToggle}
                  className="text-primary dark:text-emerald-400 cursor-pointer hover:underline font-extrabold sm:font-bold text-sm sm:text-xs py-1 px-0.5"
                >
                  {!isLoginModal ? "Log in" : "Create an account"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AuthModal;

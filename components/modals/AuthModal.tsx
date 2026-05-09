"use client";
import React, { useTransition, useState, useEffect } from "react";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaCheckCircle } from "react-icons/fa";
import { useResponsiveToast } from "../common/ResponsiveToast";

import Heading from "../common/Heading";
import AuthInput from "../inputs/AuthInput";
import OtpInput from "../inputs/OtpInput";
import Button from "../common/Button";
import Modal from "./Modal";
import SpinnerMini from "../common/Loader";
import { registerUser } from "@/services/auth";
import { sendOTP, verifyOTP } from "@/services/user/otp";
import { validateOTP } from "@/lib/validators";
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
                router.push(`/auth/locked?email=${encodeURIComponent(userEmail)}`);
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

          if (callback?.error) {
            // If login failed because email is not verified, open OTP modal
            if (callback.error.includes("Email not verified")) {
              setUserEmail(email);
              setIsOTPModal(true);
              responsiveToast.error("Please verify your email first");
            } else {
              throw new Error(callback.error);
            }
          } else if (callback?.ok) {
            responsiveToast.success("You've successfully logged in.", {
              duration: 3000,
            });
            onCloseModal?.();

            // Fetch user role to determine redirect
            const response = await fetch('/api/auth/session');
            const sessionData = await response.json();

            if (sessionData.user?.role === 'admin') {
              router.push('/admin');
            } else if (sessionData.user?.role === 'landlord') {
              router.push('/landlord');
            } else {
              router.refresh(); // Default to refresh for regular users
            }
          }
        } else {
          // Signup
          await registerUser({ email, password, name });
          setUserEmail(email);
          setIsOTPModal(true);
          responsiveToast.success("OTP sent to your email!");
        }
      } catch (error: any) {
        if (error.message.includes("AccountLocked")) {
          const email = watch("email") || userEmail;
          responsiveToast.error(
            "Access Denied: Your account is currently under a 24-hour security lock due to multiple failed OTP attempts. Please try again later or contact support.",
            { duration: 5000 }
          );
          
          // Delayed redirect to give the user time to read the toast
          setTimeout(() => {
            onCloseModal?.();
            router.push(`/auth/locked?email=${encodeURIComponent(email || userEmail)}`);
          }, 2000);
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
    // Let the backend enforce the actual limits, we'll catch the error and set the timer
    // setResendCooldown(30); 

    startTransition(async () => {
      try {
        const result = await sendOTP(userEmail);
        if (result?.error) {
          throw new Error(result.error);
        }
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
    <div className="h-full w-full">
      <Modal.WindowHeader title={isOTPModal ? "Verify Email" : title} />

      <form
        className="flex flex-col gap-5 p-4 pb-0 md:gap-5 md:p-6 w-full"
        onSubmit={handleSubmit(onSubmit)}
      >
        {isOTPModal ? (
          <>
            <div className="flex items-center justify-center mb-4">
              <FaEnvelope className="w-12 h-12 text-blue-500" />
            </div>
            <Heading
              title="Check your email"
              subtitle="We've sent a verification code to your email"
            />
            <div className="text-center mb-4 bg-blue-500/5 py-2 rounded-xl border border-blue-500/10 backdrop-blur-sm">
              <p className="text-sm font-bold text-blue-500 dark:text-blue-400 tracking-wide">{userEmail}</p>
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
              <div className="flex justify-center mt-4">
                  <button
                    type="button"
                    onClick={resendOTP}
                    className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-black uppercase tracking-widest disabled:text-gray-500 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
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
                <div className="text-center text-rose-500 font-black text-[10px] uppercase tracking-widest my-4 bg-rose-500/5 py-2 rounded-lg border border-rose-500/10">
                  Security Lockout: {lockoutCountdown} seconds remaining
                </div>
              )}
              <div className="mt-6">
                <Button
                  type="submit"
                  className="flex items-center justify-center h-[48px] w-full rounded-2xl shadow-lg shadow-blue-500/20"
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
                label="Name"
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

            <Button
              type="submit"
              className="flex items-center justify-center h-[42px]"
            >
              {isLoading ? <SpinnerMini className="w-5 h-5" /> : "Continue"}
            </Button>
          </>
        )}
      </form>

      {!isOTPModal && (
        <div className="flex flex-col gap-4 mt-4 p-4 pt-0 md:gap-4 md:mt-0 md:p-6">
          <hr />
          <Button
            outline
            onClick={async () => {
              setIsOAuthLoading(true);
              try {
                const result = await signIn("google", {
                  callbackUrl: "/",
                  redirect: false,
                });

                console.log("Google signIn result:", result);

                if (result?.error) {
                  if (result.error === "OAuthAccountNotLinked") {
                    responsiveToast.error("An account with this email already exists. Please log in using your existing account type or use a different email.");
                  } else if (result.error.includes("AccountLocked")) {
                    // Extract email from error message if possible (format: AccountLocked:email)
                    const emailFromError = result.error.split(":")[1];
                    const finalEmail = emailFromError || watch("email") || userEmail;
                    
                    onCloseModal?.();
                    router.push(`/auth/locked?email=${encodeURIComponent(finalEmail)}`);
                  } else {
                    responsiveToast.error(`Failed to sign in. Error: ${result.error}`);
                  }
                } else if (result?.ok) {
                  responsiveToast.success("Successfully signed in!");
                  onCloseModal?.();
                  router.refresh();
                }
              } catch (error: any) {
                console.error("Google signIn error:", error);
                responsiveToast.error(`Failed to sign in. Error: ${error.message || "Unknown error"}`);
              } finally {
                setIsOAuthLoading(false);
              }
            }}
            disabled={isOAuthLoading}
            className="flex flex-row justify-center gap-2 items-center px-3 py-2"
          >
            <FcGoogle className="w-6 h-6" />
            <span className="text-[14px]">
              {isOAuthLoading ? "Signing in..." : "Continue with Google"}
            </span>
            {isOAuthLoading && <SpinnerMini className="w-4 h-4" />}
          </Button>
          <Button
            outline
            onClick={async () => {
              setIsOAuthLoading(true);
              try {
                const result = await signIn("facebook", {
                  callbackUrl: "/",
                  redirect: false,
                });

                if (result?.error) {
                  if (result.error.startsWith("OAuthAccountNotLinked")) {
                    const provider = result.error.split(":")[1];
                    responsiveToast.error(`An account with this email already exists. Please log in using your ${provider === "google" ? "Google" : "Facebook"} account or use a different email.`);
                  } else if (result.error.includes("AccountLocked")) {
                    onCloseModal?.();
                    router.push(`/auth/locked?email=${encodeURIComponent(watch("email") || userEmail)}`);
                  } else {
                    responsiveToast.error("Failed to sign in. Please try again.");
                  }
                } else if (result?.ok) {
                  responsiveToast.success("Successfully signed in!");
                  onCloseModal?.();
                  router.refresh();
                }
              } catch (error) {
                responsiveToast.error("Failed to sign in. Please try again.");
              } finally {
                setIsOAuthLoading(false);
              }
            }}
            disabled={isOAuthLoading}
            className="flex flex-row justify-center gap-2 items-center px-3 py-2"
          >
            <FaFacebook className="w-6 h-6 text-blue-600" />
            <span className="text-[14px]">
              {isOAuthLoading ? "Signing in..." : "Continue with Facebook"}
            </span>
            {isOAuthLoading && <SpinnerMini className="w-4 h-4" />}
          </Button>
          <div
            className="
              text-neutral-500
              dark:text-gray-400
            text-center
            mt-2
            font-light
          "
          >
            <div className="text-[15px]">
              <small className="text-[15px]">
                {!isLoginModal
                  ? "Already have an account?"
                  : "First time using BoardTAU?"}
              </small>
              <button
                type="button"
                onClick={onToggle}
                className="
                text-neutral-800
                dark:text-white
                cursor-pointer
                hover:underline
                ml-1
                font-medium
                "
              >
                {!isLoginModal ? "Log in" : "Create an account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthModal;

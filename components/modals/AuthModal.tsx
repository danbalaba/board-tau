"use client";
import React, { useTransition, useState, useEffect } from "react";
import { AiFillGithub } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaCheckCircle } from "react-icons/fa";

import Heading from "../common/Heading";
import Input from "../inputs/Input";
import OtpInput from "../inputs/OtpInput";
import Button from "../common/Button";
import Modal from "./Modal";
import SpinnerMini from "../common/Loader";
import { registerUser } from "@/services/auth";
import { sendOTP, verifyOTP } from "@/services/user/otp";
import { validateEmail, validatePassword, validateName, validateOTP } from "@/lib/validators";

const AuthModal = ({
  name,
  onCloseModal,
}: {
  name?: string;
  onCloseModal?: () => void;
}) => {
  const [isLoading, startTransition] = useTransition();
  const [title, setTitle] = useState(name || "");
  const [isOTPModal, setIsOTPModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpAttemptLimitReached, setOtpAttemptLimitReached] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
    setFocus,
  } = useForm<FieldValues>({
    defaultValues: {
      email: "",
      password: "",
      name: "",
      otp: "",
    },
  });
  const router = useRouter();
  const isLoginModal = title === "Login";

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

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
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

            await verifyOTP(userEmail, otp);
            toast.success("Email verified successfully!");
            setIsOTPModal(false);
            setTitle("Login");
            setOtpAttemptLimitReached(false);
            reset();
          } catch (error: any) {
            // Check if OTP attempt limit was reached
            if (error.message.includes("OTP attempt limit reached")) {
              setOtpAttemptLimitReached(true);
            }
            toast.error(error.message);
          }
        } else if (isLoginModal) {
          // Client-side validation for login
          const emailError = validateEmail(email);
          const passwordError = validatePassword(password);

          if (emailError) {
            setError("email", { message: emailError });
            return;
          }

          if (passwordError) {
            setError("password", { message: passwordError });
            return;
          }

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
              toast.error("Please verify your email first");
            } else {
              throw new Error(callback.error);
            }
          } else if (callback?.ok) {
            toast.success("You've successfully logged in.");
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
          // Client-side validation for signup
          const nameError = validateName(name);
          const emailError = validateEmail(email);
          const passwordError = validatePassword(password);

          if (nameError) {
            setError("name", { message: nameError });
            return;
          }

          if (emailError) {
            setError("email", { message: emailError });
            return;
          }

          if (passwordError) {
            setError("password", { message: passwordError });
            return;
          }

          // Signup
          await registerUser({ email, password, name });
          setUserEmail(email);
          setIsOTPModal(true);
          toast.success("OTP sent to your email!");
        }
      } catch (error: any) {
        toast.error(error.message);
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
    // Set cooldown timer (60 seconds)
    setResendCooldown(60);

    startTransition(async () => {
      try {
        await sendOTP(userEmail);
        toast.success("New OTP sent to your email!");
        setOtpAttemptLimitReached(false); // Reset attempt limit state
      } catch (error: any) {
        toast.error(error.message);
        setResendCooldown(0); // Clear cooldown if there's an error
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

  return (
    <div className="h-full w-full">
      <Modal.WindowHeader title={isOTPModal ? "Verify Email" : title} />

      <form
        className="flex flex-col gap-5 p-6 pb-0 w-full h-full"
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
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">{userEmail}</p>
            </div>
            <OtpInput
              id="otp"
              label="Verification Code"
              disabled={isLoading}
              register={register}
              errors={errors}
              watch={watch}
              required
              length={6}
            />
            <Button
              type="submit"
              className="flex items-center justify-center h-[42px]"
              disabled={isLoading || !watch("otp") || watch("otp").length !== 6 || otpAttemptLimitReached}
            >
              {isLoading ? <SpinnerMini className="w-5 h-5" /> : "Verify Email"}
            </Button>
            <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={resendOTP}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                  disabled={isLoading || resendCooldown > 0}
                >
                  {resendCooldown > 0
                    ? `Resend OTP in ${resendCooldown}s`
                    : "Didn't receive code? Resend"}
                </button>
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
              <Input
                id="name"
                label="Name"
                disabled={isLoading}
                register={register}
                errors={errors}
                required
                watch={watch}
              />
            )}

            <Input
              id="email"
              label="Email"
              disabled={isLoading}
              register={register}
              errors={errors}
              required
              watch={watch}
            />

            <Input
              id="password"
              label="Password"
              type="password"
              disabled={isLoading}
              register={register}
              errors={errors}
              required
              watch={watch}
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
        <div className="flex flex-col gap-4 mt-3 p-6 pt-0">
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
                    toast.error("An account with this email already exists. Please log in using your existing account type or use a different email.");
                  } else {
                    toast.error(`Failed to sign in. Error: ${result.error}`);
                  }
                } else if (result?.ok) {
                  toast.success("Successfully signed in!");
                  onCloseModal?.();
                  router.refresh();
                }
              } catch (error: any) {
                console.error("Google signIn error:", error);
                toast.error(`Failed to sign in. Error: ${error.message || "Unknown error"}`);
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
                const result = await signIn("github", {
                  callbackUrl: "/",
                  redirect: false,
                });

                if (result?.error) {
                  if (result.error.startsWith("OAuthAccountNotLinked")) {
                    const provider = result.error.split(":")[1];
                    toast.error(`An account with this email already exists. Please log in using your ${provider === "google" ? "Google" : "GitHub"} account or use a different email.`);
                  } else {
                    toast.error("Failed to sign in. Please try again.");
                  }
                } else if (result?.ok) {
                  toast.success("Successfully signed in!");
                  onCloseModal?.();
                  router.refresh();
                }
              } catch (error) {
                toast.error("Failed to sign in. Please try again.");
              } finally {
                setIsOAuthLoading(false);
              }
            }}
            disabled={isOAuthLoading}
            className="flex flex-row justify-center gap-2 items-center px-3 py-2"
          >
            <AiFillGithub className="w-6 h-6" />
            <span className="text-[14px]">
              {isOAuthLoading ? "Signing in..." : "Continue with Github"}
            </span>
            {isOAuthLoading && <SpinnerMini className="w-4 h-4" />}
          </Button>
          <div
            className="
              text-neutral-500
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

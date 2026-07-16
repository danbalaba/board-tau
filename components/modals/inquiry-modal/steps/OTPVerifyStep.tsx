import React, { useState, useEffect } from "react";
import { FaShieldAlt } from "react-icons/fa";
import OtpInput from "@/components/inputs/OtpInput";
import { FieldValues, UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import axios from "axios";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";

interface OTPVerifyStepProps {
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors<FieldValues>;
  watch: UseFormWatch<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
  userEmail: string;
  resendCooldown: number;
  setResendCooldown: (val: number | ((prev: number) => number)) => void;
  otpAttemptLimitReached: boolean;
  setOtpAttemptLimitReached: (val: boolean) => void;
  lockoutCountdown: number;
  setLockoutCountdown: (val: number | ((prev: number) => number)) => void;
}

const OTPVerifyStep: React.FC<OTPVerifyStepProps> = ({
  register,
  errors,
  watch,
  setValue,
  isProcessing,
  setIsProcessing,
  userEmail,
  resendCooldown,
  setResendCooldown,
  otpAttemptLimitReached,
  setOtpAttemptLimitReached,
  lockoutCountdown,
  setLockoutCountdown,
}) => {
  const responsiveToast = useResponsiveToast();

  // Watch the OTP value
  const otpValue = watch("otp") || "";

  const sendOTP = async () => {
    setIsProcessing(true);
    try {
      await axios.post("/api/inquiries/otp/send", { email: userEmail });
      responsiveToast.success("Security code sent to your email!", { duration: 4000 });
      setOtpAttemptLimitReached(false);
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message;
      const cooldownMatch = msg.match(/wait (\d+) seconds/);
      
      if (cooldownMatch) {
        const cooldownSeconds = parseInt(cooldownMatch[1], 10);
        setResendCooldown(cooldownSeconds);
        responsiveToast.error(msg, { duration: Math.min(cooldownSeconds, 5) * 1000 });
      } else {
        responsiveToast.error(msg);
      }
    } finally {
      setIsProcessing(false);
    }
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
  }, [resendCooldown, setResendCooldown]);

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
  }, [lockoutCountdown, setLockoutCountdown, setOtpAttemptLimitReached]);

  return (
    <div className="flex flex-col gap-5 p-4 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-inner">
          <FaShieldAlt className="text-3xl text-blue-500" />
        </div>
        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Security Verification</h3>
        <p className="text-xs text-gray-500 font-medium">To protect landlords from spam, please verify your identity before submitting this inquiry.</p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-500/20 text-center">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Code sent to</p>
        <p className="text-sm font-black text-blue-600 dark:text-blue-400 tracking-wide">{userEmail}</p>
      </div>

      <div className="px-2">
        <OtpInput
          id="otp"
          label="6-Digit Verification Code"
          disabled={isProcessing || otpAttemptLimitReached}
          register={register as any}
          errors={errors as any}
          watch={watch as any}
          required
          length={6}
        />
      </div>

      {lockoutCountdown > 0 && (
        <div className="text-center text-rose-500 font-black text-[10px] uppercase tracking-widest my-2 bg-rose-500/5 py-2 rounded-lg border border-rose-500/10 animate-pulse">
          Security Lockout: {lockoutCountdown} seconds remaining
        </div>
      )}

      <div className="flex justify-center mt-2">
        <button
          type="button"
          onClick={sendOTP}
          disabled={isProcessing || resendCooldown > 0 || otpAttemptLimitReached}
          className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-black uppercase tracking-widest disabled:text-gray-400 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
        >
          {resendCooldown > 0
            ? `Resend available in ${resendCooldown}s`
            : otpAttemptLimitReached
            ? `Locked for ${lockoutCountdown}s`
            : "Didn't receive code? Send again"}
        </button>
      </div>
    </div>
  );
};

export default OTPVerifyStep;

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
      setResendCooldown(30);
      responsiveToast.success("Inquiry confirmation code sent to your registered email!", { duration: 4500 });
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
    <div className="flex flex-col gap-4 p-5 bg-white dark:bg-gray-900/60 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center space-y-1.5">
        <div className="w-14 h-14 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-primary/20 shadow-inner text-primary">
          <FaShieldAlt className="text-2xl" />
        </div>
        <h3 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight uppercase">
          Step 7: Security Verification OTP
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
          To protect hosts from spam inquiries, enter the 6-digit confirmation code sent to your registered account.
        </p>
      </div>

      {/* Security Clarification Alert */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-3.5 flex items-start gap-3 text-left">
        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
          <FaShieldAlt size={14} />
        </div>
        <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300 font-medium">
          <strong className="font-extrabold uppercase tracking-wider block mb-0.5">Security Notice:</strong>
          The OTP code is sent to your <u>registered account email</u> below, NOT the contact details specified for the host in Step 2.
        </p>
      </div>

      {/* Account Email Display Card */}
      <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-2xl border border-primary/20 text-center shadow-inner">
        <p className="text-[10px] font-extrabold text-primary dark:text-primary-light uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
          Registered Account Email
        </p>
        <p className="text-sm font-black text-gray-900 dark:text-white tracking-wide select-all font-mono">
          {userEmail}
        </p>
      </div>

      {/* OTP 6-Digit Input Container */}
      <div className="w-full px-0 sm:px-2 py-1">
        <OtpInput
          id="otp"
          label="6-Digit Confirmation Code"
          disabled={isProcessing || otpAttemptLimitReached}
          register={register as any}
          errors={errors as any}
          watch={watch as any}
          required
          length={6}
        />
      </div>

      {lockoutCountdown > 0 && (
        <div className="text-center text-rose-500 font-extrabold text-[11px] uppercase tracking-widest my-1 bg-rose-50 dark:bg-rose-950/30 py-2.5 rounded-xl border border-rose-200 dark:border-rose-800/40 animate-pulse">
          Security Lockout: {lockoutCountdown} seconds remaining
        </div>
      )}

      <div className="flex justify-center mt-1">
        <button
          type="button"
          onClick={sendOTP}
          disabled={isProcessing || resendCooldown > 0 || otpAttemptLimitReached}
          className="text-xs text-primary hover:text-primary-hover font-extrabold uppercase tracking-widest disabled:text-gray-400 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 cursor-pointer py-1"
        >
          {resendCooldown > 0
            ? `Resend code in ${resendCooldown}s`
            : otpAttemptLimitReached
            ? `Locked for ${lockoutCountdown}s`
            : "Didn't receive code? Send again"}
        </button>
      </div>
    </div>
  );
};

export default OTPVerifyStep;

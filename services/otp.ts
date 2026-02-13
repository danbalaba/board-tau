"use server";

import { revalidateTag } from "next/cache";
import { generateAndStoreOTP, sendOTPEmail, verifyOTP as verifyOTPUtil } from "@/lib/otp";
import { validateEmail, validateOTP, sanitizeInput } from "@/lib/validators";

export const sendOTP = async (email: string) => {
  // Sanitize and validate input
  const sanitizedEmail = sanitizeInput(email);
  const emailError = validateEmail(sanitizedEmail);

  if (emailError) {
    throw new Error(emailError);
  }

  const otp = await generateAndStoreOTP(sanitizedEmail);
  await sendOTPEmail(sanitizedEmail, otp);
  return { success: 'OTP sent to your email' };
};

export const verifyOTP = async (email: string, otp: string) => {
  // Sanitize and validate inputs
  const sanitizedEmail = sanitizeInput(email);
  const sanitizedOTP = sanitizeInput(otp);

  const emailError = validateEmail(sanitizedEmail);
  const otpError = validateOTP(sanitizedOTP);

  if (emailError) {
    throw new Error(emailError);
  }

  if (otpError) {
    throw new Error(otpError);
  }

  await verifyOTPUtil(sanitizedEmail, sanitizedOTP);
  // Revalidate user data
  revalidateTag("user", "layout");
  return { success: 'Email verified successfully' };
};

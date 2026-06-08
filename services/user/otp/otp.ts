"use server";

import { revalidateTag } from "next/cache";
import { generateAndStoreOTP, sendOTPEmail, verifyOTP as verifyOTPUtil } from "@/lib/otp";
import { validateEmail, validateOTP, sanitizeInput } from "@/lib/validators";

export const sendOTP = async (email: string) => {
  try {
    // Sanitize and validate input
    const sanitizedEmail = sanitizeInput(email);
    const emailError = validateEmail(sanitizedEmail);

    if (emailError) {
      return { error: emailError };
    }

    const otp = await generateAndStoreOTP(sanitizedEmail);
    await sendOTPEmail(sanitizedEmail, otp);
    return { success: 'OTP sent to your email' };
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return { error: error.message || 'Failed to send OTP' };
  }
};

export const verifyOTP = async (email: string, otp: string) => {
  try {
    // Sanitize and validate inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedOTP = sanitizeInput(otp);

    const emailError = validateEmail(sanitizedEmail);
    const otpError = validateOTP(sanitizedOTP);

    if (emailError) {
      return { error: emailError };
    }

    if (otpError) {
      return { error: otpError };
    }

    await verifyOTPUtil(sanitizedEmail, sanitizedOTP);
    
    // Revalidate user data
    revalidateTag("user", "layout");
    
    return { success: 'Email verified successfully' };
  } catch (error: any) {
    console.error('OTP Verification Error:', error);
    return { error: error.message || 'Failed to verify OTP' };
  }
};

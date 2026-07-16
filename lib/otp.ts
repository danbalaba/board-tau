import { Resend } from 'resend';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { validateEmail, validateOTP, sanitizeInput } from '@/lib/validators';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

// Generate random 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

import { render } from '@react-email/render';
import OTPEmail from '@/emails/OTPEmail';
import InquiryOTPEmail from '@/emails/InquiryOTPEmail';
import React from 'react';

// Send OTP email
export const sendOTPEmail = async (email: string, otp: string) => {
  // Render the React component to HTML string
  const emailHtml = await render(React.createElement(OTPEmail, { otp }));
  if (process.env.NODE_ENV !== 'test') {
    console.log(`\n\n=== DEVELOPMENT OTP (CHECK HERE): ${otp} ===\n\n`);
  }

  try {
    const response = await resend.emails.send({
      from: `BoardTAU <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Your BoardTAU Email Verification OTP',
      html: emailHtml,
    });
    
    if (response.error) {
       console.warn("Resend limit reached or error. Proceeding for development.", response.error);
    }
    return response;
  } catch (error) {
    console.warn("Resend threw an error. Proceeding for development.", error);
    return { data: { id: "dev_mock_id" } };
  }
};

// Send Inquiry OTP email
export const sendInquiryOTPEmail = async (email: string, otp: string, userName: string = "User") => {
  const emailHtml = await render(React.createElement(InquiryOTPEmail, { otp, userName }));
  if (process.env.NODE_ENV !== 'test') {
    console.log(`\n\n=== DEVELOPMENT OTP (CHECK HERE): ${otp} ===\n\n`);
  }

  try {
    const response = await resend.emails.send({
      from: `BoardTAU <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Your BoardTAU Inquiry Verification OTP',
      html: emailHtml,
    });

    if (response.error) {
       console.warn("Resend limit reached or error. Proceeding for development.", response.error);
    }
    return response;
  } catch (error) {
    console.warn("Resend threw an error. Proceeding for development.", error);
    return { data: { id: "dev_mock_id" } };
  }
};


// Generate and store OTP for a user
export const generateAndStoreOTP = async (email: string) => {
  // Sanitize input to prevent XSS
  const sanitizedEmail = sanitizeInput(email);

  // Validate email
  const emailError = validateEmail(sanitizedEmail);
  if (emailError) {
    throw new Error(emailError);
  }

  // Check if user is permanently locked
  const permanentlyLocked = await db.emailOTP.findFirst({
    where: {
      email: sanitizedEmail,
      isPermanentlyLocked: true,
    },
  });

  if (permanentlyLocked) {
    throw new Error('Your account has been temporarily locked. Please contact support@boardtau.com');
  }

  // Check if user is currently locked out
  const activeLockout = await db.emailOTP.findFirst({
    where: {
      email: sanitizedEmail,
      lockoutUntil: { gt: new Date() },
    },
  });

  if (activeLockout && activeLockout.lockoutUntil) {
    const remainingSeconds = Math.ceil((activeLockout.lockoutUntil.getTime() - new Date().getTime()) / 1000);
    throw new Error(`Please wait ${remainingSeconds} seconds before requesting a new OTP.`);
  }

  // Check for existing OTP (active or expired) to preserve phase
  const existingOTP = await db.emailOTP.findFirst({
    where: {
      email: sanitizedEmail,
      used: false,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Progressive rate limiting for RESENDING OTP based on phase
  if (existingOTP) {
    // Calculate resend cooldown (usually half of the lockout duration for that phase)
    let resendCooldownSeconds: number;
    switch (existingOTP.lockoutPhase) {
      case 1: resendCooldownSeconds = 30; break;  // 30s for phase 1
      case 2: resendCooldownSeconds = 60; break;  // 60s for phase 2
      case 3: resendCooldownSeconds = 120; break; // 120s for phase 3
      case 4: resendCooldownSeconds = 240; break; // 240s for phase 4
      default: resendCooldownSeconds = 300; break; // 5 mins cap
    }

    const timeSinceLastRequest = Date.now() - existingOTP.createdAt.getTime();
    if (timeSinceLastRequest < resendCooldownSeconds * 1000) {
      const remainingSeconds = Math.ceil((resendCooldownSeconds * 1000 - timeSinceLastRequest) / 1000);
      throw new Error(`Please wait ${remainingSeconds} seconds before requesting a new OTP.`);
    }
  }

  // Generate new OTP
  const otp = generateOTP();
  const saltedOTP = `${process.env.OTP_SECRET!}${otp}`;
  const otpHash = await bcrypt.hash(saltedOTP, 12);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Create or update OTP record
  if (existingOTP) {
    // If existing record exists (even expired), update it with new OTP
    await db.emailOTP.update({
      where: { id: existingOTP.id },
      data: {
        otpHash,
        expiresAt,
        attempts: 0, // Reset attempts for new OTP
        lockoutUntil: null, // Clear any existing lockout
        createdAt: new Date(), // Update creation time for rate limiting
        updatedAt: new Date(),
        // Keep existing phase to continue progressive locking
      },
    });
  } else {
    // If no existing OTP record, create new one at phase 1
    await db.emailOTP.create({
      data: {
        email: sanitizedEmail,
        otpHash,
        expiresAt,
        attempts: 0,
        used: false,
        lockoutPhase: 1, // Start at phase 1 for new OTP records
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  return otp;
};

// Calculate lockout duration based on phase (Standard security policy)
const getPhaseLockoutDuration = (phase: number): number => {
  if (phase === 1) return 60;  // 1 minute
  if (phase === 2) return 120; // 2 minutes
  if (phase === 3) return 240; // 4 minutes
  return 86400; // 24 hours
};

// Verify OTP with phase-based progressive locking
export const verifyOTP = async (email: string, otp: string) => {
  // Sanitize inputs to prevent XSS
  const sanitizedEmail = sanitizeInput(email);
  const sanitizedOTP = sanitizeInput(otp);

  // Validate inputs
  const emailError = validateEmail(sanitizedEmail);
  const otpError = validateOTP(sanitizedOTP);

  if (emailError) {
    throw new Error(emailError);
  }

  if (otpError) {
    throw new Error(otpError);
  }

  // Check if user is permanently locked
  const permanentlyLocked = await db.emailOTP.findFirst({
    where: {
      email: sanitizedEmail,
      isPermanentlyLocked: true,
    },
  });

  if (permanentlyLocked) {
    throw new Error('Your account has been temporarily locked. Please contact support@boardtau.com');
  }

  // Check if user is currently locked out
  const activeLockout = await db.emailOTP.findFirst({
    where: {
      email: sanitizedEmail,
      lockoutUntil: { gt: new Date() },
    },
  });

  if (activeLockout && activeLockout.lockoutUntil) {
    const remainingSeconds = Math.ceil((activeLockout.lockoutUntil.getTime() - new Date().getTime()) / 1000);
    throw new Error(`OTP attempt limit reached. Please try again in ${remainingSeconds} second(s).`);
  }

  // Find active OTP record
  let otpRecord = await db.emailOTP.findFirst({
    where: {
      email: sanitizedEmail,
      expiresAt: { gt: new Date() },
      used: false,
    },
  });

  if (!otpRecord) {
    throw new Error('Invalid or expired OTP');
  }

  // Check phase attempt limit
  const maxAttemptsPerPhase = 3; // 3 attempts per phase

  // If phase has already completed, check if lockout has expired to allow new attempts
  if (otpRecord.attempts >= maxAttemptsPerPhase) {
    // If there's an active lockout, throw error
    if (otpRecord.lockoutUntil && otpRecord.lockoutUntil > new Date()) {
      const remainingSeconds = Math.ceil((otpRecord.lockoutUntil.getTime() - new Date().getTime()) / 1000);
      throw new Error(`OTP attempt limit reached. Please try again in ${remainingSeconds} second(s).`);
    }

    // If lockout has expired, reset only attempts (keep phase to continue increasing durations)
    await db.emailOTP.update({
      where: { id: otpRecord.id },
      data: {
        attempts: 0, // Reset attempts for current phase
        updatedAt: new Date(),
      },
    });

    // Re-fetch updated record
    otpRecord = await db.emailOTP.findFirst({
      where: {
        email: sanitizedEmail,
        expiresAt: { gt: new Date() },
        used: false,
      },
    });

    if (!otpRecord) {
      throw new Error('Invalid or expired OTP');
    }
  }

  // Verify OTP with OTP_SECRET
  const saltedOTP = `${process.env.OTP_SECRET!}${sanitizedOTP}`;
  const isOTPValid = await bcrypt.compare(saltedOTP, otpRecord.otpHash);

  if (!isOTPValid) {
    const newAttempts = otpRecord.attempts + 1;
    let lockoutUntil: Date | null = null;
    let currentPhase = otpRecord.lockoutPhase;

    if (newAttempts >= maxAttemptsPerPhase) {
      // Calculate duration for the CURRENT phase before incrementing
      const lockoutSeconds = getPhaseLockoutDuration(currentPhase);
      lockoutUntil = new Date(Date.now() + lockoutSeconds * 1000);
      
      // Increment phase for the NEXT round
      const nextPhase = currentPhase + 1;

      // Check if this was the final phase (Phase 4 completed)
      if (currentPhase >= 4) {
        await db.emailOTP.update({
          where: { id: otpRecord.id },
          data: {
            attempts: newAttempts,
            isPermanentlyLocked: true,
            lockoutUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            updatedAt: new Date(),
          },
        });

        // 🔐 AUTOMATED INTRUSION RESPONSE: Suspend the entire user account
        await db.user.update({
          where: { email: sanitizedEmail },
          data: { 
            isActive: false,
            restrictedReason: "Suspicious Activity: OTP Brute Force"
          }
        });

        throw new Error('AccountSuspended');
      }

      await db.emailOTP.update({
        where: { id: otpRecord.id },
        data: {
          attempts: newAttempts,
          lockoutUntil,
          lockoutPhase: nextPhase,
          updatedAt: new Date(),
        },
      });

      throw new Error(`OTP attempt limit reached. Please try again in ${lockoutSeconds} second(s).`);
    }

    await db.emailOTP.update({
      where: { id: otpRecord.id },
      data: {
        attempts: newAttempts,
        lockoutPhase: currentPhase,
        lockoutUntil: null, // No lockout yet if attempts < 3
        updatedAt: new Date(),
      },
    });

    const remainingAttempts = maxAttemptsPerPhase - newAttempts;
    throw new Error(`Invalid OTP. ${remainingAttempts} attempt(s) remaining.`);
  }

  // Mark OTP as used
  await db.emailOTP.update({
    where: { id: otpRecord.id },
    data: { used: true },
  });

  // Update user's emailVerified status
  await db.user.update({
    where: { email: sanitizedEmail },
    data: { emailVerified: new Date() } as any,
  });

  return true;
};

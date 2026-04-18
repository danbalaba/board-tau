import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { db } from '@/lib/db';
import { validateEmail, validateOTP, sanitizeInput } from '@/lib/validators';

// Email transporter configuration (using Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD,
  },
});

// Generate random 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email: string, otp: string) => {
  // Use your Vercel URL in production, fallback to localhost for development
  const baseUrl = process.env.NEXTAUTH_URL || 'https://board-tau-rho.vercel.app';
  const lightLogoUrl = `${baseUrl}/images/TauBOARD-Light.png`;
  const darkLogoUrl = `${baseUrl}/images/TauBOARD-Dark.png`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your BoardTAU Email Verification OTP',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BoardTAU Email Verification</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            line-height: 1.6;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            overflow: hidden;
          }
          .email-header {
            background: linear-gradient(135deg, #2F7D6D 0%, #1E5F50 100%);
            padding: 30px 40px;
            text-align: center;
          }
          .email-body {
            padding: 40px;
          }
          .greeting {
            font-size: 22px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 16px;
            text-align: center;
          }
          .intro {
            font-size: 16px;
            color: #64748b;
            margin-bottom: 30px;
            line-height: 1.7;
            text-align: center;
          }
          .otp-container {
            background: #f8fafc;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 20px 0;
            border: 2px solid #e2e8f0;
          }
          .otp-code {
            font-size: 42px;
            font-weight: 800;
            letter-spacing: 8px;
            color: #2F7D6D;
            font-family: 'Courier New', monospace;
            margin: 0;
            text-shadow: 0 2px 4px rgba(47, 125, 109, 0.1);
          }
          .otp-label {
            font-size: 14px;
            color: #94a3b8;
            margin-top: 12px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .info-section {
            background: #f0fdf4;
            border-left: 4px solid #22c55e;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
          }
          .info-text {
            font-size: 14px;
            color: #15803d;
            margin: 0;
          }
          .security-note {
            font-size: 14px;
            color: #64748b;
            margin-top: 24px;
            line-height: 1.6;
            text-align: center;
          }
          .email-footer {
            background-color: #f8fafc;
            padding: 30px 40px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
          }
          .footer-text {
            font-size: 13px;
            color: #94a3b8;
            margin-bottom: 12px;
          }
          .company-info {
            font-size: 12px;
            color: #cbd5e1;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
          }
          @media (max-width: 600px) {
            .email-body {
              padding: 30px 20px;
            }
            .email-header {
              padding: 25px 20px;
            }
            .otp-code {
              font-size: 32px;
              letter-spacing: 6px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <img src="${lightLogoUrl}" alt="BoardTAU Logo" style="height: 45px; width: auto; display: block; margin: 0 auto;">
          </div>
          <div class="email-body">
            <h1 class="greeting">Your One-Time Password (OTP) is</h1>
            
            <div class="otp-container">
              <p class="otp-code">${otp}</p>
              <p class="otp-label">Verification Code</p>
            </div>

            <p class="intro">
              Hi there, you attempted to log in to your BoardTAU account. Please enter the OTP to verify the request before you can access your account.
            </p>

            <div class="info-section">
              <p class="info-text" style="text-align: center;">
                <strong>Code Expires In:</strong> 10 minutes
              </p>
            </div>

            <p class="security-note">
              If you didn't request this verification code, please ignore this email or contact 
              <a href="mailto:support@boardtau.com" style="color: #2F7D6D; text-decoration: none;">support@boardtau.com</a>.
            </p>

            <!-- Branded Divider -->
            <div style="text-align: center; margin: 40px 0 20px;">
              <div style="border-top: 1px solid #e2e8f0; position: relative; margin-bottom: 20px;">
                <img src="${darkLogoUrl}" alt="BoardTAU" style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: white; padding: 0 15px; width: 25px;">
              </div>
            </div>

            <!-- Visit Us Button -->
            <div style="text-align: center; margin-bottom: 10px;">
              <a href="${baseUrl}" style="display: inline-block; border: 1.5px solid #2F7D6D; color: #2F7D6D; padding: 10px 25px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Visit us at BoardTAU.com
              </a>
            </div>
          </div>

          <div class="email-footer">
            <p class="footer-text">
              Need help? visit our
              <a href="${baseUrl}/help" style="color: #2F7D6D; text-decoration: none; font-weight: 600;">Help Center</a>
            </p>
            <div class="company-info">
              <p>© 2026 BoardTAU. All rights reserved.</p>
              <p>Macalampa, Camiling Tarlac</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
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

  // Progressive rate limiting based on phase (TESTING values)
  if (existingOTP) {
    // Calculate cooldown based on current phase
    let cooldownSeconds: number;
    switch (existingOTP.lockoutPhase) {
      case 1: cooldownSeconds = 5; break; // 5 seconds for phase 1
      case 2: cooldownSeconds = 10; break; // 10 seconds for phase 2
      case 3: cooldownSeconds = 15; break; // 15 seconds for phase 3
      case 4: cooldownSeconds = 30; break; // 30 seconds for phase 4
      default: cooldownSeconds = 60; break; // 60 seconds for phase 5+
    }

    const timeSinceLastRequest = Date.now() - existingOTP.createdAt.getTime();
    if (timeSinceLastRequest < cooldownSeconds * 1000) {
      const remainingSeconds = Math.ceil((cooldownSeconds * 1000 - timeSinceLastRequest) / 1000);
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

// Calculate lockout duration based on phase (TESTING values - lower for testing)
const getPhaseLockoutDuration = (phase: number): number => {
  if (phase === 1) return 30; // 30 seconds
  if (phase === 2) return 60; // 1 minute
  if (phase === 3) return 120; // 2 minutes
  if (phase === 4) return 240; // 4 minutes
  return 86400; // 24 hours (permanent lock)
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
    let newPhase = otpRecord.lockoutPhase;

    if (newAttempts >= maxAttemptsPerPhase) {
      newPhase = otpRecord.lockoutPhase + 1;

      if (newPhase >= 5) {
        const lockoutUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await db.emailOTP.update({
          where: { id: otpRecord.id },
          data: {
            attempts: newAttempts,
            isPermanentlyLocked: true,
            lockoutUntil: lockoutUntil,
            updatedAt: new Date(),
          },
        });

        const lockoutDate = lockoutUntil.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        });

        throw new Error(`Your account has been locked for security reasons. Please try again after ${lockoutDate}.`);
      }

      const lockoutSeconds = getPhaseLockoutDuration(newPhase);
      lockoutUntil = new Date(Date.now() + lockoutSeconds * 1000);
    }

    await db.emailOTP.update({
      where: { id: otpRecord.id },
      data: {
        attempts: newAttempts,
        lockoutPhase: newPhase,
        lockoutUntil,
        updatedAt: new Date(),
      },
    });

    const remainingAttempts = maxAttemptsPerPhase - newAttempts;
    if (remainingAttempts > 0) {
      throw new Error(`Invalid OTP. ${remainingAttempts} attempt(s) remaining.`);
    } else {
      const lockoutSeconds = getPhaseLockoutDuration(newPhase);
      throw new Error(`OTP attempt limit reached. Please try again in ${lockoutSeconds} second(s).`);
    }
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

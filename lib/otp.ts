import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { db } from '@/lib/db';
import { validateEmail, validateOTP, sanitizeInput } from '@/lib/validators';

// Email transporter configuration (using Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Generate random 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your BoardTAU Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333;">BoardTAU Email Verification</h2>
        <p style="font-size: 16px; color: #666;">Thank you for signing up for BoardTAU! Please use the following OTP to verify your email address.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 4px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #333;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #999;">This OTP will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
        <p style="font-size: 14px; color: #999;">Best regards,<br>BoardTAU Team</p>
      </div>
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

  // Check for existing OTP
  const existingOTP = await db.emailOTP.findFirst({
    where: {
      email: sanitizedEmail,
      expiresAt: { gt: new Date() },
      used: false,
    },
  });

  // Progressive rate limiting based on failed attempts
  if (existingOTP) {
    const timeSinceLastRequest = Date.now() - existingOTP.createdAt.getTime();

    let rateLimitSeconds: number;
    if (existingOTP.attempts < 2) {
      rateLimitSeconds = 10; // 10 seconds for first 2 failed attempts
    } else if (existingOTP.attempts < 5) {
      rateLimitSeconds = 30; // 30 seconds for 3-4 failed attempts
    } else {
      rateLimitSeconds = 60; // 1 minute for 5+ failed attempts
    }

    if (timeSinceLastRequest < rateLimitSeconds * 1000) {
      const remainingSeconds = Math.ceil((rateLimitSeconds * 1000 - timeSinceLastRequest) / 1000);
      throw new Error(`Please wait ${remainingSeconds} seconds before requesting a new OTP.`);
    }
  }

  // Generate new OTP
  const otp = generateOTP();
  const otpHash = await bcrypt.hash(otp, 12);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Create or update OTP record
  if (existingOTP) {
    await db.emailOTP.update({
      where: { id: existingOTP.id },
      data: {
        otpHash,
        expiresAt,
        attempts: 0, // Reset attempts for new OTP
        createdAt: new Date(), // Update creation time for rate limiting
      },
    });
  } else {
    await db.emailOTP.create({
      data: {
        email: sanitizedEmail,
        otpHash,
        expiresAt,
        attempts: 0,
        used: false,
      },
    });
  }

  return otp;
};

// Verify OTP
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

  // Find active OTP record
  const otpRecord = await db.emailOTP.findFirst({
    where: {
      email: sanitizedEmail,
      expiresAt: { gt: new Date() },
      used: false,
    },
  });

  if (!otpRecord) {
    throw new Error('Invalid or expired OTP');
  }

  // Check attempt limit
  if (otpRecord.attempts >= 5) {
    throw new Error('OTP attempt limit reached');
  }

  // Verify OTP
  const isOTPValid = await bcrypt.compare(sanitizedOTP, otpRecord.otpHash);

  if (!isOTPValid) {
    // Increment attempts
    await db.emailOTP.update({
      where: { id: otpRecord.id },
      data: { attempts: otpRecord.attempts + 1 },
    });

    const remainingAttempts = 5 - (otpRecord.attempts + 1);
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

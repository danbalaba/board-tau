"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { 
  forgotPasswordSchema, 
  resetPasswordSchema 
} from "@/lib/validations/auth";
import { sendPasswordResetEmail, sendOAuthReminderEmail } from "@/services/email/notifications";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";

/**
 * Request Password Reset
 * Generates a secure token, hashes it, and sends the reset email.
 */
export const requestPasswordReset = async (email: string) => {
  try {
    // 🛡️ Basic validation
    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message);
    }

    // 🔒 Security: Check for existing active tokens to prevent email bombing (15 min cooldown)
    const existingToken = await db.passwordResetToken.findFirst({
      where: { 
        email: email.toLowerCase(),
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) } // 15 minutes
      },
      orderBy: { createdAt: 'desc' }
    });

    if (existingToken) {
      const secondsLeft = Math.ceil((existingToken.createdAt.getTime() + 15 * 60 * 1000 - Date.now()) / 1000);
      const minutesLeft = Math.ceil(secondsLeft / 60);
      throw new Error(`Please wait ${minutesLeft} minute(s) before requesting another reset link.`);
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        accounts: true, 
        password: true,
        lastPasswordChangeAt: true 
      }
    });

    // 🔒 Security: Always return generic success to prevent account enumeration
    if (!user) {
      return { success: true };
    }

    // 🔒 Check 2-minute cooldown for recent password changes (optimized for live Capstone defense demos)
    if (user.lastPasswordChangeAt) {
      const timeSinceLastChange = Date.now() - user.lastPasswordChangeAt.getTime();
      if (timeSinceLastChange < 2 * 60 * 1000) { // 2 Minutes
        const nextAvailable = new Date(user.lastPasswordChangeAt.getTime() + 2 * 60 * 1000);
        const secondsLeft = Math.ceil((nextAvailable.getTime() - Date.now()) / 1000);
        throw new Error(`Security Lock: Password was recently changed. Please wait ${secondsLeft} second(s).`);
      }
    }

    // 🔒 Check if user is OAuth-only
    if (user.accounts.length > 0 && !user.password) {
      const provider = user.accounts[0].provider; // Get the provider (Google, Facebook, etc.)
      const formattedProvider = provider.charAt(0).toUpperCase() + provider.slice(1);
      
      // 📩 Send Login Reminder instead of Reset Link
      await sendOAuthReminderEmail(user, formattedProvider);
      return { success: true };
    }

    // 🛡️ Generate Secure Token (64 bytes hex)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 Minutes

    // 🛡️ Store Hashed Token in DB
    await db.passwordResetToken.create({
      data: {
        email: user.email,
        tokenHash,
        expiresAt,
      },
    });

    // 📩 Get browser/device info for the email
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "Unknown IP";

    // 🛡️ Parse User Agent
    const parser = new UAParser(userAgent);
    const browserName = parser.getBrowser().name || 'Unknown Browser';
    const osName = parser.getOS().name || 'Unknown OS';
    const deviceModel = parser.getDevice().model || 'Desktop/Laptop';
    
    const browserDisplay = `${browserName} (${osName})`;

    // 📩 Send Email
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(user, resetLink, {
      browser: browserDisplay,
      device: deviceModel,
      ipAddress: ip,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Forgot password error:", error);
    
    const safeErrorMessages = [
      "Please wait",
      "Security Lock",
      "Invalid",
      "OAuth",
    ];

    const isSafe = safeErrorMessages.some(prefix => error.message.includes(prefix));
    return { error: isSafe ? error.message : "Failed to process request. Please try again later." };
  }
};

/**
 * Reset Password
 * Validates the raw token against the stored hash and updates the password.
 */
export const resetPassword = async (token: string, password: string) => {
  try {
    // 🛡️ Validate token presence
    if (!token) throw new Error("Invalid or expired reset token.");

    // 🛡️ Validate password complexity
    const validation = resetPasswordSchema.safeParse({ password, confirmPassword: password });
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message);
    }

    // 🛡️ Hash incoming token to compare with DB
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const resetToken = await db.passwordResetToken.findUnique({
      where: { tokenHash }
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new Error("Reset link has expired or is invalid.");
    }

    const user = await db.user.findUnique({
      where: { email: resetToken.email },
      select: { 
        id: true, 
        password: true, 
        passwordHistory: true, 
        securityVersion: true,
        lastPasswordChangeAt: true 
      }
    });

    if (!user) throw new Error("User not found.");

    // 🔒 Check 2-minute cooldown for recent password changes (optimized for live Capstone defense demos)
    if (user.lastPasswordChangeAt) {
      const timeSinceLastChange = Date.now() - user.lastPasswordChangeAt.getTime();
      if (timeSinceLastChange < 2 * 60 * 1000) { // 2 Minutes
        const nextAvailable = new Date(user.lastPasswordChangeAt.getTime() + 2 * 60 * 1000);
        const secondsLeft = Math.ceil((nextAvailable.getTime() - Date.now()) / 1000);
        throw new Error(`Security Lock: Password was recently changed. Please wait ${secondsLeft} second(s).`);
      }
    }

    // 🛡️ Heritage Check: Ensure not using a past password
    const isPastPassword = await Promise.all(
      user.passwordHistory.map((oldHash) => bcrypt.compare(password, oldHash))
    );

    if (isPastPassword.some(match => match)) {
      throw new Error("You cannot use a previous password. Please choose a new one.");
    }

    // 🛡️ Also check current password
    if (user.password && await bcrypt.compare(password, user.password)) {
      throw new Error("New password must be different from your current one.");
    }

    // 🛡️ Hash new password
    const newHashedPassword = await bcrypt.hash(password, 12);

    // 🛡️ Update User & Invalidate Sessions
    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: {
          password: newHashedPassword,
          lastPasswordChangeAt: new Date(),
          securityVersion: { increment: 1 },
          passwordHistory: {
            push: user.password ? user.password : undefined,
          },
        },
      }),
      // 🔒 Single-use enforcement: Delete the token
      db.passwordResetToken.delete({
        where: { id: resetToken.id }
      }),
      // 🔒 Clean up any other expired tokens for this email
      db.passwordResetToken.deleteMany({
        where: { email: resetToken.email, expiresAt: { lt: new Date() } }
      })
    ]);

    return { success: true };
  } catch (error: any) {
    console.error("Reset password error:", error);
    
    const safeErrorMessages = [
      "Invalid",
      "expired",
      "Security Lock",
      "Please wait",
      "previous password",
      "different from your current one",
      "User not found"
    ];

    const isSafe = safeErrorMessages.some(prefix => error.message.includes(prefix));
    return { error: isSafe ? error.message : "Failed to reset password." };
  }
};

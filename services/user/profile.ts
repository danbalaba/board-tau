import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sanitizeInput } from "@/lib/validators";
import { isForbiddenPassword } from "@/lib/password-blacklist";
import bcrypt from 'bcryptjs';
import { sendPasswordChangeEmail } from "@/services/email/notifications";
import { UserProfile } from "@/types/profile";

// Server-side function to get user profile
export async function getUserProfile(): Promise<UserProfile> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("User not authenticated");
  }

  const user = await db.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      phoneNumber: true,
      businessName: true,
      address: true,
      role: true,
      emailVerified: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
      bio: true,
      city: true,
      region: true,
      password: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const { password, ...rest } = user;
  return {
    ...rest,
    hasPassword: !!password,
  } as UserProfile;
}

// Server-side function to update user profile
export async function updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("User not authenticated");
  }

  // Only allow updating specific fields to prevent security issues
  const allowedFields: any = {};
  if (data.name !== undefined) {
    allowedFields.name = data.name ? sanitizeInput(data.name) : null;
  }
  if (data.phoneNumber !== undefined) {
    allowedFields.phoneNumber = data.phoneNumber ? sanitizeInput(data.phoneNumber) : null;
  }
  if (data.bio !== undefined) {
    allowedFields.bio = data.bio ? sanitizeInput(data.bio) : null;
  }
  if (data.businessName !== undefined) {
    allowedFields.businessName = data.businessName ? sanitizeInput(data.businessName) : null;
  }
  if (data.address !== undefined) {
    allowedFields.address = data.address ? sanitizeInput(data.address) : null;
  }
  if (data.image !== undefined) {
    allowedFields.image = data.image; // Allow updating profile image
  }
  if (data.city !== undefined) {
    allowedFields.city = data.city ? sanitizeInput(data.city) : null;
  }
  if (data.region !== undefined) {
    allowedFields.region = data.region ? sanitizeInput(data.region) : null;
  }

  const updatedUser = await db.user.update({
    where: {
      email: session.user.email,
    },
    data: allowedFields,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      phoneNumber: true,
      businessName: true,
      address: true,
      role: true,
      emailVerified: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
      bio: true,
      city: true,
      region: true,
    },
  });

  return updatedUser as UserProfile;
}


// Server-side function to change user password
export async function changeUserPassword(oldPassword: string, newPassword: string): Promise<void> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("User not authenticated");
  }

  const user = await db.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
      name: true,
      password: true,
      lastPasswordChangeAt: true,
      passwordHistory: true,
      securityVersion: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // 🔒 Security: 2-minute cooldown for password changes (optimized for live Capstone defense demos)
  if (user.lastPasswordChangeAt) {
    const lastChange = user.lastPasswordChangeAt;
    const cooldownMs = 2 * 60 * 1000; // 2 Minutes
    if (lastChange && (Date.now() - lastChange.getTime()) < cooldownMs) {
      const nextAvailable = new Date(lastChange.getTime() + cooldownMs);
      const secondsLeft = Math.ceil((nextAvailable.getTime() - Date.now()) / 1000);
      throw new Error(`Security Lock: Please wait ${secondsLeft} second(s) before changing your password again.`);
    }
  }


  // 🛡️ Blacklist check on server
  if (isForbiddenPassword(newPassword)) {
    throw new Error("This password is too common/easy to guess. Please choose a stronger one.");
  }

  // 🛡️ If user has a password, verify the old one
  if (user.password) {
    if (!oldPassword) {
      throw new Error("Current password is required to change your password.");
    }
    // We already checked user.password is not null above
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password as string);
    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }
  }

  // Check Password History (Last 3 hashes)
  // We check the new password against the current and history
  const isPreviouslyUsed = await Promise.all(
    user.passwordHistory
      .filter((hash: any): hash is string => hash !== null)
      .map((oldHash: any) => bcrypt.compare(newPassword, oldHash))
  );

  if (isPreviouslyUsed.some(match => match)) {
    throw new Error("You cannot reuse a recently used password.");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update password history (keep only last 10, filter out nulls)
  const updatedHistory = [user.password, ...user.passwordHistory]
    .filter((p): p is string => p !== null)
    .slice(0, 10);

  // Update user password
  await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
      lastPasswordChangeAt: new Date(),
      securityVersion: { increment: 1 },
      passwordHistory: updatedHistory,
    },
  });

  // Send Security Notification Email
  await sendPasswordChangeEmail({
    email: session.user.email,
    name: user.name,
  });
}


import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sanitizeInput } from "@/lib/validators";
import bcrypt from 'bcryptjs';

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  phoneNumber: string | null;
  businessName: string | null;
  role: Role;
  emailVerified: Date | null;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  bio: string | null;
  city: string | null;
  region: string | null;
}

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

  if (!user) {
    throw new Error("User not found");
  }

  return user as UserProfile;
}

// Server-side function to update user profile
export async function updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("User not authenticated");
  }

  // Only allow updating specific fields to prevent security issues
  const allowedFields: Partial<UserProfile> = {};
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
  if (data.image !== undefined) {
    allowedFields.image = data.image; // Allow updating profile image
  }
  if (data.city !== undefined) {
    (allowedFields as any).city = data.city ? sanitizeInput(data.city) : null;
  }
  if (data.region !== undefined) {
    (allowedFields as any).region = data.region ? sanitizeInput(data.region) : null;
  }

  const updatedUser = await db.user.update({
    where: {
      email: session.user.email,
    },
    data: allowedFields as any,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      phoneNumber: true,
      businessName: true,
      role: true,
      emailVerified: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
      bio: true,
    },
  });

  return updatedUser as UserProfile;
}

// Client-side function to update user profile
export async function updateUserProfileClient(data: Partial<UserProfile>): Promise<UserProfile> {
  const response = await fetch('/api/user/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update profile');
  }

  return await response.json();
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
      password: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.password) {
    throw new Error("User does not have a password set");
  }

  // Verify old password
  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordValid) {
    throw new Error("Current password is incorrect");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update user password
  await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
    },
  });
}

// Client-side function to change user password
export async function changeUserPasswordClient(oldPassword: string, newPassword: string): Promise<void> {
  const response = await fetch('/api/user/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to change password');
  }
}

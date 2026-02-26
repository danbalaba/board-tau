import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  phoneNumber: string | null;
  businessName: string | null;
  role: string;
  emailVerified: Date | null;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  bio: string | null;
}

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
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user as UserProfile;
}

export async function updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("User not authenticated");
  }

  const updatedUser = await db.user.update({
    where: {
      email: session.user.email,
    },
    data,
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

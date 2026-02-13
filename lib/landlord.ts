import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export type LandlordUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  isVerifiedLandlord: boolean;
  landlordApprovedAt: Date | null;
};

/** Require landlord role; redirect if not authenticated or not a landlord. */
export async function requireLandlord(): Promise<LandlordUser> {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user?.id) {
    redirect("/");
  }

  // Get full user details from database to verify landlord status
  const userFromDb = await db.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      isVerifiedLandlord: true,
      landlordApprovedAt: true,
    },
  });

  if (!userFromDb || userFromDb.role !== "landlord" || !userFromDb.isVerifiedLandlord) {
    redirect("/");
  }

  return userFromDb as LandlordUser;
}

/** Check if user is a landlord (does not redirect). */
export async function isLandlord(): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user?.id) {
      return false;
    }

    const userFromDb = await db.user.findUnique({
      where: { id: user.id },
      select: { role: true, isVerifiedLandlord: true },
    });

    return !!(userFromDb?.role === "landlord" && userFromDb.isVerifiedLandlord);
  } catch {
    return false;
  }
}

/** Check if user has pending landlord application. */
export async function hasPendingLandlordApplication(): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user?.id) {
      return false;
    }

    const userFromDb = await db.user.findUnique({
      where: { id: user.id },
      select: { role: true, isVerifiedLandlord: true, landlordApprovedAt: true },
    });

    // If user is not a landlord yet but has an application pending
    return userFromDb?.role === "user" &&
           userFromDb.landlordApprovedAt === null &&
           userFromDb.isVerifiedLandlord === false;
  } catch {
    return false;
  }
}

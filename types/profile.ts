import { Role } from "@prisma/client";

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  phoneNumber: string | null;
  businessName: string | null;
  address: string | null;
  role: Role;
  emailVerified: Date | null;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  bio: string | null;
  city: string | null;
  region: string | null;
  hasPassword?: boolean;
}

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function seedUsers(prisma: PrismaClient) {
  console.log("🚀 [2/4] Seeding System Users (Admin, Landlords, Tenants)...");

  const defaultPassword = await bcrypt.hash("Password@123", 10);

  // 1. Super Admin
  const adminEmail = "superadmin@boardtau.test";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: "BoardTAU Super Admin",
        email: adminEmail,
        password: defaultPassword,
        role: "SUPER_ADMIN",
        emailVerified: new Date(),
        city: "Tarlac City",
        region: "Tarlac",
        lastLogin: new Date()
      }
    });
    console.log("   ✓ Super Admin created.");
  } else {
    console.log("   ✓ Super Admin exists.");
  }

  // 2. System Admin (Moderator & Content In-Charge)
  const systemAdminEmail = "admin@boardtau.test";
  const existingSystemAdmin = await prisma.user.findUnique({ where: { email: systemAdminEmail } });
  if (!existingSystemAdmin) {
    await prisma.user.create({
      data: {
        name: "BoardTAU System Admin",
        email: systemAdminEmail,
        password: defaultPassword,
        role: "ADMIN",
        emailVerified: new Date(),
        city: "Camiling",
        region: "Tarlac",
        lastLogin: new Date()
      }
    });
    console.log("   ✓ System Admin (Moderator) created.");
  } else {
    console.log("   ✓ System Admin (Moderator) exists.");
  }


  // 3. Official Landlord Account (For real fieldwork data entry)
  const officialLandlordEmail = "boardtau.official@gmail.com";
  const existingOfficial = await prisma.user.findUnique({ where: { email: officialLandlordEmail } });
  if (!existingOfficial) {
    await prisma.user.create({
      data: {
        name: "BoardTAU Official Landlord",
        email: officialLandlordEmail,
        password: defaultPassword,
        role: "LANDLORD",
        isVerifiedLandlord: true,
        emailVerified: new Date(),
        city: "Camiling",
        region: "Tarlac",
        lastLogin: new Date()
      }
    });
    console.log("   ✓ Official Landlord created.");
  } else {
    console.log("   ✓ Official Landlord exists.");
  }
}

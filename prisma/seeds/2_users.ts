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

  // 2. Primary Landlord
  const landlord1Email = "testlandlord@gmail.com";
  const existingLandlord1 = await prisma.user.findUnique({ where: { email: landlord1Email } });
  if (!existingLandlord1) {
    await prisma.user.create({
      data: {
        name: "TAU Student Housing Corp",
        email: landlord1Email,
        password: defaultPassword,
        role: "LANDLORD",
        isVerifiedLandlord: true,
        emailVerified: new Date(),
        city: "Camiling",
        region: "Tarlac",
        lastLogin: new Date()
      }
    });
    console.log("   ✓ Primary Landlord created.");
  } else {
    console.log("   ✓ Primary Landlord exists.");
  }

  // 3. Second Landlord
  const landlord2Email = "rival.landlord@gmail.com";
  const existingLandlord2 = await prisma.user.findUnique({ where: { email: landlord2Email } });
  if (!existingLandlord2) {
    await prisma.user.create({
      data: {
        name: "Rival Property Management",
        email: landlord2Email,
        password: defaultPassword,
        role: "LANDLORD",
        isVerifiedLandlord: true,
        emailVerified: new Date(),
        city: "Tarlac City",
        region: "Tarlac",
        lastLogin: new Date()
      }
    });
    console.log("   ✓ Second Landlord created.");
  } else {
    console.log("   ✓ Second Landlord exists.");
  }

  // 4. Test Tenant User
  const tenantEmail = "testuser@gmail.com";
  const existingTenant = await prisma.user.findUnique({ where: { email: tenantEmail } });
  if (!existingTenant) {
    await prisma.user.create({
      data: {
        name: "Generic Test Student",
        email: tenantEmail,
        password: defaultPassword,
        role: "USER",
        emailVerified: new Date(),
        city: "Camiling",
        region: "Tarlac",
        lastLogin: new Date()
      }
    });
    console.log("   ✓ Test Tenant User created.");
  } else {
    console.log("   ✓ Test Tenant User exists.");
  }
}

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("\n=======================================================");
  console.log("🛡️  BOARDTAU SYSTEM ADMIN PROVISIONING SCRIPT");
  console.log("=======================================================\n");

  const email = "admin@boardtau.test";
  const passwordRaw = "Password@123";

  const hashedPassword = await bcrypt.hash(passwordRaw, 10);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`ℹ️ User found with email: ${email}`);
    console.log(`   Current Role: ${existingUser.role}`);
    console.log("   Updating user to ensure full System Admin (ADMIN) privileges...");

    const updated = await prisma.user.update({
      where: { email },
      data: {
        name: "BoardTAU System Admin",
        role: "ADMIN",
        password: hashedPassword,
        emailVerified: new Date(),
        isActive: true,
        isPermanentlyBanned: false,
        failedLoginAttempts: 0,
        loginLockoutUntil: null,
        city: "Camiling",
        region: "Tarlac",
        lastLogin: new Date(),
      },
    });

    console.log(`\n✅ System Admin account updated successfully!`);
    console.log(`   ID:    ${updated.id}`);
    console.log(`   Name:  ${updated.name}`);
    console.log(`   Email: ${updated.email}`);
    console.log(`   Role:  ${updated.role} (System Administrator / Moderation)`);
  } else {
    console.log(`🚀 Creating new System Admin account for: ${email}...`);

    const created = await prisma.user.create({
      data: {
        name: "BoardTAU System Admin",
        email,
        password: hashedPassword,
        role: "ADMIN",
        emailVerified: new Date(),
        isActive: true,
        isPermanentlyBanned: false,
        failedLoginAttempts: 0,
        loginLockoutUntil: null,
        city: "Camiling",
        region: "Tarlac",
        lastLogin: new Date(),
      },
    });

    console.log(`\n✅ System Admin account created successfully!`);
    console.log(`   ID:    ${created.id}`);
    console.log(`   Name:  ${created.name}`);
    console.log(`   Email: ${created.email}`);
    console.log(`   Role:  ${created.role} (System Administrator / Moderation)`);
  }

  console.log("\n-------------------------------------------------------");
  console.log("🔑 LOGIN CREDENTIALS:");
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${passwordRaw}`);
  console.log("   Dashboard Destination: /admin/dashboard (Operations / Moderation)");
  console.log("=======================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Error provisioning System Admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

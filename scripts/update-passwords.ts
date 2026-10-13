import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🔐 Starting password update for seeded users...");

  const newPasswordRaw = "Password@123";
  console.log(`Hashing new password: ${newPasswordRaw}`);
  const newHashedPassword = await bcrypt.hash(newPasswordRaw, 10);

  // 1. Ensure superadmin@boardtau.test exists as SUPER_ADMIN
  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: "superadmin@boardtau.test" }
  });

  if (!existingSuperAdmin) {
    await prisma.user.create({
      data: {
        email: "superadmin@boardtau.test",
        name: "BoardTAU Super Admin",
        password: newHashedPassword,
        role: "SUPER_ADMIN",
        isActive: true,
        emailVerified: new Date(),
        failedLoginAttempts: 0,
        loginLockoutUntil: null
      }
    });
    console.log("🌟 Created new user: superadmin@boardtau.test (SUPER_ADMIN)");
  }

  // 2. Update ALL users in the database so no user is left locked or with old password
  const allUsers = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true }
  });

  console.log(`\nFound ${allUsers.length} users in the database. Updating all to "${newPasswordRaw}"...`);

  let updatedCount = 0;

  for (const user of allUsers) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: newHashedPassword,
        failedLoginAttempts: 0,
        loginLockoutUntil: null,
        isActive: true
      }
    });
    console.log(`✅ [${user.role}] Updated ${user.name} (${user.email})`);
    updatedCount++;
  }

  console.log(`\n🎉 Password update complete! Successfully updated ${updatedCount} users.`);
  console.log(`All accounts can now log in with password: ${newPasswordRaw}`);
}

main()
  .catch(e => {
    console.error("❌ Error updating passwords:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

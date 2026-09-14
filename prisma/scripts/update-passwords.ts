import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🔐 Starting password update for seeded users...");

  const emailsToUpdate = [
    "superadmin@boardtau.test",
    "admin@boardtau.test",
    "boardtau.official@gmail.com",
    "testuser@gmail.com",
    "rival.landlord@gmail.com",
    "maria.santos@student.edu.ph",
    "juan.cruz@student.edu.ph",
    "angela.garcia@student.edu.ph",
    "pedro.reyes@student.edu.ph",
    "kristine.dizon@student.edu.ph",
    "robert.lee@student.edu.ph"
  ];

  const newPasswordRaw = "@BoardTAUPassword12345";
  console.log(`Hashing new password: ${newPasswordRaw}`);
  const newHashedPassword = await bcrypt.hash(newPasswordRaw, 10);

  let updatedCount = 0;

  for (const email of emailsToUpdate) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.user.update({
        where: { email },
        data: { password: newHashedPassword }
      });
      console.log(`✅ Updated password for: ${email}`);
      updatedCount++;
    } else {
      console.log(`⚠️ User not found (skipping): ${email}`);
    }
  }

  console.log(`\n🎉 Password update complete! Successfully updated ${updatedCount} users.`);
  console.log(`All affected users must now log in with: ${newPasswordRaw}`);
}

main()
  .catch(e => {
    console.error("❌ Error updating passwords:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

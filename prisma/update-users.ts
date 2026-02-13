import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Updated user data with valid passwords
const updatedUsers = [
  {
    email: "landlord@boardtau.test",
    password: "TestPassword@123",
  },
  {
    email: "admin@boardtau.test",
    password: "AdminPassword@123",
  },
  {
    email: "maria@student.edu",
    password: "Password@123",
  },
  {
    email: "juan@student.edu",
    password: "Password@123",
  },
  {
    email: "angela@student.edu",
    password: "Password@123",
  },
  {
    email: "pedro@student.edu",
    password: "Password@123",
  },
];

async function main() {
  try {
    console.log("🔄 Updating existing users...\n");

    for (const userData of updatedUsers) {
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (user) {
        const updates: any = {};

        // Update emailVerified if it's not a Date or is missing
        if (!user.emailVerified || typeof user.emailVerified === "boolean") {
          updates.emailVerified = new Date();
          console.log(`✓ Updating emailVerified for ${userData.email}`);
        }

        // Update password if needed (only if it's the old one without special character)
        const oldPasswords = ["TestPassword123", "Password123"];
        const isOldPassword = await bcrypt.compare(oldPasswords[0], user.password || "");
        const isOldPassword2 = await bcrypt.compare(oldPasswords[1], user.password || "");

        if (isOldPassword || isOldPassword2) {
          const hashedPassword = await bcrypt.hash(userData.password, 10);
          updates.password = hashedPassword;
          console.log(`✓ Updating password for ${userData.email}`);
        }

        // Apply updates if any
        if (Object.keys(updates).length > 0) {
          await prisma.user.update({
            where: { email: userData.email },
            data: updates,
          });
          console.log(`✓ Updated user: ${userData.email}`);
        } else {
          console.log(`✓ User already up to date: ${userData.email}`);
        }
      } else {
        console.log(`⚠️ User not found: ${userData.email}`);
      }
    }

    console.log("\n✅ All users updated successfully!");
  } catch (error) {
    console.error("❌ Error updating users:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🔄 Creating admin user...\n");

    // Admin user data
    const admin = {
      name: "BoardTAU Admin",
      email: "admin@boardtau.test",
      password: "AdminPassword@123",
      image: "https://api.placeholder.com/avatar-admin.jpg",
    };

    // Check if admin user exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: admin.email },
    });

    if (existingAdmin) {
      console.log("⚠️ Admin user already exists");
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash(admin.password, 10);
      const newAdmin = await prisma.user.create({
        data: {
          name: admin.name,
          email: admin.email,
          password: hashedPassword,
          image: admin.image,
          role: "admin",
          emailVerified: new Date(),
          isActive: true,
        },
      });

      console.log(`✅ Admin user created successfully: ${newAdmin.email}`);
    }

    // Verify all required users exist
    const usersToCheck = [
      "admin@boardtau.test",
      "landlord@boardtau.test",
      "maria@student.edu",
      "juan@student.edu",
      "angela@student.edu",
      "pedro@student.edu",
    ];

    console.log("\n✅ Checking all users:");
    for (const email of usersToCheck) {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (user) {
        console.log(`- ✅ ${email}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Email Verified: ${!!user.emailVerified}`);
      } else {
        console.log(`- ❌ ${email} (NOT FOUND)`);
      }
    }
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

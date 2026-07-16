import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Adding a Super Admin user...");

  const existing = await prisma.user.findUnique({
    where: { email: "superadmin@boardtau.test" }
  });

  if (existing) {
    console.log("Super Admin already exists!");
    console.log(`Email: superadmin@boardtau.test`);
    console.log(`Password: Password@123`);
    return;
  }

  const hashedPassword = await bcrypt.hash("Password@123", 10);

  const newSuperAdmin = await prisma.user.create({
    data: {
      name: "BoardTAU Super Admin",
      email: "superadmin@boardtau.test",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      emailVerified: new Date(),
      city: "Tarlac City",
      region: "Tarlac",
      lastLogin: new Date()
    }
  });

  console.log(`✅ Super Admin created successfully!`);
  console.log(`Email: superadmin@boardtau.test`);
  console.log(`Password: Password@123`);
  console.log(`ID: ${newSuperAdmin.id}`);
}

main()
  .catch(e => { console.error("Error:", e); })
  .finally(async () => { await prisma.$disconnect(); });

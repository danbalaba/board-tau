import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Adding a generic test user...");

  const email = "testuser@gmail.com";
  const password = "Password@123";

  const existing = await prisma.user.findUnique({
    where: { email }
  });

  if (existing) {
    console.log("Test user already exists!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name: "Generic Test User",
      email: email,
      password: hashedPassword,
      role: "USER",
      emailVerified: new Date(),
      city: "Tarlac City",
      region: "Tarlac",
      lastLogin: new Date()
    }
  });

  console.log(`✅ Test user created successfully!`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`ID: ${newUser.id}`);
}

main()
  .catch(e => { console.error("Error:", e); })
  .finally(async () => { await prisma.$disconnect(); });

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Adding a second test landlord...");

  const existing = await prisma.user.findUnique({
    where: { email: "rival.landlord@gmail.com" }
  });

  if (existing) {
    console.log("Second landlord already exists!");
    console.log(`Email: rival.landlord@gmail.com`);
    console.log(`Password: Password@123`);
    return;
  }

  const hashedPassword = await bcrypt.hash("Password@123", 10);

  const newLandlord = await prisma.user.create({
    data: {
      name: "Rival Property Management",
      email: "rival.landlord@gmail.com",
      password: hashedPassword,
      role: "LANDLORD",
      isVerifiedLandlord: true,
      emailVerified: new Date(),
      city: "Tarlac City",
      region: "Tarlac",
      lastLogin: new Date()
    }
  });

  console.log(`✅ Second landlord created successfully!`);
  console.log(`Email: rival.landlord@gmail.com`);
  console.log(`Password: Password@123`);
  console.log(`ID: ${newLandlord.id}`);
}

main()
  .catch(e => { console.error("Error:", e); })
  .finally(async () => { await prisma.$disconnect(); });

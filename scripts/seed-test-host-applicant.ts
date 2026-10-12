import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("\n=======================================================");
  console.log("🏡 BOARDTAU TEST HOST APPLICANT SEED SCRIPT");
  console.log("=======================================================\n");

  const email = "applicant@boardtau.test";
  const passwordRaw = "Password@123";

  // Check command-line arguments to optionally set status: pending, rejected, or approved
  const args = process.argv.slice(2);
  const statusArg = args.find((a) => a.startsWith("--status="))?.split("=")[1]?.toLowerCase() || "pending";
  const status = ["pending", "rejected", "approved"].includes(statusArg) ? statusArg : "pending";

  const hashedPassword = await bcrypt.hash(passwordRaw, 10);

  // 1. Find or create the test applicant user
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    console.log(`ℹ️ Found existing test user with email: ${email}`);
    user = await prisma.user.update({
      where: { email },
      data: {
        name: "Juan De La Cruz (Test Applicant)",
        password: hashedPassword,
        role: "USER", // Regular user applying to become landlord
        isVerifiedLandlord: status === "approved",
        landlordApprovedAt: status === "approved" ? new Date() : null,
        emailVerified: new Date(),
        isActive: true,
        isPermanentlyBanned: false,
        failedLoginAttempts: 0,
        loginLockoutUntil: null,
      },
    });
  } else {
    console.log(`🚀 Creating new test applicant user: ${email}...`);
    user = await prisma.user.create({
      data: {
        name: "Juan De La Cruz (Test Applicant)",
        email,
        password: hashedPassword,
        role: "USER",
        isVerifiedLandlord: status === "approved",
        landlordApprovedAt: status === "approved" ? new Date() : null,
        emailVerified: new Date(),
        isActive: true,
        isPermanentlyBanned: false,
        failedLoginAttempts: 0,
        loginLockoutUntil: null,
        city: "Camiling",
        region: "Tarlac",
      },
    });
  }

  // 2. Prepare Sample Verification Media (High quality mock images for preview inspection)
  const sampleData = {
    businessInfo: {
      businessName: "De La Cruz Student Residences",
      businessType: "BOARDING_HOUSE",
      yearsExperience: "3-5-years",
    },
    contactInfo: {
      fullName: "Juan De La Cruz",
      phoneNumber: "+639171234567",
      email: email,
      ownershipRole: "OWNER",
    },
    selfieUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80",
    idCardUrl: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80",
    businessPermitUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
    fireSafetyUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    facadePhotoUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    latlng: [15.4822, 120.5963],
    additionalDocsUrl: "",
    status: status,
    rejectedReason:
      status === "rejected"
        ? "The Mayor's Permit photo is a bit blurry near the stamp. Please upload a clearer photo or your latest electric bill (TARELCO II)."
        : null,
    rejectedBy: null,
    approvedBy: null,
  };

  // 3. Upsert Host Application (1-to-1 with User)
  const existingApp = await prisma.hostApplication.findUnique({
    where: { userId: user.id },
  });

  let app;
  if (existingApp) {
    console.log(`ℹ️ Updating existing host application (${existingApp.id}) to status: "${status}"...`);
    app = await prisma.hostApplication.update({
      where: { userId: user.id },
      data: {
        ...sampleData,
        updatedAt: new Date(),
      },
    });
  } else {
    console.log(`🚀 Creating new host application with status: "${status}"...`);
    app = await prisma.hostApplication.create({
      data: {
        userId: user.id,
        ...sampleData,
      },
    });
  }

  console.log(`\n✅ Host Application Ready!`);
  console.log(`   Application ID: ${app.id}`);
  console.log(`   Status:         ${app.status.toUpperCase()}`);
  console.log(`   Business:       ${sampleData.businessInfo.businessName}`);
  console.log(`   Location:       [${sampleData.latlng.join(", ")}] (TAU Camiling Area)`);

  console.log("\n-------------------------------------------------------");
  console.log("🔑 TEST LOGIN CREDENTIALS:");
  console.log(`   Email:       ${email}`);
  console.log(`   Password:    ${passwordRaw}`);
  console.log("   Test Route:  http://localhost:3000/become-a-host");
  console.log("=======================================================\n");
  console.log("💡 TIPS:");
  console.log("   - To test PENDING monitor:  npm run seed:test-applicant");
  console.log("   - To test REJECTED monitor: npm run seed:test-applicant -- --status=rejected");
  console.log("   - To test APPROVED monitor: npm run seed:test-applicant -- --status=approved");
  console.log("   - To RESET/DELETE applicant: npm run delete:test-applicant\n");
}

main()
  .catch((e) => {
    console.error("❌ Error setting up test applicant:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

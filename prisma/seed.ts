import { PrismaClient } from "@prisma/client";
import { seedTaxonomy } from "./seeds/1_taxonomy";
import { seedUsers } from "./seeds/2_users";

const prisma = new PrismaClient();

async function main() {
  console.log("\n=======================================================");
  console.log("🚀 BOARDTAU UNIFIED MASTER SEED PIPELINE");
  console.log("=======================================================\n");

  try {
    console.log("🧹 [0/2] Resetting All 33 Database Collections...");
    // 1. Links & Child Media
    await prisma.roomAttributeLink.deleteMany({});
    await prisma.listingAttributeLink.deleteMany({});
    await prisma.roomImage.deleteMany({});
    await prisma.listingImage.deleteMany({});
    await prisma.contractSignature.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.reservation.deleteMany({});
    await prisma.inquiry.deleteMany({});

    // 2. Core Listing, Room & Taxonomy
    await prisma.room.deleteMany({});
    await prisma.listing.deleteMany({});
    await prisma.leaseContract.deleteMany({});
    await prisma.bedSetupDefinition.deleteMany({});
    await prisma.roomTypeDefinition.deleteMany({});
    await prisma.propertyType.deleteMany({});
    await prisma.dynamicAttribute.deleteMany({});
    await prisma.attributeSubGroup.deleteMany({});
    await prisma.campusCollege.deleteMany({});

    // 3. Operational, Moderation, Tokens & Logs
    await prisma.notification.deleteMany({});
    await prisma.adminActivityLog.deleteMany({});
    await prisma.moderationLog.deleteMany({});
    await prisma.userStrike.deleteMany({});
    await prisma.hostApplication.deleteMany({});
    await prisma.emailOTP.deleteMany({});
    await prisma.passwordResetToken.deleteMany({});
    await prisma.customDashboard.deleteMany({});
    await prisma.platformMetricSnapshot.deleteMany({});
    await prisma.featureFlag.deleteMany({});
    await prisma.siteSettings.deleteMany({});

    // 4. Users, Accounts, Roles & Permissions
    await prisma.account.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.userRole.deleteMany({});
    await prisma.permission.deleteMany({});
    console.log("   ✓ All 33 Database Collections reset cleanly.");

    // 1. Taxonomy (PropertyTypes, RoomTypeDefinitions, BedSetupDefinitions, DynamicAttributes, SubGroups, CampusColleges)
    await seedTaxonomy(prisma);

    // 2. Users (SuperAdmin, System Admin, Landlords, Test Tenants)
    await seedUsers(prisma);

    // Note: Mock listings & sample contracts have been removed to allow direct manual entry of real fieldwork data.

    console.log("\n=======================================================");
    console.log("✅ UNIFIED MASTER SEED COMPLETE! System ready for use.");
    console.log("=======================================================\n");
  } catch (error) {
    console.error("\n❌ Fatal Error during Master Seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

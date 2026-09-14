import { PrismaClient } from "@prisma/client";
import { seedTaxonomy } from "./seeds/1_taxonomy";
import { seedUsers } from "./seeds/2_users";
import { seedListings } from "./seeds/3_listings";
import { seedContracts } from "./seeds/4_contracts";

const prisma = new PrismaClient();

async function main() {
  console.log("\n=======================================================");
  console.log("🚀 BOARDTAU UNIFIED MASTER SEED PIPELINE");
  console.log("=======================================================\n");

  try {
    console.log("🧹 [0/4] Resetting Database Collections...");
    await prisma.review.deleteMany({});
    await prisma.reservation.deleteMany({});
    await prisma.inquiry.deleteMany({});
    await prisma.listingImage.deleteMany({});
    await prisma.roomImage.deleteMany({});
    await prisma.roomAttributeLink.deleteMany({});
    await prisma.listingAttributeLink.deleteMany({});
    await prisma.room.deleteMany({});
    await prisma.listing.deleteMany({});
    await prisma.roomTypeDefinition.deleteMany({});
    await prisma.propertyType.deleteMany({});
    await prisma.dynamicAttribute.deleteMany({});
    await prisma.campusCollege.deleteMany({});
    await prisma.leaseContract.deleteMany({});
    await prisma.user.deleteMany({});
    console.log("   ✓ Database reset cleanly.");

    // 1. Taxonomy (PropertyTypes, RoomTypeDefinitions, DynamicAttributes, CampusColleges)
    await seedTaxonomy(prisma);

    // 2. Users (SuperAdmin, Landlords, Test Tenants)
    await seedUsers(prisma);

    // 3. Listings & Rooms (TAU Real Accommodation Data)
    await seedListings(prisma);

    // 4. Contracts (Sample Lease Agreements)
    await seedContracts(prisma);

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

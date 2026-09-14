import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetListingsOnly() {
  console.log("\n=======================================================");
  console.log("🧹 RESETTING ALL LISTINGS & RELATED DATA");
  console.log("=======================================================\n");

  try {
    console.log("⏳ Deleting all listing-dependent records from database...");

    const contractSignatures = await prisma.contractSignature.deleteMany({});
    console.log(`   ✓ Deleted ${contractSignatures.count} contract signatures`);

    const leaseContracts = await prisma.leaseContract.deleteMany({});
    console.log(`   ✓ Deleted ${leaseContracts.count} lease contracts`);

    const messages = await prisma.message.deleteMany({});
    console.log(`   ✓ Deleted ${messages.count} messages`);

    const reviews = await prisma.review.deleteMany({});
    console.log(`   ✓ Deleted ${reviews.count} reviews`);

    const reservations = await prisma.reservation.deleteMany({});
    console.log(`   ✓ Deleted ${reservations.count} reservations`);

    const inquiries = await prisma.inquiry.deleteMany({});
    console.log(`   ✓ Deleted ${inquiries.count} inquiries`);

    const listingImages = await prisma.listingImage.deleteMany({});
    console.log(`   ✓ Deleted ${listingImages.count} listing images`);

    const roomImages = await prisma.roomImage.deleteMany({});
    console.log(`   ✓ Deleted ${roomImages.count} room images`);

    const roomAttrLinks = await prisma.roomAttributeLink.deleteMany({});
    console.log(`   ✓ Deleted ${roomAttrLinks.count} room attribute links`);

    const listingAttrLinks = await prisma.listingAttributeLink.deleteMany({});
    console.log(`   ✓ Deleted ${listingAttrLinks.count} listing attribute links`);

    const rooms = await prisma.room.deleteMany({});
    console.log(`   ✓ Deleted ${rooms.count} rooms`);

    const listings = await prisma.listing.deleteMany({});
    console.log(`   ✓ Deleted ${listings.count} listings`);

    // Reset favorite & recent listing references on all users
    const userFavoritesReset = await prisma.user.updateMany({
      data: {
        favoriteIds: [],
        recentListingIds: [],
      },
    });
    console.log(`   ✓ Cleared favorite & recent listing references for ${userFavoritesReset.count} users`);

    console.log("\n=======================================================");
    console.log("✅ ALL LISTINGS & RELATED DATA CLEARED SUCCESSFULLY!");
    console.log("   Users, Landlords, Admins & System Settings remain intact.");
    console.log("=======================================================\n");
  } catch (error) {
    console.error("\n❌ Error resetting listing data:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetListingsOnly();

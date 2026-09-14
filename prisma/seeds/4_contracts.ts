import { PrismaClient } from "@prisma/client";

export async function seedContracts(prisma: PrismaClient) {
  console.log("🚀 [4/4] Seeding Sample Lease Contracts...");

  const listings = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, userId: true }
  });

  if (listings.length === 0) {
    console.log("   ✓ No active listings found for lease contracts.");
    return;
  }

  let count = 0;
  for (const listing of listings) {
    const existing = await prisma.leaseContract.findFirst({
      where: { listingId: listing.id }
    });

    if (!existing) {
      await prisma.leaseContract.create({
        data: {
          listingId: listing.id,
          landlordId: listing.userId,
          depositAmount: 1,
          moveOutNoticeDays: 30,
        }
      });
      count++;
    }
  }

  console.log(`   ✓ Added ${count} Lease Contracts.`);
}

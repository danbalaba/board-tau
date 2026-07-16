import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("📅 Adjusting Listing creation dates for 'NEW' badge testing...");

  const listings = await prisma.listing.findMany();
  console.log(`🔍 Found ${listings.length} listings to update.`);

  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i];
    const rand = Math.random();
    let newDate = new Date();

    if (rand < 0.3) {
      // 30% chance: Very New (2 days ago)
      newDate.setDate(newDate.getDate() - 2);
    } else if (rand < 0.7) {
      // 40% chance: Recently New (6 days ago)
      newDate.setDate(newDate.getDate() - 6);
    } else {
      // 30% chance: Old (45 days ago)
      newDate.setDate(newDate.getDate() - 45);
    }

    await prisma.listing.update({
      where: { id: listing.id },
      data: { createdAt: newDate }
    });
  }

  console.log("✅ Update complete! Check your UI for the 'NEW' badges.");
}

main()
  .catch(e => {
    console.error("❌ Error updating dates:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

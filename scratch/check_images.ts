
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("--- Listing and Room Images Audit ---");

  // Get all listings with their rooms and images
  const listings = await prisma.listing.findMany({
    include: {
      images: true,
      rooms: {
        include: {
          images: true
        }
      }
    }
  });

  for (const listing of listings) {
    console.log(`\nListing: ${listing.title} (ID: ${listing.id})`);
    console.log(`Listing Images count: ${Array.isArray(listing.images) ? listing.images.length : 0}`);
    
    if (listing.rooms.length > 0) {
      console.log(`Rooms in this listing:`);
      for (const room of listing.rooms) {
        console.log(`  - Room: ${room.name} (ID: ${room.id})`);
        console.log(`    Room Images count: ${room.images.length}`);
      }
    } else {
      console.log(`  No rooms found for this listing.`);
    }
  }

  // Also check specific reservations/inquiries if possible, but let's start with the structure
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

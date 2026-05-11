
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- Listing and Room Images Audit ---");

  const listings = await prisma.listing.findMany({
    include: {
      images: true, // Relation to ListingImage
      rooms: {
        include: {
          images: true // Relation to RoomImage
        }
      }
    }
  });

  listings.forEach(listing => {
    console.log(`\nListing: ${listing.title} (ID: ${listing.id})`);
    console.log(`Listing.imageSrc (Single): ${listing.imageSrc}`);
    console.log(`Listing.images (Gallery count): ${listing.images.length}`);
    
    if (listing.rooms && listing.rooms.length > 0) {
      listing.rooms.forEach(room => {
        console.log(`  - Room: ${room.name} (ID: ${room.id})`);
        console.log(`    Room Images count: ${room.images.length}`);
        if (room.images.length > 0) {
            console.log(`    Room Images URLs:`, room.images.map(i => i.url));
        }
      });
    } else {
      console.log(`  No rooms found.`);
    }
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());


const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- Listing and Room Images Audit ---");

  const listings = await prisma.listing.findMany({
    include: {
      rooms: {
        include: {
          images: true
        }
      }
    }
  });

  listings.forEach(listing => {
    console.log(`\nListing: ${listing.title} (ID: ${listing.id})`);
    console.log(`Listing Images count: ${Array.isArray(listing.images) ? listing.images.length : 0}`);
    console.log(`Listing Images:`, listing.images);
    
    if (listing.rooms && listing.rooms.length > 0) {
      listing.rooms.forEach(room => {
        console.log(`  - Room: ${room.name} (ID: ${room.id})`);
        console.log(`    Room Images count: ${room.images ? room.images.length : 0}`);
        console.log(`    Room Images:`, room.images);
      });
    } else {
      console.log(`  No rooms found.`);
    }
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

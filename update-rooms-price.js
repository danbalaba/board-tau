const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating all rooms to have the same price as their listing...');
  
  // Get all listings with their rooms
  const listings = await prisma.listing.findMany({
    include: {
      rooms: true
    }
  });
  
  let updatedCount = 0;
  
  // Update each room's price to match the listing's price
  for (const listing of listings) {
    const { id: listingId, price: listingPrice, rooms } = listing;
    
    if (rooms.length > 0) {
      const updateResult = await prisma.room.updateMany({
        where: {
          listingId: listingId
        },
        data: {
          price: listingPrice
        }
      });
      
      updatedCount += updateResult.count;
      console.log(`Updated ${updateResult.count} rooms for listing ${listingId}`);
    }
  }
  
  console.log(`\n✅ Updated ${updatedCount} rooms in total`);
}

main()
  .catch((e) => {
    console.error('Error updating rooms price:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

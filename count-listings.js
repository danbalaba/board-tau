
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function countListings() {
  try {
    const count = await prisma.listing.count();
    console.log(`Number of listings in database: ${count}`);

    // Also check their status
    const activeCount = await prisma.listing.count({ where: { status: 'active' } });
    console.log(`Number of active listings: ${activeCount}`);

    // Check if there are any rooms associated with listings
    const listingsWithRooms = await prisma.listing.findMany({
      include: { rooms: true },
      take: 10
    });

    console.log('\nSample listings with rooms count:');
    listingsWithRooms.forEach(listing => {
      console.log(`- ${listing.title}: ${listing.rooms.length} rooms`);
    });

  } catch (error) {
    console.error('Error counting listings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

countListings();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating all rooms to AVAILABLE status...');
  
  const updatedRooms = await prisma.room.updateMany({
    data: {
      status: 'AVAILABLE'
    }
  });
  
  console.log(`Updated ${updatedRooms.count} rooms to AVAILABLE status`);
}

main()
  .catch((e) => {
    console.error('Error updating rooms status:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

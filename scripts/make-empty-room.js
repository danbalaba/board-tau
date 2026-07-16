const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateRoomCapacity() {
  try {
    // Find the first BEDSPACE room
    const room = await prisma.room.findFirst({
      where: {
        roomType: 'BEDSPACE'
      },
      include: {
        listing: true
      }
    });
    
    if (room) {
      // Update capacity to 4 and availableSlots to 4 (no occupancy)
      await prisma.room.update({
        where: { id: room.id },
        data: { 
            capacity: 4,
            availableSlots: 4 
        }
      });
      console.log('Successfully updated the room to 4/4 capacity (no occupancy)!');
      console.log('--- Details ---');
      console.log('Room Name: ' + room.name);
      console.log('New Capacity: 4 | Available Slots: 4');
      console.log('Listing Name: ' + (room.listing?.title || 'Unknown'));
      console.log('Listing URL: http://localhost:3000/listings/' + room.listingId);
    } else {
      console.log('Could not find any bedspace room to update.');
    }
  } catch (error) {
    console.error('Error updating room:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateRoomCapacity();

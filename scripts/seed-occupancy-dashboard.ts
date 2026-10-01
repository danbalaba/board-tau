import { PrismaClient } from '@prisma/client';
import { cache } from '../lib/redis';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding Occupancy Rate Test Data for Landlords...');

  // 1. Find all landlords (or users with listings)
  const landlords = await prisma.user.findMany({
    where: {
      OR: [
        { role: 'LANDLORD' },
        { role: 'ADMIN' },
        { role: 'SUPER_ADMIN' },
        { isVerifiedLandlord: true }
      ]
    },
    include: {
      listings: {
        where: { isArchived: false },
        include: {
          rooms: {
            where: { isArchived: false }
          }
        }
      }
    }
  });

  if (landlords.length === 0) {
    console.log('⚠️ No landlord accounts found. Searching for any users with listings...');
    const usersWithListings = await prisma.user.findMany({
      where: {
        listings: { some: { isArchived: false } }
      },
      include: {
        listings: {
          where: { isArchived: false },
          include: { rooms: { where: { isArchived: false } } }
        }
      }
    });
    landlords.push(...usersWithListings);
  }

  console.log(`📋 Found ${landlords.length} landlord accounts.`);

  const now = new Date();
  const pastDate = new Date();
  pastDate.setDate(now.getDate() - 7); // 7 days ago

  const futureDate = new Date();
  futureDate.setDate(now.getDate() + 23); // 23 days in the future

  // Find or create a tenant user for reservations
  let tenant = await prisma.user.findFirst({
    where: { role: 'USER' }
  });

  if (!tenant) {
    tenant = await prisma.user.create({
      data: {
        name: 'Sample Student Tenant',
        email: `student.tenant.${Date.now()}@example.com`,
        role: 'USER',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'
      }
    });
  }

  let totalSeededReservations = 0;

  for (const landlord of landlords) {
    console.log(`\n🏠 Processing Landlord: ${landlord.name || landlord.email} (${landlord.id})`);

    // Ensure landlord listings are ACTIVE
    for (const listing of landlord.listings) {
      if (listing.status !== 'ACTIVE') {
        await prisma.listing.update({
          where: { id: listing.id },
          data: { status: 'ACTIVE' }
        });
        console.log(`   └─ Updated listing "${listing.title}" status to ACTIVE`);
      }

      // Check rooms
      let rooms = listing.rooms;
      if (rooms.length === 0) {
        console.log(`   └─ Listing "${listing.title}" has no rooms. Creating 3 sample rooms...`);
        const createdRooms = await Promise.all([
          prisma.room.create({
            data: {
              listingId: listing.id,
              name: 'Room 101 - Solo Deluxe',
              price: 4500,
              capacity: 1,
              availableSlots: 1,
              status: 'AVAILABLE'
            } as any
          }),
          prisma.room.create({
            data: {
              listingId: listing.id,
              name: 'Room 102 - Double Bedspace',
              price: 3500,
              capacity: 2,
              availableSlots: 2,
              status: 'AVAILABLE'
            } as any
          }),
          prisma.room.create({
            data: {
              listingId: listing.id,
              name: 'Room 103 - Quad Bedspace',
              price: 2500,
              capacity: 4,
              availableSlots: 4,
              status: 'AVAILABLE'
            } as any
          })
        ]);
        rooms = createdRooms as any;
      }

      // Seed active reservations for ~75% of room capacity
      for (const room of rooms) {
        // Check existing active reservations
        const existingActiveResCount = await prisma.reservation.count({
          where: {
            roomId: room.id,
            status: { in: ['RESERVED', 'CHECKED_IN'] },
            isArchived: false,
            startDate: { lte: now },
            endDate: { gte: now }
          }
        });

        // Determine target bookings (e.g. fill capacity or leave 1 slot open)
        const targetBookings = Math.max(1, room.capacity > 1 ? room.capacity - 1 : 1);
        const neededBookings = targetBookings - existingActiveResCount;

        for (let i = 0; i < neededBookings; i++) {
          const res = await prisma.reservation.create({
            data: {
              userId: tenant.id,
              listingId: listing.id,
              roomId: room.id,
              startDate: pastDate,
              endDate: futureDate,
              durationInDays: 30,
              totalPrice: room.price || 3500,
              status: i % 2 === 0 ? 'CHECKED_IN' : 'RESERVED',
              paymentStatus: 'PAID',
              paymentMethod: 'GCASH',
              occupantsCount: 1,
              isWalkIn: false,
              isArchived: false
            } as any
          });
          totalSeededReservations++;
          console.log(`   └─ Created active reservation ${res.id} for "${room.name}" (${room.capacity} slots)`);
        }
      }
    }
  }

  console.log(`\n✅ Seeding complete! Created ${totalSeededReservations} active reservations.`);

  // Flush Redis Cache so dashboard stats update immediately
  console.log('⚡ Flushing Redis dashboard cache...');
  try {
    await cache.flush();
    console.log('✅ Redis cache flushed successfully.');
  } catch (err) {
    console.warn('⚠️ Redis flush failed or Redis unavailable:', err);
  }
}

main()
  .catch(e => {
    console.error('❌ Error seeding occupancy data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

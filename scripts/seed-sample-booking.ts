import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding sample booking data...');

  // 1. Find a Landlord
  const landlord = await prisma.user.findFirst({
    where: {
      OR: [
        { role: 'LANDLORD' },
        { role: 'ADMIN' },
        { isVerifiedLandlord: true }
      ]
    },
    include: {
      listings: {
        include: {
          rooms: true
        }
      }
    }
  });

  if (!landlord) {
    console.error('No landlord user found in database!');
    process.exit(1);
  }

  console.log(`Found Landlord: ${landlord.name || landlord.email} (${landlord.id})`);

  // 2. Find a listing & room for this landlord
  let listing: any = landlord.listings[0];
  if (!listing) {
    console.log('No existing listing found for landlord. Creating a sample listing...');
    listing = await prisma.listing.create({
      data: {
        title: 'DANILO Dormitory',
        description: 'Modern student dormitory with complete amenities near campus.',
        imageSrc: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
        roomCount: 4,
        bathroomCount: 2,
        userId: landlord.id,
        price: 3500,
        status: 'APPROVED',
      } as any
    });
  }

  let room: any = listing.rooms?.[0];
  if (!room) {
    console.log('No existing room found for listing. Creating a sample room...');
    room = await prisma.room.create({
      data: {
        listingId: listing.id,
        name: 'Deluxe Room 101',
        description: 'Fully furnished solo room with aircon and study desk',
        price: 3500,
        capacity: 2,
        availableSlots: 2,
        status: 'AVAILABLE',
      } as any
    });
  }

  // 3. Find or create a tenant user
  let tenant = await prisma.user.findFirst({
    where: { role: 'USER' }
  });

  if (!tenant) {
    tenant = await prisma.user.create({
      data: {
        name: 'William Afton',
        email: 'william.afton@example.com',
        role: 'USER',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'
      }
    });
  }

  // 4. Create CHECKED_IN Booking (Active Stay)
  const startDate1 = new Date();
  const endDate1 = new Date();
  endDate1.setDate(startDate1.getDate() + 60);

  const booking1 = await prisma.reservation.create({
    data: {
      userId: tenant.id,
      listingId: listing.id,
      roomId: room.id,
      startDate: startDate1,
      endDate: endDate1,
      durationInDays: 60,
      totalPrice: 7000,
      status: 'CHECKED_IN',
      paymentStatus: 'PAID',
      paymentMethod: 'GCASH',
      occupantsCount: 1,
      isWalkIn: false,
      isArchived: false,
    } as any
  });

  // 5. Create Walk-in CHECKED_IN Booking
  const startDate2 = new Date();
  const endDate2 = new Date();
  endDate2.setDate(startDate2.getDate() + 30);

  const booking2 = await prisma.reservation.create({
    data: {
      userId: null,
      guestName: 'Maria Santos',
      guestContact: '09181234567',
      listingId: listing.id,
      roomId: room.id,
      startDate: startDate2,
      endDate: endDate2,
      durationInDays: 30,
      totalPrice: 3500,
      status: 'CHECKED_IN',
      paymentStatus: 'PAID',
      paymentMethod: 'CASH',
      occupantsCount: 1,
      isWalkIn: true,
      isArchived: false,
    } as any
  });

  console.log('Successfully created sample active stay bookings!');
  console.log(`- Booking 1 ID (CHECKED_IN - Tenant): ${booking1.id}`);
  console.log(`- Booking 2 ID (CHECKED_IN - Walk-in): ${booking2.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

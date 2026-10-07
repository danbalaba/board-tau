import { PrismaClient, ListingStatus, InquiryStatus, ReservationStatus, PaymentStatus, RoomStatus, BedType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding diverse test data for landlord filtering and report testing...');

  // 1. Find Landlord User
  const landlord = await prisma.user.findFirst({
    where: {
      OR: [
        { role: 'LANDLORD' },
        { role: 'ADMIN' },
        { isVerifiedLandlord: true }
      ]
    }
  });

  if (!landlord) {
    console.error('❌ No landlord user found in database!');
    process.exit(1);
  }

  console.log(`👤 Operating for Landlord: ${landlord.name || landlord.email} (ID: ${landlord.id})`);

  // 2. Find or Create Sample Tenant Users
  let tenant1 = await prisma.user.findFirst({ where: { email: 'student.juan@example.com' } });
  if (!tenant1) {
    tenant1 = await prisma.user.create({
      data: {
        name: 'Juan Dela Cruz',
        email: 'student.juan@example.com',
        role: 'USER',
        image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'
      }
    });
  }

  let tenant2 = await prisma.user.findFirst({ where: { email: 'maria.clara@example.com' } });
  if (!tenant2) {
    tenant2 = await prisma.user.create({
      data: {
        name: 'Maria Clara',
        email: 'maria.clara@example.com',
        role: 'USER',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'
      }
    });
  }

  let tenant3 = await prisma.user.findFirst({ where: { email: 'pedro.penduko@example.com' } });
  if (!tenant3) {
    tenant3 = await prisma.user.create({
      data: {
        name: 'Pedro Penduko',
        email: 'pedro.penduko@example.com',
        role: 'USER',
        image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61'
      }
    });
  }

  // 3. Find or create Property Types if needed
  let agriType = await prisma.propertyType.findFirst({ where: { name: { contains: 'Agri', mode: 'insensitive' } } });
  if (!agriType) {
    agriType = await prisma.propertyType.create({
      data: { name: 'Agri-Hostel', description: 'Agricultural campus hostel lodging' }
    });
  }

  let dormType = await prisma.propertyType.findFirst({ where: { name: { contains: 'Dorm', mode: 'insensitive' } } });
  if (!dormType) {
    dormType = await prisma.propertyType.create({
      data: { name: 'Dormitory', description: 'Student dormitory units' }
    });
  }

  let aptType = await prisma.propertyType.findFirst({ where: { name: { contains: 'Apart', mode: 'insensitive' } } });
  if (!aptType) {
    aptType = await prisma.propertyType.create({
      data: { name: 'Apartment', description: 'Private apartment suites' }
    });
  }

  // 4. Create Listings with Diverse Statuses
  console.log('🏢 Creating listings (APPROVED/ACTIVE, PENDING, REJECTED)...');

  const pendingListing = await prisma.listing.create({
    data: {
      title: 'Pineview Student Residence [PENDING]',
      description: 'Newly submitted property awaiting admin verification and approval.',
      imageSrc: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5',
      roomCount: 6,
      bathroomCount: 3,
      userId: landlord.id,
      price: 3200,
      status: ListingStatus.PENDING,
      propertyTypeId: dormType.id,
    }
  });

  const rejectedListing = await prisma.listing.create({
    data: {
      title: 'Heights Lodging [REJECTED]',
      description: 'Property listing rejected due to incomplete safety documentation.',
      imageSrc: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
      roomCount: 2,
      bathroomCount: 1,
      userId: landlord.id,
      price: 2800,
      status: ListingStatus.REJECTED,
      rejectionReason: 'Missing fire safety inspection certificate',
      propertyTypeId: aptType.id,
    }
  });

  const activeListing = await prisma.listing.create({
    data: {
      title: 'TAU AgriHostel Deluxe [APPROVED]',
      description: 'Premium campus housing located right beside the agricultural hub.',
      imageSrc: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
      roomCount: 10,
      bathroomCount: 5,
      userId: landlord.id,
      price: 4500,
      status: ListingStatus.APPROVED,
      propertyTypeId: agriType.id,
    }
  });

  console.log(`✅ Created Listings:
  - Pending: ${pendingListing.title} (${pendingListing.id})
  - Rejected: ${rejectedListing.title} (${rejectedListing.id})
  - Approved: ${activeListing.title} (${activeListing.id})`);

  // 5. Create Rooms under activeListing
  console.log('🚪 Creating rooms (AVAILABLE, FULL, MAINTENANCE)...');

  const roomAvailable = await prisma.room.create({
    data: {
      listingId: activeListing.id,
      name: 'Agri-Suite 101 (Available)',
      description: 'Spacious solo unit with study desk, aircon, and high-speed Wi-Fi',
      price: 4500,
      capacity: 1,
      availableSlots: 1,
      status: RoomStatus.AVAILABLE,
      bedType: BedType.SINGLE,
      bedCount: 1,
      reservationFee: 500,
    }
  });

  const roomFull = await prisma.room.create({
    data: {
      listingId: activeListing.id,
      name: 'Agri-Bunk 202 (Full)',
      description: 'Quad bedspace unit fully occupied by agri students',
      price: 2500,
      capacity: 4,
      availableSlots: 0,
      status: RoomStatus.FULL,
      bedType: BedType.BUNK,
      bedCount: 2,
      reservationFee: 300,
    }
  });

  const roomMaintenance = await prisma.room.create({
    data: {
      listingId: activeListing.id,
      name: 'Agri-Room 303 (Maintenance)',
      description: 'Currently undergoing plumbing and aircon maintenance',
      price: 3800,
      capacity: 2,
      availableSlots: 0,
      status: RoomStatus.MAINTENANCE,
      bedType: BedType.DOUBLE,
      bedCount: 1,
      reservationFee: 400,
    }
  });

  // 6. Create Inquiries (PENDING, APPROVED, REJECTED)
  console.log('📩 Creating inquiries (PENDING, APPROVED, REJECTED)...');

  const inqPending = await prisma.inquiry.create({
    data: {
      listingId: activeListing.id,
      roomId: roomAvailable.id,
      userId: tenant1.id,
      moveInDate: new Date(),
      checkOutDate: new Date(Date.now() + 180 * 86400000),
      occupantsCount: 1,
      message: 'Hi! Is visitors policy flexible during weekends?',
      status: InquiryStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
    }
  });

  const inqApproved = await prisma.inquiry.create({
    data: {
      listingId: activeListing.id,
      roomId: roomAvailable.id,
      userId: tenant2.id,
      moveInDate: new Date(),
      checkOutDate: new Date(Date.now() + 90 * 86400000),
      occupantsCount: 1,
      message: 'Interested in reserving room starting next month.',
      status: InquiryStatus.APPROVED,
      isApproved: true,
      paymentStatus: PaymentStatus.UNPAID,
    }
  });

  const inqRejected = await prisma.inquiry.create({
    data: {
      listingId: activeListing.id,
      roomId: roomFull.id,
      userId: tenant3.id,
      moveInDate: new Date(),
      checkOutDate: new Date(Date.now() + 30 * 86400000),
      occupantsCount: 2,
      message: 'Can 3 students fit in this quad room?',
      status: InquiryStatus.REJECTED,
      rejectionReason: 'Exceeds maximum allowable room capacity limit',
      paymentStatus: PaymentStatus.UNPAID,
    }
  });

  // 7. Create Reservations (PENDING_PAYMENT, RESERVED, CANCELLED)
  console.log('📅 Creating reservation requests (PENDING_PAYMENT, RESERVED, CANCELLED)...');

  const resPendingPayment = await prisma.reservation.create({
    data: {
      userId: tenant1.id,
      listingId: activeListing.id,
      roomId: roomAvailable.id,
      inquiryId: inqApproved.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 86400000),
      durationInDays: 30,
      totalPrice: 4500,
      status: ReservationStatus.PENDING_PAYMENT,
      paymentStatus: PaymentStatus.PENDING,
      occupantsCount: 1,
    }
  });

  const resReserved = await prisma.reservation.create({
    data: {
      userId: tenant2.id,
      listingId: activeListing.id,
      roomId: roomAvailable.id,
      startDate: new Date(Date.now() + 7 * 86400000),
      endDate: new Date(Date.now() + 97 * 86400000),
      durationInDays: 90,
      totalPrice: 13500,
      status: ReservationStatus.RESERVED,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: 'GCASH',
      paymentReference: 'GCASH-99882211',
      occupantsCount: 1,
    }
  });

  const resCancelled = await prisma.reservation.create({
    data: {
      userId: tenant3.id,
      listingId: activeListing.id,
      roomId: roomFull.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 15 * 86400000),
      durationInDays: 15,
      totalPrice: 2500,
      status: ReservationStatus.CANCELLED,
      paymentStatus: PaymentStatus.FAILED,
      cancellationReason: 'Tenant decided to transfer to another campus program',
      occupantsCount: 1,
    }
  });

  // 8. Create Bookings (CHECKED_IN active stay, COMPLETED past stay)
  console.log('🔑 Creating stay bookings (CHECKED_IN, COMPLETED)...');

  const bookingCheckedIn = await prisma.reservation.create({
    data: {
      userId: tenant1.id,
      listingId: activeListing.id,
      roomId: roomAvailable.id,
      startDate: new Date(Date.now() - 10 * 86400000),
      endDate: new Date(Date.now() + 50 * 86400000),
      durationInDays: 60,
      totalPrice: 9000,
      status: ReservationStatus.CHECKED_IN,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: 'MAYA',
      occupantsCount: 1,
    }
  });

  const bookingCompleted = await prisma.reservation.create({
    data: {
      userId: tenant2.id,
      listingId: activeListing.id,
      roomId: roomFull.id,
      startDate: new Date(Date.now() - 120 * 86400000),
      endDate: new Date(Date.now() - 30 * 86400000),
      durationInDays: 90,
      totalPrice: 7500,
      status: ReservationStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: 'CASH',
      occupantsCount: 1,
    }
  });

  // 9. Create Reviews (Needs response vs Responded, Ratings 1-5)
  console.log('⭐ Creating reviews with different ratings & response statuses...');

  await prisma.review.create({
    data: {
      userId: tenant1.id,
      listingId: activeListing.id,
      reservationId: bookingCompleted.id,
      rating: 5,
      comment: 'Super clean, quiet environment and very approachable landlord! Highly recommended for TAU students.',
      status: 'approved',
      response: 'Thank you so much Juan! You were an awesome tenant.',
      respondedAt: new Date(),
    }
  });

  await prisma.review.create({
    data: {
      userId: tenant2.id,
      listingId: activeListing.id,
      rating: 1,
      comment: 'Water pressure in 2nd floor bathroom was very weak during morning peak hours.',
      status: 'approved',
      response: null, // Needs Response
    }
  });

  await prisma.review.create({
    data: {
      userId: tenant3.id,
      listingId: activeListing.id,
      rating: 3,
      comment: 'Decent stay overall, but Wi-Fi signal drops occasionally near the rear rooms.',
      status: 'approved',
      response: 'Thanks for the feedback! We are upgrading our mesh Wi-Fi routers this week.',
      respondedAt: new Date(),
    }
  });

  await prisma.review.create({
    data: {
      userId: tenant1.id,
      listingId: pendingListing.id,
      rating: 4,
      comment: 'Looks very promising! Looking forward to when this property opens.',
      status: 'approved',
      response: null, // Needs Response
    }
  });

  console.log('🎉 Seeding completed successfully!');
  console.log('----------------------------------------------------');
  console.log(`Summary of Seeded Test Data:
  • Properties: PENDING, REJECTED, APPROVED (Agri-Hostel)
  • Rooms: AVAILABLE, FULL, MAINTENANCE
  • Inquiries: PENDING, APPROVED, REJECTED
  • Reservations: PENDING_PAYMENT, RESERVED, CANCELLED
  • Bookings: CHECKED_IN, COMPLETED
  • Reviews: 1 Star (Needs Response), 4 Star (Needs Response), 3 Star (Responded), 5 Star (Responded)
  ----------------------------------------------------`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding test data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

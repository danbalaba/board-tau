import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding moderation data...');

  // 1. Create a test user
  const user = await prisma.user.create({
    data: {
      email: `test_user_${Date.now()}@example.com`,
      name: 'Test Student',
      role: 'USER',
      isActive: true,
    }
  });

  const landlord = await prisma.user.create({
    data: {
      email: `test_landlord_${Date.now()}@example.com`,
      name: 'Test Landlord',
      role: 'LANDLORD',
      isActive: true,
    }
  });

  // 2. Create Pending Listings
  await prisma.listing.create({
    data: {
      title: 'Cozy Dorm near Campus',
      description: 'A very nice place to stay, completely fully furnished and ready to move in.',
      imageSrc: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
      roomCount: 2,
      bathroomCount: 1,
      userId: landlord.id,
      price: 5000,
      status: 'pending',
    } as any // Ignoring any strict type issues for fast seeding
  });

  await prisma.listing.create({
    data: {
      title: 'Affordable Bedspace for Students',
      description: 'Budget friendly bedspace with free wifi.',
      imageSrc: 'https://images.unsplash.com/photo-1554995207-c18c203602cb',
      roomCount: 1,
      bathroomCount: 1,
      userId: landlord.id,
      price: 2500,
      status: 'pending',
    } as any
  });

  // 3. Create Pending Reviews
  const approvedListing = await prisma.listing.create({
    data: {
      title: 'The Grand Dormitory',
      description: 'Already approved testing listing.',
      imageSrc: 'https://images.unsplash.com/photo-1502672260266-1c1de2d9d0cb',
      roomCount: 5,
      bathroomCount: 3,
      userId: landlord.id,
      price: 3000,
      status: 'approved',
    } as any
  });

  await prisma.review.create({
    data: {
      userId: user.id,
      listingId: approvedListing.id,
      rating: 4,
      comment: 'This place was decent, but it was a little noisy at night. Otherwise great value!',
      status: 'pending',
      cleanliness: 4,
      accuracy: 5,
      communication: 4,
      location: 5,
      value: 4,
    }
  });

  await prisma.review.create({
    data: {
      userId: user.id,
      listingId: approvedListing.id,
      rating: 1,
      comment: 'Terrible place. Do not recommend. The landlord was very rude to me.',
      status: 'pending',
      cleanliness: 1,
      accuracy: 2,
      communication: 1,
      location: 4,
      value: 1,
    }
  });

  // 4. Create Pending Host Application
  await prisma.hostApplication.create({
    data: {
      userId: user.id, // User applying to be host
      status: 'pending',
      businessInfo: { businessName: 'Student Haven Dorms', mission: 'To provide safe housing for students' },
      contactInfo: { fullName: 'Test Student', phoneNumber: '09123456789' },
    }
  });

  console.log('Successfully seeded Moderation Data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

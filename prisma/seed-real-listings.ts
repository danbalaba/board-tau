import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import { ROOM_TYPES } from "../data/roomTypes.js";
import { ROOM_AMENITIES } from "../data/roomAmenities.js";

const prisma = new PrismaClient();

// Sample user data (landlord who owns all listings)
const landlord = {
  name: "TAU Property Management",
  email: "landlord@boardtau.test",
  password: "TestPassword@123",
  image: "https://api.placeholder.com/avatar.jpg",
};

const admin = {
  name: "BoardTAU Admin",
  email: "admin@boardtau.test",
  password: "AdminPassword@123",
  image: "https://api.placeholder.com/avatar-admin.jpg",
};

// Sample review users (students who reviewed)
const reviewUsers = [
  {
    name: "Maria Santos",
    email: "maria@student.edu",
    password: "Password@123",
    image: "https://api.placeholder.com/avatar1.jpg",
  },
  {
    name: "Juan Cruz",
    email: "juan@student.edu",
    password: "Password@123",
    image: "https://api.placeholder.com/avatar2.jpg",
  },
  {
    name: "Angela Garcia",
    email: "angela@student.edu",
    password: "Password@123",
    image: "https://api.placeholder.com/avatar3.jpg",
  },
  {
    name: "Pedro Reyes",
    email: "pedro@student.edu",
    password: "Password@123",
    image: "https://api.placeholder.com/avatar4.jpg",
  },
];

// Load processed real listings from JSON file with images
const realListings = JSON.parse(fs.readFileSync("processed-real-listings.json", "utf8"));

async function main() {
  console.log("🌱 Starting to seed real listings data...");

  // Clean existing data (optional but recommended for fresh seed)
  await prisma.listingImage.deleteMany();
  await prisma.room.deleteMany();
  await prisma.review.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Cleared existing data");

  // Create admin user
  const hashedAdminPassword = await bcrypt.hash(admin.password, 10);
  const adminUser = await prisma.user.create({
    data: {
      ...admin,
      password: hashedAdminPassword,
      role: "admin",
      emailVerified: new Date(), // Mark admin email as verified
    },
  });
  console.log(`✅ Created admin user: ${admin.email}`);

  // Create landlord user
  const hashedLandlordPassword = await bcrypt.hash(landlord.password, 10);
  const landlordUser = await prisma.user.create({
    data: {
      ...landlord,
      password: hashedLandlordPassword,
      role: "user",
      emailVerified: new Date(), // Mark landlord email as verified
    },
  });
  console.log(`✅ Created landlord user: ${landlord.email}`);

  // Create review users
  const createdReviewUsers = [];
  for (const userData of reviewUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        role: "user",
        emailVerified: new Date(), // Mark review users emails as verified
      },
    });
    createdReviewUsers.push(user);
    console.log(`✅ Created review user: ${userData.email}`);
  }

  // Create real listings
  for (const listingData of realListings) {
    console.log(`\nCreating listing: ${listingData.title}`);

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        title: listingData.title,
        description: listingData.description,
        imageSrc: listingData.images[0]?.url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
        category: Array.isArray(listingData.category) ? listingData.category : [listingData.category],
        roomCount: listingData.roomCount,
        bathroomCount: listingData.bathroomCount,
        price: listingData.price,
        country: "Philippines",
        region: "Tarlac",
        latlng: [listingData.coords.lat, listingData.coords.lng],
        amenities: listingData.amenities,
        rating: listingData.rating,
        reviewCount: listingData.reviewCount,
        userId: landlordUser.id,
        status: "active",
        approvedAt: new Date(),
        approvedBy: adminUser.id,
        femaleOnly: listingData.femaleOnly,
        maleOnly: listingData.maleOnly,
        visitorsAllowed: listingData.visitorsAllowed,
        petsAllowed: listingData.petsAllowed,
        smokingAllowed: listingData.smokingAllowed,
        security24h: listingData.security24h,
        cctv: listingData.cctv,
        fireSafety: listingData.fireSafety,
        nearTransport: listingData.nearTransport,
        studyFriendly: listingData.studyFriendly,
        quietEnvironment: listingData.quietEnvironment,
        flexibleLease: listingData.flexibleLease,
      },
    });
    console.log(`✅ Created listing: ${listing.title}`);

    // Create rooms for the listing
    const roomCount = listingData.roomCount;
    const roomsData = [];

    // Normalize room type
    const normalizedRoomType =
      listingData.roomType.toLowerCase() === "solo"
        ? ROOM_TYPES.SOLO
        : ROOM_TYPES.BEDSPACE;

    for (let i = 1; i <= roomCount; i++) {
      // Room price with variation
      const price = listingData.price + (i * 300);

      // Capacity and available slots
      const capacity =
        normalizedRoomType === "SOLO"
          ? 1
          : Math.floor(Math.random() * 5) + 2;

      const availableSlots =
        normalizedRoomType === "SOLO"
          ? 1
          : Math.floor(Math.random() * capacity) + 1;

      // Bed type
      const bedType =
        normalizedRoomType === "SOLO"
          ? ["Single", "Double", "Queen"][Math.floor(Math.random() * 3)]
          : "Bunk";

      // Room size
      const size =
        normalizedRoomType === "SOLO"
          ? 12 + Math.random() * 13
          : 20 + Math.random() * 20;

      // Room amenities
      let roomAmenities: string[] = [];
      if (normalizedRoomType === ROOM_TYPES.SOLO) {
        roomAmenities = [ROOM_AMENITIES.PRIVATE_BATHROOM];
        if (Math.random() > 0.4) roomAmenities.push(ROOM_AMENITIES.AC);
        if (Math.random() > 0.5) roomAmenities.push(ROOM_AMENITIES.DESK);
        if (Math.random() > 0.6) roomAmenities.push(ROOM_AMENITIES.CLOSET);
        if (Math.random() > 0.7) roomAmenities.push(ROOM_AMENITIES.BALCONY);
      } else {
        roomAmenities = [ROOM_AMENITIES.SHARED_BATHROOM];
        if (Math.random() > 0.4) roomAmenities.push(ROOM_AMENITIES.AC);
        if (Math.random() > 0.5) roomAmenities.push(ROOM_AMENITIES.DESK);
        if (Math.random() > 0.6) roomAmenities.push(ROOM_AMENITIES.CLOSET);
      }

      roomsData.push({
        listingId: listing.id,
        name: `${normalizedRoomType} Room ${i}`,
        price,
        capacity,
        availableSlots,
        roomType: normalizedRoomType,
        bedType,
        size: parseFloat(size.toFixed(1)), // Round to 1 decimal place
        amenities: roomAmenities,
        images: [],
        status: "available",
      });
    }

    // Create rooms
    await prisma.room.createMany({
      data: roomsData,
    });

    // Update listing.price to be the lowest room price
    const lowestRoomPrice = Math.min(...roomsData.map(room => room.price));
    await prisma.listing.update({
      where: { id: listing.id },
      data: { price: lowestRoomPrice }
    });
    console.log(`✅ Added ${roomCount} rooms to listing: ${listing.title}`);

    // Create listing images
    if (listingData.images && listingData.images.length > 0) {
      const imagesData = (listingData.images as Array<{
        url: string;
        caption?: string;
        roomType: string;
      }>).map((img, index) => ({
        listingId: listing.id,
        url: img.url,
        caption: img.caption || img.roomType,
        roomType: img.roomType,
        order: index
      })).filter((img: { url: string }) => img.url && img.url.startsWith('https://'));

      await prisma.listingImage.createMany({
        data: imagesData
      });
      console.log(`✅ Added ${imagesData.length} images to listing: ${listing.title}`);
    }

    // Create reviews
    const reviewCount = listingData.reviewCount;
    const reviewsData = [];

    for (let i = 0; i < reviewCount; i++) {
      const reviewer = createdReviewUsers[i % createdReviewUsers.length];

      reviewsData.push({
        listingId: listing.id,
        userId: reviewer.id,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        comment: "Great place to stay! Highly recommended.",
        status: "approved",
      });
    }

    await prisma.review.createMany({
      data: reviewsData,
    });
    console.log(`✅ Added ${reviewCount} reviews to listing: ${listing.title}`);
  }

  console.log("\n🎉 All real listings data seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

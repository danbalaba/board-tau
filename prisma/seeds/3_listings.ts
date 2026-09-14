import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";

export async function seedListings(prisma: PrismaClient) {
  console.log("🚀 [3/4] Seeding Real Listings & Rooms around TAU...");

  const landlordEmail = "testlandlord@gmail.com";
  const landlordDoc = await prisma.user.findUnique({ where: { email: landlordEmail } });

  if (!landlordDoc) {
    console.warn("⚠️ Landlord user not found. Skipping listings seed.");
    return;
  }

  const studentNames = ["Maria Santos", "Juan Cruz", "Angela Garcia", "Pedro Reyes", "Kristine Dizon", "Robert Lee"];
  const students = [];

  const hashedPassword = await bcrypt.hash("Password@123", 10);
  const regions = ["Tarlac City", "Victoria", "Concepcion", "Camiling", "Capas", "Paniqui"];

  for (let i = 0; i < studentNames.length; i++) {
    const name = studentNames[i];
    const email = `${name.toLowerCase().replace(" ", ".")}@student.edu.ph`;
    
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "USER",
          emailVerified: new Date(),
          city: regions[i % regions.length],
          region: "Tarlac",
          lastLogin: new Date()
        }
      });
    }
    students.push(user);
  }

  // Fetch Existing PropertyTypes & RoomTypes
  const propertyTypes = await prisma.propertyType.findMany();
  const roomTypes = await prisma.roomTypeDefinition.findMany();
  const allAttributes = await prisma.dynamicAttribute.findMany({ where: { isActive: true } });

  if (propertyTypes.length === 0 || allAttributes.length === 0) {
    console.warn("⚠️ Taxonomy missing. Please seed taxonomy first.");
    return;
  }

  const propertyAmenities = allAttributes.filter(a => a.type === 'AMENITY');
  const roomAmenities = allAttributes.filter(a => a.type === 'ROOM_AMENITY');
  const featureAttrs = allAttributes.filter(a => a.type === 'FEATURE');
  const ruleAttrs = allAttributes.filter(a => a.type === 'RULE');

  let realListingsSource = [];
  try {
    if (fs.existsSync("processed-real-listings.json")) {
      realListingsSource = JSON.parse(fs.readFileSync("processed-real-listings.json", "utf8"));
    }
  } catch (e) {
    console.warn("Could not read processed-real-listings.json:", e);
  }

  if (!realListingsSource || realListingsSource.length === 0) {
    console.log("   ✓ Skipping listing file creation (no processed-real-listings.json found).");
    return;
  }

  const TOTAL_TARGET = Math.min(20, realListingsSource.length);
  console.log(`   📦 Creating ${TOTAL_TARGET} real listings linked to dynamic taxonomy...`);

  for (let i = 0; i < TOTAL_TARGET; i++) {
    const source = realListingsSource[i];
    const housePrice = source.price || 3500;
    const randomPropertyType = propertyTypes[i % propertyTypes.length];

    const listing = await prisma.listing.create({
      data: {
        title: source.title,
        description: source.description || "High-quality student housing in Tarlac, near TAU campus.",
        imageSrc: source.images?.[0]?.url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
        roomCount: source.roomCount || 4,
        bathroomCount: source.bathroomCount || 2,
        price: housePrice,
        country: "Philippines",
        region: "Tarlac",
        latitude: source.coords?.lat || 15.634,
        longitude: source.coords?.lng || 120.415,
        location: { type: "Point", coordinates: [source.coords?.lng || 120.415, source.coords?.lat || 15.634] },
        status: "ACTIVE",
        userId: landlordDoc.id,
        rating: 4.5,
        reviewCount: 1,
        propertyTypeId: randomPropertyType.id,
        listingLinks: {
          create: [
            ...propertyAmenities.slice(0, 3).map(a => ({ attributeId: a.id })),
            ...featureAttrs.slice(0, 2).map(a => ({ attributeId: a.id })),
            ...ruleAttrs.slice(0, 2).map(a => ({ attributeId: a.id }))
          ]
        }
      }
    });

    const availableRoomTypes = roomTypes.filter(rt => rt.propertyTypeId === randomPropertyType.id);

    const room = await prisma.room.create({
      data: {
        listingId: listing.id,
        name: "Standard Unit 101",
        price: housePrice,
        capacity: 2,
        availableSlots: 2,
        status: "AVAILABLE",
        roomTypeDefinitionId: availableRoomTypes[0]?.id || null,
        bedType: "SINGLE",
        size: 16.0,
        reservationFee: 500,
        roomLinks: {
          create: roomAmenities.slice(0, 3).map(a => ({ attributeId: a.id }))
        }
      }
    });
  }

  console.log("   ✓ Listings & Rooms seeded successfully.");
}

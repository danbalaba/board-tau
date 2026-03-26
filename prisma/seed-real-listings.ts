import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";

const prisma = new PrismaClient();

// LANDLORD & ADMIN USERS
const landlord = {
  name: "TAU Property Management",
  email: "landlord@boardtau.test",
  password: "TestPassword@123",
};

const admin = {
  name: "BoardTAU Admin",
  email: "admin@boardtau.test",
  password: "AdminPassword@123",
};

const studentNames = ["Maria Santos", "Juan Cruz", "Angela Garcia", "Pedro Reyes", "Kristine Dizon", "Robert Lee"];

// LOAD SOURCE DATA
const realListingsSource = JSON.parse(fs.readFileSync("processed-real-listings.json", "utf8"));

async function main() {
  console.log("🚀 STARTING THE BUG-FIXED SUPREME SEED (Final Final Evolution)...");

  // 1. DELETE STALE DATA
  await prisma.review.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.roomImage.deleteMany();
  await prisma.roomAmenity.deleteMany();
  await prisma.roomAmenityType.deleteMany();
  await prisma.room.deleteMany();
  await prisma.listingCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.listingFeature.deleteMany();
  await prisma.listingRule.deleteMany();
  await prisma.listingAmenity.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Database reset successfully.");

  // 2. CREATE SYSTEM USERS
  const hashedPassword = await bcrypt.hash("Password@123", 10);
  await prisma.user.create({
    data: { ...admin, password: hashedPassword, role: "ADMIN", emailVerified: new Date() }
  });
  const landlordDoc = await prisma.user.create({
    data: { ...landlord, password: hashedPassword, role: "LANDLORD", isVerifiedLandlord: true, emailVerified: new Date() }
  });

  const students = [];
  for (const name of studentNames) {
    const user = await prisma.user.create({
        data: { name, email: `${name.toLowerCase().replace(" ", ".")}@student.edu.ph`, password: hashedPassword, role: "USER", emailVerified: new Date() }
    });
    students.push(user);
  }

  // 3. CREATE CATEGORIES
  const categoryTemplates = [
    { name: "Student-Friendly", label: "Student Friendly", icon: "🎓" },
    { name: "Budget-Friendly", label: "Budget Friendly", icon: "💰" },
    { name: "Premium", label: "Premium / Private", icon: "⭐" },
    { name: "Apartment", label: "Apartment", icon: "🏠" },
    { name: "BoardingHouse", label: "Boarding House", icon: "🏚️" },
  ];
  const createdCats = [];
  for (const c of categoryTemplates) {
    const cat = await (prisma.category as any).create({ data: c });
    createdCats.push(cat);
  }

  const amTemplates = [
    { name: "wifi", icon: "📶", description: "In-room WiFi" },
    { name: "ac", icon: "❄️", description: "Air Conditioning" },
    { name: "fan", icon: "🌀", description: "Electric Fan" },
    { name: "desk", icon: "📚", description: "Study Table" },
    { name: "bathroom", icon: "🚿", description: "Own Bathroom" },
    { name: "submeter", icon: "⚡", description: "Electric Sub-meter" },
    { name: "locker", icon: "🔐", description: "Private Locker" }
  ];
  const roomAmTypes = [];
  for (const t of amTemplates) {
    const res = await prisma.roomAmenityType.create({ data: t });
    roomAmTypes.push(res);
  }

  // 4. THE SUPREME GENERATOR (50 Listings)
  const TOTAL_TARGET = 50;
  console.log(`📦 Generating ${TOTAL_TARGET} unique listing variations...`);

  for (let i = 0; i < TOTAL_TARGET; i++) {
    const source = realListingsSource[i % realListingsSource.length];
    const isAnnex = i >= realListingsSource.length;
    const housePrice = source.price + (Math.floor(Math.random() * 15) * 100);

    // FIX: Unique constraint error - ensures we don't pick the same category twice for one listing
    const randomCats = createdCats.sort(() => 0.5 - Math.random()).slice(0, 2);

    const listing = await prisma.listing.create({
      data: {
        title: `${source.title}${isAnnex ? ` - Annex ${Math.floor(i / realListingsSource.length)}` : ""}`,
        description: `${source.description} High-quality accommodation in Tarlac, specifically designed for university students.`,
        imageSrc: source.images?.[0]?.url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
        roomCount: source.roomCount || 5,
        bathroomCount: source.bathroomCount || 2,
        price: housePrice,
        country: "Philippines",
        region: "Tarlac",
        latitude: source.coords.lat,
        longitude: source.coords.lng,
        location: { type: "Point", coordinates: [source.coords.lng, source.coords.lat] },
        status: "active",
        userId: landlordDoc.id,
        rating: 4.2 + (Math.random() * 0.8),
        reviewCount: Math.floor(Math.random() * 30),
        
        amenities_tags: [
            "WiFi", "Water Dispenser", 
            Math.random() > 0.4 ? "No Curfew Enforced" : "Curfew Enforced",
            "Sari-Sari Store Nearby", "Laundry Area", "Purified Water Available", 
            "Kitchen Access", "CCTV Surveillance", "Motorcycle Parking"
        ].sort(() => 0.5 - Math.random()).slice(0, 8),

        amenities: { 
            create: { wifi: true, parking: true, laundry: true, airConditioning: Math.random() > 0.5, pool: false, gym: false } 
        },
        rules: { 
            create: { femaleOnly: i % 5 === 0, maleOnly: i % 8 === 0, visitorsAllowed: true, petsAllowed: Math.random() > 0.5, smokingAllowed: false } 
        },
        features: { 
            create: { security24h: true, cctv: true, fireSafety: true, nearTransport: true, studyFriendly: true, quietEnvironment: true } 
        },

        // FIXED: Applying the deduplicated categories
        categories: {
            create: randomCats.map(c => ({ categoryId: c.id }))
        }
      }
    });

    // 🖼️ Restore Listings Images Gallery
    if (source.images && source.images.length > 0) {
        await prisma.listingImage.createMany({
            data: source.images.map((img: any, idx: number) => ({
                listingId: listing.id,
                url: img.url,
                caption: img.caption || img.roomType || "Preview",
                roomType: img.roomType || "General",
                order: idx
            }))
        });
    }

    // CREATE ROOMS
    const count = Math.floor(Math.random() * 4) + 3;
    for (let r = 1; r <= count; r++) {
       const isSolo = r === 1 && Math.random() > 0.4;
       const rPrice = isSolo ? (housePrice + 1000) : housePrice;
       
       const room = await (prisma.room as any).create({
           data: {
               listingId: listing.id,
               name: `${isSolo ? "Solo" : "Bedspace"} Room ${r}`,
               price: rPrice,
               capacity: isSolo ? 1 : 4,
               availableSlots: Math.floor(Math.random() * 3) + 1,
               status: "AVAILABLE",
               roomType: isSolo ? "SOLO" : "BEDSPACE",
               bedType: isSolo ? "SINGLE" : "BUNK",
               size: 15.0,
               reservationFee: Math.floor(rPrice * 0.15),
               amenities: {
                   create: roomAmTypes.sort(() => 0.5 - Math.random()).slice(0, 4).map(at => ({ amenityTypeId: at.id }))
               }
           }
       });

       // 🖼️ Create Room images from source gallary
       const roomRelevantImages = source.images?.filter((img: any) => 
            img.roomType?.toLowerCase() === "bedroom" || img.roomType?.toLowerCase() === "cr"
       ).slice(0, 2);

       if (roomRelevantImages && roomRelevantImages.length > 0) {
           await (prisma.roomImage as any).createMany({
               data: roomRelevantImages.map((img: any, idx: number) => ({
                   roomId: room.id,
                   url: img.url,
                   caption: "Room Interior",
                   order: idx
               }))
           });
       } else if (source.images?.[0]) {
           await (prisma.roomImage as any).create({
               data: { roomId: room.id, url: source.images[0].url, caption: "Interior", order: 0 }
           });
       }
    }

    // REVIEWS
    const rCount = Math.floor(Math.random() * 3) + 1;
    for (let rv = 0; rv < rCount; rv++) {
        await prisma.review.create({
            data: {
                listingId: listing.id,
                userId: students[rv % students.length].id,
                rating: 4 + Math.floor(Math.random() * 2),
                comment: "Excellent stay near TAU campus! Highly recommended.",
                status: "approved"
            }
        });
    }
  }

  console.log(`\n🎉 SUPREME SEED FIXED & COMPLETE! Database is now live with 50 perfect Listings.`);
}

main()
  .catch(e => { console.error("❌ Fatal Injection Error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

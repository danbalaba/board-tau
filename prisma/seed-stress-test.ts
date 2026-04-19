import { PrismaClient, RoomType, ReservationStatus } from "@prisma/client";
import { TAU_COORDINATES, categories as CAT_OPTIONS } from "../utils/constants";
import { amenities as AM_OPTIONS } from "../data/amenities";
import { rulesPreferences as RULE_OPTIONS } from "../data/rulesPreferences";
import { advancedFilters as FEAT_OPTIONS } from "../data/advancedFilters";
import { roomAmenities as ROOM_AM_OPTIONS } from "../data/roomAmenities";

const prisma = new PrismaClient();

// Helper to generate random points around a center
function generateRandomPoint(center: [number, number], radiusInKm: number) {
  const x0 = center[1];
  const y0 = center[0];
  const rd = radiusInKm / 111.3; // Approx km to degrees

  const u = Math.random();
  const v = Math.random();
  const w = rd * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);

  return {
    lat: y0 + y,
    lng: x0 + x,
  };
}

const FIRST_NAMES = ["Reyes", "Santos", "Luna", "Garcia", "Pascual", "Bautista", "Aquino", "Dela Cruz", "Villanueva", "Lopez", "Perez", "Marcos", "Co"];
const MODIFIERS = ["Apartment", "Boarding House", "Dormitory", "Residency", "Suites", "Lodge", "Haven", "Place", "Villa"];
const ROOM_NAMES = ["A", "B", "C", "D", "101", "102", "201", "202", "Unit 1", "Unit 2", "Blue Room", "Green Room"];

// 📊 Extended Curated Photo Library (Verified No-404s)
const HOUSE_POOL = [
  "1502672260266-1c1ef2d93688", "1580537659466-419b6e57dad0", "1449156001511-ad6601b3152e",
  "1518780664697-55e3ad937233", "1513584684371-3641f95a6712", "1510798831971-661eb04b3739",
  "1494526585181-7521dc334a17", "1480074568708-e7b720bb3f09", "1600585154340-be6161a56a0c",
  "1600596542815-ffad4c1539a9", "1600607687939-ce8a6c25118c", "1600566752300-140ba732634a",
  "1583608205776-bfd35f0d9f83", "1512917774016-755a30036034", "1472224312386-3f0502a488c0",
  "1572120339974-046bd906000c", "1570129477492-45c003edd2be", "1568605114967-8130f3a36994",
  "1438340451891-eb6961fb0cc5", "1576013551827-0d1140ff42b0"
];

const INT_POOL = {
  "Bedroom": ["1505691938895-1758d7eaa511", "1522770179533-24471fcdba45", "1540518614846-a957a8217314"],
  "Living Room": ["1484154218962-a197022b5858", "1512918728675-ed5a9ecde9d7", "1493663284031-b748lbd86aeae6"],
  "Kitchen": ["1556912177-966cd9f015ab", "1604328698042-c751274fb33f", "1556909214-9556d1134a41"],
  "Bathroom": ["1584622650111-993a426fbf0a", "1600566752300-140ba732634a", "1497366754035-f200968a6e72"],
  "Common Area": ["1560448204-61dc36dc98c8", "1517544445381-0262efcd152f", "1519711489921-707b93fdc06b"]
};

async function main() {
  console.log("🚀 STARTING LARGE BATCH SEED (450 ADDITIONAL LISTINGS)...");

  console.log("🧹 Cleaning up previous stress-test data...");
  await prisma.listing.deleteMany({
    where: { title: { contains: " - " } }
  });

  const landlord = await prisma.user.findUnique({
    where: { email: "boardtau.official@gmail.com" },
  });

  if (!landlord) {
    console.error("❌ Landlord account not found!");
    return;
  }

  const allCategories = await prisma.category.findMany();
  const BATCH_SIZE = 450;
  
  for (let i = 0; i < BATCH_SIZE; i++) {
    const listingType = Math.random(); 
    const radius = Math.random() < 0.6 ? 2 : 15;
    const coords = generateRandomPoint(TAU_COORDINATES, radius);
    
    const ownerName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const modifier = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
    const title = `${ownerName} ${modifier} - ${i + 51}`;
    const basePrice = Math.floor(Math.random() * 2500) + 1200;
    const roomCount = Math.floor(Math.random() * 5) + 1;
    
    const selectedAmenities = AM_OPTIONS.filter(() => Math.random() > 0.4).map(a => a.value);
    const selectedCats = [...allCategories].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);

    // Pick a varied main image
    const mainImgId = HOUSE_POOL[i % HOUSE_POOL.length];

    const listing = await prisma.listing.create({
      data: {
        title,
        description: `Experience comfort at ${title}. Located ${radius < 2 ? 'near' : 'within a short ride from'} TAU. Perfect for students looking for ${selectedCats[0]?.name || 'a place'}.`,
        imageSrc: `https://images.unsplash.com/photo-${mainImgId}?auto=format&fit=crop&q=80&w=800`,
        price: basePrice,
        latitude: coords.lat,
        longitude: coords.lng,
        location: { type: "Point", coordinates: [coords.lng, coords.lat] },
        status: "active",
        userId: landlord.id,
        category: selectedCats.map(c => c.name),
        amenities_list: selectedAmenities,
        rating: 3.5 + Math.random() * 1.5,
        reviewCount: Math.floor(Math.random() * 20),
        roomCount: roomCount,
        bathroomCount: Math.max(1, Math.floor(roomCount / 2)),
        country: "Philippines",
        region: "Tarlac",
        
        // Full Photo Tour for ListingGallery (Using offset rotations i+idx)
        images: {
          create: Object.entries(INT_POOL).map(([type, ids], idx) => {
             const photoId = ids[i % ids.length];
             return {
                url: `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&q=80&w=1200`,
                caption: `${type} of ${title}`,
                roomType: type,
                order: idx + 1
             }
          }).concat({
             url: `https://images.unsplash.com/photo-${mainImgId}?auto=format&fit=crop&q=80&w=1200`,
             caption: `Exterior of ${title}`,
             roomType: "Exterior",
             order: 0
          })
        },

        rooms: {
          create: Array.from({ length: roomCount }).map((_, rIdx) => {
            let rType: RoomType = RoomType.BEDSPACE;
            if (listingType < 0.3) rType = RoomType.SOLO;
            else if (listingType > 0.6) rType = Math.random() > 0.5 ? RoomType.SOLO : RoomType.BEDSPACE;

            const roomImg = INT_POOL["Bedroom"][(i + rIdx) % INT_POOL["Bedroom"].length];

            return {
              name: `Room ${ROOM_NAMES[rIdx % ROOM_NAMES.length]}`,
              roomType: rType,
              price: rType === RoomType.SOLO ? basePrice + 800 : basePrice,
              capacity: rType === RoomType.SOLO ? 1 : 4,
              availableSlots: rType === RoomType.SOLO ? 1 : Math.floor(Math.random() * 5),
              status: "AVAILABLE",
              bedType: rType === RoomType.SOLO ? "SINGLE" : "BUNK",
              size: 12.0 + Math.random() * 5,
              images: {
                create: [
                   { url: `https://images.unsplash.com/photo-${roomImg}?auto=format&fit=crop&q=80&w=800`, caption: "Room Interior" }
                ]
              }
            };
          })
        },

        rules: {
          create: {
            femaleOnly: Math.random() > 0.8,
            maleOnly: Math.random() > 0.9,
            visitorsAllowed: Math.random() > 0.5,
            petsAllowed: Math.random() > 0.7,
            smokingAllowed: Math.random() > 0.9,
          }
        },

        features: {
          create: {
            security24h: Math.random() > 0.6,
            cctv: Math.random() > 0.4,
            nearTransport: Math.random() > 0.3,
            studyFriendly: Math.random() > 0.3,
          }
        },

        categories: {
          create: selectedCats.map(cat => ({
             categoryId: cat.id
          }))
        }
      }
    });

    if (i % 50 === 0) {
      console.log(`📦 Seeded ${i} / ${BATCH_SIZE} listings...`);
    }
  }

  console.log("✅ FINISHED! Total 500 listings (50 original + 450 new) are now available.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

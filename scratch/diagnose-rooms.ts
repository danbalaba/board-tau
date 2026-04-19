import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Searching for any listing with Kitchen Access AND a SOLO room...");

  const match = await prisma.listing.findFirst({
    where: {
      amenities_list: { has: "Kitchen Access" },
      rooms: { some: { roomType: "SOLO" } }
    },
    include: {
      rooms: {
        include: {
          amenities: { include: { amenityType: true } }
        }
      }
    }
  });

  if (!match) {
    console.log("❌ Truly NO listings found with BOTH [Kitchen Access] and [SOLO Room].");
    return;
  }

  console.log("✅ Found a match! Listing ID:", match.id);
  console.log("Listing Amenities:", match.amenities_list);
  
  match.rooms.forEach((room, i) => {
    if (room.roomType === "SOLO") {
      console.log(`\nRoom ${i+1} (SOLO) Amenities:`, 
        room.amenities.map(a => a.amenityType?.name)
      );
    }
  });
}




main().catch(console.error).finally(() => prisma.$disconnect());

import { db as prisma } from "../lib/db";
import fs from "fs";
import path from "path";

async function dumpAllDatabaseListings() {
  console.log("==========================================================================");
  console.log("  Exporting Complete Database Listings & Joined Model Taxonomy Data       ");
  console.log("==========================================================================");

  const listings = await prisma.listing.findMany({
    include: {
      propertyType: true,
      user: {
        select: { id: true, name: true, email: true, role: true }
      },
      listingLinks: {
        include: {
          attribute: {
            include: { subGroup: true }
          }
        }
      },
      rooms: {
        where: { isArchived: false },
        include: {
          roomTypeDefinition: true,
          roomLinks: {
            include: {
              attribute: {
                include: { subGroup: true }
              }
            }
          }
        }
      }
    }
  });

  const propertyTypes = await prisma.propertyType.findMany({ where: { isActive: true } });
  const roomTypeDefinitions = await prisma.roomTypeDefinition.findMany({ where: { isActive: true } });
  const dynamicAttributes = await prisma.dynamicAttribute.findMany({ where: { isActive: true } });
  const colleges = await prisma.campusCollege.findMany({ where: { isActive: true } });

  let mdContent = `# 📊 Complete Database Listings & Joined Taxonomy Export Dump\n\n`;
  mdContent += `*Generated At*: ${new Date().toISOString()}\n`;
  mdContent += `*Total Listings in DB*: ${listings.length}\n`;
  mdContent += `*Total Property Types*: ${propertyTypes.length}\n`;
  mdContent += `*Total Room Type Definitions*: ${roomTypeDefinitions.length}\n`;
  mdContent += `*Total Dynamic Attributes*: ${dynamicAttributes.length}\n`;
  mdContent += `*Total Campus Colleges*: ${colleges.length}\n\n`;

  mdContent += `---\n\n## 🏛️ Property Types (${propertyTypes.length})\n\n`;
  propertyTypes.forEach(pt => {
    mdContent += `- **${pt.name}** (ID: \`${pt.id}\`) - Icon: \`${pt.icon || "N/A"}\`\n`;
  });

  mdContent += `\n---\n\n## 🚪 Room Type Definitions (${roomTypeDefinitions.length})\n\n`;
  roomTypeDefinitions.forEach(rt => {
    mdContent += `- **${rt.name}** (ID: \`${rt.id}\`, PropertyTypeID: \`${rt.propertyTypeId}\`, FlatRate: \`${rt.isFlatRate}\`)\n`;
  });

  mdContent += `\n---\n\n## 🎓 TAU Campus Colleges (${colleges.length})\n\n`;
  colleges.forEach(c => {
    mdContent += `- **${c.name}** (\`${c.code}\`): Lat \`${c.latitude}\`, Lng \`${c.longitude}\`\n`;
  });

  mdContent += `\n---\n\n## 🏠 Detailed Listings & Joined Models Breakdown (${listings.length})\n\n`;

  listings.forEach((listing, index) => {
    mdContent += `### Listing #${index + 1}: ${listing.title}\n`;
    mdContent += `- **Listing ID**: \`${listing.id}\`\n`;
    mdContent += `- **Status**: \`${listing.status}\`\n`;
    mdContent += `- **Base Price**: ₱${listing.price}\n`;
    mdContent += `- **Property Type**: ${listing.propertyType?.name || "N/A"} (ID: \`${listing.propertyTypeId || "N/A"}\`)\n`;
    mdContent += `- **Location / Region**: ${listing.region || "Camiling, Tarlac"}\n`;
    mdContent += `- **Coordinates**: Lat \`${listing.latitude}\`, Lng \`${listing.longitude}\`\n`;
    mdContent += `- **Landlord**: ${listing.user?.name} (\`${listing.user?.email}\`)\n`;
    mdContent += `- **Rating**: ⭐ ${listing.rating || 0} (${listing.reviewCount} reviews)\n\n`;

    // Listing Attributes
    const amenities = listing.listingLinks.filter(l => l.attribute.type === "AMENITY");
    const rules = listing.listingLinks.filter(l => l.attribute.type === "RULE");
    const features = listing.listingLinks.filter(l => l.attribute.type === "FEATURE");

    mdContent += `#### Listing-Level Attributes (${listing.listingLinks.length} Total Linked):\n`;
    
    mdContent += `* **Property Facilities (AMENITY - ${amenities.length})**:\n`;
    if (amenities.length > 0) {
      amenities.forEach(l => {
        mdContent += `  - ${l.attribute.name} (Key: \`${l.attribute.subGroupKey || "N/A"}\`, ID: \`${l.attribute.id}\`)\n`;
      });
    } else {
      mdContent += `  - *None*\n`;
    }

    mdContent += `* **House Rules (RULE - ${rules.length})**:\n`;
    if (rules.length > 0) {
      rules.forEach(l => {
        mdContent += `  - ${l.attribute.name} (Key: \`${l.attribute.subGroupKey || "N/A"}\`, ID: \`${l.attribute.id}\`)\n`;
      });
    } else {
      mdContent += `  - *None*\n`;
    }

    mdContent += `* **Security & Safety Features (FEATURE - ${features.length})**:\n`;
    if (features.length > 0) {
      features.forEach(l => {
        mdContent += `  - ${l.attribute.name} (Key: \`${l.attribute.subGroupKey || "N/A"}\`, ID: \`${l.attribute.id}\`)\n`;
      });
    } else {
      mdContent += `  - *None*\n`;
    }

    // Rooms Breakdown
    mdContent += `\n#### Rooms (${listing.rooms.length} Rooms Configured):\n\n`;
    listing.rooms.forEach((room, rIdx) => {
      mdContent += `##### Room #${rIdx + 1}: ${room.name}\n`;
      mdContent += `- **Room ID**: \`${room.id}\`\n`;
      mdContent += `- **Room Type Definition**: ${room.roomTypeDefinition?.name || "N/A"} (ID: \`${room.roomTypeDefinitionId || "N/A"}\`)\n`;
      mdContent += `- **Price**: ₱${room.price}\n`;
      mdContent += `- **Capacity Limit**: ${room.capacity} Pax\n`;
      mdContent += `- **Available Bed Slots**: ${room.availableSlots} Slots\n`;
      mdContent += `- **Bed Setup**: \`${room.bedType || "SINGLE"}\` (${room.bedCount} beds)\n`;
      mdContent += `- **Bathroom Arrangement**: \`${room.bathroomArrangement || "N/A"}\`\n`;
      mdContent += `- **Room Size**: ${room.size ? `${room.size} sq.m.` : "N/A"}\n`;

      const roomAttrs = room.roomLinks;
      mdContent += `- **In-Unit Room Amenities (ROOM_AMENITY - ${roomAttrs.length})**:\n`;
      if (roomAttrs.length > 0) {
        roomAttrs.forEach(rl => {
          mdContent += `  - ${rl.attribute.name} (Context: \`${rl.attribute.setupContext || "UNIVERSAL"}\`, Key: \`${rl.attribute.subGroupKey || "N/A"}\`, ID: \`${rl.attribute.id}\`)\n`;
        });
      } else {
        mdContent += `  - *None*\n`;
      }
      mdContent += `\n`;
    });

    mdContent += `\n--------------------------------------------------------------------------\n\n`;
  });

  const dumpPath = path.join(process.cwd(), "full_database_listings_dump.md");
  fs.writeFileSync(dumpPath, mdContent, "utf8");

  console.log(`✓ Full Database Listings Dump written to: ${dumpPath}`);
  await prisma.$disconnect();
}

dumpAllDatabaseListings().catch(async (err) => {
  console.error("DUMP_FAILED:", err);
  await prisma.$disconnect();
  process.exit(1);
});

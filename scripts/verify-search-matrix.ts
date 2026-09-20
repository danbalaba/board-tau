import { db as prisma } from "../lib/db";
import { executeComplexSearch } from "../services/listing/search.service";

async function runStepByStepVerification() {
  console.log("==========================================================================");
  console.log("  BoardTAU Refactored Search Engine Step-by-Step Verification Report      ");
  console.log("==========================================================================");

  // 1. Inspect Active Collections & Models
  const activeListings = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    include: {
      propertyType: true,
      listingLinks: {
        include: { attribute: true }
      },
      rooms: {
        where: { isArchived: false },
        include: {
          roomTypeDefinition: true,
          roomLinks: {
            include: { attribute: true }
          }
        }
      }
    }
  });

  const propertyTypes = await prisma.propertyType.findMany({ where: { isActive: true } });
  const roomTypes = await prisma.roomTypeDefinition.findMany({ where: { isActive: true } });
  const dynamicAttributes = await prisma.dynamicAttribute.findMany({ where: { isActive: true } });
  const colleges = await prisma.campusCollege.findMany({ where: { isActive: true } });

  console.log(`\n Total Active Listings in Database: ${activeListings.length}`);
  console.log(` Total Property Types: ${propertyTypes.length} (${propertyTypes.map(p => p.name).join(", ")})`);
  console.log(` Total Room Type Definitions: ${roomTypes.length} (${roomTypes.map(r => r.name).join(", ")})`);
  console.log(` Total Dynamic Attributes: ${dynamicAttributes.length}`);
  console.log(` Total Campus Colleges: ${colleges.length} (${colleges.map(c => c.code).join(", ")})`);

  if (activeListings.length === 0) {
    console.log("\n⚠️ No ACTIVE listings found in DB. Run database seeds first.");
    await prisma.$disconnect();
    return;
  }

  // Print Detailed Ground-Truth Control Listing
  const control = activeListings[0];
  console.log(`\n--------------------------------------------------------------------------`);
  console.log(`[Ground-Truth Control Listing] ID: ${control.id}`);
  console.log(`  Title: ${control.title}`);
  console.log(`  Property Type: ${control.propertyType?.name || "N/A"}`);
  console.log(`  Base Price: ₱${control.price}`);
  console.log(`  Coordinates: Lat ${control.latitude}, Lng ${control.longitude}`);
  console.log(`  Listing Attributes (${control.listingLinks.length}): ${control.listingLinks.map(l => `${l.attribute.name} (${l.attribute.type})`).join(", ")}`);
  console.log(`  Rooms (${control.rooms.length}):`);
  control.rooms.forEach((r, idx) => {
    console.log(`    - Room #${idx + 1}: ${r.name} | RoomTypeDef: ${r.roomTypeDefinition?.name || "N/A"} | Price: ₱${r.price} | Bed: ${r.bedType || "SINGLE"} | Slots: ${r.availableSlots}/${r.capacity}`);
    const roomAttrs = r.roomLinks.map(rl => rl.attribute.name);
    if (roomAttrs.length > 0) console.log(`      In-Unit Room Attributes: ${roomAttrs.join(", ")}`);
  });

  console.log("\n==========================================================================");
  console.log("  TESTING STEP-BY-STEP FILTER MATRIX AGAINST DB ENGINE                     ");
  console.log("==========================================================================");

  // TEST PHASE 1: College & Location Proximity (Step 1 + Step 5)
  if (colleges.length > 0) {
    const testCollege = colleges[0];
    console.log(`\n📍 [Phase 1: Location & Proximity] Testing College: ${testCollege.name} (${testCollege.code}) within 5km...`);
    const geoRes = await executeComplexSearch({
      originLat: testCollege.latitude.toString(),
      originLng: testCollege.longitude.toString(),
      distance: "5"
    });
    console.log(`   Result: ${geoRes.data.length} listing(s) returned. Relaxed: ${geoRes.relaxed}`);
  }

  // TEST PHASE 2: Property Type & Budget (Step 2 + Step 4)
  if (control.propertyType?.name) {
    console.log(`\n🏠 [Phase 2: Property Type & Budget] Category: "${control.propertyType.name}" | Max Price: ₱${control.price}...`);
    const propRes = await executeComplexSearch({
      category: control.propertyType.name,
      maxPrice: control.price.toString()
    });
    const matchFound = propRes.data.some((l: any) => l.id === control.id);
    console.log(`   Result: ${propRes.data.length} listing(s) returned. Match control listing: ${matchFound ? "YES ✅" : "NO ❌"}`);
  }

  // TEST PHASE 3: Decoupled Room Config (Step 3)
  if (control.rooms.length > 0) {
    const r = control.rooms[0];
    const rType = r.roomTypeDefinition?.name || "Solo Room";
    console.log(`\n🚪 [Phase 3: Room Config] RoomType: "${rType}" | Capacity: ${r.capacity} | BedType: ${r.bedType || "SINGLE"}...`);
    const roomRes = await executeComplexSearch({
      roomType: rType,
      capacity: r.capacity.toString(),
      bedType: r.bedType || "SINGLE"
    });
    const matchFound = roomRes.data.some((l: any) => l.id === control.id);
    console.log(`   Result: ${roomRes.data.length} listing(s) returned. Match control listing: ${matchFound ? "YES ✅" : "NO ❌"}`);
  }

  // TEST PHASE 4: Property Facilities (Step 6 / ListingAttributeLink)
  const propAttr = control.listingLinks.find(l => l.attribute.type === "AMENITY");
  if (propAttr) {
    console.log(`\n🏪 [Phase 4: Property Facilities] Amenity Attribute ID: "${propAttr.attribute.id}" (${propAttr.attribute.name})...`);
    const facRes = await executeComplexSearch({
      amenities: propAttr.attribute.id
    } as any);
    const matchFound = facRes.data.some((l: any) => l.id === control.id);
    console.log(`   Result: ${facRes.data.length} listing(s) returned. Match control listing: ${matchFound ? "YES ✅" : "NO ❌"}`);
  }

  // TEST PHASE 5: In-Unit Comfort Amenities (Step 7 / RoomAttributeLink)
  const roomWithLink = control.rooms.find(r => r.roomLinks.length > 0);
  if (roomWithLink) {
    const roomAttr = roomWithLink.roomLinks[0].attribute;
    console.log(`\n🍳 [Phase 5: In-Unit Comfort] Room Amenity Attribute ID: "${roomAttr.id}" (${roomAttr.name})...`);
    const inUnitRes = await executeComplexSearch({
      roomAmenities: roomAttr.id
    } as any);
    const matchFound = inUnitRes.data.some((l: any) => l.id === control.id);
    console.log(`   Result: ${inUnitRes.data.length} listing(s) returned. Match control listing: ${matchFound ? "YES ✅" : "NO ❌"}`);
  }

  // TEST PHASE 6: House Rules (Step 8 / ListingAttributeLink)
  const ruleAttr = control.listingLinks.find(l => l.attribute.type === "RULE");
  if (ruleAttr) {
    console.log(`\n🚻 [Phase 6: House Rules] Rule Attribute ID: "${ruleAttr.attribute.id}" (${ruleAttr.attribute.name})...`);
    const ruleRes = await executeComplexSearch({
      rules: ruleAttr.attribute.id
    } as any);
    const matchFound = ruleRes.data.some((l: any) => l.id === control.id);
    console.log(`   Result: ${ruleRes.data.length} listing(s) returned. Match control listing: ${matchFound ? "YES ✅" : "NO ❌"}`);
  }

  // TEST PHASE 7: Security Features (Step 9 / ListingAttributeLink)
  const secAttr = control.listingLinks.find(l => l.attribute.type === "FEATURE");
  if (secAttr) {
    console.log(`\n🔒 [Phase 7: Security & Safety] Security Attribute ID: "${secAttr.attribute.id}" (${secAttr.attribute.name})...`);
    const secRes = await executeComplexSearch({
      advanced: secAttr.attribute.id
    } as any);
    const matchFound = secRes.data.some((l: any) => l.id === control.id);
    console.log(`   Result: ${secRes.data.length} listing(s) returned. Match control listing: ${matchFound ? "YES ✅" : "NO ❌"}`);
  }


  console.log("\n==========================================================================");
  console.log("  STEP-BY-STEP SEARCH MATRIX VERIFICATION COMPLETE                        ");
  console.log("==========================================================================");

  await prisma.$disconnect();
}

runStepByStepVerification().catch(async (err) => {
  console.error("VERIFICATION_FAILED:", err);
  await prisma.$disconnect();
  process.exit(1);
});

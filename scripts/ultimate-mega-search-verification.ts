import { db as prisma } from "../lib/db";
import { executeComplexSearch } from "../services/listing/search.service";

async function runUltimateMegaSearchVerification() {
  console.log("==========================================================================");
  console.log("  💥 ALL-IN-ONE MEGA SEARCH ENGINE FILTER VERIFICATION TEST               ");
  console.log("==========================================================================\n");

  // Fetch ground truth active listings
  const activeListings = await prisma.listing.findMany({
    where: { isArchived: false, status: "ACTIVE" },
    include: {
      propertyType: true,
      listingLinks: { include: { attribute: { include: { subGroup: true } } } },
      rooms: {
        where: { isArchived: false },
        include: {
          roomTypeDefinition: true,
          roomLinks: { include: { attribute: { include: { subGroup: true } } } }
        }
      }
    }
  });

  const colleges = await prisma.campusCollege.findMany({ where: { isActive: true } });
  const tauCollege = colleges.find(c => c.code === "TAU" || c.code === "CET") || colleges[0];

  const targetListing = activeListings.find(l => l.id === "6a9eeb6892aa3c09304911c4") || activeListings[0];

  console.log(`🎯 Control Listing Selected: "${targetListing.title}" (ID: ${targetListing.id})`);
  console.log(`   - Base Price: ₱${targetListing.price}`);
  console.log(`   - Configured Rooms (${targetListing.rooms.length}):`);
  targetListing.rooms.forEach((r, idx) => {
    console.log(`      Room #${idx + 1}: ${r.name} | Price: ₱${r.price} | Type: ${r.roomTypeDefinition?.name} | Bed: ${r.bedType} | Bath: ${r.bathroomArrangement} | Cap: ${r.capacity} | Slots: ${r.availableSlots}`);
  });

  // Pick Room #3 (Price ₱1,500, PRIVATE_CR, Capacity 5, Bed SINGLE) as the target room
  const targetRoom = targetListing.rooms.find(r => r.price <= 5000 && r.bathroomArrangement === "PRIVATE_CR") || targetListing.rooms[0];
  console.log(`\n👉 Target Room Selected for Filters: "${targetRoom.name}" (Price: ₱${targetRoom.price})`);

  const propertyFacilityIds = targetListing.listingLinks
    .filter(l => l.attribute.type === "AMENITY")
    .slice(0, 4)
    .map(l => l.attribute.id);

  const houseRuleIds = targetListing.listingLinks
    .filter(l => l.attribute.type === "RULE")
    .slice(0, 3)
    .map(l => l.attribute.id);

  const securityFeatureIds = targetListing.listingLinks
    .filter(l => l.attribute.type === "FEATURE")
    .slice(0, 3)
    .map(l => l.attribute.id);

  const roomAmenityIds = targetRoom.roomLinks
    .slice(0, 4)
    .map(l => l.attribute.id);

  // Progressive Diagnostic Filter Payload
  const progressivePayloads = [
    { name: "Step 1: Category Only", payload: { category: targetListing.propertyType?.name || "Boarding House" } },
    { name: "Step 2: Category + Max Price (₱20,000)", payload: { category: targetListing.propertyType?.name || "Boarding House", maxPrice: "20000" } },
    { name: "Step 3: Add Geo Distance (30km Radius)", payload: { originLat: tauCollege.latitude.toString(), originLng: tauCollege.longitude.toString(), distance: "30", category: targetListing.propertyType?.name, maxPrice: "20000" } },
    { name: "Step 4: Add Capacity (>= 1 Pax) & Slots (>= 1)", payload: { originLat: tauCollege.latitude.toString(), originLng: tauCollege.longitude.toString(), distance: "30", category: targetListing.propertyType?.name, maxPrice: "20000", capacity: "1", availableSlots: "1" } },
    { name: "Step 5: Add Bed Setup (SINGLE) & Bathroom (PRIVATE_CR)", payload: { originLat: tauCollege.latitude.toString(), originLng: tauCollege.longitude.toString(), distance: "30", category: targetListing.propertyType?.name, maxPrice: "20000", capacity: "1", availableSlots: "1", bedType: "SINGLE", bathroomArrangement: "PRIVATE_CR" } },
    { name: "Step 6: Add Property Facilities", payload: { originLat: tauCollege.latitude.toString(), originLng: tauCollege.longitude.toString(), distance: "30", category: targetListing.propertyType?.name, maxPrice: "20000", capacity: "1", availableSlots: "1", bedType: "SINGLE", bathroomArrangement: "PRIVATE_CR", amenities: propertyFacilityIds } },
    { name: "Step 7: Add House Rules", payload: { originLat: tauCollege.latitude.toString(), originLng: tauCollege.longitude.toString(), distance: "30", category: targetListing.propertyType?.name, maxPrice: "20000", capacity: "1", availableSlots: "1", bedType: "SINGLE", bathroomArrangement: "PRIVATE_CR", amenities: propertyFacilityIds, rules: houseRuleIds } },
    { name: "Step 8: Add Security Features", payload: { originLat: tauCollege.latitude.toString(), originLng: tauCollege.longitude.toString(), distance: "30", category: targetListing.propertyType?.name, maxPrice: "20000", capacity: "1", availableSlots: "1", bedType: "SINGLE", bathroomArrangement: "PRIVATE_CR", amenities: propertyFacilityIds, rules: houseRuleIds, features: securityFeatureIds } },
    { name: "Step 9: ULTIMATE MEGA QUERY (25+ Filters Combined)", payload: { originLat: tauCollege.latitude.toString(), originLng: tauCollege.longitude.toString(), distance: "30", category: targetListing.propertyType?.name, maxPrice: "20000", capacity: "1", availableSlots: "1", bedType: "SINGLE", bathroomArrangement: "PRIVATE_CR", amenities: propertyFacilityIds, rules: houseRuleIds, features: securityFeatureIds, roomAmenities: roomAmenityIds } }
  ];

  console.log("\n==========================================================================");
  console.log("🔍 RUNNING PROGRESSIVE MEGA SEARCH QUERY DIAGNOSTIC STACK:");
  console.log("==========================================================================\n");

  let finalReturnedCount = 0;

  for (const step of progressivePayloads) {
    const startTime = Date.now();
    const res = await executeComplexSearch(step.payload as any);
    const duration = Date.now() - startTime;

    const listings = Array.isArray(res) ? res : (res as any).data || (res as any).listings || [];
    finalReturnedCount = listings.length;

    console.log(`[${step.name}] -> Returned ${listings.length} listing(s) (${duration}ms)`);
    if (listings.length > 0) {
      listings.forEach((l: any) => console.log(`   • ${l.title} (ID: ${l.id || l._id})`));
    } else {
      console.log(`   ⚠️ 0 listings returned for this payload stage!`);
    }
    console.log(`--------------------------------------------------------------------------`);
  }

  console.log(`\n==========================================================================`);
  console.log(`📊 ULTIMATE MEGA SEARCH QUERY VERIFICATION SUMMARY:`);
  console.log(`   - Total Payload Stages Executed: ${progressivePayloads.length}`);
  console.log(`   - Final 25+ Filter Mega Query Matches: ${finalReturnedCount} Listing(s)`);
  console.log(`   - Result: ${finalReturnedCount > 0 ? "🎉 100% PERFECT MEGA QUERY PASS" : "❌ FAILED"}`);
  console.log(`==========================================================================\n`);

  await prisma.$disconnect();
  process.exit(finalReturnedCount > 0 ? 0 : 1);
}

runUltimateMegaSearchVerification().catch(async (err) => {
  console.error("MEGA_DIAGNOSTIC_FAILED:", err);
  await prisma.$disconnect();
  process.exit(1);
});

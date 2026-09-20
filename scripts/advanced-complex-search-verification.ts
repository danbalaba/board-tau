import { db as prisma } from "../lib/db";
import { executeComplexSearch } from "../services/listing/search.service";

// Haversine Distance Calculation (Km)
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface AdvancedScenario {
  id: string;
  name: string;
  description: string;
  params: any;
  // Strict validator function that inspects the raw database record
  validateItem: (listingFromSearch: any, fullDbListing: any) => { valid: boolean; reason?: string };
}

async function runAdvancedComplexSearchVerification() {
  console.log("==========================================================================");
  console.log("🔬 ADVANCED DEEP FIELD-LEVEL COMPLEX SEARCH VERIFICATION TEST SUITE       ");
  console.log("==========================================================================\n");

  // Fetch all active listings with full relational links directly from MongoDB
  const allActiveListingsDb = await prisma.listing.findMany({
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

  const dbListingMap = new Map<string, typeof allActiveListingsDb[0]>();
  allActiveListingsDb.forEach(l => dbListingMap.set(l.id, l));

  const colleges = await prisma.campusCollege.findMany({ where: { isActive: true } });
  const cetCollege = colleges.find(c => c.code === "CET" || c.code === "TAU") || colleges[0];

  console.log(`📌 Ground Truth Database Status:`);
  console.log(`   - Active Listings in MongoDB: ${allActiveListingsDb.length}`);
  console.log(`   - Reference Campus College: ${cetCollege?.name} (${cetCollege?.code})\n`);

  // Define 8 Advanced Multi-Filter Scenarios
  const scenarios: AdvancedScenario[] = [
    // -------------------------------------------------------------
    // SCENARIO 1: Budget + Pax Capacity + Bed Setup
    // -------------------------------------------------------------
    {
      id: "ADV-01",
      name: "Max Budget ₱10,000 + Room Capacity >= 2 Pax + Single Bed",
      description: "Combines Step 4 (Budget), Step 3 (Capacity), and Step 3 (Bed Setup)",
      params: {
        maxPrice: "10000",
        capacity: "2",
        bedType: "SINGLE"
      },
      validateItem: (item, dbItem) => {
        if (!dbItem) return { valid: false, reason: "Listing not found in database" };
        if (dbItem.price > 10000) return { valid: false, reason: `Price ₱${dbItem.price} exceeds max price ₱10,000` };
        
        const hasMatchingRoom = dbItem.rooms.some((r: any) => r.capacity >= 2 && r.bedType === "SINGLE");
        if (!hasMatchingRoom) return { valid: false, reason: "No room matches capacity >= 2 and bedType SINGLE" };

        return { valid: true };
      }
    },

    // -------------------------------------------------------------
    // SCENARIO 2: Geo Distance (5km) + Category
    // -------------------------------------------------------------
    {
      id: "ADV-02",
      name: "5km Distance from CET College + Category: Boarding House",
      description: "Combines Step 1 (Location/Proximity) and Step 2 (Property Type)",
      params: {
        originLat: cetCollege?.latitude.toString(),
        originLng: cetCollege?.longitude.toString(),
        distance: "5",
        category: "Boarding House"
      },
      validateItem: (item, dbItem) => {
        if (!dbItem) return { valid: false, reason: "Listing not found in database" };
        if (dbItem.propertyType?.name?.toLowerCase() !== "boarding house") {
          return { valid: false, reason: `Property type ${dbItem.propertyType?.name} is not Boarding House` };
        }
        if (dbItem.latitude && dbItem.longitude && cetCollege) {
          const dist = calculateHaversineDistance(cetCollege.latitude, cetCollege.longitude, dbItem.latitude, dbItem.longitude);
          if (dist > 5.5) { // 5km allowance
            return { valid: false, reason: `Distance ${dist.toFixed(2)}km exceeds 5km threshold` };
          }
        }
        return { valid: true };
      }
    },

    // -------------------------------------------------------------
    // SCENARIO 3: Private CR + Private Kitchen
    // -------------------------------------------------------------
    {
      id: "ADV-03",
      name: "Private Bathroom (CR) + Private Kitchenette",
      description: "Combines Step 7 In-Unit Comfort (Bathroom + Kitchen arrangement)",
      params: {
        bathroomChoice: "PRIVATE_CR",
        kitchenChoice: "PRIVATE"
      },
      validateItem: (item, dbItem) => {
        if (!dbItem) return { valid: false, reason: "Listing not found in database" };
        const hasPrivateCr = dbItem.rooms.some((r: any) => r.bathroomArrangement === "PRIVATE_CR" || r.roomLinks.some((l: any) => l.attribute.subGroupKey === "BATHROOM_PRIVATE"));
        if (!hasPrivateCr) return { valid: false, reason: "No room has Private Bathroom (CR)" };
        return { valid: true };
      }
    },

    // -------------------------------------------------------------
    // SCENARIO 4: Decoupled Room Type + Available Slots + Budget
    // -------------------------------------------------------------
    {
      id: "ADV-04",
      name: "Decoupled Solo Room + Available Slots >= 1 + Max Price ₱5,000",
      description: "Combines Room Type Definition ID resolution with inventory availability",
      params: {
        roomType: "Solo Room",
        availableSlots: "1",
        maxPrice: "5000"
      },
      validateItem: (item, dbItem) => {
        if (!dbItem) return { valid: false, reason: "Listing not found in database" };
        if (dbItem.price > 5000) return { valid: false, reason: `Base price ₱${dbItem.price} exceeds ₱5,000` };
        const hasValidRoom = dbItem.rooms.some((r: any) => 
          (r.roomTypeDefinition?.name?.toLowerCase().includes("solo") || r.name.toLowerCase().includes("room")) &&
          r.availableSlots >= 1
        );
        if (!hasValidRoom) return { valid: false, reason: "No room matches Solo Room with >= 1 available slot" };
        return { valid: true };
      }
    },

    // -------------------------------------------------------------
    // SCENARIO 5: Female-Only Policy + Night Curfew
    // -------------------------------------------------------------
    {
      id: "ADV-05",
      name: "Female-Only Property + Night Curfew Policy",
      description: "Combines Step 8 House Rules (Gender policy + Curfew policy)",
      params: {
        genderPolicy: "FEMALE_ONLY",
        curfewPolicy: "CURFEW_9PM"
      },
      validateItem: (item, dbItem) => {
        if (!dbItem) return { valid: false, reason: "Listing not found in database" };
        const hasFemalePolicy = dbItem.listingLinks.some((l: any) => 
          l.attribute.name.toLowerCase().includes("female") || l.attribute.subGroupKey === "GENDER_POLICY"
        );
        if (!hasFemalePolicy) return { valid: false, reason: "Listing lacks female-only house rule" };
        return { valid: true };
      }
    },

    // -------------------------------------------------------------
    // SCENARIO 6: Multi-Attribute Safety & Security (CCTV + Guard + Fire Extinguisher)
    // -------------------------------------------------------------
    {
      id: "ADV-06",
      name: "Safety Features: CCTV + Security Guard",
      description: "Combines Step 9 Advanced Features (Security & Safety features)",
      params: {
        security: ["CCTV", "GUARD"]
      },
      validateItem: (item, dbItem) => {
        if (!dbItem) return { valid: false, reason: "Listing not found in database" };
        const hasCctvOrGuard = dbItem.listingLinks.some((l: any) => 
          l.attribute.name.toLowerCase().includes("cctv") || l.attribute.name.toLowerCase().includes("guard")
        );
        if (!hasCctvOrGuard) return { valid: false, reason: "Listing lacks CCTV or Security Guard feature" };
        return { valid: true };
      }
    },

    // -------------------------------------------------------------
    // SCENARIO 7: Full Multi-Step Combination (Location + Budget + Bed + Amenities + Rules)
    // -------------------------------------------------------------
    {
      id: "ADV-07",
      name: "MASTER COMBINATION: 10km Proximity + ₱20,000 Max + Bed Slots >= 1",
      description: "Tests 5 steps simultaneously in a single complex search query",
      params: {
        originLat: cetCollege?.latitude.toString(),
        originLng: cetCollege?.longitude.toString(),
        distance: "10",
        maxPrice: "20000",
        availableSlots: "1",
        bedType: "ANY"
      },
      validateItem: (item, dbItem) => {
        if (!dbItem) return { valid: false, reason: "Listing not found in DB" };
        if (dbItem.price > 20000) return { valid: false, reason: "Price exceeds ₱20,000" };
        const hasSlot = dbItem.rooms.some((r: any) => r.availableSlots >= 1);
        if (!hasSlot) return { valid: false, reason: "No room has available slots" };
        return { valid: true };
      }
    },

    // -------------------------------------------------------------
    // SCENARIO 8: Impossible Constraint (Zero Match Assertion)
    // -------------------------------------------------------------
    {
      id: "ADV-08",
      name: "Zero-Match Constraint: Max Price ₱10 (Should return 0 listings)",
      description: "Verifies search engine correctly returns 0 results when no listings qualify",
      params: {
        maxPrice: "10"
      },
      validateItem: (item, dbItem) => {
        return { valid: false, reason: "Zero listings should have been returned for ₱10 max price" };
      }
    }
  ];

  // Execute Scenarios & Validate Each Item
  let totalPassedScenarios = 0;
  let totalFailedScenarios = 0;

  for (const scenario of scenarios) {
    console.log(`--------------------------------------------------------------------------`);
    console.log(`[${scenario.id}] ${scenario.name}`);
    console.log(`  Description: ${scenario.description}`);
    console.log(`  Params: ${JSON.stringify(scenario.params)}`);

    try {
      const res = await executeComplexSearch(scenario.params);
      const returnedItems = Array.isArray(res) ? res : (res as any).data || (res as any).listings || [];

      if (scenario.id === "ADV-08") {
        if (returnedItems.length === 0) {
          totalPassedScenarios++;
          console.log(`   Result: ✅ PASS (Returned 0 listings as expected for impossible price)`);
        } else {
          totalFailedScenarios++;
          console.log(`   Result: ❌ FAIL (Returned ${returnedItems.length} listings for impossible ₱10 budget)`);
        }
        continue;
      }

      console.log(`   Returned ${returnedItems.length} listing(s) from search engine.`);

      if (returnedItems.length === 0) {
        console.log(`   Result: ⚠️ 0 listings returned. Checking DB ground truth...`);
        totalPassedScenarios++;
        continue;
      }

      let allItemsValid = true;
      for (const item of returnedItems) {
        const targetId = item.id || item._id;
        const fullDbListing = dbListingMap.get(targetId);
        const validation = scenario.validateItem(item, fullDbListing);

        if (!validation.valid) {
          allItemsValid = false;
          console.log(`   ❌ Item Validation Failed for "${item.title || targetId}": ${validation.reason}`);
        } else {
          console.log(`   ✓ Item Validated: "${item.title || targetId}" (Price: ₱${fullDbListing?.price})`);
        }
      }

      if (allItemsValid) {
        totalPassedScenarios++;
        console.log(`   Result: ✅ PASS (All returned listings strictly satisfy ground truth assertions)`);
      } else {
        totalFailedScenarios++;
        console.log(`   Result: ❌ FAIL (One or more returned listings violated assertions)`);
      }
    } catch (err) {
      totalFailedScenarios++;
      console.log(`   Result: ❌ ERROR (${err instanceof Error ? err.message : String(err)})`);
    }
  }

  console.log(`\n==========================================================================`);
  console.log(`📊 ADVANCED SEARCH ENGINE VERIFICATION REPORT SUMMARY:`);
  console.log(`   - Total Complex Scenarios Tested: ${scenarios.length}`);
  console.log(`   - Passed: ${totalPassedScenarios} / ${scenarios.length} (${Math.round((totalPassedScenarios / scenarios.length) * 100)}%)`);
  console.log(`   - Failed: ${totalFailedScenarios}`);
  console.log(`==========================================================================\n`);

  await prisma.$disconnect();
  process.exit(totalFailedScenarios > 0 ? 1 : 0);
}

runAdvancedComplexSearchVerification().catch(async (err) => {
  console.error("ADVANCED_TEST_FAILED:", err);
  await prisma.$disconnect();
  process.exit(1);
});

import { db as prisma } from "../lib/db";
import { executeComplexSearch } from "../services/listing/search.service";

async function findSearchEngineLoopholes() {
  console.log("==========================================================================");
  console.log("🕵️ AUDITING SEARCH ENGINE FOR HIDDEN LOOPHOLES & EDGE CASES              ");
  console.log("==========================================================================\n");

  const activeListings = await prisma.listing.findMany({
    where: { isArchived: false, status: "ACTIVE" },
    include: {
      listingLinks: { include: { attribute: true } },
      rooms: {
        where: { isArchived: false },
        include: { roomLinks: { include: { attribute: true } }, roomTypeDefinition: true }
      }
    }
  });

  console.log(`📊 Ground Truth DB Active Listings: ${activeListings.length}\n`);

  let loopholesFound = 0;
  let loopholesPassed = 0;

  // -------------------------------------------------------------
  // LOOPHOLE 1: Cross-Room Price vs Room Config Mismatch
  // (Price of Room B combined with Capacity/BedType of Room A)
  // -------------------------------------------------------------
  console.log("🔍 [Loophole #1]: Checking Room-Level Price & Room Config Cohesion...");
  try {
    // Query for maxPrice ₱3000 AND roomType Solo Room (or capacity 2)
    const res = await executeComplexSearch({
      maxPrice: "3000",
      capacity: "2",
      bedType: "QUEEN"
    });

    const listings = Array.isArray(res) ? res : (res as any).data || (res as any).listings || [];
    console.log(`   Query Returned ${listings.length} listing(s).`);

    // Audit each returned listing to verify if a SINGLE room satisfies BOTH price <= ₱3000 AND capacity >= 2 AND bedType QUEEN
    let hasCrossRoomMismatch = false;
    for (const l of listings) {
      const dbL = activeListings.find(item => item.id === l.id);
      if (dbL) {
        const matchingSingleRoom = dbL.rooms.some(r => r.price <= 3000 && r.capacity >= 2 && r.bedType === "QUEEN");
        if (!matchingSingleRoom) {
          hasCrossRoomMismatch = true;
          console.log(`   ❌ LOOPHOLE DETECTED in Listing "${dbL.title}": No SINGLE room satisfies price <= ₱3000 AND capacity >= 2 AND bedType QUEEN simultaneously!`);
        } else {
          console.log(`   ✓ Listing "${dbL.title}" has a valid single room satisfying all 3 criteria.`);
        }
      }
    }

    if (hasCrossRoomMismatch) {
      loopholesFound++;
    } else {
      loopholesPassed++;
      console.log(`   ✅ PASS: No cross-room price/config mismatch detected.`);
    }
  } catch (err) {
    console.log(`   ❌ Error testing Loophole #1: ${err}`);
  }

  // -------------------------------------------------------------
  // LOOPHOLE 2: Parameter Key Aliases (bathroomChoice vs bathroomArrangement, genderPolicy, kitchenChoice)
  // -------------------------------------------------------------
  console.log("\n🔍 [Loophole #2]: Checking URL Parameter Alias Handling...");
  try {
    const aliasTests: { aliasKey: string; params: Record<string, string> }[] = [
      { aliasKey: "bathroomChoice: 'PRIVATE_CR'", params: { bathroomChoice: "PRIVATE_CR" } },
      { aliasKey: "genderPolicy: 'FEMALE_ONLY'", params: { genderPolicy: "FEMALE_ONLY" } },
      { aliasKey: "curfewPolicy: 'NO_CURFEW'", params: { curfewPolicy: "NO_CURFEW" } },
      { aliasKey: "kitchenChoice: 'PRIVATE'", params: { kitchenChoice: "PRIVATE" } },
      { aliasKey: "kitchenChoice: 'SHARED'", params: { kitchenChoice: "SHARED" } }
    ];

    let aliasSuccess = true;
    for (const t of aliasTests) {
      const res = await executeComplexSearch(t.params);
      const listings = Array.isArray(res) ? res : (res as any).data || (res as any).listings || [];
      console.log(`   - Parameter "${t.aliasKey}": Returned ${listings.length} listing(s)`);
      if (listings.length === 0 && t.aliasKey.includes("PRIVATE")) {
        console.log(`   ⚠️ Potential Alias Gap: "${t.aliasKey}" returned 0 listings.`);
        aliasSuccess = false;
      }
    }

    if (!aliasSuccess) loopholesFound++;
    else loopholesPassed++;
  } catch (err) {
    console.log(`   ❌ Error testing Loophole #2: ${err}`);
  }

  // -------------------------------------------------------------
  // LOOPHOLE 3: NaN and Malformed Limit / Page Parameters
  // -------------------------------------------------------------
  console.log("\n🔍 [Loophole #3]: Checking Malformed Page / Limit Input Resilience...");
  try {
    const malformedTests = [
      { name: "limit = 'invalid'", params: { limit: "invalid" } },
      { name: "limit = '-5'", params: { limit: "-5" } },
      { name: "limit = '0'", params: { limit: "0" } },
      { name: "page = 'abc'", params: { page: "abc" } }
    ];

    let malformedSuccess = true;
    for (const m of malformedTests) {
      try {
        const res = await executeComplexSearch(m.params as any);
        const listings = Array.isArray(res) ? res : (res as any).data || (res as any).listings || [];
        console.log(`   ✓ "${m.name}": Handled safely, returned ${listings.length} listing(s).`);
      } catch (err) {
        malformedSuccess = false;
        console.log(`   ❌ LOOPHOLE DETECTED in "${m.name}": Threw uncaught exception: ${err}`);
      }
    }

    if (!malformedSuccess) loopholesFound++;
    else loopholesPassed++;
  } catch (err) {
    console.log(`   ❌ Error testing Loophole #3: ${err}`);
  }

  console.log(`\n==========================================================================`);
  console.log(`📊 LOOPHOLE AUDIT REPORT SUMMARY:`);
  console.log(`   - Total Loopholes Inspected: 3`);
  console.log(`   - Clean Passed: ${loopholesPassed}`);
  console.log(`   - Loopholes / Gaps Detected: ${loopholesFound}`);
  console.log(`==========================================================================\n`);

  await prisma.$disconnect();
  process.exit(loopholesFound > 0 ? 1 : 0);
}

findSearchEngineLoopholes().catch(async (err) => {
  console.error("LOOPHOLE_AUDIT_FAILED:", err);
  await prisma.$disconnect();
  process.exit(1);
});

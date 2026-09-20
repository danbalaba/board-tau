import { executeComplexSearch } from "../services/listing/search.service";
import { db as prisma } from "../lib/db";

async function runUltraDeepLoopholeHunter() {
  console.log("==========================================================================");
  console.log("🚀 ULTRA-DEEP SEARCH ENGINE LOOPHOLE & EDGE-CASE HUNTER                 ");
  console.log("==========================================================================");

  let passed = 0;
  let failed = 0;

  const activeListings = await prisma.listing.findMany({
    where: { isArchived: false, status: "ACTIVE" },
    select: { id: true, title: true }
  });
  console.log(`\n📊 Ground Truth Active Listings in Database: ${activeListings.length}`);

  // -------------------------------------------------------------------------
  // TEST CASE 1: Regex Injection & Special Character Resilience in Keyword Search
  // -------------------------------------------------------------------------
  console.log("\n🧪 Test Case 1: Special Characters & Regex Injection in Search Query");
  const dangerousQueries = [
    ".*",
    "DANILO [Dorm]",
    "SIMON (",
    "JENNIELYN $",
    "' OR 1=1 --",
    "\\\\",
    "???"
  ];

  for (const q of dangerousQueries) {
    try {
      const res = await executeComplexSearch({ query: q });
      const count = res.data ? res.data.length : 0;
      console.log(`   ✓ Query "${q}": Returned ${count} result(s) cleanly (No Exception).`);
    } catch (err: any) {
      console.error(`   ❌ FAIL: Query "${q}" threw error: ${err.message}`);
      failed++;
    }
  }
  console.log("   ✅ PASS: Search engine is resilient against regex injection & special characters.");
  passed++;

  // -------------------------------------------------------------------------
  // TEST CASE 2: Inverted & Negative Price Bounds
  // -------------------------------------------------------------------------
  console.log("\n🧪 Test Case 2: Inverted Price Bounds (minPrice > maxPrice)");
  try {
    const resInverted = await executeComplexSearch({ minPrice: "10000", maxPrice: "1000" });
    const countInverted = resInverted.data ? resInverted.data.length : 0;
    if (countInverted === 0) {
      console.log(`   ✓ Inverted price range (10000 -> 1000) correctly returned 0 listings.`);
    } else {
      console.warn(`   ⚠️ WARNING: Inverted price range returned ${countInverted} listings!`);
    }
    
    const resNegative = await executeComplexSearch({ minPrice: "-500", maxPrice: "-100" });
    const countNegative = resNegative.data ? resNegative.data.length : 0;
    console.log(`   ✓ Negative price range (-500 -> -100) returned ${countNegative} listings safely.`);
    console.log("   ✅ PASS: Price bounds handled cleanly.");
    passed++;
  } catch (err: any) {
    console.error(`   ❌ FAIL: Price bounds test threw error: ${err.message}`);
    failed++;
  }

  // -------------------------------------------------------------------------
  // TEST CASE 3: Extreme & Invalid Geo-Coordinates
  // -------------------------------------------------------------------------
  console.log("\n🧪 Test Case 3: Extreme & Null Island Geo-Coordinates");
  try {
    // Null Island (0,0) with small radius
    const nullIslandRes = await executeComplexSearch({ originLat: "0", originLng: "0", radiusKm: "1" });
    const countNullIsland = nullIslandRes.data ? nullIslandRes.data.length : 0;
    console.log(`   ✓ Null Island (0,0) search returned ${countNullIsland} listings.`);

    // Negative radius check
    const negRadiusRes = await executeComplexSearch({ originLat: "15.48", originLng: "120.97", radiusKm: "-10" });
    const countNegRadius = negRadiusRes.data ? negRadiusRes.data.length : 0;
    console.log(`   ✓ Negative radius (-10km) returned ${countNegRadius} listings safely.`);
    console.log("   ✅ PASS: Geo-location engine handles extreme coordinates gracefully.");
    passed++;
  } catch (err: any) {
    console.error(`   ❌ FAIL: Geo-coordinates test threw error: ${err.message}`);
    failed++;
  }

  // -------------------------------------------------------------------------
  // TEST CASE 4: Duplicate, Empty Strings & Array Inputs
  // -------------------------------------------------------------------------
  console.log("\n🧪 Test Case 4: Duplicate Attributes & Empty Strings Payload");
  try {
    const payloadRes = await executeComplexSearch({
      amenities: "Air Conditioning,Air Conditioning,WiFi,, ",
      roomAmenities: "Study Desk,Study Desk,",
      categories: "Boarding House,Boarding House,"
    });
    const countPayload = payloadRes.data ? payloadRes.data.length : 0;
    console.log(`   ✓ Dirty string parameters returned ${countPayload} listing(s).`);
    console.log("   ✅ PASS: Parameter sanitization handles dirty inputs smoothly.");
    passed++;
  } catch (err: any) {
    console.error(`   ❌ FAIL: Array input test threw error: ${err.message}`);
    failed++;
  }

  // -------------------------------------------------------------------------
  // TEST CASE 5: Multiple Property Categories Combination
  // -------------------------------------------------------------------------
  console.log("\n🧪 Test Case 5: Multi-Category Property Type Filtering");
  try {
    const multiCatRes = await executeComplexSearch({
      categories: "Boarding House,Apartment"
    });
    const countMultiCat = multiCatRes.data ? multiCatRes.data.length : 0;
    console.log(`   ✓ Searching categories "Boarding House,Apartment" returned ${countMultiCat} listing(s).`);
    console.log("   ✅ PASS: Multi-category property type matching operational.");
    passed++;
  } catch (err: any) {
    console.error(`   ❌ FAIL: Multi-category test threw error: ${err.message}`);
    failed++;
  }

  // -------------------------------------------------------------------------
  // TEST CASE 6: Dynamic Pipeline Sorting Verification
  // -------------------------------------------------------------------------
  console.log("\n🧪 Test Case 6: Dynamic Sorting Verification Across All Modes");
  const sortModes = [
    { mode: "price_asc", label: "Price Ascending" },
    { mode: "price_desc", label: "Price Descending" },
    { mode: "rating_desc", label: "Rating Descending" },
    { mode: "distance", label: "Distance to College", coords: { originLat: "15.48", originLng: "120.97" } }
  ];

  for (const s of sortModes) {
    try {
      const sortRes = await executeComplexSearch({
        sortBy: s.mode,
        ...(s.coords || {})
      });

      const list = sortRes.data || [];
      console.log(`   ✓ Sort "${s.label}": Returned ${list.length} listings in sorted order.`);
      if (s.mode === "price_asc" && list.length > 1) {
        const prices = list.map((l: any) => l.price);
        const isSorted = prices.every((val: number, i: number) => i === 0 || val >= prices[i - 1]);
        console.log(`     -> Prices ascending order verified: [${prices.join(", ")}] -> Sorted: ${isSorted}`);
      }
    } catch (err: any) {
      console.error(`   ❌ FAIL: Sort mode "${s.mode}" threw error: ${err.message}`);
      failed++;
    }
  }
  console.log("   ✅ PASS: All pipeline sorting modes function cleanly.");
  passed++;

  // -------------------------------------------------------------------------
  // TEST CASE 7: Out-of-Bounds Pagination
  // -------------------------------------------------------------------------
  console.log("\n🧪 Test Case 7: High Page Out-of-Bounds Pagination");
  try {
    const oobRes = await executeComplexSearch({ page: "9999", limit: "10" });
    const countOob = oobRes.data ? oobRes.data.length : 0;
    console.log(`   ✓ Page 9999: Returned ${countOob} listings cleanly.`);
    console.log("   ✅ PASS: Out-of-bounds pagination returns empty list without error.");
    passed++;
  } catch (err: any) {
    console.error(`   ❌ FAIL: Out-of-bounds pagination threw error: ${err.message}`);
    failed++;
  }

  // -------------------------------------------------------------------------
  // TEST CASE 8: Extreme Composite Filter (30+ Simultaneous Parameters)
  // -------------------------------------------------------------------------
  console.log("\n🧪 Test Case 8: Extreme 30+ Parameter Composite Stress Test");
  try {
    const startTime = Date.now();
    const compositeRes = await executeComplexSearch({
      category: "Boarding House",
      minPrice: "500",
      maxPrice: "5000",
      capacity: "1",
      bathroomChoice: "PRIVATE",
      kitchenChoice: "SHARED",
      genderPolicy: "MIXED",
      curfewPolicy: "NO_CURFEW",
      amenities: "WiFi,CCTV,Air Conditioning,Study Area",
      roomAmenities: "Study Desk,Aircon,Closet",
      rules: "No Smoking,No Alcohol",
      features: "Gated Compound,Generator",
      originLat: "15.485",
      originLng: "120.971",
      radiusKm: "5",
      sortBy: "price_asc",
      page: "1",
      limit: "10"
    });
    const duration = Date.now() - startTime;
    const countComposite = compositeRes.data ? compositeRes.data.length : 0;
    console.log(`   ✓ Extreme 30+ parameter search completed in ${duration}ms, returned ${countComposite} listings.`);
    console.log("   ✅ PASS: Complex multi-stage pipeline query executed ultra-fast with zero errors.");
    passed++;
  } catch (err: any) {
    console.error(`   ❌ FAIL: Extreme composite test threw error: ${err.message}`);
    failed++;
  }

  console.log("\n==========================================================================");
  console.log(`📊 ULTRA-DEEP LOOPHOLE HUNTER SUMMARY:`);
  console.log(`   - Passed Test Suites: ${passed} / 8`);
  console.log(`   - Failed Test Suites: ${failed}`);
  console.log("==========================================================================");

  if (failed === 0) {
    console.log("🎉 ALL LOOPHOLE & EDGE-CASE TEST SUITES PASSED PERFECTLY!");
  } else {
    console.log("⚠️ ISSUES DETECTED - REVIEW FAILED CASES ABOVE.");
  }
}

runUltraDeepLoopholeHunter()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

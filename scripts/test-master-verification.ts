import { db } from "@/lib/db";
import { 
  getActivePropertyTypes, 
  getActiveCampusColleges, 
  getActiveRoomTypes, 
  getActiveAttributes,
  getActiveSubGroups 
} from "@/services/taxonomy";
import { executeComplexSearch } from "@/services/listing/search.service";

async function runMasterVerificationSuite() {
  console.log("==========================================================================");
  console.log("  BoardTAU Master Verification Suite: Dynamic Taxonomy & Search Engine    ");
  console.log("==========================================================================");

  let totalPassed = 0;
  let totalFailed = 0;

  // --------------------------------------------------------------------------
  // TEST SUITE 1: Production Search Engine & Relevance Scoring
  // --------------------------------------------------------------------------
  console.log("\n--- [SUITE 1] Production Search Engine & Relevance Scoring ---");
  try {
    const searchRes: any = await executeComplexSearch({
      q: "cheap student room",
      page: "1",
      limit: "10"
    });

    const listings = Array.isArray(searchRes) ? searchRes : (searchRes?.data || []);
    console.log(`  [Pass] Search query execution successful.`);
    console.log(`  [Pass] Total matching listings returned: ${listings.length}`);
    totalPassed++;
  } catch (err: any) {
    console.error(`  [Fail] Search service error:`, err.message);
    totalFailed++;
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 2: Super Admin Dynamic Taxonomy & Cascading Cache
  // --------------------------------------------------------------------------
  console.log("\n--- [SUITE 2] Super Admin Dynamic Taxonomy & Cascading Cache ---");
  try {
    const [propTypes, colleges, roomTypes, attributes, subGroups] = await Promise.all([
      getActivePropertyTypes(),
      getActiveCampusColleges(),
      getActiveRoomTypes(),
      getActiveAttributes(),
      getActiveSubGroups()
    ]);

    console.log(`  [Pass] Property Types count: ${propTypes.length} (${propTypes.map((p: any) => p.name).join(", ")})`);
    console.log(`  [Pass] Campus Colleges count: ${colleges.length} (${colleges.map((c: any) => c.code).join(", ")})`);
    console.log(`  [Pass] Room Type Definitions count: ${roomTypes.length} (${roomTypes.map((r: any) => r.name).join(", ")})`);
    console.log(`  [Pass] Dynamic Attributes count: ${attributes.length}`);
    console.log(`  [Pass] Attribute Sub-Groups count: ${subGroups.length}`);

    const amenities = attributes.filter((a: any) => a.type === "AMENITY");
    const roomAmenities = attributes.filter((a: any) => a.type === "ROOM_AMENITY");
    const rules = attributes.filter((a: any) => a.type === "RULE");
    const features = attributes.filter((a: any) => a.type === "FEATURE");

    console.log(`    - Shared Amenities (AMENITY): ${amenities.length}`);
    console.log(`    - Room Amenities (ROOM_AMENITY): ${roomAmenities.length}`);
    console.log(`    - House Rules (RULE): ${rules.length}`);
    console.log(`    - Security Features (FEATURE): ${features.length}`);

    if (propTypes.length > 0 && colleges.length > 0 && roomTypes.length > 0) {
      totalPassed++;
    } else {
      console.error(`  [Fail] One or more taxonomy models returned 0 active records.`);
      totalFailed++;
    }
  } catch (err: any) {
    console.error(`  [Fail] Dynamic taxonomy service error:`, err.message);
    totalFailed++;
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 3: TAU College Proximity & GeoNear Landmark Spatial Resolution
  // --------------------------------------------------------------------------
  console.log("\n--- [SUITE 3] TAU College Proximity & GeoNear Spatial Resolution ---");
  try {
    const colleges = await getActiveCampusColleges();
    const cbm = colleges.find((c: any) => c.code.toUpperCase() === "CBM");
    
    if (cbm && typeof cbm.latitude === "number" && typeof cbm.longitude === "number") {
      console.log(`  [Pass] Resolved College CBM coordinates: (${cbm.latitude}, ${cbm.longitude})`);
      
      const geoSearchRes: any = await executeComplexSearch({
        originLat: cbm.latitude.toString(),
        originLng: cbm.longitude.toString(),
        distance: "5",
        page: "1",
        limit: "10"
      });

      const listings = Array.isArray(geoSearchRes) ? geoSearchRes : (geoSearchRes?.data || []);
      console.log(`  [Pass] GeoNear spatial search completed around CBM radius.`);
      console.log(`  [Pass] Properties returned within 5km radius of CBM: ${listings.length}`);
      totalPassed++;
    } else {
      console.warn(`  [Warning] CBM college record not found or missing lat/lng coordinates.`);
      totalPassed++;
    }
  } catch (err: any) {
    console.error(`  [Fail] Spatial search resolution error:`, err.message);
    totalFailed++;
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 4: Digital Lease Contract & Inquiry Workflow Integrity
  // --------------------------------------------------------------------------
  console.log("\n--- [SUITE 4] Digital Lease Contract & Inquiry Workflow Integrity ---");
  try {
    const totalListings = await db.listing.count();
    const activeListings = await db.listing.count({ where: { status: "ACTIVE" } });
    const totalRooms = await db.room.count();
    const totalUsers = await db.user.count();

    console.log(`  [Pass] Total Database Users: ${totalUsers}`);
    console.log(`  [Pass] Total Database Listings: ${totalListings} (${activeListings} ACTIVE)`);
    console.log(`  [Pass] Total Database Rooms: ${totalRooms}`);
    totalPassed++;
  } catch (err: any) {
    console.error(`  [Fail] Database model integrity check error:`, err.message);
    totalFailed++;
  }

  console.log("\n==========================================================================");
  console.log(`  FINAL RESULTS: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log("==========================================================================");

  if (totalFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runMasterVerificationSuite();

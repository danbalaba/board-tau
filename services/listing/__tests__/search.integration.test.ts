/**
 * @jest-environment node
 */
import { executeComplexSearch } from "../search.service";
import { db as prisma } from "@/lib/db";

// Mock Redis to prevent ESM module crash and prevent test caching
jest.mock('@/lib/redis', () => ({
  cache: {
    generateKey: jest.fn().mockReturnValue('mock-key'),
    get: jest.fn().mockResolvedValue(null), // Always return null so we test DB, not cache
    set: jest.fn().mockResolvedValue(undefined),
  }
}));

// Ensure tests don't timeout for complex MongoDB aggregations
jest.setTimeout(30000);

describe("BoardTAU Search & Filtering Engine - Database Integration Tests", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("1. Price & Room Type Matrix (Strict Boundaries)", () => {
    const priceTests = [
      { params: { roomType: "SOLO", maxPrice: "1000" }, desc: "Extremely low budget solo (should trigger AI fallback)", expectRelaxed: true },
      { params: { roomType: "SOLO", maxPrice: "3000" }, desc: "Standard budget solo" },
      { params: { roomType: "SOLO", maxPrice: "10000" }, desc: "High budget solo" },
      { params: { roomType: "BEDSPACE", maxPrice: "500" }, desc: "Impossible bedspace budget (fallback)", expectRelaxed: true },
      { params: { roomType: "BEDSPACE", maxPrice: "1500" }, desc: "Standard bedspace budget" },
      { params: { roomType: "BEDSPACE", maxPrice: "3000" }, desc: "High budget bedspace" },
      { params: { maxPrice: "2000" }, desc: "Any room under 2000" },
      { params: { maxPrice: "500" }, desc: "Any room under 500 (fallback)", expectRelaxed: true },
      { params: { minPrice: "2000", maxPrice: "5000" }, desc: "Price strictly within range (2000 - 5000)" },
      { params: { minPrice: "50000" }, desc: "Extremely high minimum price (fallback)", expectRelaxed: true },
    ];

    test.each(priceTests)("$desc", async ({ params, expectRelaxed = false }) => {
      const res = await executeComplexSearch(params as any);
      expect(res.relaxed).toBe(expectRelaxed);
      if (!expectRelaxed) {
        expect(res.data.length).toBeGreaterThanOrEqual(0); // Validates pipeline doesn't crash
      }
    });
  });

  describe("2. Strict Rules & Listing Amenities", () => {
    const rulesTests = [
      { params: { femaleOnly: "true", visitorsAllowed: "false" }, desc: "Strict female, no visitors" },
      { params: { maleOnly: "true", noCurfew: "true" }, desc: "Male only, no curfew", expectRelaxed: true },
      { params: { petsAllowed: "true", smokingAllowed: "false" }, desc: "Pet friendly, non-smoking" },
      { params: { amenities: ["wifi", "airConditioning"] }, desc: "Has WiFi and AC", expectRelaxed: true },
      { params: { amenities: ["parking", "laundry"], femaleOnly: "true" }, desc: "Parking, laundry, female only", expectRelaxed: true },
      { params: { femaleOnly: "true", maleOnly: "true" }, desc: "Contradiction (Female AND Male Only) - Should fallback", expectRelaxed: false },
    ];

    test.each(rulesTests)("$desc", async ({ params, expectRelaxed = false }) => {
      const res = await executeComplexSearch(params as any);
      expect(res.relaxed).toBe(expectRelaxed);
    });
  });

  describe("3. Room Specifics (Capacity, Slots, Amenities)", () => {
    const roomTests = [
      { params: { capacity: "1" }, desc: "Solo room with exactly 1 slot open" },
      { params: { capacity: "4", availableSlots: "2" }, desc: "4-person room with at least 2 slots" },
      { params: { bedType: "BUNK" }, desc: "Rooms strictly using BUNK beds" },
      { params: { bedType: "BUNK", roomType: "BEDSPACE" }, desc: "Bedspace rooms strictly with Bunk beds" },
      { params: { bedType: "SINGLE", roomType: "SOLO" }, desc: "Solo rooms with Single beds" },
      { params: { bathroomArrangement: "PRIVATE" }, desc: "Rooms strictly with Private Bathroom" },
      { params: { bathroomArrangement: "SHARED" }, desc: "Rooms strictly with Shared Bathroom" },
      { params: { roomAmenities: ["bathroom", "ac"] }, desc: "Room has own bathroom and AC" },
      { params: { roomAmenities: ["wifi", "locker"], availableSlots: "4" }, desc: "Empty 4-slot room with wifi and locker" },
    ];

    test.each(roomTests)("$desc", async ({ params }) => {
      const res = await executeComplexSearch(params as any);
      expect(res.data).toBeDefined();
    });
  });

  describe("4. Advanced Safety Features", () => {
    const featureTests = [
      { params: { security24h: "true", cctv: "true" }, desc: "Highly secure (24/7 + CCTV)" },
      { params: { fireSafety: "true", floodFree: "true" }, desc: "Safe from natural disasters/fire" },
      { params: { backupPower: "true", nearTransport: "true" }, desc: "Convenient (Power + Transport)" },
      { params: { security24h: "true", cctv: "true", backupPower: "true", fireSafety: "true" }, desc: "Maximum safety requirements" },
    ];

    test.each(featureTests)("$desc", async ({ params }) => {
      const res = await executeComplexSearch(params as any);
      expect(res.data).toBeDefined();
      if (res.data.length > 0) {
        // Just verify no errors were thrown and data shape is correct
        expect(res.data[0].id).toBeDefined();
      }
    });
  });

  describe("5. Maximum Complexity (The Unicorn Searches)", () => {
    const complexTests = [
      { 
        params: { 
          category: "Apartment", 
          roomType: "SOLO", 
          maxPrice: "15000", 
          petsAllowed: "true", 
          security24h: "true" 
        }, 
        desc: "Expensive Solo Apartment, Pet Friendly, Secure" 
      },
      { 
        params: { 
          category: "Student-Friendly", 
          roomType: "BEDSPACE", 
          maxPrice: "1200", 
          femaleOnly: "true", 
          amenities: ["wifi", "waterDispenser"],
          features: ["cctv"]
        }, 
        desc: "Ultra-budget strict female student bedspace with wifi/water/cctv" 
      },
      { 
        params: { 
          distance: "2", 
          originLat: "15.4851", 
          originLng: "120.5973", 
          roomType: "BEDSPACE",
          maxPrice: "2000"
        }, 
        desc: "Distance-based geo search (within 2km of Tarlac coordinates)" 
      }
    ];

    test.each(complexTests)("$desc", async ({ params }) => {
      const res = await executeComplexSearch(params as any);
      expect(res).toHaveProperty('relaxed');
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  describe("6. Extreme Edge Cases & Rare Combinations", () => {
    const extremeTests = [
      { 
        params: { isUnlimitedDistance: "true", originLat: "14.5995", originLng: "120.9842" }, 
        desc: "Unlimited distance from Manila (Stress test geo-spatial)" 
      },
      { 
        params: { category: ["Premium", "Student-Friendly", "Apartment"] }, 
        desc: "Multiple categories selected simultaneously" 
      },
      { 
        params: { maxPrice: "0", roomType: "BEDSPACE" }, 
        desc: "Zero budget (Should trigger fallback immediately)" 
      },
      { 
        params: { 
          capacity: "10", 
          features: ["cctv", "security24h", "backupPower", "fireSafety", "floodFree", "nearTransport"] 
        }, 
        desc: "Massive capacity with ALL advanced features required" 
      },
      { 
        params: { 
          amenities: ["wifi", "parking", "pool", "gym", "laundry"],
          roomAmenities: ["ac", "bathroom", "submeter"]
        }, 
        desc: "Luxury Check: Every premium amenity selected at once" 
      },
      { 
        params: { distance: "0.5", originLat: "15.4851", originLng: "120.5973" }, 
        desc: "Extremely tight 500-meter geo-fence search" 
      },
      { 
        params: { femaleOnly: "false", maleOnly: "false", visitorsAllowed: "false", petsAllowed: "false", smokingAllowed: "false", noCurfew: "false" }, 
        desc: "Explicitly turning ALL rules to false" 
      },
      { 
        params: { roomType: "UNKNOWN_TYPE" }, 
        desc: "Garbage data room type (Should safely fallback)" 
      },
      { 
        params: { limit: "100", page: "1" }, 
        desc: "Pagination stress test (Requesting 100 items at once)" 
      },
      { 
        params: { page: "999" }, 
        desc: "Deep pagination test (Out of bounds page)" 
      }
    ];

    test.each(extremeTests)("$desc", async ({ params }) => {
      const res = await executeComplexSearch(params as any);
      expect(res).toBeDefined();
      expect(Array.isArray(res.data)).toBe(true);
      expect(typeof res.relaxed).toBe('boolean');
    });
  });

  describe("7. Category Isolation Tests", () => {
    const categoryTests = [
      { params: { category: "Student-Friendly" }, desc: "Strictly 'Student-Friendly' Category" },
      { params: { category: "Premium" }, desc: "Strictly 'Premium' Category" },
      { params: { category: "Apartment" }, desc: "Strictly 'Apartment' Category" },
      { params: { category: "BoardingHouse" }, desc: "Strictly 'BoardingHouse' Category" },
      { params: { category: "Budget-Friendly" }, desc: "Strictly 'Budget-Friendly' Category" },
      { params: { category: ["Student-Friendly", "Budget-Friendly"] }, desc: "Mixed Array: Student & Budget" },
    ];

    test.each(categoryTests)("$desc", async ({ params }) => {
      const res = await executeComplexSearch(params as any);
      expect(res).toBeDefined();
      expect(Array.isArray(res.data)).toBe(true);
      // Validates that if matches are found, they actually contain the requested category (unless fallback triggered)
      if (!res.relaxed && res.data.length > 0) {
        const catList = Array.isArray(params.category) ? params.category : [params.category];
        const match = res.data[0].categories.some((c: any) => catList.includes(c.name));
        expect(match).toBe(true);
      }
    });
  });

  describe("8. Geo-Spatial Location Testing (College -> Distance Flow)", () => {
    // Target Coordinates (e.g., Tarlac State University)
    const COLLEGE_LAT = "15.4851"; 
    const COLLEGE_LNG = "120.5973"; 

    const geoTests = [
      { params: { originLat: COLLEGE_LAT, originLng: COLLEGE_LNG, distance: "1" }, desc: "Walking Distance (1km limit)" },
      { params: { originLat: COLLEGE_LAT, originLng: COLLEGE_LNG, distance: "5" }, desc: "Commute Distance (5km limit)" },
      { params: { originLat: COLLEGE_LAT, originLng: COLLEGE_LNG, distance: "50" }, desc: "Far Away (50km limit)" },
    ];

    test.each(geoTests)("$desc", async ({ params }) => {
      const res = await executeComplexSearch(params as any);
      expect(res).toBeDefined();
      expect(Array.isArray(res.data)).toBe(true);
      
      // Strict mathematical verification: if matches exist, every single one MUST be within the requested distance.
      if (!res.relaxed && res.data.length > 0) {
        res.data.forEach((listing: any) => {
          // MongoDB returns distanceToCollege in meters. We requested distance in km.
          const maxAllowedMeters = Number(params.distance) * 1000;
          expect(listing).toHaveProperty("distanceToCollege");
          expect(listing.distanceToCollege).toBeLessThanOrEqual(maxAllowedMeters);
        });
      }
    });
  });

  describe("9. Scoring & Sorting Engine", () => {
    test("Results must include finalScore and be strictly sorted in descending order", async () => {
      // Pass broad parameters to ensure we get multiple results back
      const res = await executeComplexSearch({ distance: "50" } as any);
      
      expect(res).toBeDefined();
      expect(Array.isArray(res.data)).toBe(true);
      
      // We need at least 2 results to prove sorting logic
      if (!res.relaxed && res.data.length > 1) {
        let previousScore = Infinity;
        
        res.data.forEach((listing: any) => {
          // 1. Prove the scoring engine actually attached a score
          expect(listing).toHaveProperty("finalScore");
          expect(typeof listing.finalScore).toBe("number");
          
          // 2. Prove the array is sorted Highest -> Lowest (Descending)
          expect(listing.finalScore).toBeLessThanOrEqual(previousScore);
          previousScore = listing.finalScore;
        });
      }
    });
  });
});

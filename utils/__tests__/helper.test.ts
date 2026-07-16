import { formatPrice, cn, haversineKm, calculateAverageRating } from "../helper";

describe("helper utils", () => {
  describe("formatPrice", () => {
    it("formats thousands with commas", () => {
      expect(formatPrice(5000)).toBe("5,000");
      expect(formatPrice(1000000)).toBe("1,000,000");
    });
  });

  describe("cn", () => {
    it("merges tailwind classes", () => {
      expect(cn("p-4", "p-8")).toBe("p-8");
      expect(cn("text-red", ["bg-black"])).toBe("text-red bg-black");
    });
  });

  describe("haversineKm", () => {
    it("calculates distance correctly between two points", () => {
      // Coordinates roughly between Manila and Quezon City (approx ~10-15km)
      const lat1 = 14.5995;
      const lon1 = 120.9842;
      const lat2 = 14.6760;
      const lon2 = 121.0437;
      
      const distance = haversineKm(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(0);
      // Rough validation: distance should be around 10.6 km
      expect(distance).toBeCloseTo(10.6, 0); 
    });

    it("returns 0 if points are exactly the same", () => {
      const distance = haversineKm(10, 10, 10, 10);
      expect(distance).toBe(0);
    });
  });

  describe("calculateAverageRating", () => {
    it("calculates the average correctly", () => {
      const reviews = [{ rating: 5 }, { rating: 3 }, { rating: 4 }];
      expect(calculateAverageRating(reviews)).toBe(4);
    });

    it("handles missing ratings gracefully", () => {
      // @ts-ignore: Intentionally passing undefined rating to test robustness
      const reviews = [{ rating: 5 }, { }, { rating: 4 }] as any;
      expect(calculateAverageRating(reviews)).toBe(3); // (5 + 0 + 4) / 3 = 3
    });

    it("returns fallback if reviews array is empty", () => {
      expect(calculateAverageRating([], 4.5)).toBe(4.5);
    });

    it("returns 0 if reviews array is empty and no fallback is provided", () => {
      expect(calculateAverageRating([])).toBe(0);
    });

    it("returns fallback if reviews array is null/undefined", () => {
      // @ts-ignore
      expect(calculateAverageRating(null, 3.5)).toBe(3.5);
    });
  });
});

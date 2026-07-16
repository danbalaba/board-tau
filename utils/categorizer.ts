/**
 * Auto-Categorization Utility for BoardTAU Listings
 * This evaluates a property's raw data and returns an array of matching categories.
 */

export function autoCategorizeListing(data: any): string[] {
  const categories: string[] = [];

  // Extract necessary fields
  const {
    price,
    rooms = [],
    amenities = [], // Array of string amenities
    businessInfo,
    visitorsAllowed,
    petsAllowed,
    noCurfew,
    studyFriendly,
    quietEnvironment,
    flexibleLease,
  } = data;

  const safeAmenities = Array.isArray(amenities) ? amenities.map(a => String(a).toLowerCase()) : [];
  const safeRooms = Array.isArray(rooms) ? rooms : [];

  // Helper: Find the lowest price among all rooms, or fallback to base price
  let lowestPrice = Number(price) || Infinity;
  if (safeRooms.length > 0) {
    const minRoomPrice = Math.min(...safeRooms.map(r => Number(r.price) || Infinity));
    lowestPrice = Math.min(lowestPrice, minRoomPrice);
  }
  if (lowestPrice === Infinity) lowestPrice = 0;

  // 1. Budget-Friendly
  // Criteria: Lowest rent is ₱3,000 or below
  if (lowestPrice > 0 && lowestPrice <= 3000) {
    categories.push("Budget-Friendly");
  }

  // 2. Student-Friendly
  // Criteria: Has WiFi AND (Study Friendly OR Quiet Environment)
  const hasWifi = safeAmenities.some(a => a.includes("wifi"));
  if (hasWifi && (studyFriendly === true || quietEnvironment === true)) {
    categories.push("Student-Friendly");
  }

  // 3. Premium / Private
  // Criteria: Rent is ₱8,000+, has Air Conditioning, and has SOLO rooms
  const hasAC = safeAmenities.some(a => a.includes("air cond") || a.includes("ac"));
  const hasSoloRoom = safeRooms.some(r => String(r.roomType).toUpperCase() === "SOLO");
  if (lowestPrice >= 8000 && hasAC && hasSoloRoom) {
    categories.push("Premium");
  }

  // 4. Family-Friendly
  // Criteria: Allows visitors
  if (visitorsAllowed === true) {
    categories.push("Family-Friendly");
  }

  // 5. Pet-Friendly
  // Criteria: Explicitly allows pets
  if (petsAllowed === true) {
    categories.push("Pet-Friendly");
  }

  // 6. Apartment
  // Criteria: Business type is explicitly an apartment
  const bType = String(businessInfo?.businessType || "").toLowerCase();
  if (bType.includes("apartment")) {
    categories.push("Apartment");
  }

  // 7. Short-Term / Flexible Lease
  // Criteria: Landlord toggled flexible lease
  if (flexibleLease === true) {
    categories.push("Short-Term / Flexible Lease");
  }

  // 8. Quiet / Study Environment
  // Criteria: Enforces curfew (noCurfew = false) and marked as quiet environment
  if (noCurfew === false && quietEnvironment === true) {
    categories.push("Quiet / Study Environment");
  }

  // Fallback if absolutely no categories matched
  if (categories.length === 0) {
    categories.push("Student-Friendly"); // Default safe category
  }

  // Deduplicate array just in case
  return Array.from(new Set(categories));
}

import queryString from "query-string";
import { FieldValues } from "react-hook-form";
import { ROOM_TYPES } from "@/data/roomTypes";

/**
 * Encapsulates the logic of converting the 10-step wizard form data
 * into a serialized URL query string for the backend algorithm.
 */
export function buildSearchUrl(data: FieldValues, currentSearchParams: URLSearchParams | null): string {
  // 1. Get exact map coordinates for distance filtering
  // These are now populated directly in the form via CollegeStep
  const originLat = data.originLat;
  const originLng = data.originLng;

  // 2. Parse existing queries to retain anything else in the URL
  let currentQuery: Record<string, unknown> = {};
  if (currentSearchParams) {
    currentQuery = queryString.parse(currentSearchParams.toString()) as Record<string, unknown>;
  }

  // 3. Build the massive query object safely
  const updatedQuery: Record<string, unknown> = {
    ...currentQuery,
    college: data.college,
    category: (data.propertyType ?? []).length ? data.propertyType : (data.categories ?? undefined),
    distance: data.distance,
    moveInDate: data.moveInMonth || undefined,
    stayDuration: data.stayDuration || undefined,
    amenities: (data.amenities ?? []).length ? data.amenities : undefined,
    // Send raw enum values — DB stores enums (SOLO, DESK, etc.)
    roomType: Array.isArray(data.roomType) ? data.roomType[0] : (data.roomType || undefined),
    bedType: data.bedType || undefined,
    roomAmenities: (data.roomAmenities ?? []).length ? data.roomAmenities : undefined,
    
    // Hard requirements specific to Room Type
    capacity: data.roomType === ROOM_TYPES.SOLO || !data.capacity || data.capacity === "" ? undefined : data.capacity,
    availableSlots: data.roomType === ROOM_TYPES.SOLO || !data.availableSlots || data.availableSlots === "" ? undefined : data.availableSlots,
    roomSize: data.roomSize || undefined,
    minPrice: data.minPrice !== "" && data.minPrice !== null ? data.minPrice : undefined,
    maxPrice: data.maxPrice !== "" && data.maxPrice !== null ? data.maxPrice : undefined,

    // Convert Rule Checkboxes to Boolean URL Parameters for backend
    femaleOnly: (data.rules ?? []).includes("female-only") ? "true" : undefined,
    maleOnly: (data.rules ?? []).includes("male-only") ? "true" : undefined,
    visitorsAllowed: (data.rules ?? []).includes("visitors-allowed") ? "true" : undefined,
    petsAllowed: (data.rules ?? []).includes("pets-allowed") ? "true" : undefined,
    smokingAllowed: (data.rules ?? []).includes("smoking-allowed") ? "true" : undefined,
    noCurfew: (data.rules ?? []).includes("no-curfew") ? "true" : undefined,

    // Convert Advanced Soft Filters (Scoring multipliers) to Boolean Parameters
    security24h: (data.advanced ?? []).includes("security24h") ? "true" : undefined,
    cctv: (data.advanced ?? []).includes("cctv") ? "true" : undefined,
    fireSafety: (data.advanced ?? []).includes("fireSafety") ? "true" : undefined,
    nearTransport: (data.advanced ?? []).includes("nearTransport") ? "true" : undefined,
    floodFree: (data.advanced ?? []).includes("floodFree") ? "true" : undefined,
    backupPower: (data.advanced ?? []).includes("backupPower") ? "true" : undefined,
    isUnlimitedDistance: data.isUnlimitedDistance ? "true" : undefined,
  };

  // 4. Attach Geolocation coordinates if a specific college was chosen
  if (originLat !== undefined && originLng !== undefined) {
    updatedQuery.originLat = originLat;
    updatedQuery.originLng = originLng;
  }

  // 5. Build and return the stringified URL
  return queryString.stringifyUrl(
    { url: "/", query: updatedQuery as Record<string, string | string[] | number | undefined> },
    { skipNull: true }
  );
}

import queryString from "query-string";
import { FieldValues } from "react-hook-form";

/**
 * Encapsulates the logic of converting the 10-step wizard form data
 * into a serialized URL query string for the backend algorithm.
 */
export function buildSearchUrl(data: FieldValues, currentSearchParams: URLSearchParams | null): string {
  // 1. Get exact map coordinates for distance filtering
  const originLat = data.originLat;
  const originLng = data.originLng;

  // 2. Parse existing queries to retain anything else in the URL
  let currentQuery: Record<string, unknown> = {};
  if (currentSearchParams) {
    currentQuery = queryString.parse(currentSearchParams.toString()) as Record<string, unknown>;
  }

  const isSoloOrFlat = Boolean(data.isFlatRate) || (typeof data.roomType === "string" && (data.roomType.toUpperCase() === "SOLO" || data.roomType.toLowerCase().includes("solo")));

  // 3. Build the query object safely
  const updatedQuery: Record<string, unknown> = {
    ...currentQuery,
    college: data.college,
    category: (data.propertyType ?? []).length ? data.propertyType : (data.categories ?? undefined),
    distance: data.distance,
    moveInDate: data.moveInMonth || undefined,
    stayDuration: data.stayDuration || undefined,
    amenities: (data.amenities ?? []).length ? data.amenities : undefined,
    roomAmenities: (data.roomAmenities ?? []).length ? data.roomAmenities : undefined,
    rules: (data.rules ?? []).length ? data.rules : undefined,
    advanced: (data.advanced ?? []).length ? data.advanced : undefined,
    roomType: Array.isArray(data.roomType) ? data.roomType[0] : (data.roomType || undefined),
    bedType: data.bedType || undefined,
    capacity: isSoloOrFlat || !data.capacity || data.capacity === "" ? undefined : data.capacity,
    availableSlots: isSoloOrFlat || !data.availableSlots || data.availableSlots === "" ? undefined : data.availableSlots,
    roomSize: data.roomSize || undefined,
    minPrice: data.minPrice !== "" && data.minPrice !== null ? data.minPrice : undefined,
    maxPrice: data.maxPrice !== "" && data.maxPrice !== null ? data.maxPrice : undefined,
    femaleOnly: (data.rules ?? []).includes("female-only") || (data.rules ?? []).some((r: string) => r.toLowerCase().includes("female")) ? "true" : undefined,
    maleOnly: (data.rules ?? []).includes("male-only") || (data.rules ?? []).some((r: string) => r.toLowerCase().includes("male")) ? "true" : undefined,
    visitorsAllowed: (data.rules ?? []).includes("visitors-allowed") || (data.rules ?? []).some((r: string) => r.toLowerCase().includes("visitor")) ? "true" : undefined,
    petsAllowed: (data.rules ?? []).includes("pets-allowed") || (data.rules ?? []).some((r: string) => r.toLowerCase().includes("pet")) ? "true" : undefined,
    smokingAllowed: (data.rules ?? []).includes("smoking-allowed") || (data.rules ?? []).some((r: string) => r.toLowerCase().includes("smoking")) ? "true" : undefined,
    noCurfew: (data.rules ?? []).includes("no-curfew") || (data.rules ?? []).some((r: string) => r.toLowerCase().includes("curfew")) ? "true" : undefined,
    security24h: (data.advanced ?? []).includes("security24h") || (data.advanced ?? []).some((a: string) => a.toLowerCase().includes("security")) ? "true" : undefined,
    cctv: (data.advanced ?? []).includes("cctv") || (data.advanced ?? []).some((a: string) => a.toLowerCase().includes("cctv")) ? "true" : undefined,
    fireSafety: (data.advanced ?? []).includes("fireSafety") || (data.advanced ?? []).some((a: string) => a.toLowerCase().includes("fire")) ? "true" : undefined,
    nearTransport: (data.advanced ?? []).includes("nearTransport") || (data.advanced ?? []).some((a: string) => a.toLowerCase().includes("transport")) ? "true" : undefined,
    floodFree: (data.advanced ?? []).includes("floodFree") || (data.advanced ?? []).some((a: string) => a.toLowerCase().includes("flood")) ? "true" : undefined,
    backupPower: (data.advanced ?? []).includes("backupPower") || (data.advanced ?? []).some((a: string) => a.toLowerCase().includes("power") || a.toLowerCase().includes("generator")) ? "true" : undefined,
    isUnlimitedDistance: data.isUnlimitedDistance ? "true" : undefined,
  };

  if (originLat !== undefined && originLng !== undefined) {
    updatedQuery.originLat = originLat;
    updatedQuery.originLng = originLng;
  }

  return queryString.stringifyUrl(
    { url: "/", query: updatedQuery as Record<string, string | string[] | number | undefined> },
    { skipNull: true }
  );
}

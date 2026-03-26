import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { colleges } from "@/data/colleges";

export function useSearchSummary() {
  const searchParams = useSearchParams();

  const college = searchParams?.get("college");
  const categories = searchParams?.getAll("categories");
  const distance = searchParams?.get("distance");
  const roomType = searchParams?.get("roomType");
  const minPrice = searchParams?.get("minPrice");
  const maxPrice = searchParams?.get("maxPrice");
  const guestCount = searchParams?.get("guestCount");

  const locationLabel = useMemo(() => {
    const co = colleges.find((c) => c.value === college);
    const name = co?.label ?? "TAU";
    if (distance != null && distance !== "") return `Near ${name} · ≤ ${distance} km`;
    return `Near ${name}`;
  }, [college, distance]);

  const categoryLabel = useMemo(() => {
    if (categories?.length) {
      if (categories.length === 1) return categories[0];
      return `${categories.length} categories`;
    }
    return "Any category";
  }, [categories]);

  const priceLabel = useMemo(() => {
    if (minPrice && maxPrice && +minPrice > 0 && +maxPrice > 0) {
      return `₱${minPrice}–${maxPrice} / mo`;
    }
    return "Any price";
  }, [minPrice, maxPrice]);

  const roomTypeLabel = useMemo(() => {
    if (roomType) return roomType;
    return "Any room";
  }, [roomType]);

  const occupantLabel = useMemo(() => {
    if (guestCount) return `${guestCount} occupants`;
    return "Occupants";
  }, [guestCount]);

  return {
    locationLabel,
    categoryLabel,
    priceLabel,
    roomTypeLabel,
    occupantLabel,
  };
}

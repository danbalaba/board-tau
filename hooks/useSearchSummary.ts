import { useMemo, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";

const COLLEGE_SHORT_NAMES: Record<string, string> = {
  "TAU - College of Engineering and Technology": "TAU - College of Eng.",
  "TAU - College of Business and Management": "TAU - CBM",
  "TAU - College of Veterinary Medicine": "TAU - CVM",
  "TAU - College of Veterinary Medicine Annex Bldg.": "TAU - CVM Annex",
  "TAU - College of Agriculture and Forestry": "TAU - CAF",
  "TAU - College of Arts and Sciences": "TAU - CAS",
  "TAU - College of Education": "TAU - CED",
  "TAU - Laboratory High School": "TAU - LHS",
  "Tarlac Agricultural University": "TAU Main",
};

const getShortCollegeName = (fullName: string): string => {
  if (COLLEGE_SHORT_NAMES[fullName]) return COLLEGE_SHORT_NAMES[fullName];
  if (fullName.length > 25) return fullName.replace("College of ", "Col. of ");
  return fullName;
};

export function useSearchSummary() {
  const searchParams = useSearchParams();

  const college = searchParams?.get("college");
  const categories = searchParams?.getAll("categories");
  const distance = searchParams?.get("distance");
  const roomType = searchParams?.get("roomType");
  const minPrice = searchParams?.get("minPrice");
  const maxPrice = searchParams?.get("maxPrice");
  const guestCount = searchParams?.get("guestCount");

  const [collegeName, setCollegeName] = useState<string>("TAU");

  useEffect(() => {
    if (college && college !== "any") {
      axios.get("/api/colleges").then((res) => {
        const found = res.data.find((c: any) => c.code === college);
        if (found) setCollegeName(found.name);
      }).catch(console.error);
    } else {
      setCollegeName("TAU");
    }
  }, [college]);

  const shortCollegeName = useMemo(() => {
    return getShortCollegeName(collegeName);
  }, [collegeName]);

  const locationLabel = useMemo(() => {
    if (distance != null && distance !== "") return `Near ${shortCollegeName} · ≤ ${distance} km`;
    return `Near ${shortCollegeName}`;
  }, [shortCollegeName, distance]);

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

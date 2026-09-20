import {
  MdOutlineSchool,
  MdOutlineKingBed,
  MdOutlineAttachMoney,
  MdOutlineGroups,
} from "react-icons/md";
import { GiFamilyHouse } from "react-icons/gi";

export const LISTINGS_BATCH = 16;

export const menuItems = [
  { label: "My messages", path: "/messages" },
  { label: "My favorites", path: "/favorites" },
  { label: "My inquiries", path: "/inquiries" },
  { label: "My reservations", path: "/reservations" },
  { label: "My reviews", path: "/my-reviews" },
  { label: "My profile", path: "/profile" },
];

/** Tarlac Agricultural University (TAU), Camiling, Tarlac — default map center & distance reference */
export const TAU_COORDINATES = [15.63518934952113, 120.41534319307087] as [number, number];

/** Central Bathroom Arrangements */
export const BATHROOM_ARRANGEMENTS = {
  PRIVATE: "PRIVATE_CR",
  COMMON: "COMMON_CR",
} as const;

/** Central Bed Setup Options */
export interface BedTypeOption {
  value: string;
  label: string;
  capacity?: number;
  description?: string;
}

export const bedTypeOptions: BedTypeOption[] = [
  { value: "SINGLE", label: "Single Bed", capacity: 1, description: "1 Person per bed" },
  { value: "BUNK", label: "Bunk Bed", capacity: 2, description: "2 Persons per bunk set" },
  { value: "DOUBLE", label: "Double Bed", capacity: 2, description: "2 Persons per double bed" },
  { value: "QUEEN", label: "Queen Bed", capacity: 2, description: "2 Persons per queen bed" },
  { value: "KING", label: "King Bed", capacity: 2, description: "2 Persons per king bed" },
];

export const CENTRAL_BED_TYPES = bedTypeOptions;

/** Stay duration options (Step 3). */
export const stayDurationOptions = [
  { value: "", label: "Not specified" },
  { value: "1-3", label: "1–3 months" },
  { value: "4-6", label: "4–6 months" },
  { value: "semester", label: "1 semester" },
  { value: "long-term", label: "Long-term (6+ months)" },
];

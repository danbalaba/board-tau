import {
  MdOutlineSchool,
  MdOutlineKingBed,
  MdOutlineAttachMoney,
  MdOutlineFemale,
  MdOutlineMale,
  MdOutlineGroups,
} from "react-icons/md";
import { GiFamilyHouse } from "react-icons/gi";

/** BoardTAU Step 1 — boarding house categories (multi-select). */
export const categories = [
  { label: "Student-Friendly", value: "Student-Friendly", icon: MdOutlineSchool, description: "Boarding houses suitable for students." },
  { label: "Female-Only", value: "Female-Only", icon: MdOutlineFemale, description: "Exclusively for female tenants." },
  { label: "Male-Only", value: "Male-Only", icon: MdOutlineMale, description: "Exclusively for male tenants." },
  { label: "Budget Boarding House", value: "Budget Boarding House", icon: MdOutlineAttachMoney, description: "Affordable options." },
  { label: "Private Boarding House", value: "Private Boarding House", icon: MdOutlineKingBed, description: "Private rooms or units." },
  { label: "Family / Visitor Friendly", value: "Family / Visitor Friendly", icon: MdOutlineGroups, description: "Family or visitor-friendly." },
];

export const LISTINGS_BATCH = 16;

export const menuItems = [
  { label: "My favorites", path: "/favorites" },
  { label: "My reservations", path: "/reservations" },
  { label: "My properties", path: "/properties" },
];

/** Tarlac Agricultural University (TAU), Camiling, Tarlac — default map center & distance reference */
export const TAU_COORDINATES = [15.63518934952113, 120.41534319307087] as [number, number];

/** Room types for filter & listings (Step 6). */
export const roomTypeOptions = [
  { value: "", label: "Any" },
  { value: "Solo", label: "Solo" },
  { value: "Shared", label: "Shared" },
  { value: "Bed Spacer", label: "Bed Spacer" },
];

/** Stay duration options (Step 3). */
export const stayDurationOptions = [
  { value: "", label: "Not specified" },
  { value: "1-3", label: "1–3 months" },
  { value: "4-6", label: "4–6 months" },
  { value: "semester", label: "1 semester" },
  { value: "long-term", label: "Long-term (6+ months)" },
];

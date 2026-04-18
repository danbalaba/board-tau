import {
  MdOutlineSchool,
  MdOutlineKingBed,
  MdOutlineAttachMoney,
  MdOutlineGroups,
} from "react-icons/md";
import { GiFamilyHouse } from "react-icons/gi";

/** BoardTAU Step 1 — boarding house categories (multi-select). */
export const categories = [
  { label: "Student-Friendly", value: "Student-Friendly", icon: MdOutlineSchool, description: "Boarding houses suitable for students." },
  { label: "Budget-Friendly", value: "Budget Boarding House", icon: MdOutlineAttachMoney, description: "Affordable options for students or working individuals." },
  { label: "Premium / Private", value: "Private Boarding House", icon: MdOutlineKingBed, description: "Higher-end boarding houses or private rooms." },
  { label: "Family-Friendly", value: "Family-Friendly", icon: MdOutlineGroups, description: "Allows visitors, pets, or accommodates small families." },
  { label: "Pet-Friendly", value: "Pet-Friendly", icon: GiFamilyHouse, description: "Explicitly allows pets." },
  { label: "Apartment", value: "Apartment", icon: MdOutlineKingBed, description: "Full apartment listing, not typical boarding rooms." },
  { label: "Short-Term / Flexible Lease", value: "Short-Term / Flexible Lease", icon: MdOutlineSchool, description: "Temporary stays or short-term rentals." },
  { label: "Quiet / Study Environment", value: "Quiet / Study Environment", icon: MdOutlineSchool, description: "Focused on study-friendly, noise-controlled environment." },
];

export const LISTINGS_BATCH = 16;

export const menuItems = [
  { label: "My favorites", path: "/favorites" },
  { label: "My inquiries", path: "/inquiries" },
  { label: "My reservations", path: "/reservations" },
  { label: "My reviews", path: "/my-reviews" },
  { label: "My profile", path: "/profile" },
];

/** Tarlac Agricultural University (TAU), Camiling, Tarlac — default map center & distance reference */
export const TAU_COORDINATES = [15.63518934952113, 120.41534319307087] as [number, number];

/** Room types for filter & listings (Step 6). */
import { ROOM_TYPES, ROOM_TYPE_LABELS } from "@/data/roomTypes";

export const roomTypeOptions = [
  { value: "", label: "Choose room type" },
  { value: ROOM_TYPES.SOLO, label: ROOM_TYPE_LABELS.SOLO },
  { value: ROOM_TYPES.BEDSPACE, label: ROOM_TYPE_LABELS.BEDSPACE },
];

/** Stay duration options (Step 3). */
export const stayDurationOptions = [
  { value: "", label: "Not specified" },
  { value: "1-3", label: "1–3 months" },
  { value: "4-6", label: "4–6 months" },
  { value: "semester", label: "1 semester" },
  { value: "long-term", label: "Long-term (6+ months)" },
];

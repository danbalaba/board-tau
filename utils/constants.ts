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

/** Room types for filter & listings (Step 6). */
import { ROOM_TYPES, ROOM_TYPE_LABELS } from "@/data/roomTypes";

export const roomTypeOptions = [
  { value: "", label: "Choose room type", description: "Search for all available properties regardless of room type." },
  { value: ROOM_TYPES.SOLO, label: ROOM_TYPE_LABELS.SOLO, description: "A private room exclusively for one person. Offers maximum privacy." },
  { value: ROOM_TYPES.BEDSPACE, label: ROOM_TYPE_LABELS.BEDSPACE, description: "A shared room where you rent a single bed. Highly cost-effective and social." },
];

/** Stay duration options (Step 3). */
export const stayDurationOptions = [
  { value: "", label: "Not specified" },
  { value: "1-3", label: "1–3 months" },
  { value: "4-6", label: "4–6 months" },
  { value: "semester", label: "1 semester" },
  { value: "long-term", label: "Long-term (6+ months)" },
];

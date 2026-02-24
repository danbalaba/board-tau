export const ROOM_AMENITIES = {
  PRIVATE_BATHROOM: "PRIVATE_BATHROOM",
  SHARED_BATHROOM: "SHARED_BATHROOM",
  AC: "AC",
  DESK: "DESK",
  CLOSET: "CLOSET",
  BALCONY: "BALCONY",
  MINI_FRIDGE: "MINI_FRIDGE",
  NATURAL_LIGHT: "NATURAL_LIGHT",
  HEATING_FAN: "HEATING_FAN",
  WIFI: "WIFI",
  SHARED_KITCHEN: "SHARED_KITCHEN",
  PERSONAL_LOCK: "PERSONAL_LOCK",
  DESK_LAMP: "DESK_LAMP"
} as const;

export const ROOM_AMENITY_LABELS: Record<string, string> = {
  PRIVATE_BATHROOM: "Private Bathroom",
  SHARED_BATHROOM: "Shared Bathroom",
  AC: "Air Conditioning",
  DESK: "Study Desk",
  CLOSET: "Closet / Wardrobe",
  BALCONY: "Balcony / Window",
  MINI_FRIDGE: "Mini-Fridge",
  NATURAL_LIGHT: "Natural Light",
  HEATING_FAN: "Heating / Fan",
  WIFI: "WiFi Access",
  SHARED_KITCHEN: "Shared Kitchen",
  PERSONAL_LOCK: "Personal Lock",
  DESK_LAMP: "Desk Lamp"
};

export type RoomAmenity = keyof typeof ROOM_AMENITIES;

import { IconType } from "react-icons";
import { ROOM_TYPES } from "./roomTypes";
import {
  FaBath,
  FaUtensils,
  FaThermometerHalf,
  FaBook,
  FaLock,
  FaBed,
  FaWindowMaximize,
  FaFan,
  FaWifi,
} from "react-icons/fa";

/** BoardTAU Step 2 — Room-level amenities (strict filters). */
export const roomAmenities: { label: string; value: string; icon: IconType; applicableTo?: string[] }[] = [
  // Solo Room Amenities
  {
    label: ROOM_AMENITY_LABELS.PRIVATE_BATHROOM,
    value: ROOM_AMENITIES.PRIVATE_BATHROOM,
    icon: FaBath,
    applicableTo: [ROOM_TYPES.SOLO]
  },
  {
    label: "Private Kitchen",
    value: "PRIVATE_KITCHEN",
    icon: FaUtensils,
    applicableTo: [ROOM_TYPES.SOLO]
  },
  {
    label: ROOM_AMENITY_LABELS.AC,
    value: ROOM_AMENITIES.AC,
    icon: FaThermometerHalf
  },
  {
    label: ROOM_AMENITY_LABELS.DESK,
    value: ROOM_AMENITIES.DESK,
    icon: FaBook
  },
  {
    label: ROOM_AMENITY_LABELS.CLOSET,
    value: ROOM_AMENITIES.CLOSET,
    icon: FaLock
  },
  {
    label: ROOM_AMENITY_LABELS.BALCONY,
    value: ROOM_AMENITIES.BALCONY,
    icon: FaWindowMaximize
  },
  {
    label: ROOM_AMENITY_LABELS.MINI_FRIDGE,
    value: ROOM_AMENITIES.MINI_FRIDGE,
    icon: FaUtensils,
    applicableTo: [ROOM_TYPES.SOLO]
  },
  {
    label: ROOM_AMENITY_LABELS.NATURAL_LIGHT,
    value: ROOM_AMENITIES.NATURAL_LIGHT,
    icon: FaWindowMaximize
  },
  {
    label: ROOM_AMENITY_LABELS.HEATING_FAN,
    value: ROOM_AMENITIES.HEATING_FAN,
    icon: FaFan
  },
  {
    label: ROOM_AMENITY_LABELS.WIFI,
    value: ROOM_AMENITIES.WIFI,
    icon: FaWifi
  },

  // Bedspace Room Amenities
  {
    label: ROOM_AMENITY_LABELS.SHARED_BATHROOM,
    value: ROOM_AMENITIES.SHARED_BATHROOM,
    icon: FaBath,
    applicableTo: [ROOM_TYPES.BEDSPACE]
  },
  {
    label: ROOM_AMENITY_LABELS.SHARED_KITCHEN,
    value: ROOM_AMENITIES.SHARED_KITCHEN,
    icon: FaUtensils,
    applicableTo: [ROOM_TYPES.BEDSPACE]
  },
  {
    label: ROOM_AMENITY_LABELS.PERSONAL_LOCK,
    value: ROOM_AMENITIES.PERSONAL_LOCK,
    icon: FaLock,
    applicableTo: [ROOM_TYPES.BEDSPACE]
  },
  {
    label: ROOM_AMENITY_LABELS.DESK_LAMP,
    value: ROOM_AMENITIES.DESK_LAMP,
    icon: FaBook,
    applicableTo: [ROOM_TYPES.BEDSPACE]
  },
];

/** BoardTAU Step 2 — Bed type options. */
export const bedTypeOptions = [
  { value: "", label: "Any" },
  { value: "Single", label: "Single" },
  { value: "Double", label: "Double" },
  { value: "Queen", label: "Queen" },
  { value: "Bunk", label: "Bunk" },
];

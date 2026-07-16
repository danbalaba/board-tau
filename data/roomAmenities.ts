export const ROOM_AMENITIES = {
  AC: "ac",
  DESK: "desk",
  CABINET: "locker",
  FOAM: "foam",
  FAN: "fan",
  SUBMETER_ELEC: "submeter",
  SUBMETER_WATER: "submeter_water",
  WIFI: "wifi",
} as const;

export const ROOM_AMENITY_LABELS: Record<string, string> = {
  AC: "Air Conditioning",
  DESK: "Study Table",
  CABINET: "Locker",
  FOAM: "Foam Mattress",
  FAN: "Electric Fan",
  SUBMETER_ELEC: "Electric Sub-Meter",
  SUBMETER_WATER: "Water Sub-Meter",
  WIFI: "WiFi Access",
};

// Bathroom arrangement options — used as a radio question per room, NOT as amenity checkboxes
export const BATHROOM_ARRANGEMENTS = {
  PRIVATE: "PRIVATE_CR",
  SHARED_OCCUPANTS: "SHARED_CR",
  COMMON: "COMMON_CR",
} as const;

export const BATHROOM_ARRANGEMENT_LABELS: Record<string, string> = {
  PRIVATE_CR: "Own private CR",
  SHARED_CR: "Shared CR (among this room's occupants)",
  COMMON_CR: "No CR — uses common bathroom",
};

export type RoomAmenity = keyof typeof ROOM_AMENITIES;

import { IconType } from "react-icons";
import { ROOM_TYPES, RoomType } from "./roomTypes";
import {
  FaBook,
  FaLock,
  FaFan,
  FaWifi,
  FaSnowflake,
  FaBed,
  FaBolt,
  FaTint,
  FaChair
} from "react-icons/fa";

/** BoardTAU — Room-level amenity checkboxes (bathroom excluded — handled via dedicated radio). */
export const roomAmenities: {
  label: string;
  value: string;
  icon: IconType;
  applicableTo?: RoomType[];
  description?: string;
}[] = [
  // ── Universal
  {
    label: ROOM_AMENITY_LABELS.WIFI,
    value: ROOM_AMENITIES.WIFI,
    icon: FaWifi,
    description: "Fast, reliable internet access is provided for tenants.",
  },

  // ── Comfort & Furnishing
  {
    label: ROOM_AMENITY_LABELS.AC,
    value: ROOM_AMENITIES.AC,
    icon: FaSnowflake,
    applicableTo: [ROOM_TYPES.SOLO, ROOM_TYPES.BEDSPACE],
    description: "Room comes equipped with an installed air conditioning unit.",
  },
  {
    label: ROOM_AMENITY_LABELS.FAN,
    value: ROOM_AMENITIES.FAN,
    icon: FaFan,
    applicableTo: [ROOM_TYPES.SOLO, ROOM_TYPES.BEDSPACE],
    description: "Room is equipped with a ceiling or stand fan.",
  },
  {
    label: ROOM_AMENITY_LABELS.DESK,
    value: ROOM_AMENITIES.DESK,
    icon: FaChair,
    applicableTo: [ROOM_TYPES.SOLO, ROOM_TYPES.BEDSPACE],
    description: "Room includes a dedicated desk and chair for studying or working.",
  },
  {
    label: ROOM_AMENITY_LABELS.CABINET,
    value: ROOM_AMENITIES.CABINET,
    icon: FaLock,
    applicableTo: [ROOM_TYPES.SOLO, ROOM_TYPES.BEDSPACE],
    description: "Includes personal storage space with secure locks.",
  },
  {
    label: ROOM_AMENITY_LABELS.FOAM,
    value: ROOM_AMENITIES.FOAM,
    icon: FaBed,
    applicableTo: [ROOM_TYPES.SOLO, ROOM_TYPES.BEDSPACE],
    description: "A foam mattress is provided with the bed.",
  },

  // ── Solo Room Specific (Sub-meters usually apply per distinct room unit)
  {
    label: ROOM_AMENITY_LABELS.SUBMETER_ELEC,
    value: ROOM_AMENITIES.SUBMETER_ELEC,
    icon: FaBolt,
    applicableTo: [ROOM_TYPES.SOLO],
    description: "You pay only for the exact electricity you consume inside your room.",
  },
  {
    label: ROOM_AMENITY_LABELS.SUBMETER_WATER,
    value: ROOM_AMENITIES.SUBMETER_WATER,
    icon: FaTint,
    applicableTo: [ROOM_TYPES.SOLO],
    description: "You pay only for the exact water you consume.",
  },
];

/** BoardTAU — Bed type options. */
export const bedTypeOptions = [
  { value: "SINGLE", label: "Single Bed" },
  { value: "DOUBLE", label: "Double Bed" },
  { value: "QUEEN", label: "Queen Bed" },
  { value: "BUNK", label: "Bunk Bed (Double Deck)" },
];

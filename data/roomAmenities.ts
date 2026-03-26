export const ROOM_AMENITIES = {
  AC: "AC",
  DESK: "DESK",
  CABINET: "CABINET",
  FOAM: "FOAM",
  FAN: "FAN",
  SUBMETER_ELEC: "SUBMETER_ELEC",
  SUBMETER_WATER: "SUBMETER_WATER",
  WIFI: "WIFI",
} as const;

export const ROOM_AMENITY_LABELS: Record<string, string> = {
  AC: "Air Conditioning",
  DESK: "Desk / Study Table",
  CABINET: "Cabinet with Lock",
  FOAM: "Foam / Mattress Included",
  FAN: "Electric Fan Provided",
  SUBMETER_ELEC: "Own Sub-Meter (Electricity)",
  SUBMETER_WATER: "Own Sub-Meter (Water)",
  WIFI: "WiFi / Ethernet Access",
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
import { ROOM_TYPES } from "./roomTypes";
import {
  FaBook,
  FaLock,
  FaFan,
  FaWifi,
  FaSnowflake,
  FaBed,
  FaBolt,
  FaTint
} from "react-icons/fa";

/** BoardTAU — Room-level amenity checkboxes (bathroom excluded — handled via dedicated radio). */
export const roomAmenities: { label: string; value: string; icon: IconType; applicableTo?: string[] }[] = [

  // ── Shared by both room types ───────────────────────────────────────────
  {
    label: ROOM_AMENITY_LABELS.AC,
    value: ROOM_AMENITIES.AC,
    icon: FaSnowflake,
  },
  {
    label: ROOM_AMENITY_LABELS.FAN,
    value: ROOM_AMENITIES.FAN,
    icon: FaFan,
  },
  {
    label: ROOM_AMENITY_LABELS.WIFI,
    value: ROOM_AMENITIES.WIFI,
    icon: FaWifi,
  },
  {
    label: ROOM_AMENITY_LABELS.DESK,
    value: ROOM_AMENITIES.DESK,
    icon: FaBook,
  },
  {
    label: ROOM_AMENITY_LABELS.CABINET,
    value: ROOM_AMENITIES.CABINET,
    icon: FaLock,
  },
  {
    label: ROOM_AMENITY_LABELS.FOAM,
    value: ROOM_AMENITIES.FOAM,
    icon: FaBed,
  },

  // ── Solo Room Specific (Sub-meters usually apply per distinct room unit) 
  {
    label: ROOM_AMENITY_LABELS.SUBMETER_ELEC,
    value: ROOM_AMENITIES.SUBMETER_ELEC,
    icon: FaBolt,
    applicableTo: [ROOM_TYPES.SOLO],
  },
  {
    label: ROOM_AMENITY_LABELS.SUBMETER_WATER,
    value: ROOM_AMENITIES.SUBMETER_WATER,
    icon: FaTint,
    applicableTo: [ROOM_TYPES.SOLO],
  },
];

/** BoardTAU — Bed type options. */
export const bedTypeOptions = [
  { value: "Single", label: "Single" },
  { value: "Double", label: "Double" },
  { value: "Bunk Bed", label: "Bunk Bed (Double Deck)" },
];

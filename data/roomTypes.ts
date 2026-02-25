export const ROOM_TYPES = {
  SOLO: "SOLO",
  BEDSPACE: "BEDSPACE"
} as const;

export const ROOM_TYPE_LABELS = {
  SOLO: "Solo Room",
  BEDSPACE: "Bedspace"
};

export type RoomType = keyof typeof ROOM_TYPES;

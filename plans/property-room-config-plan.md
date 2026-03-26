# Implementation Plan: PropertyConfigStep & RoomConfigStep

> Based on discussions, schema review, and `Amenities-Categories-Pref.md` reference doc.

---

## PART 1 — `PropertyConfigStep.tsx`

### Section 1: Property Basics

| Field | Component | Validation | Schema Mapping |
|---|---|---|---|
| Total Rooms Available `*` | Number Input | Required, min 1, max 50 | `Listing.roomCount` → also triggers auto-populate in Room Config |
| Number of Common Bathrooms `*` | Number Input | Required, min 0 | `Listing.bathroomCount` → shared hallway CRs for rooms with no own CR |

> **Removed:** `Bathroom Type` dropdown — now handled per-room in Room Config
> **Renamed:** `Number of Bathrooms` → `Number of Common Bathrooms` with updated description

---

### Section 2: Rules & Preferences
*(No changes — already modernized with custom Checkbox)*

| Field | Form Key |
|---|---|
| Female-only | `propertyConfig.femaleOnly` |
| Male-only | `propertyConfig.maleOnly` |
| Visitors allowed | `propertyConfig.visitorsAllowed` |
| Pets allowed | `propertyConfig.petsAllowed` |
| Smoking allowed | `propertyConfig.smokingAllowed` |

---

### Section 3: Advanced Features
*(No changes — already modernized with custom Checkbox)*

| Field | Form Key |
|---|---|
| 24/7 Security | `propertyConfig.security24h` |
| CCTV | `propertyConfig.cctv` |
| Fire Safety Equipment | `propertyConfig.fireSafety` |
| Near Public Transport | `propertyConfig.nearTransport` |
| Study-friendly environment | `propertyConfig.studyFriendly` |
| Quiet / Noise-controlled | `propertyConfig.quietEnvironment` |
| Flexible Lease Terms | `propertyConfig.flexibleLease` |

---

### Section 4: Property Amenities *(Listing-Level ONLY — per reference doc)*

**Removed from current list (wrong level):**
- ❌ `Own CR` → room-level, moved to Room Config bathroom question
- ❌ `Shared CR` → room-level, moved to Room Config bathroom question
- ❌ `Air Conditioning` → room-level amenity per reference doc
- ❌ `Cable TV` → not in reference doc at all

**Final Amenities List (10 items):**

| Label | Value | Source in Doc |
|---|---|---|
| WiFi / Internet | `WiFi` | Listing.amenities ✅ |
| Laundry Area / Washer | `Laundry Area` | Listing.amenities ✅ |
| Parking / Garage | `Parking` | Listing.amenities ✅ |
| Gated / Secure | `Gated` | Listing.amenities ← NEW |
| Kitchen / Shared Kitchen | `Kitchen Access` | Listing.amenities ✅ |
| Study Room / Common Area | `Study Room` | Listing.amenities ← NEW |
| Elevator / Accessible | `Elevator` | Listing.amenities ← NEW |
| Furnished | `Furnished` | Listing.amenities ← NEW |
| Gym / Pool / Recreation | `Gym` | Listing.amenities ← NEW |
| Water Heater | `Water Heater` | Reasonable listing-level ✅ |

---

## PART 2 — `RoomConfigStep.tsx`

### Auto-Populate Behavior

When host enters `totalRooms` in PropertyConfigStep:
- `useEffect` in `HostApplicationModal` watches `propertyConfig.totalRooms`
- Automatically calls `append()` / `remove()` to sync the `rooms[]` array to match the count
- Each new room card is pre-filled with defaults: `{ name: "Room 1", roomType: SOLO, price: '', ... }`
- If host reduces count (e.g., 10 → 8), the last 2 cards are removed

### Card Title Change
- **Before:** "Room Type {index + 1}"
- **After:** "Room {index + 1}" — because each card now = one specific room

### Removed Field
- ❌ `Number of Rooms` (`count` field) — each card IS one room, no longer needed

### Bulk Assign Helper *(UX improvement)*
At top of the room list section:
```
"Set all rooms to: [Solo ▼]  [Apply to All Rooms]"
```
- Allows hosts with uniform room types to set all at once instead of one-by-one

---

### Each Room Card — Full Field Layout

```
┌─────────────────────────────────────────────┐
│  Room {N}                    [Remove]        │
│─────────────────────────────────────────────│
│  Room Type *       │  Price per Room/Bed *   │
│  [ReactSelect]     │  [Number Input]         │
│                                             │
│  Reservation Fee * │  Bed Type *             │
│  [Number Input]    │  [ReactSelect]          │
│                                             │
│  — For SOLO rooms only: —                  │
│  Room Size (sq.m)  │  Max Capacity           │
│  [Number Input]    │  [ReactSelect]          │
│                                             │
│  — For BEDSPACE rooms only: —              │
│  Bed Count/Capacity│  Available Slots        │
│  [Number Input]    │  [Number Input]         │
│─────────────────────────────────────────────│
│  🚿 Bathroom Arrangement *                   │
│  ○ Own private CR                           │
│    (room has its own dedicated bathroom)    │
│  ○ Shared CR (among this room's occupants) │
│    (bathroom inside room, shared by beds)  │
│  ○ No CR — uses common bathroom            │
│    (uses the building's shared bathrooms)  │
│─────────────────────────────────────────────│
│  🏠 Room Amenities                          │
│  [Custom Checkbox grid — per room type]     │
│  (CR/bathroom options excluded here)        │
│─────────────────────────────────────────────│
│  Room Description *                         │
│  [Textarea]                                 │
└─────────────────────────────────────────────┘
```

---

### Room Amenities — Per Room Type (from reference doc)

**Solo Room Amenities** (`Room.amenities` — Room-Level only):

| Label | Value |
|---|---|
| Air Conditioning | `AIR_CONDITIONING` |
| Desk / Study Table | `DESK` |
| Closet / Wardrobe | `CLOSET` |
| Balcony / Window | `BALCONY` |
| Mini-Fridge / Refrigerator | `MINI_FRIDGE` |
| WiFi / Ethernet Access | `WIFI` |
| Natural Light / View | `NATURAL_LIGHT` |
| Heating / Fan | `FAN` |

**Bedspace Room Amenities** (`Room.amenities` — Room-Level only):

| Label | Value |
|---|---|
| Air Conditioning | `AIR_CONDITIONING` |
| Desk / Shared Table | `DESK` |
| Closet per Bed | `CLOSET` |
| Personal Lock / Storage | `PERSONAL_LOCK` |
| Fan | `FAN` |
| Window / Ventilation | `WINDOW` |
| Desk Lamp / Reading Light | `DESK_LAMP` |
| WiFi Access | `WIFI` |

> ✅ CR/bathroom amenities are excluded from this list — handled by the "Bathroom Arrangement" radio question.
> ✅ Amenities filtered by room type (solo amenities shown for Solo only, bedspace for Bedspace only).

---

## PART 3 — Files to Modify

| File | Changes |
|---|---|
| `PropertyConfigStep.tsx` | Remove bathroomType dropdown, rename bathroomCount label, update amenities list |
| `RoomConfigStep.tsx` | Remove count field, add Bathroom Arrangement radio, update amenities per room type, rename card title, add bulk assign helper |
| `HostApplicationModal.tsx` | Add `useEffect` to watch `totalRooms` and auto-populate `rooms[]` array |
| `data/roomAmenities.ts` | Update amenity lists to match reference doc (remove CR items, add missing ones) |

---

## PART 4 — Schema Alignment Summary

| Form Field | Schema Field | Level |
|---|---|---|
| Total Rooms | `Listing.roomCount` | Listing |
| Common Bathrooms | `Listing.bathroomCount` | Listing |
| Rules & Preferences | `ListingRule.*` | Listing |
| Advanced Features | `ListingFeature.*` | Listing |
| Property Amenities | `ListingAmenity.*` | Listing |
| Bathroom Arrangement | `RoomAmenity` (PRIVATE_BATHROOM / SHARED_BATHROOM / none) | Room |
| Room Amenities | `RoomAmenity[]` via `RoomAmenityType` | Room |
| Room Price | `Room.price` | Room |
| Room Type | `Room.roomType` (SOLO / BEDSPACE) | Room |
| Bed Type | `Room.bedType` | Room |
| Capacity | `Room.capacity` | Room |
| Available Slots | `Room.availableSlots` | Room |
| Room Size | `Room.size` | Room |
| Reservation Fee | `Room.reservationFee` | Room |

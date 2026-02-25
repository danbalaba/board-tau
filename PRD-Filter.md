# PRD: BoardTAU Multi-Question Filtering Feature Update

## 1. Context
BoardTAU's current frontend filtering system is a multi-step search wizard designed to help users find boarding houses.
The **frontend design and layout remain the same**, but the existing implementation has several issues:

- Conflicting gender filters (categories vs rules)
- Missing validation on price ranges
- Room-level vs listing-level amenities overlap
- Availability filtering not implemented
- Backend schema not fully compatible with refined room-level and listing-level filters

**Goal:** Update filtering feature to ensure accurate, conflict-free search results without changing the step-by-step frontend UI.

---

## 2. Objectives
1. Maintain current multi-question wizard UI
2. Fix conflicts between gender filters
3. Implement input validation for budget, room preferences, and rules
4. Distinguish room-level filters (Step 2) from listing-level filters (Steps 5–8)
5. Ensure availability filtering against reservations
6. Update database schema to fully support room-level and listing-level filters

---

## 3. Updated Filtering Flow

| Step | Question | Input | Backend Mapping | Notes |
|------|---------|-------|----------------|-------|
| 0 | College Affiliation | Dropdown (TAU colleges + "None") | originLat, originLng | Optional for distance filter |
| 1 | Budget | Min / Max price | Listing.price (min/base) or Room.price | Validate min ≤ max |
| 2 | Room Details | Dropdown: Solo / Bedspace | Room.roomType | Primary, strict filters |
| 2.1 | Solo Room | Private Bathroom, Kitchen, AC, Bed Type, Desk, Closet, Balcony, Mini-Fridge, Room Size, Room Price | Room.amenities, Room.bedType, Room.price | Strict, per room |
| 2.1 | Bedspace Room | Shared Bathroom, Kitchen, AC, Capacity, Available Slots, Desk, Closet, Bed Type, Price per bed | Room.amenities, Room.capacity, Room.availableSlots, Room.price | Strict, per room |
| 3 | Location & Distance | Slider / Map selection | Haversine formula using Listing.latlng | Default 5–10 km, optional presets |
| 4 | Move-In Date & Duration | Month picker + Duration | Check reservations against Room & Listing | Optional — can remove if not essential |
| 5 | Listing Categories | Multi-select | Listing.category[] | Filters at listing level; no room duplication |
| 6 | Listing Amenities | Multi-select | Listing.amenities[] | Secondary filter; no room-level duplication |
| 7 | Rules / Preferences | Multi-select checkboxes | Listing boolean fields (visitorsAllowed, petsAllowed, smokingAllowed, femaleOnly, maleOnly) | Validate conflicts (cannot select maleOnly + femaleOnly) |
| 8 | Advanced Features | Multi-select | Listing boolean fields (security24h, cctv, fireSafety, flexibleLease, nearTransport, studyFriendly, quietEnvironment) | Optional scoring |
| 9 | Summary | Display selected filters | N/A | Optional: Clear all / reset |

---

## 4. Key Updates / Fixes

- **Gender Conflict Fix**: Removed gender options from categories; only in rules with frontend validation
- **Price Validation**: Added min ≤ max for budget input; room-level price used for exact match
- **Room vs Listing Amenities**: Step 2 strictly for room, Step 6 strictly for listing
- **Availability Filtering**: Reservation-based availability logic implemented
- **Categories**: Standardized to recommended set (Student-Friendly, Budget, Premium/Private, Family-Friendly, Pet-Friendly, Apartment, Short-Term, Quiet)
- **Room-Level Enhancements**: Solo room and Bedspace room have dedicated preference filters, with room-level amenities

---

## 5. MVP Scope

- All steps preserved (Step 0 → Step 9)
- Backend validation implemented for all inputs
- Room-level vs listing-level filters separated
- Gender and budget conflicts eliminated
- Availability filtering implemented
- Updated database schema deployed
- Existing frontend design reused (UI unchanged)

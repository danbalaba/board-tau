# Future Migration Plan: Dynamic Categories & Amenities

This document serves as a blueprint for migrating BoardTAU's hardcoded categories, amenities, and rules (currently stored in `.ts` files) into a fully dynamic, database-driven system managed by the Super Admin dashboard.

This is a massive refactor that touches the database, backend APIs, frontend forms, and admin UI.

---

## Phase 1: Database Refactoring (Prisma Schema)

Currently, your schema has mixed implementations. Some models exist (like `Category` and `RoomAmenityType`), but `ListingAmenity` relies on hardcoded boolean fields (e.g., `wifi Boolean`, `pool Boolean`). 

**Actions:**
1. **Create/Standardize Models:** Ensure you have universal models for `Amenity`, `Category`, and `Rule`.
2. **Deprecate Booleans:** Remove the hardcoded boolean fields from `ListingAmenity` and `ListingRule`.
3. **Use Relations:** Use Prisma's relation arrays (e.g., Many-to-Many) so a `Listing` simply connects to multiple `Amenity` IDs.

```prisma
// Example Future Schema
model Amenity {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String   @unique
  label       String
  icon        String   // React Icons string reference (e.g. "MdOutlineWifi")
  type        String   // "PROPERTY" or "ROOM"
  isActive    Boolean  @default(true)
  
  // Relations
  listingAmenities ListingAmenityPivot[]
}
```

---

## Phase 2: Data Seeding (Migration Script)

You cannot lose your existing data. You will need to write a one-time migration script.

**Actions:**
1. Create a script (e.g., `prisma/seed-amenities.ts`).
2. Have the script import your current `constants.ts`, `amenities.ts`, and `roomAmenities.ts`.
3. Loop through those arrays and run `prisma.amenity.create(...)` and `prisma.category.create(...)` to populate MongoDB.
4. Run a script to migrate existing listings. If a listing has `wifi: true` in the old `ListingAmenity` table, the script must connect that listing to the new `WiFi` Amenity ID.

---

## Phase 3: The API Layer

Your frontend needs a way to fetch this data dynamically instead of importing static files.

**Actions:**
1. **Public APIs:** 
   - `GET /api/public/categories`
   - `GET /api/public/amenities`
   *(These will be called by the search page and listing creation forms).*
2. **Admin APIs:**
   - `POST /api/admin/amenities` (Create new)
   - `PUT /api/admin/amenities/[id]` (Update/Deactivate)
   - `DELETE /api/admin/amenities/[id]` 

---

## Phase 4: Admin Dashboard UI

You will finally build the "Categories & Amenities" management page in the Property Management section.

**Actions:**
1. Create `app/admin/properties/platform-data/page.tsx`.
2. Build a Data Table that lists all Categories, Amenities, and Rules fetched from the database.
3. Build a "Create New" modal.
   * *Challenge:* Because you use `react-icons`, you cannot easily save actual icon components to the database. You will need to build an "Icon Picker" component in the admin dashboard that allows the admin to select an icon visually, and then saves the string name (e.g., `"MdOutlineWifi"`) to the database.

---

## Phase 5: Frontend Refactoring (The Heavy Lift)

Every component that currently imports `constants.ts` or `amenities.ts` must be rewritten.

**Actions:**
1. **Host Flow (Create Listing):** When a landlord creates a listing, the checkbox list of amenities must be fetched from `GET /api/public/amenities` using `SWR` or `React Query` (or fetched Server-Side).
2. **Search & Filters:** The advanced filter sidebar for students must fetch the list of available categories and amenities dynamically from the database.
3. **Dynamic Icon Rendering:** You will need a helper function that takes the string name (e.g., `"MdOutlineWifi"`) from the database and maps it to the actual `react-icon` component for rendering on the screen.

```tsx
// Example dynamic icon mapping
import * as MdIcons from "react-icons/md";

const renderIcon = (iconName: string) => {
  const IconComponent = MdIcons[iconName];
  return IconComponent ? <IconComponent /> : <MdIcons.MdHelpOutline />;
};
```

---

## Summary of Impact
- **Time Estimate:** ~1-2 weeks of developer time.
- **Risk:** High. If the data migration is done incorrectly, existing listings will lose all their assigned amenities and rules.
- **Benefit:** Infinite scalability. Non-technical staff can add new categories/amenities via the dashboard instantly without requiring developer intervention or server redeployments.

# Frontend Refactor Plan: Categories to Property Types

## 1. Rationale & Architectural Goal
Refactor the tenant-facing Search, Navbar, Map, and Listing Card UI components to consume dynamic database-driven `PropertyType` records instead of static hardcoded string arrays (`data/categories.ts`).

**Why we are changing this:**
1. **Dynamic Navigation:** When a Super Admin adds a new Property Type (e.g., "Transient House"), it must automatically appear as a pill in the `Categories.tsx` navbar.
2. **Multi-Select Cleanliness:** When a tenant filters by 2 or more Property Types in the Search Modal, the single-pill navbar can cause UI confusion. The navbar will smartly hide and display a "Clear Filters" banner instead.
3. **Card & Map Consistency:** All property cards (`ListingCard`, `ListingPinCard`, `SidebarDetailView`, `ListingDetailsClient`) must render the dynamic `PropertyType` name and icon fetched from the database.

---

## 2. Do's and Don'ts (Strict Guardrails)

### Do's:
- **DO** hide the main `Categories.tsx` navbar when two or more Property Types are selected in the Search Modal.
- **DO** show a "Clear Filters" banner (`ClearFiltersBanner.tsx`) when the navbar is hidden so the user can easily reset search state.
- **DO** pre-populate the Search Modal's `PropertyTypeStep` based on whichever quick-filter pill the user clicked in the navbar.
- **DO** map through `data.categories` or `data.propertyType` to render the exact dynamic name and icon on all cards and detail views.
- **DO** use the `categorizer.ts` utility to automatically generate Lifestyle Highlights (e.g. Budget-Friendly, Pet-Friendly) based on property amenities and rules.

### Don'ts (DO NOT TOUCH):
- **DO NOT** invent new UI card layouts or alter the glassmorphic theme of `ListingCard.tsx`.
- **DO NOT** let landlords manually pick Lifestyle Tags like "Budget-Friendly" in their creation form; these remain auto-calculated to prevent misrepresentation.
- **DO NOT** use static imports from `constants.ts` or `categories.ts` for property categories anymore.

---

## 3. UI/UX Consistency Standards
- **Navbar Pills:** Inherit `Categories.tsx` horizontally scrolling icon-pill design with Framer-Motion active indicator line.
- **Clear Filters Banner:** Styled with clean Tailwind glassmorphism (`bg-white/80 dark:bg-slate-800/80 backdrop-blur-md`) matching the existing notification bar style.
- **Search Modal:** Pre-selects category checkboxes smoothly without resetting other search filters.

---

## 4. Optimized 7-Step Search Wizard Sequence (UX Fix)

User testing revealed that asking for Room Type at Step 3 before asking for Property Type at Step 7 caused heavy confusion. Property Type dictates which Room Types are valid. We consolidate the wizard from 11 steps down to **7 logical steps**:

```
Step 1: College & Campus Landmark (CollegeStep.tsx)
Step 2: Property Type / Category (PropertyTypeStep.tsx) <-- MOVED TO STEP 2!
Step 3: Room Type & Bed Setup (RoomTypeStep.tsx)
Step 4: Budget & Distance Range (BudgetStep.tsx & LocationStep.tsx)
Step 5: Property & Room Amenities (AmenitiesStep.tsx & RoomAmenitiesStep.tsx)
Step 6: House Rules & Safety Features (RulesStep.tsx & AdvancedStep.tsx)
Step 7: Filter Summary & Results (SummaryStep.tsx)
```

### Dynamic Card & Map UI (`ListingCard.tsx`, `ListingPinCard.tsx`, `SidebarDetailView.tsx`)
- Parse the relational `propertyType` data:
  ```tsx
  const propertyTypeName = data.propertyType?.name || "Property";
  const PropertyIcon = LucideIcons[data.propertyType?.icon] || Building;
  ```
- Render badge dynamically on the image container overlay.

---

## 5. File Modifications List

### [NEW] Files to Create
- `components/navbar/ClearFiltersBanner.tsx`

### [MODIFY] Files to Update
- `components/navbar/Categories.tsx` (Fetch dynamic property types from DB API)
- `components/modals/SearchModal.tsx` (Pass pre-selected categories to steps)
- `components/modals/search-modal/steps/CategoryStep.tsx` (Rename to `PropertyTypeStep.tsx`, support multi-select)
- `components/modals/search-modal/useSearchLogic.ts` (Manage multi-select category state)
- `components/listings/detail/ListingHead.tsx` (Render auto-calculated Lifestyle badges)
- `components/listings/detail/ListingDetailsClient.tsx` (Render dynamic PropertyType badge & icon)
- `components/listings/ListingCard.tsx` (Render dynamic PropertyType badge)
- `components/map/ListingPinCard.tsx` (Render dynamic PropertyType badge)
- `components/map/SidebarDetailView.tsx` (Render dynamic PropertyType badge)
- `utils/categorizer.ts` (Focus on universal lifestyle tags like Budget-Friendly, Pet-Friendly)

---

## 6. Verification Plan
1. Open homepage and verify `Categories.tsx` navbar populates from the database API.
2. Click "Apartment" pill in navbar and open Search Modal; verify "Apartment" checkbox is pre-ticked.
3. Select both "Apartment" and "Boarding House" in Search Modal; verify navbar hides and `ClearFiltersBanner` appears.
4. Verify `ListingCard` and `ListingPinCard` display dynamic Property Type icons cleanly.

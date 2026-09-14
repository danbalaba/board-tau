# Super Admin Property Configuration UI/UX Modernization Plan (UI/UX First Focus)

Modernize `/admin/settings/property-configuration` to inherit BoardTAU's flagship **User Directory Design System**, featuring KPI summary cards, standardized `@tanstack/react-table` data tables, full cell actions, interactive Leaflet landmark map pickers, un-squished room types modals, and dynamic attributes management.

---

## 1. Strategy: UI/UX First Workflow
As requested by the user, we are executing in **2 Distinct Stages**:
1. **STAGE 1 (CURRENT FOCUS): Frontend UI/UX Modernization**: Implement all visual components, layouts, KPI cards, tables, modals, interactive map pickers, and tab navigation so the user can review, test, and give suggestions/feedback on the live interface.
2. **STAGE 2 (FOLLOW-UP): Backend Core Logic & Cascading Flows**: Connect full MongoDB transactions, `UNPUBLISHED` status cascading, email notifications, and landlord/tenant integration after the UI/UX is finalized and approved.

---

## 2. Visual Architecture & Design Language (Matching User Directory)

### A. Page Header & KPI Metric Summary Strip
- **Header Banner**: `Property Configuration` (`Manage property types, room definitions, campus landmarks, and dynamic attributes`). Includes Date Range selector (`Last 7 days`, `Last 30 days`, `Last 90 days`, `Past year`), Sync Refresh button, and **Export Dropdown Button (CSV, Excel, PDF)**.
- **4 Live KPI Cards (with Recharts Sparklines & Tooltips)**:
  1. **Total Property Types**: Count of configured property types (*Apartment, Boarding House, Dormitory, Transient, Agri-Hostel*).
  2. **Room Definitions**: Count of defined room structures (*Studio Unit, Solo Room, Bedspace, etc.*).
  3. **Campus Landmarks**: Count of TAU colleges & campus landmarks (*9 Seeded Landmarks*).
  4. **Dynamic Attributes**: Count of active system attributes (*50+ Amenities, Rules, Features*).

### B. Segmented Tab Bar (3 Main Governance Tabs)
- Glassmorphic segmented tab bar (`bg-slate-900/60 border border-slate-800 backdrop-blur-xl`):
  - 🏠 **`Property Types`**: Property type management & nested room definitions.
  - 🎓 **`Campus Landmarks & TAU Colleges`**: University landmarks, logo previews, and map pin picker.
  - 🏷️ **`Dynamic Attributes`**: System-wide amenities, room amenities, house rules, and safety features.

---

## 3. Detailed Component Modernization Blueprint

### Component 1: Property Types Tab & Room Types Modal

#### [MODIFY] [property-tables/index.tsx](file:///c:/Users/asus/Capstone/BoardTAU/app/admin/features/property-configuration/components/property-tables/index.tsx)
#### [MODIFY] [property-tables/columns.tsx](file:///c:/Users/asus/Capstone/BoardTAU/app/admin/features/property-configuration/components/property-tables/columns.tsx)
#### [MODIFY] [property-tables/cell-action.tsx](file:///c:/Users/asus/Capstone/BoardTAU/app/admin/features/property-configuration/components/property-tables/cell-action.tsx)
- Rebuild using `@/app/admin/components/ui/table/data-table` engine (`DataTable` + `DataTableToolbar`).
- Search input (`Search property types...`), status filter (`Active`, `Disabled`), column toggle (`View`), and `+ ADD PROPERTY TYPE` primary green button.
- Columns: Lucide Icon Badge, Property Type Name & Description, Attached Active Listings Count Pill, Room Types Count Badge, Active Status Pill, Actions Dropdown (`IconDots`).
- Action Menu: `Edit Details`, `Manage Room Types` (opens nested modal), `Toggle Active/Disabled`.

#### [MODIFY] [manage-room-types-modal.tsx](file:///c:/Users/asus/Capstone/BoardTAU/app/admin/features/property-configuration/components/modals/manage-room-types-modal.tsx)
- **Fix Squished Button**: Change top notice box to `flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800`. Add `shrink-0 whitespace-nowrap w-auto` to `+ ADD NEW` button.
- **Card Badges**: Add distinct visual badges for **`Flat Rate Room`** (Blue) vs **`Per-Head Bedspace`** (Emerald).
- Include inline active/disabled toggle switch on each room type card.

---

### Component 2: Campus Landmarks Tab & Leaflet Map Picker Modal

#### [MODIFY] [college-tables/index.tsx](file:///c:/Users/asus/Capstone/BoardTAU/app/admin/features/property-configuration/components/college-tables/index.tsx)
#### [MODIFY] [college-tables/columns.tsx](file:///c:/Users/asus/Capstone/BoardTAU/app/admin/features/property-configuration/components/college-tables/columns.tsx)
#### [MODIFY] [college-tables/cell-action.tsx](file:///c:/Users/asus/Capstone/BoardTAU/app/admin/features/property-configuration/components/college-tables/cell-action.tsx)
- Rebuild using `@/app/admin/components/ui/table/data-table` engine.
- Columns: Logo Asset Preview (`h-10 w-10 object-contain rounded-xl bg-white border border-slate-700`), Name, Code Badge, Formatted Coordinates (`15.6352, 120.4153` + **`📍 View Pin`** interactive badge button), Status, Actions Dropdown (`IconDots`).
- **Fix Broken Action Button**: Connect `onEdit` handler to open `AddCollegeModal` in edit mode populated with selected landmark details!

#### [MODIFY] [add-college-modal.tsx](file:///c:/Users/asus/Capstone/BoardTAU/app/admin/features/property-configuration/components/modals/add-college-modal.tsx)
- **Interactive Leaflet Map Coordinate Picker**: Add an interactive Leaflet map inside the modal! Admins can click anywhere on the TAU campus map to auto-set latitude & longitude, or pick from TAU landmark preset buttons.
- Support both `create` and `edit` modes cleanly.

---

### Component 3: Dynamic Attributes Tab & Attribute Creation Modal (NEW)

#### [NEW] [attribute-tables/index.tsx](file:///c:/Users/asus/Capstone/BoardTAU/app/admin/features/property-configuration/components/attribute-tables/index.tsx)
#### [NEW] [attribute-tables/columns.tsx](file:///c:/Users/asus/Capstone/BoardTAU/app/admin/features/property-configuration/components/attribute-tables/columns.tsx)
#### [NEW] [attribute-tables/cell-action.tsx](file:///c:/Users/asus/Capstone/BoardTAU/app/admin/features/property-configuration/components/attribute-tables/cell-action.tsx)
- Build new table using `@/app/admin/components/ui/table/data-table` engine.
- Category Sub-Filter Pills at top: `All Items`, `Shared Amenities`, `Room Amenities`, `House Rules`, `Security & Features`.
- Columns: Icon Badge, Attribute Name & Description, Category Type Badge (`AMENITY` Blue, `ROOM_AMENITY` Purple, `RULE` Amber, `FEATURE` Emerald), Property Type Scope (`Universal` vs `Boarding House & Dorm`), Active Status, Actions Dropdown.

#### [NEW] [modals/add-attribute-modal.tsx](file:///c:/Users/asus/Capstone/BoardTAU/app/admin/features/property-configuration/components/modals/add-attribute-modal.tsx)
- Modal for creating/editing `DynamicAttribute` records.
- Fields: Name, Type Selector, Description (consumed by `HelpTooltip.tsx`), Searchable Lucide Icon Grid, Property Type Scoping Checkboxes (`Universal` vs targeted types), and Active Switch.

---

## 4. Execution Roadmap (Stage 1)

1. **Step 1**: Update `app/admin/features/property-configuration/index.tsx` header, KPI cards, date range & export controls, and 3-tab glassmorphic navigation bar.
2. **Step 2**: Rebuild `PropertyTable`, `columns.tsx`, and `cell-action.tsx` using `DataTable` engine.
3. **Step 3**: Fix squished layout and styling in `ManageRoomTypesModal` and `AddPropertyTypeModal`.
4. **Step 4**: Rebuild `CollegeTable`, `columns.tsx`, and `cell-action.tsx` with complete edit action handlers.
5. **Step 5**: Upgrade `AddCollegeModal` with interactive Leaflet map pin picker.
6. **Step 6**: Build `AttributeTable`, `columns.tsx`, `cell-action.tsx`, and `AddAttributeModal` for Dynamic Attributes.
7. **Step 7**: Present live UI/UX to user for review, suggestions, and feedback!

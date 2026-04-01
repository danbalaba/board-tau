# Landlord Domain Refactor: "Admin-Pattern" Blueprint

## 1. Context & Objective
The Landlord domain currently suffers from "Component Gravity"—where large client files (700+ lines) mix UI, business logic, state management, and mock data. This refactor aims to reorganize the `app/landlord/` folder into a **Domain-Driven Feature Architecture**, adopting the exact pattern found in `app/admin/features/`.

**Primary Goal**: Achieve clean separation of concerns, improve maintainability, and enforce explicit component ownership without changing the visual design or existing functionality.

---

## 2. Hard Constraints (The "Do Not Touch" List)
These are absolute boundaries to prevent regression and "hallucination."

*   **Pixel-Perfect UI Consistency**: Do NOT change any CSS, Tailwind classes, colors, spacing, or shadows. The visual output must be identical.
*   **0% Redesign**: This is an architectural cleanup. No buttons move, and no new styles are introduced.
*   **Preserve Business Logic**: The logic for validation, API requests (PUT/POST/GET), and data handling must be copied word-for-word into the new hooks/components.
*   **Hooks vs. JSX**: No API calls should remain in the JSX layer. All state/fetching must be extracted into custom hooks.
*   **Naming Convention**: All new extracted files must follow the `landlord-[feature]-[purpose].tsx` format for absolute clarity of ownership.

---

## 3. Targeted Files for Refactor
Total coverage of the following 22 files identified as "Spaghetti":

1.  `LandlordDashboardClient.tsx`
2.  `LandlordLayoutClient.tsx`
3.  `LandlordSidebar.tsx`
4.  `LandlordTopbar.tsx`
5.  `AccountSettingsModal.tsx`
6.  `NotificationsListModal.tsx`
7.  `NotificationsModal.tsx`
8.  `PaymentSettingsModal.tsx`
9.  `PerformanceModal.tsx`
10. `ProfileSettingsModal.tsx`
11. `SecuritySettingsModal.tsx`
12. `LandlordAnalyticsClient.tsx`
13. `LandlordBookingsClient.tsx`
14. `LandlordInquiriesClient.tsx`
15. `LandlordInquiryDetailClient.tsx`
16. `LandlordEditPropertyClient.tsx`
17. `LandlordCreatePropertyClient.tsx`
18. `LandlordPropertiesClient.tsx`
19. `LandlordReservationsClient.tsx`
20. `LandlordReviewsClient.tsx`
21. `LandlordSettingsClient.tsx`
22. `LandlordTenantsClient.tsx`

---

## 4. Final Feature Directory Structure
All logic and components will be migrated to `app/landlord/features/`.

```text
app/landlord/features/
├── dashboard/                     # Refactored: LandlordDashboardClient
│   ├── components/                # Stats Cards, Activity Feed, Quick Actions
│   └── index.tsx                  # Dashboard Entry Point (Admin Style)
│
├── property-management/           # Refactored: Create/Edit/List Properties
│   ├── components/                # Step-by-step forms (Basics, Media, Rules)
│   ├── hooks/                     # use-property-form-logic.ts
│   └── index.tsx                  # Property List View
│
├── inquiry-center/                # Refactored: Inquiry List/Details
│   ├── components/                # Inquiry Inbox, Conversation Panel
│   └── index.tsx                  # Inquiry Center Entry Point
│
├── analytics/                     # Refactored: AnalyticsClient/PerformanceModal
│   ├── components/                # Extracted individual charts and metrics
│   └── index.tsx                  # Analytics Hub
│
├── settings-hub/                  # Refactored: 7 Modals + SettingsClient
│   ├── components/                # Shared Profile, Security, Payment tabs
│   └── index.tsx                  # Unified Settings Entry Point
│
├── booking-reservations/          # Refactored: Bookings/Reservations/Reviews
│   ├── components/                # Tables, Calendars, Review Lists
│   └── index.tsx                  # Integrated Portfolio Management
│
├── tenant-manager/                # Refactored: LandlordTenantsClient
│   ├── components/                # Tenant Tables, Detail Views
│   └── index.tsx                  # Tenant Manager Entry Point
│
├── shared/                        # (MIGRATED FROM LANDLORD/COMPONENTS/SHARED)
│   ├── landlord-section-container.tsx
│   ├── landlord-status-badge.tsx
│   └── landlord-form-header.tsx
│
└── layout/                        # (MIGRATED FROM LANDLORD/COMPONENTS/LAYOUT)
    ├── landlord-main-sidebar.tsx
    ├── landlord-topbar-header.tsx
    └── landlord-layout-client-root.tsx

---

## 5. Folder Role Definitions
To ensure 100% clarity and prevent architectural drift:

*   **`app/landlord/features/[domain]/`**: This is for **Business Logic**. If a component only exists to serve the "Property Editor," it stays here. Each feature folder has its own `components/` sub-folder for local UI and its own `hooks/` for state management.
*   **`app/landlord/components/shared/`**: This is for **Pure UI**. If a component (like a "Dashboard Card") is used in BOTH the Dashboard and the Analytics page, it lives here. This acts as the "Toolbox" for the features.
*   **`app/landlord/constants/`**: ALL mock data, lists, and schema configurations are moved here to remove noise from the logic files. (Example: `amenities.ts`, `dashboard-nav.ts`).
```

---

## 5. Implementation Roadmap (The Iterative Protocol)

### Phase 1: Feature Isolation (Surgery Phase)
1.  **Extract Components**: Identify repeated chunks of JSX (like Stats Card, Section Container) and move them to `landlord/features/shared/`.
2.  **Modularize UI**: Take a large `Client.tsx` and move its inner JSX sections into separate sub-component files within that feature's `components/` folder.
3.  **Encapsulate Mock Data**: Move all static arrays and configurations to a `constants/` file or the top of the feature folder.

### Phase 2: Logic Decoupling (Hook Phase)
1.  **Extract Hooks**: Identify all `useState`, `useEffect`, and API handlers.
2.  **Consolidate State**: Move this logic into a feature-specific Hook (e.g., `useLandlordPropertyForm`).
3.  **Prop Drilling**: Pass only the necessary state/dispatchers from the `index.tsx` (Orchestrator) to the "Dumb" UI components.

### Phase 3: Validation & Cleanup
1.  **TypeScript Verification**: Run `tsc --noEmit` after every component extraction.
2.  **Functionality Testing**: Manually verify each form submission and navigation flow.
3.  **Dead Code Removal**: Delete the old fragmented files in `landlord/components/pages/` and `landlord/components/modals/`.

---

## 6. Maintenance & Performance
*   **Lazy Loading**: Components should be structured to allow for dynamic imports where necessary to improve Dashboard load times.
*   **DRY (Don't Repeat Yourself)**: If multiple features use the same "Section" styling, it **must** come from the `features/shared/` folder.

---

## 8. Refactor Execution Checklist (Status Tracker)

| Feature Domain | Feature Folder | Status | Polished |
| :--- | :--- | :--- | :--- |
| **Core Dashboard** | `features/dashboard/` | ✅ COMPLETED | ✅ YES |
| **Property Management** | `features/property-management/` | ✅ COMPLETED | ✅ YES |
| **Settings Hub** | `features/settings-hub/` | ✅ COMPLETED | ✅ YES |
| **Inquiry Center** | `features/inquiry-center/` | ✅ COMPLETED | ✅ YES |
| **Analytics & Performance** | `features/analytics/` | ✅ COMPLETED | ✅ YES |
| **Booking & Reservations** | `features/booking-reservations/` | ✅ COMPLETED | ✅ YES |
| **Tenant Manager** | `features/tenant-manager/` | ✅ COMPLETED | ✅ YES |
| **Global Layout** | `features/layout/` | ✅ COMPLETED | ✅ YES |

---

## 9. Rollback & Safety (Archive Plan)
Before deleting any legacy "spaghetti" files, they are moved to:
`app/landlord/archive/legacy-backup/`

This ensures that if anything is missed during the modularization, the original developer logic can be recovered instantly.

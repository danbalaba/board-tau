# Implementation Plan: Landlord Booking Fulfillment & 404 Fix

## 1. Context & Purpose
Currently, the Landlord dashboard has a critical "Manage Booking" bug where clicking the details icon leads to a 404 error because the target page is missing. Furthermore, to enable the **Verified Review System**, landlords must have a way to transition a booking from `RESERVED` to `CHECKED_IN` and finally `COMPLETED`. This document outlines the fix for the 404 and the implementation of the fulfillment workflow.

## 2. Core Objectives
-   **Fix the 404 Bug:** Replace the broken page navigation with a modern **Detail Modal** to keep landlords on the dashboard.
-   **Enable Fulfillment Flow:** Implement the backend and frontend logic for **Check-In** and **Completion** status updates.
-   **API Hardening:** Update the validation layer to support the new `ReservationStatus` enum values safely.
-   **Verified Review Trigger:** Ensure that only bookings marked as `COMPLETED` by the landlord become eligible for student reviews.

## 3. Detailed Implementation Plan

### Phase 1: Service & API Layer
-   **Service Update:** Modify `services/landlord/bookings.ts`. Update `updateBookingStatus` to accept the new fulfillment statuses (`CHECKED_IN`, `COMPLETED`).
-   **API Update:** Modify `app/api/landlord/bookings/route.ts`. Update the `PUT` method's status validation list to include the new enum values.

### Phase 2: Logic Hook Enhancement
-   **Hook Update:** Modify `app/landlord/features/bookings/hooks/use-booking-logic.ts`.
-   **Status Transition Logic:** Add specific handlers for `handleCheckIn` and `handleComplete` that call the updated API.
-   **Sync Refresh:** Ensure `router.refresh()` is triggered so all status badges update instantly.

### Phase 3: The Detail Modal (New)
-   **New Component:** Create `landlord-booking-details-modal.tsx`.
-   **Visuals:** Premium glassmorphic design showing:
    -   Guest Profile (Name, Email, Verification Status).
    -   Stay Timeline (Start/End Dates).
    -   Payment Summary (Reservation Fee Status).
-   **Actions:** Dynamic buttons that shift based on current status (e.g., if status is `RESERVED`, show "Mark as Checked In").

### Phase 4: UI Integration & Bug Fix
-   **Status Badge:** Create `landlord-booking-status-badge.tsx` for consistent coloring of `CHECKED_IN` (Blue) and `COMPLETED` (Purple).
-   **Modifying Card:** Update `landlord-booking-card.tsx`. 
    -   **Fix 404:** Remove `router.push` and replace it with a state toggle for the new Details Modal.
    -   **Enhance:** Add the new status badge for visual clarity.

## 4. Folder Structure
```text
/app
  /landlord
    /features
      /bookings
        /components
          /landlord-booking-card.tsx (Modified)
          /landlord-booking-status-badge.tsx (New)
          /landlord-booking-details-modal.tsx (New)
          /landlord-booking-empty-state.tsx (New)
        /hooks
          /use-booking-logic.ts (Modified)
```

## 5. Constraints & Guidelines (Do's and Don'ts)

### ✅ DO's:
-   **Modal Pattern:** Match the styling of the Student Inquiry modals for a unified "BoardTAU" brand feel.
-   **Permission Check:** Verify listing ownership on the server side (in the service layer) before allowing any status change.
-   **Loading States:** Use a spinner specifically on the action buttons inside the modal.

### ❌ DON'Ts:
-   **Don't Navigate:** Avoid using `router.push('/landlord/bookings/[id]')` until a dedicated page is actually built. For now, the Modal is the preferred UI.
-   **Don't Hardcode Statuses:** Use the generated Prisma Types for `ReservationStatus`.
-   **Don't Overcomplicate:** Keep the fulfillment interface simple. One button at a time (Next Step) is better than a complex dropdown.

## 6. Take Notes for the Agent
-   The 404 is the priority fix. Start by removing the `router.push` in the `LandlordBookingCard`.
-   Ensure the `LandlordBookingDetailsModal` receives the full booking object to avoid unnecessary secondary API calls.
-   Use `IconPlayerPlay` for Check-In and `IconHomeCheck` for Completion for intuitive iconography.

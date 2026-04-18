# Implementation Plan: Student Card Status & Review Trigger

## 1. Context & Purpose
With the introduction of the Landlord Fulfillment flow (`CHECKED_IN`, `COMPLETED`), the student-side interface must be updated to provide real-time feedback on their stay status. More importantly, this update will integrate the **"Write a Review"** trigger, allowing students to access the review submission flow once their stay is officially marked as completed by the landlord.

## 2. Core Objectives
-   **Status Visibility:** Update Reservation cards and Inquiry cards with new status badges matching the landlord side.
-   **Review Entry Point:** Implement the "Rate Experience" button on completed reservation cards.
-   **Client-side Filtering:** Extend the search/filter logic to handle the full lifecycle of a stay.
-   **Seamless Navigation:** Ensure students can easily toggle between active and past (completed) reservations.

## 3. Detailed Implementation Plan

### Phase 1: Component UI Enhancements
-   **File:** `components/reservations/ReservationCard.tsx`
    -   **Logic:** Update `getStatusBadge()` to handle `CHECKED_IN` (Indigo/Blue) and `COMPLETED` (Purple).
    -   **Action:** Add the "Rate Experience" button in the footer of the card.
-   **File:** `components/reservations/ReservationDetailsModal.tsx`
    -   Add a summary section showing the fulfillment timeline (e.g., "Checked in on [Date]").

### Phase 2: Client-side Data & Filter Updates
-   **File:** `components/reservations/ReservationsClient.tsx`
    -   **Filtering:** Add the new statuses to the `statusOptions` array.
    -   **Logic:** Ensure that filtering for "All" or "Past" correctly includes `COMPLETED` and `CANCELLED` stays.

### Phase 3: Inquiry Consistency (Optional but recommended)
-   **File:** `components/inquiries/InquiryCard.tsx`
    -   Update the badge styling to be consistent with the new Reservation badge design for brand uniformity.
-   **File:** `components/inquiries/InquiryDetailsModal.tsx`
    -   Add a small informational tooltip: "Approved inquiries move to your Reservations page for Check-in."

### Phase 4: The Review Trigger Integration
-   **Integration:** Connect the "Rate Experience" button to the upcoming `ReviewModal`.
-   **Eligibility Check:** Before opening the modal, perform a quick client-side check to ensure the reservation hasn't already been reviewed (using the `review` relation).

## 4. Folder Structure
```text
/components
  /reservations
    /ReservationCard.tsx (Modified)
    /ReservationsClient.tsx (Modified)
    /ReservationDetailsModal.tsx (Modified)
  /inquiries
    /InquiryCard.tsx (Modified)
    /InquiryDetailsModal.tsx (Modified)
```

## 5. Constraints & Guidelines (Do's and Don'ts)

### ✅ DO's:
-   **Action Prioritization:** Ensure the "Rate Experience" button is visually distinct but doesn't overshadow the "Details" button.
-   **Consistent Icons:** Use `Lucide` icons to match the existing student dashboard style.
-   **Empty States:** If a user filters by "Completed" and has none, show a helpful message: "No completed stays yet. Reviews are unlocked after you check out."

### ❌ DON'Ts:
-   **Don't Duplicate Buttons:** Avoid showing "Pay Now" on a `CHECKED_IN` or `COMPLETED` card.
-   **Don't Break Layout:** The addition of the new status badges and the review button must not cause the cards to expand unevenly. Use fixed-height headers or flex-grow logic.
-   **Don't Hardcode Logic:** Status checks should always be case-insensitive or use the Prisma enum constants.

## 6. Take Notes for the Agent
-   The "Rate Experience" button should be the main entry point to the review modal.
-   Pay attention to `ReservationCard:L140`. The MapPin and Location layout should remain clean even with longer title texts.
-   Update the badges in `ReservationsClient:L259` to ensure the filter dropdown is fully functional immediately.

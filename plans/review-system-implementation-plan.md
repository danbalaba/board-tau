# Implementation Plan: Verified Review & Rating System

## 1. Context & Purpose
BoardTAU currently has a baseline review listing component (`ListingReviews.tsx`), but it lacks a submission flow, verified stay logic, and interactive data visualization. To fulfill the Goal of a "Modernized and Interactive" system, we need to implement a robust Review System that ensures authenticity and provides deep insights to potential tenants through categorized ratings and photo evidence.

## 2. Core Objectives
-   **Eligibility Enforcement:** Strictly limit reviews to users with a `COMPLETED` or `PAID` reservation for the listing.
-   **Categorized Insights:** Upgrade the system to handle specific scores for Cleanliness, Accuracy, Communication, Location, and Value.
-   **Interactive Display:** Transform the listing page into a dynamic hub with filter chips and visual average bars.
-   **Visual Proof:** Allow users to upload photos of their actual stay to ensure transparency.

## 3. Detailed Implementation Plan

### Phase 0: Fulfillment & UI Cleanup (Prerequisite)
> [!IMPORTANT]
> This phase must be completed FIRST to enable the review system.
- **Landlord Fulfillment:** Implement Check-In/Complete logic and fix the 404 Manage Booking bug. (See: [booking-plan.md](file:///c:/Users/asus/Capstone/BoardTAU/docs/reviews/booking-plan.md))
- **Student Status UI:** Update Reservation Cards with new fulfillment badges and the Review trigger button. (See: [inquiry-and-reservation-plan-fix-card.md](file:///c:/Users/asus/Capstone/BoardTAU/docs/reviews/inquiry-and-reservation-plan-fix-card.md))

### Phase 1: Database & Seed Updates
-   **Schema Change:** Modify `prisma/schema.prisma` to add `images String[]` and `reservationId String? @db.ObjectId` to the `Review` model. (Completed: Relation set to one-to-many to avoid MongoDB unique null errors).
-   **Data Restoration:** Update `prisma/seed-real-listings.ts` with categorized ratings. (Completed).

### Phase 3: Enhanced Display UI (Listing Page)
-   **Summary Bars:** In `ListingReviews.tsx`, implement a "Review Summary" section using horizontal progress bars for each category.
-   **Interactive Filters:** Implement filter chips (e.g., "All", "5 Stars", "With Photos") that filter the reviews list on the frontend.
-   **Modern Styling:** Use `framer-motion` for all new transitions and ensure a "Glassmorphic" feel.

### Phase 4: Submission Interface (Input)
-   **Review Modal:** Build a multi-step modal (`components/modals/ReviewModal.tsx`):
    -   *Step 1:* Categorized star selection.
    -   *Step 2:* Text comment area.
    -   *Step 3:* Image upload (supports drag-and-drop).
-   **Verification Button:** Add a "Write a Review" button to the listing page header/sidebar that only renders for eligible users.

### Phase 5: API Layer
-   **POST /api/reviews:** Validate the `reservationId` and `userId`. Ensure stars are between 1-5.
-   **PATCH /api/reviews/[id]/reply:** (Landlord only) Endpoint to allow house owners to respond to feedback.

## 4. Folder Structure
```text
/plans
  /review-system-implementation-plan.md  <- Master Plan
/docs
  /reviews
    /booking-plan.md                     <- Landlord Side Details
    /inquiry-and-reservation-plan-fix-card.md <- Student Side Details
/app
  /api
    /reviews
      /route.ts
      /[reviewId]
        /reply/route.ts
/components
  /listings
    /detail
      /ListingReviews.tsx (Modified)
      /ReviewSummary.tsx (New)
      /ReviewFilters.tsx (New)
  /modals
    /ReviewModal.tsx (New)
/hooks
  /useReviewEligibility.ts
/services
  /reviewService.ts
```

## 5. Constraints & Guidelines (Do's and Don'ts)

### ✅ DO's:
-   **Maintain Aesthetics:** Use the existing `#2F7D6D` primary color and Tarlac Agricultural University theme.
-   **Separate Logic:** Keep business logic (data fetching, validation) in hooks/services, not inside UI components.
-   **Loading States:** Ensure all buttons show a spinner/loading state during API submission.
-   **Error Handling:** Use `react-hot-toast` to notify users of submission errors (e.g., "You have already reviewed this property").

### ❌ DON'Ts:
-   **Don't Touch Core Reservations:** Do not modify the existing payment or booking logic except for reading the reservation status.
-   **Don't Hardcode Strings:** Use constants or existing categories from the schema.
-   **Don't Compromise Mobile UX:** The category grid and progress bars must be stacked or neatly organized on mobile screens.

## 6. Take Notes for the Agent
-   The user already has a baseline `ListingReviews.tsx`. **Do not delete it.** Extend it by adding the Summary and Filter components.
-   Check `seed-real-listings.ts` first; if you don't randomize the category scores there, the new UI will look empty.
-   The "Write a Review" button should be high-contrast to encourage interaction but subtle enough not to distract from the booking sidebar.

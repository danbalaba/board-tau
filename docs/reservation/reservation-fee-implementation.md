# Fixed Reservation Fee Implementation Plan

## 1. Overview
BoardTAU is shifting from a duration-based (Price × Months) booking model to a **"Slot Securing"** model. In this model, the **Price** remains as the **Monthly Rent** (important for student affordability), but the **Transaction** amount is a fixed **Reservation Fee** set by the landlord to hold the slot.

## 2. Goals
- **Maintain Search Filters**: Keep the `price` field as the monthly rent for affordability filtering.
- **Fixed Fee Payment**: Ensure Stripe/GCash payments reflect a one-time reservation fee, not a calculated stay total.
- **Improved Transparency**: Clearly label "Monthly Rent" and "Reservation Fee" across the platform.
- **Real-time Slot Holding**: One paid reservation = 1 slot (Solo Room) or 1 unit of capacity (Bedspace) is held.

## 3. Implementation Phases

### Phase 1: Database Schema Updates
- **File**: `prisma/schema.prisma`
- **Actions**:
    - Update `Room` model to include `reservationFee: Int` (default to 0 or a sensible default like 500).
    - Ensure `Inquiry` and `Reservation` models are prepared to handle this fixed fee.

### Phase 2: Landlord Management
- **Files**:
    - `components/host/RoomConfig.tsx` (or equivalent room editing components)
- **Actions**:
    - Add an input field for `reservationFee` so landlords can customize the "Holding Price" per room.

### Phase 3: Inquiry & API Logic
- **Files**:
    - `app/api/inquiries/route.ts`
    - `app/api/inquiries/[id]/approve/route.ts`
    - `app/api/reservations/route.ts`
- **Actions**:
    - Update `POST /api/inquiries` to record the `reservationFee` from the room at the time of inquiry.
    - Update the **Approval** logic to create a `Reservation` with `totalPrice = inquiry.reservationFee`.

### Phase 4: Payment System Refinement
- **Files**:
    - `app/api/reservations/[id]/payment/route.ts`
    - `components/reservations/PaymentModal.tsx`
- **Actions**:
    - Create the payment intent for the fixed `reservationFee`.
    - Update the Payment Modal UI to clarify that this is a "Slot Reservation Fee."

### Phase 5: UI Polish & Labels
- **Files**:
    - `components/listings/detail/AvailableRoomsSection.tsx`
    - `components/modals/InquiryModal.tsx`
    - `components/reservations/ReservationCard.tsx`
- **Actions**:
    - Label `Room.price` as `₱ X / mo`.
    - Label transaction cost as `Reservation Fee: ₱ X`.
    - Add descriptive text: *"Remaining monthly rent and utilities are paid directly to the landlord."*

## 4. Success Criteria
1. Affordability filtering (Monthly Rent) works correctly.
2. The checkout total always matches the landlord-defined reservation fee.
3. Clear distinction in the UI between the "Holding Fee" and "Monthly Rent."
4. Landlords can change their reservation fees in their property management settings.

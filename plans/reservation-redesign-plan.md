# BoardTAU Reservation and Inquiry Flow Redesign - Implementation Plan

## Overview
This document outlines the complete implementation plan for redesigning the BoardTAU reservation system from a direct reservation flow to an inquiry-first approach.

## Current State Analysis

### Existing Models (from Prisma Schema)
- **Inquiry model**: Already exists with `InquiryStatus` enum (PENDING, APPROVED, REJECTED, EXPIRED)
- **Reservation model**: Already exists with `inquiryId` field and `ReservationStatus` enum
- **Room model**: Has all required fields including images, amenities, capacity

### Schema Updates Required
1. Add `CANCELLED` to `InquiryStatus` enum
2. Update `ReservationStatus` enum from (PENDING, CONFIRMED, CANCELLED) to (PENDING_PAYMENT, RESERVED, CANCELLED, EXPIRED)

### Existing Services
- `services/user/inquiries/inquiry.ts` - Already has createInquiry and getInquiriesByUser functions
- `services/payments/stripe.ts` - Existing Stripe integration to be used as-is
- `services/user/reservations/reservation.ts` - Existing reservation service

## Process Flow Diagram

```mermaid
flowchart TD
    A[User Views Listing] --> B[Room Section with "Inquire" Button]
    B --> C[Click "Inquire"]
    C --> D[InquiryModal Opens]
    D --> E[User Fills Inquiry Form]
    E --> F[Submit to /api/inquiries]
    F --> G[Inquiry Created with PENDING Status]
    G --> H[Redirect to /inquiries]
    H --> I[User Views My Inquiries Page]

    I --> J{Landlord Approves?}
    J -->|Yes| K[Reservation Created with PENDING_PAYMENT]
    K --> L[User Sees "Pay Now" in My Reservations]
    L --> M[Payment Modal with Stripe]
    M --> N[Payment Successful]
    N --> O[Status Changes to RESERVED]

    J -->|No| P[Status Changes to REJECTED]
    I --> Q[User Can Cancel Pending Inquiry]
    L --> R[User Can Cancel Pending Payment]
```

## Phase-by-Phase Implementation

### Phase 1: Room Section Redesign
**Files to Modify:**
- `components/listings/detail/AvailableRoomsSection.tsx`
- `components/listings/detail/ListingDetailsClient.tsx`

**New Components:**
- `components/listings/detail/AllRoomsModal.tsx`
- `components/listings/detail/RoomDetailsModal.tsx`
- `components/listings/detail/RoomTooltip.tsx`

**Changes:**
1. Change button text "Reserve" → "Inquire"
2. Add left/right arrow navigation to room slider
3. Add "View All Rooms" button when rooms > 3
4. Create tooltip component for hover details
5. Create modals for viewing all rooms and room details

### Phase 2: Rooms Modal Design
**Features:**
1. AllRoomsModal with responsive grid (3-col desktop, 2-col tablet, 1-col mobile)
2. Room filtering by type (solo/bedspace) and price range
3. Room sorting by price (low/high) and type
4. RoomDetailsModal with image slider, amenities, specifications

### Phase 3: Inquiry Form Redesign
**Files to Modify:**
- `components/modals/InquiryModal.tsx`
- `components/listings/detail/ListingDetailsClient.tsx`

**New API:**
- `app/api/inquiries/route.ts`

**Changes:**
1. Update title "Reserve Room" → "Send Inquiry"
2. Update button text "Confirm Reservation" → "Send Inquiry"
3. Remove stay duration and price calculation
4. Create inquiries API endpoint
5. Update success redirect to /inquiries

### Phase 4: Reservation Process & Schema Updates
**Files to Modify:**
- `prisma/schema.prisma`

**New API Endpoints:**
- `app/api/reservations/route.ts`
- `app/api/reservations/[id]/payment/route.ts`

**Changes:**
1. Update Prisma enums for InquiryStatus and ReservationStatus
2. Create reservation API for approved inquiries
3. Implement Stripe payment endpoint
4. Add disabled GCash/Maya placeholder buttons

### Phase 5: My Inquiries Page
**New Files:**
- `app/inquiries/page.tsx`
- `components/inquiries/InquiryCard.tsx`
- `components/inquiries/InquiryDetailsModal.tsx`

**Services Updates:**
- `services/user/inquiries.ts` - Add filtering, search, pagination

**Features:**
1. Grid layout with status badges
2. Filter by status (Pending, Approved, Rejected, Cancelled)
3. Search by room name or location
4. Sort by date, price, status
5. Cancel pending inquiries

### Phase 6: My Reservations Page
**New Files:**
- `components/reservations/ReservationCard.tsx`
- `components/reservations/ReservationDetailsModal.tsx`
- `components/reservations/PaymentModal.tsx`

**Files to Modify:**
- `app/reservations/page.tsx`
- `services/user/reservations.ts`

**Features:**
1. Grid layout with status badges (Pending Payment, Reserved, Cancelled)
2. Filter and search functionality
3. "Pay Now" button for PENDING_PAYMENT status
4. Payment modal with Stripe integration
5. Cancel reservation functionality

## Status Badge Colors

### Inquiry Statuses
- **PENDING**: Orange (`bg-orange-100 text-orange-800`)
- **APPROVED**: Green (`bg-green-100 text-green-800`)
- **REJECTED**: Red (`bg-red-100 text-red-800`)
- **CANCELLED**: Gray (`bg-gray-100 text-gray-800`)
- **EXPIRED**: Gray (`bg-gray-100 text-gray-800`)

### Reservation Statuses
- **PENDING_PAYMENT**: Orange (`bg-orange-100 text-orange-800`)
- **RESERVED**: Green (`bg-green-100 text-green-800`)
- **CANCELLED**: Gray (`bg-gray-100 text-gray-800`)
- **EXPIRED**: Gray (`bg-gray-100 text-gray-800`)

## API Endpoints Summary

### New Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/inquiries` | POST | Create new inquiry |
| `/api/inquiries` | GET | Get user's inquiries |
| `/api/inquiries/[id]/cancel` | PUT | Cancel pending inquiry |
| `/api/reservations` | POST | Create reservation from approved inquiry |
| `/api/reservations/[id]/payment` | POST | Process Stripe payment |
| `/api/reservations/[id]/cancel` | PUT | Cancel reservation |

## Testing Strategy
As per user requirements, testing will be done after all phases are complete.

## Implementation Notes

1. **Payment Integration**: Use existing `services/payments/stripe.ts` - only Stripe will be implemented. GCash and Maya will be placeholder buttons with "Coming Soon" text.

2. **Database Migrations**: Schema file will be updated. User will handle running migrations.

3. **Existing Inquiry Service**: The `services/user/inquiries/inquiry.ts` already has basic CRUD functions that can be extended.

4. **Modal Pattern**: Use the existing Modal component pattern with `Modal.Trigger`, `Modal.Window`, and `Modal.WindowHeader`.

5. **Styling**: Follow existing Tailwind CSS patterns and dark mode support.

## Next Steps
Once this plan is approved, implementation will proceed phase by phase starting with Phase 1.

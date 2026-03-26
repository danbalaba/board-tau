# My Reservations Page Design

## Overview

The "My Reservations" page is where users can manage all their approved inquiries that have been converted to reservations. It provides a clear overview of reservation statuses, with options to view details, pay for pending reservations, or cancel reservations.

## Current Implementation

The current reservations page shows both guest reservations and host reservations using ListingCard components. It does not distinguish between inquiry statuses and reservation statuses.

## Issues with Current Design

1. **Confusion**: Mixes inquiries and reservations in the same view
2. **Lack of Payment Options**: No payment button for pending payment reservations
3. **Incorrect Terminology**: Uses "Confirmed" instead of "Reserved" status
4. **Limited Actions**: No clear options for payment or cancellation

## Redesign Goals

1. **Clarity**: Separate inquiries from reservations
2. **Payment Integration**: Add payment button for pending payment reservations
3. **Correct Terminology**: Use "Reserved" status instead of "Confirmed"
4. **Enhanced Actions**: Provide clear options for payment, cancellation, and viewing details

## New My Reservations Page Design

### Page Header
```
┌─────────────────────────────────────────────────────────────────┐
│  My Reservations                                               │
│  Manage your approved boarding house reservations             │
└─────────────────────────────────────────────────────────────────┘
```

### Filter and Search Bar
```
┌─────────────────────────────────────────────────────────────────┐
│  [Search] [Filter: All] [Sort: Date (Newest)]                  │
│                                                                 │
│  Filter options: All, Pending Payment, Reserved, Cancelled     │
└─────────────────────────────────────────────────────────────────┘
```

### Reservation Cards (Grid Layout)
```
┌─────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────┐ ┌──────────────────────────┐    │
│  │ [Room Image]              │ │ [Room Image]              │    │
│  │ Room Name: Solo Room 1    │ │ Room Name: Bedspace 2     │    │
│  │ Price: ₱5,000/month        │ │ Price: ₱2,500/month        │    │
│  │ Status: [Pending Payment]  │ │ Status: [Reserved]         │    │
│  │ Date: Feb 15, 2026         │ │ Date: Feb 14, 2026         │    │
│  │ [View Details] [Pay Now]   │ │ [View Details] [Cancel]    │    │
│  └──────────────────────────┘ └──────────────────────────┘    │
│                                                                 │
│  ┌──────────────────────────┐ ┌──────────────────────────┐    │
│  │ [Room Image]              │ │ [Room Image]              │    │
│  │ Room Name: Solo Room 3    │ │ Room Name: Bedspace 4     │    │
│  │ Price: ₱6,000/month        │ │ Price: ₱2,800/month        │    │
│  │ Status: [Cancelled]        │ │ Status: [Reserved]         │    │
│  │ Date: Feb 13, 2026         │ │ Date: Feb 12, 2026         │    │
│  │ [View Details]             │ │ [View Details]             │    │
│  └──────────────────────────┘ └──────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Status Badge Colors
- **Pending Payment**: Orange
- **Reserved**: Green
- **Cancelled**: Gray

### Empty State
```
┌─────────────────────────────────────────────────────────────────┐
│  No Reservations Found                                         │
│  You haven't made any reservations yet.                        │
│  Start sending inquiries to find your perfect room.            │
│  [View My Inquiries]                                           │
└─────────────────────────────────────────────────────────────────┘
```

## Key Features

### 1. Reservation Management
- **View All Reservations**: Display all reservations with clear status badges
- **Filtering**: Filter by status (All, Pending Payment, Reserved, Cancelled)
- **Search**: Search reservations by room name or location
- **Sorting**: Sort by date (newest/oldest), price, or status

### 2. Card Actions
- **View Details**: Open a modal with complete reservation information
- **Pay Now**: Pay for pending payment reservations (only available for Pending Payment status)
- **Cancel**: Cancel reservations (only available for Pending Payment and Reserved statuses)

### 3. Reservation Details Modal
```
┌─────────────────────────────────────────────────────────────────┐
│  Reservation Details                                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  [Room Image Slider]                                            │
│                                                                 │
│  Room Name: Solo Room with Private Bathroom                     │
│  Price: ₱5,000/month                                           │
│  Listing: Dianna Lney Boarding House                           │
│  Location: Brgy. San Isidro, City of San Fernando, Pampanga    │
│                                                                 │
│  Status: Pending Payment                                       │
│  Reserved On: Feb 15, 2026 10:30 AM                            │
│  Move-in Date: March 01, 2026                                  │
│  Move-out Date: May 31, 2026                                  │
│  Total Price: ₱15,000                                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Payment Information                                           │
│  Payment Method: GCash                                         │
│  Payment Status: Unpaid                                        │
│  Due Date: Feb 20, 2026                                        │
│                                                                 │
│  [Pay Now] [Cancel Reservation] [Close]                        │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Payment Modal
```
┌─────────────────────────────────────────────────────────────────┐
│  Complete Payment                                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Reservation Summary                                           │
│  Room: Solo Room with Private Bathroom                          │
│  Duration: 3 months                                             │
│  Total: ₱15,000                                               │
│                                                                 │
│  Payment Methods                                               │
│  [ ] GCash                                                    │
│  [ ] Maya                                                    │
│  [ ] Stripe (Credit/Debit Card)                              │
│                                                                 │
│  [Complete Payment] [Cancel]                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 5. Responsive Design
- **Desktop**: Grid layout with 2-3 columns depending on screen size
- **Tablet**: Grid layout with 2 columns
- **Mobile**: Single column list layout

## Implementation Details

### Component File: MyReservationsPage.tsx
- Location: `/app/reservations/page.tsx`
- Query all reservations for the current user
- Display in card format with status badges
- Handle filtering, searching, and sorting
- Implement empty state

### Query Function: getReservations
- Location: `/services/user/reservations.ts`
- Accepts query parameters: status, search, sort, page
- Returns filtered and sorted reservations with pagination

### Database Query
```typescript
const reservations = await db.reservation.findMany({
  where: {
    userId: currentUser.id,
    status: { in: statusFilter },
    OR: [
      { room: { name: { contains: searchQuery } } },
      { listing: { title: { contains: searchQuery } } }
    ]
  },
  include: {
    room: true,
    listing: true
  },
  orderBy: { createdAt: sortOrder },
  skip: (page - 1) * PAGE_SIZE,
  take: PAGE_SIZE
});
```

## Related Components

1. **ReservationCard.tsx**: Reusable card component for displaying reservation information
2. **ReservationDetailsModal.tsx**: Modal component for viewing reservation details
3. **PaymentModal.tsx**: Modal component for completing payments
4. **StatusBadge.tsx**: Reusable status badge component with color coding
5. **Pagination.tsx**: Reusable pagination component for multi-page results

## Benefits of the Redesign

1. **Clarity**: Separate inquiries from reservations
2. **Payment Integration**: Easy payment options for pending reservations
3. **Correct Terminology**: Uses "Reserved" status instead of "Confirmed"
4. **Enhanced Actions**: Clear options for payment, cancellation, and viewing details
5. **Better Experience**: Complete reservation management journey

## File Structure

```
src/
├── app/
│   └── reservations/
│       └── page.tsx (MyReservationsPage.tsx)
├── components/
│   └── reservations/
│       ├── ReservationCard.tsx
│       ├── ReservationDetailsModal.tsx
│       └── PaymentModal.tsx
├── services/
│   └── user/
│       └── reservations.ts
└── docs/
    └── reservation/
        └── my-reservations-page-design.md (this file)
```

## Related Documentation

- [PRD.md](../features/PRD.md) - Product Requirements Document
- [TASK-ANALYSIS.md](../reference/TASK-ANALYSIS.md) - Task Analysis Forms
- [INPUT-PROCESS-OUTPUT-DOCUMENTATION.md](../reference/INPUT-PROCESS-OUTPUT-DOCUMENTATION.md) - Input Process Output Documentation
- [inquiry-form-design.md](inquiry-form-design.md) - Inquiry Form Design
- [reservation-process-design.md](reservation-process-design.md) - Reservation Process Design
- [my-inquiries-page-design.md](my-inquiries-page-design.md) - My Inquiries Page Design

## Next Steps

1. Review and approve this My Reservations page design
2. Create the MyReservationsPage.tsx component
3. Create the ReservationCard, ReservationDetailsModal, and PaymentModal components
4. Implement the getReservations service
5. Test the page functionality
6. Gather user feedback and make improvements
7. Document the final implementation

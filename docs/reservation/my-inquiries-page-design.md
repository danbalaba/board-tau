# My Inquiries Page Design

## Overview

The "My Inquiries" page is a new addition to BoardTAU that allows users to track and manage all their inquiries about boarding house rooms. It provides a clear overview of inquiry statuses, with options to view details or cancel pending inquiries.

## Current Implementation

Currently, there is no dedicated page for inquiries. Inquiries are directly converted to reservations without any intermediate tracking for users.

## Issues with Current Design

1. **Lack of Transparency**: Users can't track their inquiry status after submission
2. **No Cancel Option**: Users can't cancel pending inquiries
3. **Poor Communication**: Users have no way to view or reference their previous inquiries
4. **Incomplete Experience**: The journey from inquiry to reservation is not fully visible

## Redesign Goals

1. **Transparency**: Provide users with clear visibility into their inquiry status
2. **Control**: Allow users to cancel pending inquiries
3. **Reference**: Enable users to view past inquiries for future reference
4. **Improved Experience**: Create a complete inquiry management journey

## New My Inquiries Page Design

### Page Header
```
┌─────────────────────────────────────────────────────────────────┐
│  My Inquiries                                                  │
│  Manage your boarding house inquiries                         │
└─────────────────────────────────────────────────────────────────┘
```

### Filter and Search Bar
```
┌─────────────────────────────────────────────────────────────────┐
│  [Search] [Filter: All] [Sort: Date (Newest)]                  │
│                                                                 │
│  Filter options: All, Pending, Approved, Rejected, Cancelled    │
└─────────────────────────────────────────────────────────────────┘
```

### Inquiry Cards (Grid Layout)
```
┌─────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────┐ ┌──────────────────────────┐    │
│  │ [Room Image]              │ │ [Room Image]              │    │
│  │ Room Name: Solo Room 1    │ │ Room Name: Bedspace 2     │    │
│  │ Price: ₱5,000/month        │ │ Price: ₱2,500/month        │    │
│  │ Status: [Pending]          │ │ Status: [Approved]         │    │
│  │ Date: Feb 15, 2026         │ │ Date: Feb 14, 2026         │    │
│  │ [View Details] [Cancel]    │ │ [View Details]             │    │
│  └──────────────────────────┘ └──────────────────────────┘    │
│                                                                 │
│  ┌──────────────────────────┐ ┌──────────────────────────┐    │
│  │ [Room Image]              │ │ [Room Image]              │    │
│  │ Room Name: Solo Room 3    │ │ Room Name: Bedspace 4     │    │
│  │ Price: ₱6,000/month        │ │ Price: ₱2,800/month        │    │
│  │ Status: [Rejected]         │ │ Status: [Cancelled]        │    │
│  │ Date: Feb 13, 2026         │ │ Date: Feb 12, 2026         │    │
│  │ [View Details]             │ │ [View Details]             │    │
│  └──────────────────────────┘ └──────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Status Badge Colors
- **Pending**: Orange
- **Approved**: Green
- **Rejected**: Red
- **Cancelled**: Gray
- **Expired**: Gray

### Empty State
```
┌─────────────────────────────────────────────────────────────────┐
│  No Inquiries Found                                            │
│  You haven't sent any inquiries yet.                           │
│  Start exploring boarding houses to find your perfect room.    │
│  [Explore Listings]                                            │
└─────────────────────────────────────────────────────────────────┘
```

## Key Features

### 1. Inquiry Management
- **View All Inquiries**: Display all inquiries with clear status badges
- **Filtering**: Filter by status (All, Pending, Approved, Rejected, Cancelled)
- **Search**: Search inquiries by room name or location
- **Sorting**: Sort by date (newest/oldest), price, or status

### 2. Card Actions
- **View Details**: Open a modal with complete inquiry information
- **Cancel**: Cancel pending inquiries (only available for Pending status)

### 3. Inquiry Details Modal
```
┌─────────────────────────────────────────────────────────────────┐
│  Inquiry Details                                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  [Room Image Slider]                                            │
│                                                                 │
│  Room Name: Solo Room with Private Bathroom                     │
│  Price: ₱5,000/month                                           │
│  Listing: Dianna Lney Boarding House                           │
│  Location: Brgy. San Isidro, City of San Fernando, Pampanga    │
│                                                                 │
│  Status: Pending                                               │
│  Submitted: Feb 15, 2026 10:30 AM                              │
│  Last Updated: Feb 15, 2026 10:30 AM                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Inquiry Information                                           │
│  Move-in Date: March 01, 2026                                  │
│  Move-out Date: May 31, 2026                                  │
│  Number of Occupants: 1                                        │
│  Role: Student                                                 │
│  Contact Method: Email                                         │
│  Message to Host: "I'm a TAU student looking for a quiet room" │
│                                                                 │
│  [Cancel Inquiry] [Close]                                      │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Responsive Design
- **Desktop**: Grid layout with 2-3 columns depending on screen size
- **Tablet**: Grid layout with 2 columns
- **Mobile**: Single column list layout

## Implementation Details

### Component File: MyInquiriesPage.tsx
- Location: `/app/inquiries/page.tsx`
- Query all inquiries for the current user
- Display in card format with status badges
- Handle filtering, searching, and sorting
- Implement empty state

### Query Function: getInquiries
- Location: `/services/user/inquiries.ts`
- Accepts query parameters: status, search, sort, page
- Returns filtered and sorted inquiries with pagination

### Database Query
```typescript
const inquiries = await db.inquiry.findMany({
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

1. **InquiryCard.tsx**: Reusable card component for displaying inquiry information
2. **InquiryDetailsModal.tsx**: Modal component for viewing inquiry details
3. **StatusBadge.tsx**: Reusable status badge component with color coding
4. **Pagination.tsx**: Reusable pagination component for multi-page results

## Benefits of the Redesign

1. **Transparency**: Users can track their inquiry status in real-time
2. **Control**: Users can cancel pending inquiries before approval
3. **Reference**: All inquiries are stored for future reference
4. **Improved Experience**: Complete journey from inquiry to reservation
5. **Communication**: Clear status indicators and email notifications

## File Structure

```
src/
├── app/
│   └── inquiries/
│       └── page.tsx (MyInquiriesPage.tsx)
├── components/
│   └── inquiries/
│       ├── InquiryCard.tsx
│       └── InquiryDetailsModal.tsx
├── services/
│   └── user/
│       └── inquiries.ts
└── docs/
    └── reservation/
        └── my-inquiries-page-design.md (this file)
```

## Related Documentation

- [PRD.md](../features/PRD.md) - Product Requirements Document
- [TASK-ANALYSIS.md](../reference/TASK-ANALYSIS.md) - Task Analysis Forms
- [INPUT-PROCESS-OUTPUT-DOCUMENTATION.md](../reference/INPUT-PROCESS-OUTPUT-DOCUMENTATION.md) - Input Process Output Documentation
- [inquiry-form-design.md](inquiry-form-design.md) - Inquiry Form Design
- [reservation-process-design.md](reservation-process-design.md) - Reservation Process Design
- [my-reservations-page-design.md](my-reservations-page-design.md) - My Reservations Page Design

## Next Steps

1. Review and approve this My Inquiries page design
2. Create the MyInquiriesPage.tsx component
3. Create the InquiryCard and InquiryDetailsModal components
4. Implement the getInquiries service
5. Test the page functionality
6. Gather user feedback and make improvements
7. Document the final implementation

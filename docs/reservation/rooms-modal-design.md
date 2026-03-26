# Rooms Modal Design

## Overview

The rooms modal is a key component of the BoardTAU system, allowing potential tenants to view all available rooms for a specific listing in a detailed, organized manner. This modal serves as an expansion of the room section from the main listing page, providing a better overview of all available rooms.

## Current Implementation

Currently, the room section on the listing page uses a horizontal slider to display available rooms. Each room card shows the room image, name, price, type, status, and a "Reserve" button. There is no dedicated modal or page for viewing all rooms at once.

## Issues with Current Design

1. **Limited View**: Horizontal slider makes it difficult to see multiple rooms at once
2. **Lack of Detail**: No way to view all rooms with comprehensive information
3. **Scalability**: Not suitable for listings with many rooms
4. **Inconsistent Flow**: No dedicated space for comparing rooms

## Redesign Goals

1. **Comprehensive View**: Display all rooms in an organized, grid format
2. **Detailed Information**: Provide more comprehensive room details
3. **Improved Comparability**: Allow users to compare rooms side by side
4. **Consistent Flow**: Integrate seamlessly with the inquiry process

## New Rooms Modal Design

### Modal Header
```
┌───────────────────────────────────────────────────┐
│  X  Available Rooms                                │
└───────────────────────────────────────────────────┘
```
- **Title**: "Available Rooms"
- **Subtitle**: "View all available rooms for this listing"
- **Listing Name**: Display the boarding house name
- **Total Rooms**: Show the number of available rooms

### Room Filtering & Sorting
```
┌───────────────────────────────────────────────────┐
│  Filter: [All ▾]  Sort: [Price: Low to High ▾]     │
└───────────────────────────────────────────────────┘
```
- **Filters**: Room type (All/Solo/Bedspace), Price range, Amenities
- **Sorting**: Price (Low to High/High to Low), Room type, Capacity

### Room Grid
```
┌───────────────────┬───────────────────┬───────────────────┐
│  [Room Image]     │  [Room Image]     │  [Room Image]     │
│  Solo Room 1      │  Solo Room 2      │  Bedspace 1       │
│  ₱5,000/month     │  ₱5,500/month     │  ₱2,500/month     │
│                   │                   │                   │
│  • Private Bath   │  • Private Bath   │  • Shared Bath    │
│  • Air Con        │  • Air Con        │  • Fan            │
│  • Wi-Fi          │  • Wi-Fi          │  • Wi-Fi          │
│                   │                   │                   │
│  [View Details]   │  [View Details]   │  [View Details]   │
│  [Inquire]        │  [Inquire]        │  [Inquire]        │
└───────────────────┴───────────────────┴───────────────────┘
```

### Room Details Modal (Open from Room Card)
```
┌───────────────────────────────────────────────────┐
│  X  Room Details                                  │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│  [Large Image Slider]                             │
│                                                   │
│  Room Name: Solo Room with Private Bathroom       │
│  Price: ₱5,000/month                               │
│  Type: Solo Room                                  │
│  Status: Available                                │
│  Capacity: 1 person                               │
│                                                   │
│  Amenities:                                       │
│  • Private Bathroom                               │
│  • Air Conditioning                               │
│  • Wi-Fi                                           │
│  • Closet                                          │
│  • Study Desk                                      │
│                                                   │
│  [Inquire]  [Close]                               │
└───────────────────────────────────────────────────┘
```

## Key Features

### 1. Room Card Information
Each room card in the grid will include:
- High-quality room image
- Room name
- Price per month
- Room type (Solo/Bedspace)
- Status indicator (Available/Full)
- Key amenities (3-4 most important)
- "View Details" button
- "Inquire" button

### 2. Room Details Modal
When clicking "View Details" on a room card, a detailed modal will open showing:
- Large image slider with multiple photos
- Complete room description
- Full amenities list
- Room specifications (size, bed type, etc.)
- Price details
- Occupancy information
- "Inquire" button to start the inquiry process

### 3. Filtering & Sorting
- **Room Type Filter**: Filter by solo rooms, bedspaces, or all rooms
- **Price Range Filter**: Slider to filter rooms by price range
- **Sorting Options**: Sort by price (low to high/high to low), room type, capacity

### 4. Responsive Design
- **Desktop**: 3-column grid for optimal viewing
- **Tablet**: 2-column grid
- **Mobile**: Single column list view

## Implementation Details

### Component File: AllRoomsModal.tsx
- Location: `/components/listings/detail/AllRoomsModal.tsx`
- Props:
  - `rooms`: Array of room objects
  - `listingName`: Name of the boarding house
  - `onClose`: Function to close the modal
  - `onInquire`: Function to handle inquiry submission

### Room Object Structure
```typescript
interface Room {
  id: string;
  name: string;
  price: number;
  type: 'solo' | 'bedspace';
  status: 'available' | 'full';
  capacity: number;
  availableSlots: number;
  amenities: string[];
  images: {
    id: string;
    url: string;
    caption?: string;
  }[];
  description: string;
  size?: number; // in square meters
  bedType?: string;
}
```

### Integration with Existing Components
- `AvailableRoomsSection.tsx`: Will trigger the AllRoomsModal when "View All Rooms" is clicked
- `RoomDetailsModal.tsx`: Will be reused for the detailed room information
- `InquiryModal.tsx`: Will be reused for the inquiry form

## Benefits of the Redesign

1. **Comprehensive View**: Users can see all rooms at once for better comparison
2. **Detailed Information**: Each room's details are easily accessible
3. **Improved Usability**: Filtering and sorting options help users find the right room
4. **Consistent Flow**: Seamlessly integrates with the inquiry process
5. **Scalability**: Handles large numbers of rooms effectively

## File Structure

```
src/
├── components/
│   └── listings/
│       └── detail/
│           ├── AllRoomsModal.tsx (new)
│           ├── RoomDetailsModal.tsx (new)
│           └── AvailableRoomsSection.tsx (updated)
└── docs/
    └── reservation/
        └── rooms-modal-design.md (this file)
```

## Related Documentation

- [PRD.md](../features/PRD.md) - Product Requirements Document
- [TASK-ANALYSIS.md](../reference/TASK-ANALYSIS.md) - Task Analysis Forms
- [INPUT-PROCESS-OUTPUT-DOCUMENTATION.md](../reference/INPUT-PROCESS-OUTPUT-DOCUMENTATION.md) - Input Process Output Documentation
- [room-section-redesign.md](room-section-redesign.md) - Room Section Redesign
- [inquiry-form-design.md](inquiry-form-design.md) - Inquiry Form Design

## Next Steps

1. Review and approve this rooms modal design
2. Create the AllRoomsModal.tsx component
3. Create the RoomDetailsModal.tsx component
4. Update the AvailableRoomsSection.tsx to trigger the modal
5. Test the rooms modal functionality
6. Gather user feedback and make improvements
7. Document the final implementation

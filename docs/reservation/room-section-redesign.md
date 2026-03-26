# Room Section Redesign - Listing Page

## Current Design Overview

The current room section in the listing page features a horizontal slider with room cards, each displaying:
- Room image
- Room name
- Price per month
- Room type
- Status indicator (Available/Full)
- "Reserve" button

## Issues with Current Design

1. **Terminology Inconsistency**: The "Reserve" button implies immediate booking, but the actual process is an inquiry followed by landlord approval
2. **Limited Navigation**: The horizontal slider can be difficult to use if there are many rooms
3. **Lack of Detail Teasers**: Users can't quickly see key amenities without clicking through to a modal
4. **No View All Option**: There's no way to see all rooms at once if there are more than 3-4

## Redesign Goals

1. **Clarify Process**: Change terminology to reflect inquiry-first approach
2. **Improve Navigation**: Add arrow navigation and view all rooms option
3. **Enhance Preview**: Add hover tooltips with key room details
4. **Maintain Scalability**: Handle large numbers of rooms effectively

## Redesign Plan

### 1. Button Text Update
- **Change from**: "Reserve"
- **Change to**: "Inquire"
- **Reason**: Better reflects the actual process (inquiry → approval → reservation)

### 2. Slider Navigation Improvements
- Add **left/right arrow buttons** for explicit slider navigation
- Make arrows **always visible** (not just on hover) for better usability
- Implement **drag-to-scroll** functionality for touch devices

### 3. View All Rooms Option
- If there are **more than 3 rooms**, display a "View All Rooms" button at the end of the slider
- Clicking this button opens a **modal with all rooms in a grid layout**
- Each room card in the modal includes:
  - Room image
  - Room name
  - Price
  - Type
  - Status
  - Key amenities
  - "Inquire" and "View Details" buttons

### 4. Hover Tooltip Enhancement
- Add a **hover tooltip** to each room card in the slider
- The tooltip should appear after a short delay and display:
  - Room type and capacity
  - Key amenities (e.g., "Private Bathroom", "Air Conditioning")
  - Price per month
  - "View Details" link
- Tooltip should be responsive and work on touch devices

### 5. Room Details Modal
- Create a detailed room information modal accessible from the slider or view all rooms modal
- Modal should include:
  - Large image slider with multiple photos
  - Full room description
  - Complete amenities list
  - Room specifications (size, bed type, etc.)
  - Price details
  - "Inquire" button to start the inquiry process

## Implementation Steps

### Component Updates

1. **AvailableRoomsSection.tsx**
   - Modify button text from "Reserve" to "Inquire"
   - Add arrow navigation for the slider
   - Implement "View All Rooms" button logic
   - Add hover tooltip functionality
   - Create room details modal

2. **ListingDetailsClient.tsx**
   - Update any references to reservation in the context of rooms
   - Ensure the new modal works with the existing state management

3. **New Components to Create**
   - `RoomTooltip.tsx`: Reusable tooltip component for room cards
   - `RoomDetailsModal.tsx`: Modal for displaying detailed room information
   - `AllRoomsModal.tsx`: Modal for displaying all rooms in a grid layout

## Technical Considerations

### Responsive Design
- For mobile devices: Keep horizontal slider but adjust spacing and card sizes
- For tablets/desktops: Use 2-3 column grid for view all rooms modal

### Performance Optimization
- Lazy load images for slider rooms
- Implement virtualization for large number of rooms
- Cache room data for fast access

### Accessibility
- Ensure tooltips are accessible to screen readers
- Implement keyboard navigation for the slider and modals
- Provide ARIA labels and descriptions

## Benefits of the Redesign

1. **Clearer Communication**: Users understand they're sending an inquiry, not booking directly
2. **Improved User Experience**: Better navigation and preview options
3. **Scalability**: Handles large numbers of rooms effectively
4. **Consistency**: Aligns with the boarding house model where landlord approval is required

## File Structure

```
src/
├── components/
│   └── listings/
│       └── detail/
│           ├── AvailableRoomsSection.tsx (updated)
│           ├── RoomTooltip.tsx (new)
│           ├── RoomDetailsModal.tsx (new)
│           └── AllRoomsModal.tsx (new)
└── docs/
    └── reservation/
        └── room-section-redesign.md (this file)
```

## Related Documentation

- [PRD.md](../features/PRD.md) - Product Requirements Document
- [TASK-ANALYSIS.md](../reference/TASK-ANALYSIS.md) - Task Analysis Forms
- [INPUT-PROCESS-OUTPUT-DOCUMENTATION.md](../reference/INPUT-PROCESS-OUTPUT-DOCUMENTATION.md) - Input Process Output Documentation

## Next Steps

1. Review and approve this redesign plan
2. Create and implement the new components
3. Test the redesigned room section with various scenarios
4. Gather user feedback and make improvements
5. Document the final implementation

# Inquiry Form Design

## Overview

The inquiry form is a key component of the BoardTAU system, allowing potential tenants to send inquiries about specific rooms to landlords. The form is designed to gather essential information while providing a seamless user experience.

## Current Implementation

The current inquiry form is implemented as a modal (`InquiryModal.tsx`) with the following fields:
- Move-in Date
- Stay Duration
- Number of Occupants
- Role (Student/Staff/Other)
- Pets (Yes/No)
- Smoking (Yes/No)
- Contact Method
- Message to Owner

## Issues with Current Design

1. **Terminology**: Uses "Reserve" language instead of "Inquire"
2. **Complexity**: Includes unnecessary fields like stay duration and total price calculation
3. **Flow**: Implies immediate reservation rather than inquiry
4. **Lack of Validation**: No mandatory fields for identity verification

## Redesign Goals

1. **Simplify**: Focus on essential information for initial inquiry
2. **Clarify**: Use inquiry-focused terminology
3. **Improve**: Enhance user experience and flow
4. **Secure**: Add mandatory fields for identity verification

## New Inquiry Form Design

### Modal Header
```
┌───────────────────────────────────────────────────┐
│  X  Send Inquiry                                  │
└───────────────────────────────────────────────────┘
```
- **Title**: "Send Inquiry"
- **Subtitle**: "Send an inquiry to the landlord about this room"

### Main Content (Single Page Layout)

```
┌───────────────────────┬───────────────────────────────────────────┐
│                       │  [Room Image]                            │
│  1. Payment Method    │  Room Name: Solo Room with Private       │
│  *Required            │  Bathroom                                │
│  [ ] Credit or debit  │  Price: ₱5,000/month                       │
│  card (Stripe)        │                                           │
│  [x] GCash            │  Room Type: Solo Room                     │
│  [ ] Maya             │  Capacity: 1 person                        │
│                       │                                           │
│                       │  Available: Yes                           │
│                       │  Last Updated: Today                      │
└───────────────────────┴───────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  2. Stay Details                                                │
│  *All fields required                                           │
│  [Check-in Date Picker]  [Check-out Date Picker]                │
│  Number of occupants: [1] [+] [-]                               │
│  Role: [Student ▾]  [Staff ▾]  [Faculty ▾]  [Other ▾]            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  3. Write a message to the host                                   │
│  *Required                                                      │
│  [Text Area]                                                     │
│  (Tell the host a little about yourself)                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  4. Add a profile photo                                         │
│  *Required                                                      │
│  [Add Photo Button]                                             │
│  (Help hosts recognize you)                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  5. Attach ID                                                   │
│  *Required                                                    │
│  [Add Photo Button]                                             │
│  (Show your ID based on role:)                                  │
│  - Student: Certificate of Registration (COR)                   │
│  - Staff: Staff ID Card                                          │
│  - Faculty: Faculty ID Card                                     │
│  - Other: Valid Government ID                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  6. Review your request                                         │
│  [Review Button]                                                │
│  (Check all details before sending)                             │
│                                                                 │
│  [Send Inquiry]  [Cancel]                                       │
│                                                                 │
│  By sending this inquiry, you agree to our                      │
│  Terms of Service and Privacy Policy.                           │
└─────────────────────────────────────────────────────────────────┘
```

## Key Improvements

### 1. Single Page Layout
- All fields visible on one page, no pagination
- Sidebar with room details for quick reference
- Similar to Airbnb's booking flow

### 2. Mandatory Fields for Security
- **Profile Photo**: Required for identity verification
- **ID Attachment**: Conditional required field based on user role
  - Student: Certificate of Registration (COR)
  - Staff: Staff ID Card
  - Faculty: Faculty ID Card
  - Other: Valid Government ID

### 3. Payment Method First
- Payment method selection as first step
- Options: Stripe (credit/debit card), GCash, Maya
- Note: Payment won't be processed until inquiry is approved

### 4. Terminology Changes
- Button text changed from "Confirm Reservation" to "Send Inquiry"
- Modal title changed from "Reserve Room" to "Send Inquiry"
- Success message updated to reflect inquiry process

### 5. Enhanced User Experience
- Clear step indicators with numbering
- Real-time validation for required fields
- Error messages for invalid inputs
- Disabled submit button until all required fields are filled
- Sidebar with room details for quick reference

### 6. Accessibility
- Keyboard navigation support
- Screen reader compatibility
- ARIA labels and descriptions

## Implementation Details

### Component File: InquiryModal.tsx
- Location: `/components/modals/InquiryModal.tsx`
- Changes needed:
  - Update all text content
  - Remove stay duration and price calculation logic
  - Modify success state
  - Add step indicators

### Form Submission
- API Endpoint: `/api/inquiries` (POST)
- Request Body:
  ```json
  {
    "listingId": "string",
    "roomId": "string",
    "moveInDate": "string",
    "occupantsCount": "number",
    "role": "string",
    "hasPets": "boolean",
    "smokes": "boolean",
    "contactMethod": "string",
    "message": "string"
  }
  ```
- Response: Inquiry object with status "PENDING"

## Related Components

- `ListingDetailsClient.tsx`: Will need to update the API call from `/api/reservations/direct` to `/api/inquiries`
- `AvailableRoomsSection.tsx`: Will need to update button text from "Reserve" to "Inquire"
- `RoomDetailsModal.tsx`: New component that will include the inquiry form

## Benefits of the Redesign

1. **Clearer Communication**: Users understand they're sending an inquiry, not booking directly
2. **Simpler Process**: Focuses on essential information for initial contact
3. **Better User Experience**: More intuitive and streamlined flow
4. **Consistent Terminology**: All UI elements reflect the inquiry-first approach

## File Structure

```
src/
├── components/
│   └── modals/
│       └── InquiryModal.tsx (updated)
└── docs/
    └── reservation/
        └── inquiry-form-design.md (this file)
```

## Related Documentation

- [PRD.md](../features/PRD.md) - Product Requirements Document
- [TASK-ANALYSIS.md](../reference/TASK-ANALYSIS.md) - Task Analysis Forms
- [INPUT-PROCESS-OUTPUT-DOCUMENTATION.md](../reference/INPUT-PROCESS-OUTPUT-DOCUMENTATION.md) - Input Process Output Documentation
- [room-section-redesign.md](room-section-redesign.md) - Room Section Redesign

## Next Steps

1. Review and approve this inquiry form design
2. Update the InquiryModal.tsx component
3. Modify the ListingDetailsClient.tsx to use the new API endpoint
4. Test the inquiry form functionality
5. Gather user feedback and make improvements
6. Document the final implementation

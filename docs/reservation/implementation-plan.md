# Reservation and Inquiry Flow Implementation Plan

## Overview

This comprehensive plan outlines the complete implementation of the redesigned inquiry and reservation flow for BoardTAU. The changes transition from the current direct reservation system to an inquiry-first approach, providing users with better transparency, control, and communication throughout the booking process.

## Current Issues

1. **Direct Reservation Confusion**: Users are presented with "Reserve" buttons that directly create reservations instead of inquiries
2. **Lack of Inquiry Tracking**: No dedicated page for tracking inquiry statuses
3. **Incomplete Reservation Flow**: Missing payment integration and reservation management features
4. **Terminology Inconsistencies**: Mixing of inquiry and reservation terminology
5. **Poor Communication**: Users have limited visibility into the status of their bookings

## Design Documents (Aligned with PRD)

1. **Room Section Redesign**: `/docs/reservation/room-section-redesign.md`
2. **Rooms Modal Design**: `/docs/reservation/rooms-modal-design.md`
3. **Inquiry Form Design**: `/docs/reservation/inquiry-form-design.md`
4. **Reservation Process Design**: `/docs/reservation/reservation-process-design.md`
5. **My Inquiries Page Design**: `/docs/reservation/my-inquiries-page-design.md`
6. **My Reservations Page Design**: `/docs/reservation/my-reservations-page-design.md`

## Implementation Phases

### Phase 1: Inquiry First Transition (High Priority)
- Update UI text in all components
- Modify API call in ListingDetailsClient.tsx
- Update InquiryModal.tsx content and logic

### Phase 2: Room Section Enhancement (High Priority)
- Add room section redesign to listing page
- Create AllRoomsModal.tsx
- Create RoomDetailsModal.tsx
- Update AvailableRoomsSection.tsx

### Phase 3: Inquiry Management (High Priority)
- Create MyInquiriesPage.tsx
- Create InquiryCard.tsx and InquiryDetailsModal.tsx
- Implement getInquiries service
- Create inquiries API endpoint
- Update Prisma schema to include inquiry statuses

### Phase 4: Reservation Management (High Priority)
- Create MyReservationsPage.tsx
- Create ReservationCard.tsx and ReservationDetailsModal.tsx
- Create PaymentModal.tsx for payment integration
- Implement getReservations service
- Create reservations API endpoints

### Phase 5: Email Notifications (High Priority)
- Implement email notification system for inquiry status changes
- Create email templates for inquiry submission, approval, rejection
- Create email templates for reservation confirmation and payment reminders

### Phase 6: Payment Integration (High Priority)
- Implement Stripe card payment
- Create placeholders for GCash and Maya payments (for future implementation)
- Test payment processing

### Phase 7: Landlord Dashboard Updates (Medium Priority)
- Update LandlordInquiriesClient.tsx to handle the new flow
- Update LandlordReservationsClient.tsx to handle the new flow
- Add inquiry management features to landlord dashboard

### Phase 8: Testing & Optimization (All Priorities)
- Test the flow with both solo and bedspace rooms
- Conduct user testing
- Optimize for performance
- Ensure consistency across all pages
- Implement Jest unit tests for key components and services
- Implement React testing library tests for UI components

## Detailed Implementation Tasks

### Phase 1: Inquiry First Transition

#### Task 1: Update UI Text in All Components
- **File**: `components/listings/detail/AvailableRoomsSection.tsx`
- **Changes**:
  - Replace all instances of "Reserve" with "Inquire"
  - Update button text in both user and guest views
- **Expected Outcome**: Button text updated across all room cards

#### Task 2: Modify API Call in ListingDetailsClient.tsx
- **File**: `components/listings/detail/ListingDetailsClient.tsx`
- **Changes**:
  - Update API endpoint from `/api/reservations/direct` to `/api/inquiries`
  - Modify the `handleInquiry` function to handle inquiry creation
  - Update success and error messages to reference inquiries instead of reservations
- **Expected Outcome**: Inquiries are now sent to the correct API endpoint

#### Task 3: Update InquiryModal.tsx Content and Logic
- **File**: `components/modals/InquiryModal.tsx`
- **Changes**:
  - Update modal title from "Reserve Room" to "Inquire About Room"
  - Update step 1 title from "Reservation Details" to "Inquiry Details"
  - Update confirmation button from "Confirm Reservation" to "Send Inquiry"
  - Update success state message to reference inquiry submission
  - Update redirect from `/reservations` to `/inquiries`
- **Expected Outcome**: Inquiry modal now reflects the new design

### Phase 2: Room Section Enhancement

#### Task 4: Create AllRoomsModal.tsx
- **File**: `components/available-rooms/AllRoomsModal.tsx`
- **Changes**:
  - Create a new modal component for viewing all rooms
  - Implement room filtering and sorting
  - Design responsive room grid
  - Add room card components
- **Expected Outcome**: Users can view all rooms in a single modal

#### Task 5: Create RoomDetailsModal.tsx
- **File**: `components/available-rooms/RoomDetailsModal.tsx`
- **Changes**:
  - Create a new modal component for detailed room information
  - Implement image slider
  - Display comprehensive room details
  - Add "Inquire" button functionality
- **Expected Outcome**: Users can view detailed information about each room

#### Task 6: Update AvailableRoomsSection.tsx
- **File**: `components/listings/detail/AvailableRoomsSection.tsx`
- **Changes**:
  - Add "View All Rooms" button functionality
  - Implement room section redesign
  - Add hover tooltip functionality
- **Expected Outcome**: Enhanced room section with improved navigation and preview options

### Phase 3: Inquiry Management

#### Task 7: Create MyInquiriesPage.tsx
- **File**: `app/inquiries/page.tsx`
- **Changes**:
  - Create the My Inquiries page with filtering and search functionality
  - Display inquiries in card format with status badges
  - Implement empty state
- **Expected Outcome**: Users can view and manage all their inquiries

#### Task 8: Create Inquiry Components
- **Files**: `components/inquiries/InquiryCard.tsx` and `components/inquiries/InquiryDetailsModal.tsx`
- **Changes**:
  - Create reusable card component for displaying inquiry information
  - Create modal component for viewing inquiry details
- **Expected Outcome**: Consistent inquiry display across the application

#### Task 9: Implement getInquiries Service
- **File**: `services/user/inquiries.ts`
- **Changes**:
  - Create query function to fetch inquiries for current user
  - Add support for filtering, searching, and sorting
  - Implement pagination
- **Expected Outcome**: Backend support for inquiry management

#### Task 10: Create Inquiries API Endpoint
- **File**: `app/api/inquiries/route.ts`
- **Changes**:
  - Create API endpoint for creating and fetching inquiries
  - Implement CRUD operations for inquiries
  - Add authentication and authorization checks
- **Expected Outcome**: Frontend integration for inquiry management

#### Task 11: Update Prisma Schema for Inquiries
- **File**: `lib/prisma/schema.prisma`
- **Changes**:
  - Update Inquiry model with status field (PENDING, APPROVED, REJECTED, CANCELLED)
  - Add fields for inquiry details (move-in date, stay duration, etc.)
- **Expected Outcome**: Database schema supports the new inquiry flow

### Phase 4: Reservation Management

#### Task 12: Create MyReservationsPage.tsx
- **File**: `app/reservations/page.tsx`
- **Changes**:
  - Create the My Reservations page with filtering and search functionality
  - Display reservations in card format with status badges
  - Add payment button for pending payment reservations
  - Implement empty state
- **Expected Outcome**: Users can view and manage all their reservations

#### Task 13: Create Reservation Components
- **Files**: `components/reservations/ReservationCard.tsx`, `components/reservations/ReservationDetailsModal.tsx`, and `components/reservations/PaymentModal.tsx`
- **Changes**:
  - Create reusable card component for displaying reservation information
  - Create modal component for viewing reservation details
  - Create modal component for completing payments
- **Expected Outcome**: Consistent reservation display across the application

#### Task 14: Implement getReservations Service
- **File**: `services/user/reservations.ts`
- **Changes**:
  - Update query function to fetch reservations for current user
  - Add support for filtering, searching, and sorting
  - Implement pagination
- **Expected Outcome**: Backend support for reservation management

#### Task 15: Create Reservations API Endpoints
- **Files**: `app/api/reservations/route.ts` and `app/api/reservations/[id]/payment/route.ts`
- **Changes**:
  - Create API endpoint for creating and fetching reservations
  - Create API endpoint for payment processing
  - Implement CRUD operations for reservations
  - Add authentication and authorization checks
- **Expected Outcome**: Frontend integration for reservation and payment management

### Phase 5: Email Notifications

#### Task 16: Implement Email Notification System
- **File**: `services/email/email.service.ts`
- **Changes**:
  - Create email service for sending notifications
  - Implement template system for dynamic content
- **Expected Outcome**: Backend support for email notifications

#### Task 17: Create Email Templates
- **Files**: `services/email/templates/inquiry-submitted.tsx`, `services/email/templates/inquiry-approved.tsx`, `services/email/templates/inquiry-rejected.tsx`, `services/email/templates/reservation-created.tsx`, and `services/email/templates/payment-reminder.tsx`
- **Changes**:
  - Create email templates for all key events
  - Add dynamic content support
- **Expected Outcome**: Professional email notifications for users

### Phase 6: Payment Integration

#### Task 18: Implement Stripe Card Payment
- **File**: `services/payment/stripe.ts`
- **Changes**:
  - Implement Stripe integration for card payments
  - Create payment request and verification functions
- **Expected Outcome**: Stripe card payment processing

#### Task 19: Create Placeholders for GCash and Maya Payments
- **File**: `components/reservations/PaymentModal.tsx`
- **Changes**:
  - Add disabled buttons for GCash and Maya payments
  - Show "Coming Soon" message for these payment methods
- **Expected Outcome**: Users can see that these payment methods will be available in the future

#### Task 20: Test Payment Processing
- **File**: `app/api/reservations/[id]/payment/route.ts`
- **Changes**:
  - Test Stripe payment method in test mode
  - Verify payment status updates
  - Handle payment failures
- **Expected Outcome**: Working Stripe payment integration

### Phase 7: Landlord Dashboard Updates

#### Task 22: Update LandlordInquiriesClient.tsx
- **File**: `app/landlord/components/pages/inquiries/LandlordInquiriesClient.tsx`
- **Changes**:
  - Update to handle the new inquiry statuses
  - Add functionality to approve/reject inquiries
  - Improve inquiry listing and filtering
- **Expected Outcome**: Landlord can manage inquiries from their dashboard

#### Task 23: Update LandlordReservationsClient.tsx
- **File**: `app/landlord/components/pages/reservations/LandlordReservationsClient.tsx`
- **Changes**:
  - Update to handle the new reservation statuses
  - Add functionality to view and manage reservations
  - Improve reservation listing and filtering
- **Expected Outcome**: Landlord can manage reservations from their dashboard

### Phase 8: Testing & Optimization

#### Task 24: Test the Flow with Both Solo and Bedspace Rooms
- **Files**: All reservation-related files
- **Changes**:
  - Test the entire flow with different room types
  - Verify that bedspace rooms handle capacity correctly
  - Check that solo rooms display proper amenities
- **Expected Outcome**: Flow works correctly for all room types

#### Task 25: Conduct User Testing
- **Files**: All reservation-related files
- **Changes**:
  - Gather feedback from users
  - Identify usability issues
  - Make improvements based on feedback
- **Expected Outcome**: Improved user experience

#### Task 26: Optimize for Performance
- **Files**: All reservation-related files
- **Changes**:
  - Optimize image loading
  - Improve API response times
  - Reduce unnecessary re-renders
- **Expected Outcome**: Fast and efficient application

#### Task 27: Ensure Consistency Across All Pages
- **Files**: All reservation-related files
- **Changes**:
  - Verify that terminology is consistent throughout
  - Check that all links and buttons work correctly
  - Ensure responsive design on all devices
- **Expected Outcome**: Consistent and professional appearance

#### Task 28: Implement Jest Unit Tests
- **Files**: Services and utility files
- **Changes**:
  - Create unit tests for getInquiries service
  - Create unit tests for getReservations service
  - Create unit tests for payment processing
- **Expected Outcome**: 80% test coverage for backend services

#### Task 29: Implement React Testing Library Tests
- **Files**: React components
- **Changes**:
  - Create tests for ListingDetailsClient.tsx
  - Create tests for AvailableRoomsSection.tsx
  - Create tests for InquiryModal.tsx
- **Expected Outcome**: Tests for all major UI components

## Timeline

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1 | 3 tasks | 1-2 days |
| Phase 2 | 3 tasks | 2-3 days |
| Phase 3 | 6 tasks | 3-4 days |
| Phase 4 | 5 tasks | 3-4 days |
| Phase 5 | 2 tasks | 1-2 days |
| Phase 6 | 3 tasks | 2-3 days |
| Phase 7 | 2 tasks | 1-2 days |
| Phase 8 | 6 tasks | 2-3 days |

**Total Estimated Time**: 17-25 days

## Key Changes to Existing Flow

### 1. Inquiry First Approach
- Users now send inquiries instead of direct reservations
- Inquiries go through approval process before reservation is created
- Users can track inquiry status in "My Inquiries" page

### 2. Enhanced Reservation Management
- Separate "My Inquiries" and "My Reservations" pages
- Clear status indicators and action buttons
- Payment integration for pending payment reservations

### 3. Improved User Communication
- Email notifications for all key events
- Clear status badges and timelines
- Detailed inquiry and reservation history

### 4. Payment Integration
- Stripe card payment integration
- Placeholders for future GCash and Maya payments
- Secure payment processing
- Payment reminders and status updates

## Success Criteria

1. **User Experience**: Users can easily send inquiries, track status, and manage reservations
2. **Functionality**: All features work correctly across all room types
3. **Performance**: Application responds quickly and efficiently
4. **Consistency**: UI and terminology are consistent throughout
5. **Security**: Payment processing is secure and reliable

## Risk Assessment

### High Risks
- **Payment Integration**: Potential issues with third-party payment gateways
- **Email Delivery**: Ensuring email notifications reach users reliably
- **Data Integrity**: Maintaining consistency between inquiries and reservations

### Mitigation Strategies
- Thorough testing of payment methods in test mode
- Implementing email deliverability monitoring
- Adding validation and error handling for data operations

## Post-Implementation Monitoring

1. **Analytics**: Track user behavior and flow completion rates
2. **Bug Reports**: Monitor for any issues reported by users
3. **Performance**: Monitor API response times and application speed
4. **Feedback**: Gather user feedback to identify areas for improvement

## Conclusion

This implementation plan provides a comprehensive roadmap for transitioning BoardTAU from a direct reservation system to an inquiry-first approach. By following this plan, we will create a more transparent, user-friendly, and efficient booking process for both tenants and landlords.

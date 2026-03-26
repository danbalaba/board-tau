# Reservation and Inquiry Flow Testing Plan

## Overview

This document outlines a comprehensive testing plan for the BoardTAU reservation and inquiry flow. It covers both manual testing scenarios and automated testing using Jest and React Testing Library. The goal is to ensure the quality, reliability, and user experience of the redesigned flow.

## Testing Objectives

1. Validate the entire inquiry and reservation flow works correctly
2. Verify all UI components are functioning as intended
3. Test edge cases and error scenarios
4. Ensure the flow works for both solo rooms and bedspace rooms
5. Validate payment processing functionality
6. Ensure consistency across all pages and devices

## Test Coverage Areas

1. **Inquiry First Transition**
2. **Room Section Enhancement**
3. **Inquiry Management**
4. **Reservation Management**
5. **Email Notifications**
6. **Payment Integration**
7. **Landlord Dashboard Updates**
8. **Responsive Design**

## Manual Testing Scenarios

### 1. Inquiry First Transition

#### Scenario 1: Sending an Inquiry (User Not Logged In)
- **Steps**:
  1. Navigate to a listing page
  2. Click "Inquire" on a room
  3. Attempt to send an inquiry without logging in
- **Expected Result**:
  - User is prompted to log in
  - Inquiry form is not submitted

#### Scenario 2: Sending an Inquiry (User Logged In)
- **Steps**:
  1. Navigate to a listing page
  2. Click "Inquire" on a room
  3. Fill out the inquiry form
  4. Submit the inquiry
- **Expected Result**:
  - Inquiry is successfully sent
  - User is redirected to My Inquiries page
  - Success message is displayed
  - Email notification is received

#### Scenario 3: Inquiry Modal Validation
- **Steps**:
  1. Open inquiry modal
  2. Attempt to submit without filling required fields
  3. Fill out all required fields
  4. Submit the inquiry
- **Expected Result**:
  - Form validation messages are displayed
  - Form is submitted successfully

### 2. Room Section Enhancement

#### Scenario 4: Room Slider Navigation
- **Steps**:
  1. Navigate to a listing with multiple rooms
  2. Use left/right arrows to navigate through rooms
  3. Verify room cards are displayed correctly
- **Expected Result**:
  - Slider navigation works smoothly
  - All rooms are accessible
  - Room cards are displayed with correct information

#### Scenario 5: View All Rooms Modal
- **Steps**:
  1. Navigate to a listing with more than 3 rooms
  2. Click "View All Rooms" button
  3. Verify modal displays all rooms in grid format
  4. Click "Inquire" on a room in the modal
- **Expected Result**:
  - Modal opens with all rooms
  - Room details are correct
  - "Inquire" button on room cards in modal works

#### Scenario 6: Room Details Modal
- **Steps**:
  1. Open Room Details modal from slider or view all rooms modal
  2. Verify all room details are displayed correctly
  3. Verify image slider functionality
  4. Click "Inquire" button
- **Expected Result**:
  - All room details are displayed correctly
  - Image slider works properly
  - Inquire button opens the inquiry modal

### 3. Inquiry Management

#### Scenario 7: My Inquiries Page
- **Steps**:
  1. Navigate to My Inquiries page
  2. Verify inquiries are displayed with status badges
  3. Test filtering and search functionality
  4. Click "View Details" on an inquiry
  5. Click "Cancel" on a pending inquiry
- **Expected Result**:
  - Inquiries are displayed with correct statuses
  - Filtering and search work properly
  - Inquiry details modal opens with complete information
  - Inquiry can be cancelled successfully

#### Scenario 8: Inquiry Status Updates
- **Steps**:
  1. As a landlord, approve or reject an inquiry
  2. As a user, check if the inquiry status is updated
  3. Verify email notification for status change
- **Expected Result**:
  - Inquiry status is updated correctly
  - Email notification is received with new status

### 4. Reservation Management

#### Scenario 9: My Reservations Page
- **Steps**:
  1. Navigate to My Reservations page
  2. Verify reservations are displayed with status badges
  3. Test filtering and search functionality
  4. Click "View Details" on a reservation
  5. Click "Pay Now" on a pending payment reservation
- **Expected Result**:
  - Reservations are displayed with correct statuses
  - Filtering and search work properly
  - Reservation details modal opens with complete information
  - Payment modal opens when "Pay Now" is clicked

#### Scenario 10: Reservation Cancellation
- **Steps**:
  1. Navigate to My Reservations page
  2. Click "Cancel" on a reservation
  3. Confirm cancellation
- **Expected Result**:
  - Reservation is cancelled successfully
  - Status is updated to "Cancelled"
  - Email notification is received

### 5. Payment Integration

#### Scenario 11: Stripe Payment Processing
- **Steps**:
  1. Navigate to a reservation with "Pending Payment" status
  2. Click "Pay Now" button
  3. Select Stripe payment method
  4. Enter test card details (4242 4242 4242 4242)
  5. Complete payment
- **Expected Result**:
  - Payment is processed successfully
  - Reservation status is updated to "Reserved"
  - Email notification is received
  - Payment details are saved

#### Scenario 12: Payment Failure Handling
- **Steps**:
  1. Navigate to a reservation with "Pending Payment" status
  2. Click "Pay Now" button
  3. Select Stripe payment method
  4. Enter invalid card details (4000 0000 0000 9995)
  5. Attempt to complete payment
- **Expected Result**:
  - Payment is declined
  - Error message is displayed
  - Reservation status remains "Pending Payment"

#### Scenario 13: GCash and Maya Placeholders
- **Steps**:
  1. Navigate to a reservation with "Pending Payment" status
  2. Click "Pay Now" button
  3. Verify GCash and Maya payment options are disabled
  4. Verify "Coming Soon" message is displayed
- **Expected Result**:
  - GCash and Maya payment options are disabled
  - "Coming Soon" message is displayed for these payment methods

### 6. Landlord Dashboard Updates

#### Scenario 14: Landlord Inquiry Management
- **Steps**:
  1. Log in as a landlord
  2. Navigate to Landlord Dashboard > Inquiries
  3. Verify all inquiries are displayed
  4. Approve or reject an inquiry
- **Expected Result**:
  - All inquiries are displayed with correct information
  - Inquiry can be approved or rejected successfully
  - Status update is reflected in the user's My Inquiries page

#### Scenario 15: Landlord Reservation Management
- **Steps**:
  1. Log in as a landlord
  2. Navigate to Landlord Dashboard > Reservations
  3. Verify all reservations are displayed
  4. View reservation details
- **Expected Result**:
  - All reservations are displayed with correct information
  - Reservation details can be viewed

### 7. Responsive Design

#### Scenario 16: Mobile Responsiveness
- **Steps**:
  1. Test the entire flow on a mobile device (or mobile viewport)
  2. Verify all components are properly sized and spaced
  3. Test navigation and interactive elements
- **Expected Result**:
  - All components are responsive and readable
  - Interactive elements are easily clickable
  - Flow works correctly on mobile

#### Scenario 17: Tablet Responsiveness
- **Steps**:
  1. Test the entire flow on a tablet device (or tablet viewport)
  2. Verify all components are properly sized and spaced
  3. Test navigation and interactive elements
- **Expected Result**:
  - All components are responsive and readable
  - Interactive elements are easily clickable
  - Flow works correctly on tablet

#### Scenario 18: Desktop Responsiveness
- **Steps**:
  1. Test the entire flow on a desktop device
  2. Verify all components are properly sized and spaced
  3. Test navigation and interactive elements
- **Expected Result**:
  - All components are responsive and readable
  - Interactive elements are easily clickable
  - Flow works correctly on desktop

## Automated Testing Plan

### 1. Jest Unit Tests

#### Services and Utilities

**File**: `services/user/inquiries.test.ts`
```typescript
// Test getInquiries service
test('should retrieve inquiries for current user', async () => {
  // Test implementation
});

test('should filter inquiries by status', async () => {
  // Test implementation
});

test('should search inquiries by room name', async () => {
  // Test implementation
});
```

**File**: `services/user/reservations.test.ts`
```typescript
// Test getReservations service
test('should retrieve reservations for current user', async () => {
  // Test implementation
});

test('should filter reservations by status', async () => {
  // Test implementation
});

test('should search reservations by room name', async () => {
  // Test implementation
});
```

**File**: `services/payment/stripe.test.ts`
```typescript
// Test Stripe payment integration
test('should create a payment intent', async () => {
  // Test implementation
});

test('should confirm a payment', async () => {
  // Test implementation
});

test('should handle payment errors', async () => {
  // Test implementation
});
```

### 2. React Testing Library Tests

#### UI Components

**File**: `components/listings/detail/ListingDetailsClient.test.tsx`
```typescript
// Test ListingDetailsClient.tsx
test('should display listing details', () => {
  // Test implementation
});

test('should render AvailableRoomsSection', () => {
  // Test implementation
});

test('should handle inquiry submission', () => {
  // Test implementation
});
```

**File**: `components/listings/detail/AvailableRoomsSection.test.tsx`
```typescript
// Test AvailableRoomsSection.tsx
test('should display room cards', () => {
  // Test implementation
});

test('should render View All Rooms button when there are more than 3 rooms', () => {
  // Test implementation
});

test('should open AllRoomsModal when View All Rooms button is clicked', () => {
  // Test implementation
});

test('should open RoomDetailsModal when View Details button is clicked', () => {
  // Test implementation
});
```

**File**: `components/modals/InquiryModal.test.tsx`
```typescript
// Test InquiryModal.tsx
test('should render inquiry form', () => {
  // Test implementation
});

test('should validate required fields', () => {
  // Test implementation
});

test('should submit inquiry when all fields are filled', () => {
  // Test implementation
});
```

**File**: `components/inquiries/InquiryCard.test.tsx`
```typescript
// Test InquiryCard.tsx
test('should display inquiry information', () => {
  // Test implementation
});

test('should display correct status badge', () => {
  // Test implementation
});

test('should handle View Details button click', () => {
  // Test implementation
});

test('should handle Cancel button click', () => {
  // Test implementation
});
```

**File**: `components/reservations/ReservationCard.test.tsx`
```typescript
// Test ReservationCard.tsx
test('should display reservation information', () => {
  // Test implementation
});

test('should display correct status badge', () => {
  // Test implementation
});

test('should handle View Details button click', () => {
  // Test implementation
});

test('should handle Pay Now button click', () => {
  // Test implementation
});

test('should handle Cancel button click', () => {
  // Test implementation
});
```

## Testing Environment Setup

### 1. Test Database
- Use a separate test database to avoid affecting production data
- Seed test database with sample data for testing purposes

### 2. Stripe Test Mode
- Use Stripe test environment for payment testing
- Use Stripe test card numbers for testing payment scenarios

### 3. Email Testing
- Use an email testing service like Mailtrap or Ethereal for testing email notifications
- Verify that emails are sent correctly for all key events

## Test Execution Plan

1. **Run all Jest unit tests** to verify backend services
2. **Run all React Testing Library tests** to verify UI components
3. **Execute manual testing scenarios** to validate the entire flow
4. **Test on different devices** to ensure responsive design
5. **Test edge cases and error scenarios** to ensure robustness

## Test Reports

- Generate test coverage reports using Jest
- Document all test results and any issues found
- Create bug reports for any issues that need to be fixed

## Post-Implementation Testing

- **Monitoring**: Monitor application logs and error tracking systems
- **User Testing**: Gather feedback from users and address any issues
- **Regression Testing**: Re-run tests after any changes to ensure no regression

## Success Criteria

1. **All automated tests pass**
2. **All manual testing scenarios are successfully executed**
3. **Flow works correctly for both solo and bedspace rooms**
4. **Payment integration works as expected**
5. **All components are responsive and accessible**
6. **Error handling is appropriate**

## Risk Mitigation

1. **Test Early and Often**: Run tests throughout development to catch issues early
2. **Prioritize High Risk Areas**: Focus testing on critical functionality like payment processing
3. **Cross-Browser Testing**: Test on different browsers to ensure compatibility
4. **Load Testing**: Test with large numbers of inquiries and reservations to ensure performance

## Conclusion

This testing plan covers all aspects of the reservation and inquiry flow, from basic functionality to edge cases and error scenarios. By following this plan, we will ensure that the redesigned flow is reliable, user-friendly, and meets all requirements.

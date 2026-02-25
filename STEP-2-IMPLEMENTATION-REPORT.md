# STEP 2 IMPLEMENTATION REPORT

## 1. New Components / Files

### LandlordReservationsClient.tsx
- **File Path**: `app/landlord/components/pages/reservations/LandlordReservationsClient.tsx`
- **Props**:
  - `reservations[]`: Array of reservation requests for the landlord's properties
- **Responsibilities**:
  - Displays all reservation requests in a responsive list format
  - Each request shows:
    - Listing image + title
    - Room name + price
    - User name + email
    - Move-in date + stay duration
    - Status badge (pending / approved / rejected)
    - Payment status badge (unpaid / paid)
  - Action buttons for landlords to:
    - View details
    - Approve reservation request
    - Reject reservation request
  - Status filtering functionality

### Landlord Reservations Page
- **File Path**: `app/landlord/reservations/page.tsx`
- **Responsibilities**:
  - Server component that fetches reservation requests for the current landlord
  - Passes data to LandlordReservationsClient.tsx for rendering

### Stripe Payment Service
- **File Path**: `services/payments/stripe.ts`
- **Functions**:
  - `createStripeCheckoutSession`: Creates a Stripe checkout session for reservation fee payment
  - `handleStripeWebhook`: Handles Stripe checkout session completion webhook
- **Responsibilities**:
  - Calculates total price based on room price and stay duration
  - Creates Stripe product and checkout session
  - Updates reservation request status on payment success
  - Locks the room/bedspace to prevent double booking
  - Creates a reservation record in the database

### Payments API Route
- **File Path**: `app/api/payments/checkout/route.ts`
- **Method**: POST
- **Responsibilities**:
  - Accepts inquiryId from frontend
  - Calls createStripeCheckoutSession to create a Stripe checkout session
  - Returns checkout session URL for frontend redirection

### Reservations API Route
- **File Path**: `app/api/reservations/route.ts`
- **Methods**:
  - POST: Creates a new reservation request (inquiry) with pending status
  - PUT: Updates reservation request status (approved / rejected)
  - GET: Returns all reservation requests for the current landlord
- **Responsibilities**:
  - Handles reservation request creation
  - Manages status updates with landlord authorization
  - Fetches reservation requests with pagination

## 2. Updated Components

### ListingDetailsClient.tsx
- **File Path**: `components/listings/detail/ListingDetailsClient.tsx`
- **Changes**:
  - Updated `handleInquiry` function to use `/api/reservations` instead of `/api/inquiries`
  - Changed success toast message from "Inquiry sent!" to "Reservation request sent!"
  - Updated error message from "Failed to send inquiry" to "Failed to send reservation request"

### LandlordSidebar.tsx
- **File Path**: `app/landlord/components/layout/LandlordSidebar.tsx`
- **Changes**:
  - Added "Reservations" menu item with FaCalendarCheck icon
  - Menu item points to `/landlord/reservations`

### Stripe Webhook
- **File Path**: `app/api/webhooks/stripe/route.ts`
- **Changes**:
  - Updated to use `handleStripeWebhook` from stripe payment service
  - Removed direct reservation creation logic
  - Now handles payment success, status update, and room locking

### Prisma Schema
- **File Path**: `prisma/schema.prisma`
- **Changes**:
  - Added `paymentStatus` field to Inquiry model with default "unpaid"
  - Updated Inquiry model to support reservation request functionality

## 3. API / Service Changes

### POST /api/reservations
- Accepts reservation details including listingId, roomId, moveInDate, stayDuration, etc.
- Creates a new Inquiry record with status "pending" and paymentStatus "unpaid"
- Requires authentication

### PUT /api/reservations?id={id}
- Updates reservation request status to "approved" or "rejected"
- Only accessible by the landlord of the listing
- Requires authentication

### GET /api/reservations
- Returns all reservation requests for the current landlord's properties
- Includes listing, room, and user details
- Requires authentication

### POST /api/payments/checkout
- Accepts inquiryId and creates a Stripe checkout session
- Returns checkout session URL for frontend redirection
- Requires authentication

### Stripe Checkout Integration
- Uses Stripe API to create checkout sessions
- Handles payment success via webhook
- Calculates total price based on room price and stay duration
- Locks room/bedspace after payment to prevent double booking

## 4. Database Changes

### ReservationRequest (Inquiry) Table Updates
- Added `paymentStatus` field: String, default: "unpaid"
- Updated status field to support "confirmed" status after payment
- Existing fields remain intact: id, listingId, roomId, userId, moveInDate, stayDuration, occupantsCount, role, hasPets, smokes, contactMethod, message, status, createdAt, updatedAt

## 5. Data Flow

```
User selects room on listing page
    ↓
ReservationRequestModal opens
    ↓
User fills reservation form and submits
    ↓
POST /api/reservations → creates Inquiry (status: pending, paymentStatus: unpaid)
    ↓
Landlord sees reservation in dashboard
    ↓
Landlord approves → PUT /api/reservations/[id]/status
    ↓
User gets approved notification → clicks "Pay Reservation Fee"
    ↓
POST /api/payments/checkout → creates Stripe checkout session
    ↓
User redirects to Stripe checkout
    ↓
Payment success → Stripe webhook triggers handleStripeWebhook
    ↓
Update inquiry: paymentStatus: paid, status: confirmed
    ↓
Update room: availableSlots -= 1, status = "full" if availableSlots ≤ 0
    ↓
Create Reservation record (status: confirmed, paymentStatus: paid)
```

## 6. Notes / Observations

- Step 2 reuses the existing Inquiry model for reservation requests
- Users can only pay after landlord approval
- Room is locked after payment to prevent double booking
- Payment integration uses Stripe Checkout for secure payment processing
- Landlord dashboard now includes a reservations page for managing requests
- The implementation maintains compatibility with Step 1 flow
- Status filtering is available in the landlord dashboard
- Error handling and loading states are implemented
- The reservation request form collects all necessary details including move-in date, stay duration, and personal information

## 7. Implementation Details

- **Payment Calculation**: Total price is calculated by multiplying the room's monthly price by the stay duration in months
- **Room Locking**: Available slots are decremented by 1 on payment success, and room status is set to "full" if all slots are taken
- **Reservation Confirmation**: After payment, the reservation request status is set to "confirmed" and a Reservation record is created
- **Security**: API routes are protected with authentication, and only the landlord of the listing can approve/reject reservations
- **Error Handling**: All API routes include error handling and return appropriate error messages

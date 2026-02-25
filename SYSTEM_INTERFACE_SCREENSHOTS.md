# SYSTEM INTERFACE SCREENSHOTS DOCUMENTATION

## A. WEB APPLICATION INTERFACES

### 1. Home Page
📸 Screenshot Placeholder: [Insert Screenshot Here]
**Description:**
- Displays boarding house listings with search and filter functionality
- Connected to GET /api/listings endpoint
- Search and filter implemented with categories, price range, and amenities
- Dynamic data from MongoDB database
- Responsive grid layout

### 2. Listing Details Page
📸 Screenshot Placeholder: [Insert Screenshot Here]
**Description:**
- Displays full property data including images, amenities, pricing, and rules
- Image gallery integrated with multiple photos
- Reservation button connected to CREATE /api/reservations endpoint
- Shows property reviews and ratings
- Map integration with property location

### 3. Landlord Dashboard
📸 Screenshot Placeholder: [Insert Screenshot Here]
**Description:**
- Displays landlord analytics (total listings, bookings, revenue)
- View properties with status (active, pending, rejected, flagged)
- Manage bookings (confirm/cancel) and inquiries
- View reviews and respond to them
- Manage tenant information
- Navigation to create new properties

### 4. Landlord Properties Page
📸 Screenshot Placeholder: [Insert Screenshot Here]
**Description:**
- List of all properties managed by the landlord
- Filter by property status
- Actions: Add property, edit property, delete property, view details
- Pagination for large property lists
- Status badges showing approval status

### 5. Create Property Page
📸 Screenshot Placeholder: [Insert Screenshot Here]
**Description:**
- Form with multiple sections: Basic Information, Property Details, Amenities, Images
- Form validation implemented
- Image upload functionality (EdgeStore integration)
- Connected to POST /api/landlord/properties endpoint
- Includes advanced filters and property preferences

### 6. Landlord Bookings Page
📸 Screenshot Placeholder: [Insert Screenshot Here]
**Description:**
- View all bookings with status and payment information
- Filter by status (pending/confirmed/cancelled) and payment status
- Actions: Confirm booking, cancel booking, view details
- Pagination support

### 7. Landlord Inquiries Page
📸 Screenshot Placeholder: [Insert Screenshot Here]
**Description:**
- View all inquiries from potential tenants
- Filter by status
- Respond to inquiries
- View inquiry details including tenant information

### 8. Landlord Reviews Page
📸 Screenshot Placeholder: [Insert Screenshot Here]
**Description:**
- View all reviews for properties
- Filter by status and rating
- Respond to reviews
- View review details

### 9. Landlord Tenants Page
📸 Screenshot Placeholder: [Insert Screenshot Here]
**Description:**
- View all tenants
- Filter by status (active, past)
- View tenant details and rental history
- Access tenant documents

## B. ADMIN PANEL INTERFACES

### 1. Admin Dashboard
📸 Screenshot Placeholder: [Insert Screenshot Here]
**Description:**
- Displays system analytics (total users, listings, bookings, revenue)
- Overview of pending applications and listings
- Analytics charts for user growth and property trends
- Quick navigation to main sections

### 2. Admin Users Page
📸 Screenshot Placeholder: [Insert Screenshot Here]
**Description:**
- Manage all system users
- Filter by role (admin/user/landlord) and status (active/inactive)
- Actions: Add user, edit user, delete user, view details
- Search functionality for users

### 3. Admin Listings Page
📸 Screenshot Placeholder: [Insert Screenshot Here]
**Description:**
- Manage all property listings
- Filter by status (pending/active/flagged/rejected)
- Actions: Approve listing, reject listing, flag listing
- View listing details and landlord information

### 4. Admin Host Applications Page
📸 Screenshot Placeholder: [Insert Screenshot Here]
**Description:**
- View all host/landlord applications
- Filter by status (pending/approved/rejected)
- Actions: Approve application, reject application, view details
- Detailed application review with business information, property details, and documents

### 5. Admin Reservations Page
📸 Screenshot Placeholder: [Insert Screenshot Here]
**Description:**
- Manage all reservations and inquiries
- Filter by status and date range
- View reservation details including tenant and property information

### 6. Admin Reviews Page
📸 Screenshot Placeholder: [Insert Screenshot Here]
**Description:**
- Manage all property reviews
- Filter by status (pending/approved/removed)
- Actions: Approve review, remove review
- View review details and user information

### 7. Admin Reports Page
📸 Screenshot Placeholder: [Insert Screenshot Here]
**Description:**
- System reports and analytics
- User activity reports
- Property performance reports
- Financial reports

### 8. Admin System Settings Page
📸 Screenshot Placeholder: [Insert Screenshot Here]
**Description:**
- System configuration and settings
- User roles and permissions management
- Payment gateway settings
- Email template configuration

## C. USER INTERFACES

### 1. Login/Signup Page
📸 Screenshot Placeholder: [Insert Screenshot Here]
**Description:**
- User authentication implemented with NextAuth
- Email/password login
- Social login options
- OTP verification for email confirmation
- Form validation included

### 2. User Dashboard
📸 Screenshot Placeholder: [Insert Screenshot Here]
**Description:**
- User profile management
- View favorite properties
- View reservation history
- Manage personal information

### 3. User Reservations Page
📸 Screenshot Placeholder: [Insert Screenshot Here]
**Description:**
- View all user's reservations and inquiries
- Filter by status
- View reservation details
- Cancel reservations

### 4. Favorites Page
📸 Screenshot Placeholder: [Insert Screenshot Here]
**Description:**
- View all favorite properties
- Remove properties from favorites
- Quick access to property details

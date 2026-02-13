# Task Analysis Forms

## Table 1.  End-User Task Analysis

### “BoardTAU: A Modernized and Interactive Web System for Boarding Houses Near Tarlac Agricultural University”

#### Perspective: Client / End-User (Student/Instructors/Faculties/Staffs)

| Task ID | Fundamental or Basic Task | Input | Output | Subtask (if any) | Exceptions (What can go wrong) |
|---------|---------------------------|-------|--------|------------------|--------------------------------|
| 1 | Access system homepage | URL request | Display list of available boarding houses | • Fetch active listings<br>• Load cached data<br>• Display Hero Section<br>• Show Categories | Server downtime, slow page load, network error |
| 2 | Browse boarding house listings | Scroll Home Page | Display Listing in a card format | • Pagination / infinite scroll<br>• Display category filters | No listings available, loading timeout |
| 3 | Search for boarding houses | Search query | Search results | • Parse search parameters<br>• Validate input<br>• Fetch matching listings | Invalid search query, boarding house not found |
| 4 | Apply advanced filter in search bar | Budget, amenities, room type, rules, and distance of boarding house in specific college | Filtered boarding house listing home page | • Combined filter logic<br>• Cached query retrieval<br>• Distance calculation from TAU | Invalid filter combination, no results found |
| 5 | View boarding house details | Listing selection | Detailed listing view | • Load images<br>• Display boarding house description<br>• Display amenities<br>• Show property location on map<br>• Display reviews and ratings | Image load failure, missing property data, map loading error |
| 6 | Add property to favorites | Heart button click | Property added to favorites | • Authentication check<br>• Save to user favorites page<br>• Update UI state | User not logged in, duplicate favorite, database error |
| 7 | Initiate inquiry/reservation | Inquiry button click | Display inquiry form | • Authentication check<br>• Load property and room details<br>• Display inquiry form | User not logged in, no available rooms |
| 8 | Register / Log in | User credentials | Authenticated session | • Credential validation<br>• Session creation<br>• Email verification | Invalid credentials, account not verified, registration error |
| 9 | Submit inquiry request | Inquiry form details | Inquiry record created | • Availability validation<br>• Save inquiry to database<br>• Notify landlord | Room already booked/full, invalid form data, submission error |
| 10 | View inquiry status | My Inquiries dashboard/page | Inquiry status overview | • Fetch user inquiries<br>• Display status updates | No inquiries found, database error |
| 11 | Receive inquiry acceptance notification | Landlord acceptance | Acceptance notification | • Display notification<br>• Show payment options (GCash/Maya/Card)<br>• Update inquiry status to "approved" | Notification not received, email delivery failure |
| 12 | Process digital payment | Payment details, selected method (GCash/Maya/Card) | Payment confirmation | • Payment gateway request<br>• Transaction validation<br>• Booking status update<br>• Boarding house listing room availability update status (full/1/4 occupied)<br>• Receipt generation | Payment failure, gateway timeout, invalid payment details |
| 13 | Receive booking confirmation | Successful payment transaction | Booking confirmation message (Email / In-app (toast) notification) | • Payment validation<br>• Inquiry status update to "confirmed"<br>• Notification dispatch (email & in-app)<br>• Send receipt | Payment successful but notification not received, email delivery failure |
| 14 | Submit review and rating | Rating, feedback | Stored review | • Content validation<br>• User authentication<br>• Update property rating<br>• Store review in database | Inappropriate content, duplicate review, submission error |
| 15 | View favorites | Favorites Page | Saved Favorite properties list | • Fetch favorite properties<br>• Display property details<br>• Remove from favorites | No favorites found, database error |
| 16 | Update user profile | Profile settings | Updated profile | • Save changes<br>• Validate input<br>• Update user record | Invalid profile data, save error |

---

## Table 2.  Landlord/Property Owner Task Analysis

### Perspective: Property Owner (Landlord)

| Task ID | Fundamental or Basic Task | Input | Output | Subtask (if any) | Exceptions (What can go wrong) |
|---------|---------------------------|-------|--------|------------------|--------------------------------|
| 1 | Access system homepage | URL request | Display homepage with "Become a Host" button | • Load homepage content<br>• Display hero section<br>• Show "Become a Host" button in header | Server downtime, slow page load, network error |
| 2 | Click "Become a Host" button | Button click | Redirect to landlord registration page | • Handle button click event<br>• Navigate to registration page<br>• Display registration form | Navigation error, button not responding |
| 3 | Complete landlord registration | Registration form details | Landlord account created (pending approval) | • Validate registration data<br>• Upload property owner verification documents<br>• Save to database<br>• Submit for admin approval | Invalid form data, document upload failure, registration error |
| 4 | Landlord login | User credentials | Authenticated landlord session with dashboard redirect | • Credential validation<br>• Role verification (detect landlord account)<br>• Automatic redirect to landlord<br>• Account activation | Invalid credentials, account not approved, login error, redirect failure |
| 5 | View landlord dashboard | Dashboard access (automatic redirect) | Landlord dashboard overview | • Fetch property statistics<br>• Display pending inquiries<br>• Show booking history<br>• Display property performance metrics<br>• Load recent reviews | Dashboard data not loading, database error |
| 6 | Create property listing | Property details, images | Listing created (pending for approval) | • Upload property images<br>• Validate listing data<br>• Save to database<br>• Submit for approval by admin | Image upload failure, invalid data, submission error |
| 7 | Edit property listing | Updated property details | Listing updated | • Validate changes<br>• Save to database<br>• Re-submit for approval | Update failure, invalid data, database error |
| 8 | Manage room availability | Room details availability | Room availability updated | • Update room information<br>• Save availability changes<br>• Update listing status | Availability not updated, database error |
| 9 | View inquiries | Inquiries dashboard/page | List of pending inquiries | • Fetch property inquiries<br>• Display inquiry details<br>• Sort/filter by date inquiries | No inquiries found, database error |
| 10 | Review inquiry details | Inquiry selection | Detailed inquiry view with payment information | • Load inquiry details<br>• Display tenant information<br>• Show room availability<br>• Review payment options and deposit requirements | Inquiry not found, missing payment information |
| 11 | Respond to inquiries | Approval/rejection decision | Inquiry status updated | • Update inquiry status<br>• Notify tenant<br>• Update room availability | Response not saved, notification failure, database error |
| 12 | View payment status | Payment status check | Current payment status overview | • Fetch payment information<br>• Display payment history<br>• Show deposit status<br>• Update booking status when payment confirmed | Payment information not found, database error |
| 13 | Manage boarding house listing images | Property images | Updated image gallery | • Upload new images<br>• Reorder images<br>• Delete images | Image upload failure, delete error, database error |
| 14 | Update boarding house listing room status | Boarding house listing status change | Boarding house listing status updated | • Activate/deactivate listing<br>• Update visibility<br>• Notify admin | Status update failure, database error |

---

## Table 3.  System Administrator Task Analysis

### Perspective: System Administrator

| Task ID | Fundamental or Basic Task | Input | Output | Subtask (if any) | Exceptions (What can go wrong) |
|---------|---------------------------|-------|--------|------------------|--------------------------------|
| 1 | Admin login | Admin credentials | Authenticated admin session | • Credential validation<br>• Role verification<br>• Session management | Invalid credentials, account locked, login error |
| 2 | User management | User data, role changes | Updated user information | • View user list<br>• Activate/deactivate users<br>• Change user roles<br>• Delete users | User not found, update failure, database error |
| 3 | Listing moderation | Listing review | Listing status updated | • Approve/reject listings<br>• Flag inappropriate listings<br>• View listing details | Listing not found, approval error, database error |
| 4 | Review moderation | Review content | Review status updated | • Approve/remove reviews<br>• Flag inappropriate reviews<br>• Update property ratings | Review not found, moderation error, database error |
| 5 | System monitoring | System logs | Activity overview | • View admin activity<br>• Track system performance<br>• Check for errors<br>• Generate system reports | Logs not available, monitoring error, report generation failure |
| 6 | Analytics and reporting | Report parameters | System reports | • Generate user reports<br>• Generate listing reports<br>• Export to CSV/PDF<br>• View performance charts | Report generation failure, invalid parameters, database error |
| 7 | System configuration | Settings form input | Updated system configuration | • Configure platform settings<br>• Manage payment gateway settings (GCash/Maya)<br>• Set email notification templates<br>• Configure platform fees and deposit requirements<br>• Update system parameters<br>• Manage content moderation rules | Configuration not saved, invalid settings, system error |

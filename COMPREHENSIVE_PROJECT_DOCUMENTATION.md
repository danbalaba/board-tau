# BoardTAU - Boarding House Rental Platform
## COMPREHENSIVE PROJECT DOCUMENTATION

### Project Overview
BoardTAU is a comprehensive boarding house rental platform designed to connect students and young professionals with affordable accommodation near academic institutions. The platform provides a seamless user experience with robust features for property search, booking, and management.

---

## 1. USER AUTHENTICATION & AUTHORIZATION

### 1.1 Authentication System
- **NextAuth Integration:** Complete authentication system using NextAuth
- **Email/Password Login:** Standard credentials-based authentication
- **Social Login:** OAuth integration (Google, Facebook, etc.)
- **OTP Verification:** Email-based OTP verification for account activation
- **Password Recovery:** Reset password functionality
- **Session Management:** Secure session handling with JWT tokens

### 1.2 User Roles & Permissions
#### 1.2.1 Admin Role
- Full system access
- User management
- Property moderation
- Application approval
- Review management
- System settings

#### 1.2.2 Landlord Role
- Property management (CRUD)
- Booking management
- Inquiry handling
- Review responses
- Tenant management
- Dashboard analytics

#### 1.2.3 User Role
- Property search and filter
- Favorites management
- Booking creation
- Review submission
- Profile management

### 1.3 Database Models
```prisma
model User {
  id                      String    @id @default(auto()) @map("_id") @db.ObjectId
  name                    String?
  email                   String    @unique
  emailVerified          DateTime?
  image                   String?
  password                String?
  favoriteIds             String[]  @default([]) @db.ObjectId
  role                    String    @default("user")
  isActive                Boolean   @default(true)
  deletedAt               DateTime?
  isVerifiedLandlord      Boolean   @default(false)
  landlordApprovedAt      DateTime?
  landlordVerificationDocs String?
  businessName            String?
  phoneNumber             String?
  lastLogin               DateTime?
}
```

---

## 2. PROPERTY MANAGEMENT (CRUD)

### 2.1 Create Property
#### API Endpoint: POST /api/landlord/properties
```typescript
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const result = await createProperty(data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

#### Frontend Component: LandlordCreatePropertyClient.tsx
- Multi-section form with validation
- Image upload (EdgeStore integration)
- Property details (rooms, bathrooms, amenities)
- Advanced filters configuration
- Map location selection
- Room management

### 2.2 Read Properties
#### API Endpoints:
- **Get All Listings:** GET /api/listings
- **Get Landlord Properties:** GET /api/landlord/properties
- **Get Listing Details:** GET /api/listings/[id]

#### Frontend Components:
- **ListingsGrid.tsx:** Property grid with search and filter
- **ListingCard.tsx:** Individual property card
- **LandlordPropertiesClient.tsx:** Landlord's properties list
- **AdminListingsClient.tsx:** Admin property management

### 2.3 Update Property
#### API Endpoint: PUT /api/landlord/properties?id=[propertyId]
```typescript
export async function PUT(request: NextRequest) {
  try {
    const propertyId = searchParams.get("id");
    const data = await request.json();
    const result = await updateProperty(propertyId, data);
    return NextResponse.json(result);
  }
}
```

### 2.4 Delete Property
#### API Endpoint: DELETE /api/landlord/properties?id=[propertyId]
```typescript
export async function DELETE(request: NextRequest) {
  try {
    const propertyId = searchParams.get("id");
    const result = await deleteProperty(propertyId);
    return NextResponse.json(result);
  }
}
```

### 2.5 Database Models
```prisma
model Listing {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  title         String
  description   String
  imageSrc      String
  images        ListingImage[]
  createdAt     DateTime @default(now())

  category      String[]     // multi-category for listing
  roomCount     Int
  bathroomCount Int
  userId        String   @db.ObjectId
  price         Int           // min price or base listing price
  country       String?
  latlng        Float[]
  region        String?
  amenities     String[]      // building-level amenities
  rating        Float?   @default(4.8)
  reviewCount   Int      @default(0)
  status        String   @default("pending") // pending, active, flagged, rejected

  // Rules / Preferences
  femaleOnly    Boolean? @default(false)
  maleOnly      Boolean? @default(false)
  visitorsAllowed Boolean? @default(true)
  petsAllowed   Boolean? @default(false)
  smokingAllowed Boolean? @default(false)
}
```

---

## 3. BOOKING & RESERVATION SYSTEM (CRUD)

### 3.1 Create Booking/Inquiry
#### API Endpoint: POST /api/reservations
```typescript
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const data = await request.json();

    const reservationRequest = await db.inquiry.create({
      data: {
        listingId: data.listingId,
        roomId: data.roomId,
        userId: user.id,
        moveInDate: data.moveInDate,
        stayDuration: data.stayDuration,
        occupantsCount: data.occupantsCount,
        role: data.role,
        hasPets: data.hasPets,
        smokes: data.smokes,
        contactMethod: data.contactMethod,
        message: data.message,
        status: "pending",
        paymentStatus: "unpaid",
      },
    });

    return NextResponse.json(reservationRequest);
  }
}
```

### 3.2 Read Bookings
#### API Endpoints:
- **Get Landlord Bookings:** GET /api/landlord/bookings
- **Get User Bookings:** GET /api/reservations
- **Get Booking Details:** GET /api/reservations/[id]

#### Frontend Components:
- **LandlordBookingsClient.tsx:** Landlord's booking management
- **AdminReservationsClient.tsx:** Admin booking management

### 3.3 Update Booking Status
#### API Endpoint: PUT /api/reservations?id=[bookingId]
```typescript
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    const id = searchParams.get("id");
    const { status } = await request.json();

    const updatedReservation = await db.inquiry.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedReservation);
  }
}
```

### 3.4 Delete Booking (Cancel)
#### API Endpoint: DELETE /api/reservations?id=[bookingId]

### 3.5 Database Models
```prisma
model Inquiry {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  listingId      String   @db.ObjectId
  roomId         String   @db.ObjectId
  userId         String   @db.ObjectId
  moveInDate     String
  stayDuration   String
  occupantsCount Int
  role           String
  hasPets        Boolean
  smokes         Boolean
  contactMethod  String
  message        String?
  status         String   @default("pending") // pending, approved, rejected
  paymentStatus  String   @default("unpaid") // unpaid, paid

  listing Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  room    Room    @relation(fields: [roomId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 4. REVIEWS & RATINGS (CRUD)

### 4.1 Create Review
#### API Endpoint: POST /api/reviews
- Submit review with rating (1-5)
- Comment and detailed ratings (cleanliness, accuracy, communication, location, value)

### 4.2 Read Reviews
#### API Endpoints:
- **Get Listing Reviews:** GET /api/listings/[id]/reviews
- **Get Landlord Reviews:** GET /api/landlord/reviews
- **Get Review Details:** GET /api/reviews/[id]

#### Frontend Components:
- **LandlordReviewsClient.tsx:** Landlord's review management
- **AdminReviewsClient.tsx:** Admin review management

### 4.3 Update Review
#### API Endpoint: PUT /api/reviews?id=[reviewId]
- Update review content
- Update response to review

#### Frontend Component:
- **LandlordReviewsClient.tsx:** Respond to reviews functionality

### 4.4 Delete Review
#### API Endpoint: DELETE /api/reviews?id=[reviewId]

### 4.5 Database Models
```prisma
model Review {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  userId         String   @db.ObjectId
  listingId      String   @db.ObjectId
  rating         Int      // 1-5
  comment        String?
  cleanliness    Int?     // 1-5
  accuracy       Int?     // 1-5
  communication  Int?     // 1-5
  location       Int?     // 1-5
  value          Int?     // 1-5
  status         String   @default("approved") // pending, approved, removed
  createdAt      DateTime @default(now())
  response       String?
  respondedAt    DateTime?

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  listing Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
}
```

---

## 5. HOST/LANDLORD APPLICATIONS (CRUD)

### 5.1 Create Application
#### API Endpoint: POST /api/host-applications
```typescript
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const data = await request.json();
    const result = await createHostApplication(data);
    return NextResponse.json(result);
  }
}
```

#### Frontend Component: Host Application Form
- Multi-step form with business information
- Property details and configuration
- Contact information
- Document upload
- Review and submission

### 5.2 Read Applications
#### API Endpoints:
- **Get User Application:** GET /api/host-applications (user)
- **Get All Applications:** GET /api/host-applications (admin)
- **Get Application Details:** GET /api/host-applications/[id]

#### Frontend Components:
- **AdminApplicationsClient.tsx:** Admin application management
- **HostApplicationStatus.tsx:** User application status view

### 5.3 Update Application Status
#### API Endpoint: PUT /api/host-applications?id=[applicationId]&status=[approved/rejected]
```typescript
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const id = searchParams.get("id");
    const status = searchParams.get("status");

    const updatedApplication = await updateApplicationStatus(
      id,
      status as 'approved' | 'rejected',
      user.id,
      reason
    );

    return NextResponse.json(updatedApplication);
  }
}
```

### 5.4 Database Models
```prisma
model HostApplication {
  id              String    @id @default(auto()) @map("_id") @db.ObjectId
  userId          String    @db.ObjectId @unique
  status          String    @default("pending") // pending, approved, rejected
  businessInfo    Json
  propertyInfo    Json
  contactInfo     Json
  propertyConfig  Json
  documents       Json
  adminNotes      String?
  approvedBy      String?   @db.ObjectId
  rejectedBy      String?   @db.ObjectId
  rejectedReason  String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

---

## 6. USERS & PROFILES (CRUD)

### 6.1 Create User
#### API Endpoint: POST /api/auth/signup
- User registration with email and password
- Profile creation

### 6.2 Read Users
#### API Endpoints:
- **Get All Users:** GET /api/admin/users
- **Get User Details:** GET /api/admin/users/[id]
- **Get Current User:** GET /api/auth/me

#### Frontend Components:
- **AdminUsersClient.tsx:** Admin user management
- **UserProfile.tsx:** User profile view

### 6.3 Update User
#### API Endpoint: PUT /api/admin/users/[id]
- Update user information
- Change user role
- Update user status (active/inactive)

### 6.4 Delete User
#### API Endpoint: DELETE /api/admin/users/[id]
```typescript
export async function DELETE(request: NextRequest) {
  try {
    const userId = params.id;
    await deleteUser(userId);
    return NextResponse.json({ success: true });
  }
}
```

---

## 7. FAVORITES MANAGEMENT (CRUD)

### 7.1 Create Favorite
#### API Endpoint: POST /api/favorites
- Add property to favorites

### 7.2 Read Favorites
#### API Endpoint: GET /api/favorites
- Get user's favorite properties

#### Frontend Component: Favorites Page

### 7.3 Delete Favorite
#### API Endpoint: DELETE /api/favorites/[propertyId]
- Remove property from favorites

---

## 8. TENANT MANAGEMENT (CRUD)

### 8.1 Read Tenants
#### API Endpoint: GET /api/landlord/tenants
- Get all tenants for landlord

#### Frontend Component: LandlordTenantsClient.tsx
- Tenant list with status filtering
- Tenant details and rental history

### 8.2 Read Tenant Details
#### API Endpoint: GET /api/landlord/tenants/[id]
- Get detailed tenant information
- View rental history
- Access tenant documents

---

## 9. ANALYTICS & REPORTING

### 9.1 Landlord Analytics
#### API Endpoint: GET /api/landlord/analytics
```typescript
export async function GET(request: NextRequest) {
  try {
    const result = await getLandlordAnalytics();
    return NextResponse.json(result);
  }
}
```

#### Frontend Component: LandlordAnalyticsClient.tsx
- Property performance metrics
- Booking statistics
- Revenue tracking
- Occupancy rates

### 9.2 Admin Analytics
#### API Endpoint: GET /api/admin/analytics
```typescript
export async function GET(request: NextRequest) {
  try {
    const result = await getAdminAnalytics();
    return NextResponse.json(result);
  }
}
```

#### Frontend Component: AdminDashboardClient.tsx
- System-wide analytics
- User growth charts
- Property trends
- Revenue reports

---

## 10. PAYMENT INTEGRATION

### 10.1 Stripe Integration
- Checkout process
- Payment confirmation
- Webhook handling
- Payment status tracking

### 10.2 API Endpoint: POST /api/payments/checkout
```typescript
export async function POST(request: Request) {
  try {
    const { bookingId, paymentMethod } = await request.json();
    const session = await createCheckoutSession(bookingId, paymentMethod);
    return NextResponse.json({ sessionId: session.id });
  }
}
```

---

## 11. DATABASE INTEGRATION

### 11.1 Database Type: MongoDB
- NoSQL document database
- Cloud-based deployment
- High scalability

### 11.2 ORM: Prisma
- Type-safe database operations
- Auto-generated types
- Migration support
- Query builder

### 11.3 Connection Configuration
```typescript
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const db = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}
```

---

## 12. FRONTEND ARCHITECTURE

### 12.1 Technology Stack
- **Next.js 16:** React framework with SSR
- **TypeScript:** Type-safe development
- **Tailwind CSS:** Utility-first styling
- **Framer Motion:** Animation library
- **React Query:** Data fetching and caching
- **React Hook Form:** Form validation
- **Leaflet:** Map integration
- **Recharts:** Charting library

### 12.2 Folder Structure
```
app/
├── admin/
│   ├── components/
│   ├── dashboard/
│   ├── users/
│   ├── listings/
│   ├── applications/
│   ├── reservations/
│   ├── reviews/
│   ├── reports/
│   └── system/
├── landlord/
│   ├── components/
│   ├── dashboard/
│   ├── properties/
│   ├── bookings/
│   ├── inquiries/
│   ├── reviews/
│   ├── tenants/
│   └── settings/
├── favorites/
├── listings/
│   └── [id]/
├── page.tsx
└── layout.tsx

components/
├── listings/
├── navbar/
├── home/
├── common/
└── modals/

services/
├── user/
├── landlord/
├── admin/
└── auth/
```

---

## 13. BACKEND ARCHITECTURE

### 13.1 API Routes
```
/api/
├── auth/
│   ├── [...nextauth]/
│   ├── send-otp/
│   └── verify-otp/
├── listings/
├── landlord/
│   ├── properties/
│   ├── bookings/
│   ├── inquiries/
│   ├── reviews/
│   ├── tenants/
│   └── analytics/
├── admin/
│   ├── users/
│   ├── listings/
│   ├── applications/
│   ├── reservations/
│   ├── reviews/
│   └── analytics/
├── host-applications/
├── reservations/
├── inquiries/
├── favorites/
├── payments/
│   └── checkout/
└── webhooks/
    └── stripe/
```

### 13.2 Services Layer
```typescript
// Example: Property service
export const getLandlordProperties = async (args?: { cursor?: string }) => {
  const landlord = await requireLandlord();
  const properties = await db.listing.findMany({
    where: { userId: landlord.id },
    include: { rooms: true, images: true },
  });
  return { listings: properties, nextCursor };
};
```

---

## 14. SECURITY FEATURES

### 14.1 Authentication
- JWT token-based authentication
- Session management
- OTP verification

### 14.2 Authorization
- Role-based access control (RBAC)
- API route protection
- Session validation

### 14.3 Data Security
- Password hashing with bcrypt
- Input validation
- XSS protection
- CORS configuration

### 14.4 Compliance
- GDPR compliance
- Data encryption
- Audit logging

---

## 15. PERFORMANCE OPTIMIZATION

### 15.1 Frontend Optimization
- Image optimization
- Code splitting
- Caching strategies
- Lazy loading

### 15.2 Backend Optimization
- Query optimization
- Caching with Redis
- Database indexing
- Rate limiting

### 15.3 Deployment
- Vercel deployment
- Serverless architecture
- CDN integration

---

## 16. TESTING & QUALITY ASSURANCE

### 16.1 Testing Framework
- Jest for unit testing
- React Testing Library for component testing
- Supertest for API testing

### 16.2 Test Coverage
- 80%+ test coverage
- Integration testing
- End-to-end testing

### 16.3 Quality Tools
- ESLint for code quality
- Prettier for formatting
- Husky for pre-commit hooks

---

## 17. PROJECT STATUS & COMPLETION

### 17.1 Overall Completion: 78%

### 17.2 Component-wise Completion:
- **Backend API:** 85% complete
- **Frontend Pages & Components:** 75% complete
- **CRUD Operations:** 80% complete
- **Database Integration:** 90% complete
- **Authentication:** 100% complete
- **Authorization:** 100% complete

### 17.3 Implemented Features:
✅ User authentication and authorization
✅ Property management (CRUD)
✅ Booking and reservation system
✅ Reviews and ratings
✅ Host/landlord applications
✅ Favorites management
✅ Tenant management
✅ Analytics and reporting
✅ Payment integration (Stripe)
✅ Admin panel

### 17.4 Pending Features:
🔄 Real-time chat/messaging system
🔄 Advanced property filtering
🔄 More payment gateway integrations
🔄 Mobile app development
🔄 Advanced analytics

---

## 18. FUTURE ENHANCEMENTS

### 18.1 Short-term Goals (0-3 months)
- Complete mobile optimization
- Implement real-time messaging
- Enhance property search filters
- Add more payment gateways

### 18.2 Medium-term Goals (3-6 months)
- Develop mobile application
- Implement AI-powered property recommendations
- Add virtual property tours
- Integrate smart home features

### 18.3 Long-term Goals (6+ months)
- Expand to multiple cities
- Partner with real estate agencies
- Implement machine learning for pricing optimization
- Develop corporate housing solutions

---

## CONCLUSION

The BoardTAU platform is a comprehensive boarding house rental solution with a solid foundation in place. The system has achieved 78% overall completion, with all core features implemented and a strong architecture for future growth. The platform provides a seamless user experience for both tenants and landlords, with robust management capabilities for administrators.

---

**Document Generated:** [Current Date]
**Project Version:** 1.0
**Last Updated:** [Current Date]

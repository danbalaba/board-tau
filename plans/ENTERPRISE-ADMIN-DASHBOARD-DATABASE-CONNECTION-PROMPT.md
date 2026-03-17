# Enterprise Admin Dashboard - Database Connection Prompt

## Project Context
This prompt is for connecting the BoardTAU enterprise admin dashboard to the MongoDB database using Prisma ORM and Next.js API routes. The dashboard currently uses hard-coded mock data, and we need to replace it with real data from the database.

## Project Structure
```
app/
├── admin/
│   ├── features/
│   │   ├── dashboard/              # Executive Overview
│   │   ├── user-management/        # User Directory, Roles, Analytics
│   │   ├── moderation/            # Moderation Queue, Host Applications, Listings, Reviews
│   │   ├── finance/               # Revenue, Transactions, Commissions, Taxes, Reports
│   │   ├── properties/            # Directory, Performance, Occupancy, Pricing, Bookings
│   │   ├── monitoring/            # System Health, Servers, Database, API, Errors, Security
│   │   └── analytics/             # Analytics Dashboard, Custom Dashboards, Data Export
│   └── components/
│       ├── ui/                    # ShadCN UI components
│       └── layout/                # Sidebar, header, etc.
└── api/                           # API routes (to be created)
```

## Database Schema
Refer to the Prisma schema in `prisma/schema.prisma` for the complete database structure. Key models:

#### Core Models:
- **User**: `id`, `name`, `email`, `role`, `isActive`, `isVerifiedLandlord`, `createdAt`, `updatedAt`
- **Listing**: `id`, `title`, `description`, `userId`, `price`, `status`, `rating`, `reviewCount`, `createdAt`
- **Room**: `id`, `listingId`, `name`, `price`, `capacity`, `availableSlots`, `roomType`, `status`
- **Inquiry**: `id`, `listingId`, `roomId`, `userId`, `moveInDate`, `stayDuration`, `status`, `createdAt`
- **Reservation**: `id`, `userId`, `listingId`, `roomId`, `inquiryId`, `startDate`, `endDate`, `totalPrice`, `status`, `paymentStatus`
- **Review**: `id`, `userId`, `listingId`, `rating`, `comment`, `status`, `createdAt`
- **HostApplication**: `id`, `userId`, `status`, `businessInfo`, `propertyInfo`, `documents`, `createdAt`

#### Enums:
- `Role`: USER, ADMIN, LANDLORD
- `InquiryStatus`: PENDING, APPROVED, REJECTED, EXPIRED
- `PaymentStatus`: UNPAID, PENDING, PAID, REFUNDED, FAILED
- `ReservationStatus`: PENDING, CONFIRMED, CANCELLED
- `RoomType`: SOLO, BEDSPACE
- `RoomStatus`: AVAILABLE, FULL, MAINTENANCE

## Implementation Plan
Refer to the complete implementation plan in `plans/ENTERPRISE-ADMIN-DASHBOARD-DATABASE-CONNECTION-PLAN.md`

## Key Requirements

### 1. API Routes (High Priority)
Create API routes for:
- User management: `/api/admin/users`
- User analytics: `/api/admin/analytics/users`
- Property management: `/api/admin/properties`
- Property performance: `/api/admin/properties/performance`
- Moderation queue: `/api/admin/moderation/queue`
- Host applications: `/api/admin/moderation/hosts`
- Listings review: `/api/admin/moderation/listings`
- Reviews moderation: `/api/admin/moderation/reviews`
- Revenue dashboard: `/api/admin/finance/revenue`
- Transactions: `/api/admin/finance/transactions`
- Financial reports: `/api/admin/finance/reports`
- Executive overview: `/api/admin/analytics/overview`

### 2. Component Updates
Update all dashboard components to use real data fetched from the API routes. Replace hard-coded mock data with React Query for data fetching.

### 3. Data Fetching
Implement React Query with:
- Automatic caching
- Loading states
- Error handling
- Pagination
- Filtering

### 4. Security
Implement:
- Authentication using NextAuth.js
- Role-based authorization for API routes
- Input validation
- Error handling
- Rate limiting

## Technical Stack
- **Prisma ORM**: Database interactions
- **React Query**: Data fetching and caching
- **Next.js API Routes**: Serverless endpoints
- **Jest**: Testing
- **Vercel**: Deployment and monitoring

## Success Metrics
- **API Response Time**: < 500ms for all endpoints
- **Data Accuracy**: 100% match between dashboard and database
- **User Experience**: No empty states or loading issues
- **Performance**: Page load time < 3 seconds
- **Reliability**: 99.9% uptime

## Deliverables
1. Complete API routes with documentation
2. Updated components with real data fetching
3. Test coverage report
4. Performance audit report
5. Deployment instructions

## Instructions
1. Read and understand the complete implementation plan in `plans/ENTERPRISE-ADMIN-DASHBOARD-DATABASE-CONNECTION-PLAN.md`
2. Create API routes following the structure outlined
3. Update components to use real data
4. Implement testing and optimization
5. Deploy to production

Ensure all changes follow the existing project structure and code style guidelines.

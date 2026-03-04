# BoardTAU Database Redesign Plan

## Context

This document outlines the comprehensive database redesign for the BoardTAU platform. The redesign aims to address several key issues with the current database structure, improve data integrity, enhance performance, and make the system more maintainable and scalable.

### Current Database Structure Issues

1. **Lack of Normalization**:
   - Amenities, rules, and features are stored as boolean fields directly in the listings table
   - Categories are stored as a string array field
   - Room amenities and images are stored as string arrays

2. **Poor Data Types**:
   - Dates and durations are stored as string fields instead of proper date/integer types
   - Status, payment, and other categorical fields are stored as free text strings

3. **Missing Relationships**:
   - EmailOTPs table has no foreign key relationship to users
   - Reservations table has no reference to specific rooms or inquiry origins

4. **Suboptimal Query Performance**:
   - Array fields make complex queries inefficient
   - Lack of proper indexing for common query patterns

5. **Limited Type Safety**:
   - No type constraints on many fields, leading to potential data inconsistencies

## Redesign Objectives

1. **Normalization**: Restructure the database to follow 1NF, 2NF, and 3NF principles
2. **Type Safety**: Implement strict type constraints and enums where appropriate
3. **Improved Queries**: Optimize data structures for common query patterns
4. **Maintainability**: Make the database structure more understandable and maintainable
5. **Scalability**: Design for future feature additions and growth
6. **Data Integrity**: Ensure all relationships are properly defined and constraints are enforced

## Key Improvements

### 1. EmailOTPs Entity
- **Problem**: `email_otps` table had `email` field but no foreign key to `users`
- **Solution**: Add `user_id` foreign key (optional for new user registration)
- **Benefits**: Establishes clear relationship, improves data integrity, reduces redundancy

### 2. ListingAmenities/ListingRules/ListingFeatures
- **Problem**: All stored as fields directly in the Listing entity
- **Solution**: Create separate entities with boolean fields
- **Benefits**: Follows normalization principles, improves query performance, easier maintenance

### 3. Categories/ListingCategories
- **Problem**: `category: String[]` array field
- **Solution**: Create separate `categories` entity with metadata and junction table `listing_categories`
- **Benefits**: Categories have icons, descriptions, and are multi-select

### 4. Latitude/Longitude
- **Problem**: `latlng: Float[]` array field
- **Solution**: Separate into `latitude: Float` and `longitude: Float`, plus GeoJSON `location: Json`
- **Benefits**: Clarity, better geospatial queries, validation, API consistency

### 5. RoomImages/RoomAmenities
- **Problem**: `images: varchar[]` and `amenities: varchar[]` array fields
- **Solution**: Create normalized tables following existing patterns
- **Benefits**: Consistency, metadata support, better querying

### 6. Type Safety with Enums
- **Problem**: Status, payment, and other categorical fields are stored as free text
- **Solution**: Implement strict enums for all categorical fields
- **Benefits**: Prevents invalid values, improves code quality

### 7. Inquiry/Reservation Flow
- **Problem**: Reservations have no reference to specific rooms or inquiry origins
- **Solution**: Enhance both entities to support the inquiry → approval → reservation process
- **Benefits**: Clear booking process, better communication, capacity management

## Implementation Plan

### Phase 1: Preparation (100% Safe)
1. **Create a Backup**: Make a complete copy of your database
2. **Set Up a Testing Environment**: Isolate changes from production
3. **Document Current State**: Record how data flows through your system

### Phase 2: Schema Updates (Very Safe)
1. **Add New Entities**: Create `listing_amenities`, `listing_rules`, `listing_features`, `categories`, `listing_categories`, `room_images`, `room_amenity_types`, and `room_amenities` without removing old fields
2. **Run Prisma Push**: Apply changes without affecting existing data
3. **Verify**: Check that all existing tables and data are intact

### Phase 3: Data Migration (Controlled)
1. **Create Migration Script**: Write a script to copy data from old fields to new entities
2. **Test Migration**: Run script on the testing environment
3. **Validate**: Check that all data is correctly copied and relationships are intact

### Phase 4: API Updates (Backward Compatible)
1. **Update Seed File**: Modify seed-real-listings.ts to use new entities
2. **Update APIs**: Add support for new fields while maintaining existing endpoints
3. **Testing**: Test all functionality to ensure it still works

### Phase 5: Frontend Updates (Incremental)
1. **Update Filters**: Modify filter logic to use new fields
2. **Update Views**: Change how data is displayed
3. **Testing**: Test all user interactions

### Phase 6: Cleanup (Final Step)
1. **Remove Old Fields**: Once everything is verified, remove old fields from schema
2. **Run Prisma Push Again**: Apply final changes
3. **Final Testing**: Ensure all functionality works as expected

## Prisma Schema Changes

### 1. Enums
```prisma
enum Role {
  USER
  ADMIN
  LANDLORD
}

enum InquiryStatus {
  PENDING
  APPROVED
  REJECTED
  EXPIRED
}

enum PaymentStatus {
  UNPAID
  PENDING
  PAID
  REFUNDED
  FAILED
}

enum ContactMethod {
  PHONE
  EMAIL
  SMS
}

enum ReservationStatus {
  PENDING
  CONFIRMED
  CANCELLED
}

enum PaymentMethod {
  GCASH
  MAYA
  BANK_TRANSFER
  CASH
}

enum RoomType {
  SOLO
  BEDSPACE
}

enum BedType {
  SINGLE
  DOUBLE
  QUEEN
  BUNK
}

enum RoomStatus {
  AVAILABLE
  FULL
  MAINTENANCE
}
```

### 2. New Entities
```prisma
model ListingAmenity {
  id              String    @id @default(auto()) @map("_id") @db.ObjectId
  listingId       String    @db.ObjectId
  wifi            Boolean   @default(false)
  parking         Boolean   @default(false)
  pool            Boolean   @default(false)
  gym             Boolean   @default(false)
  airConditioning Boolean   @default(false)
  laundry         Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  listing         Listing   @relation(fields: [listingId], references: [id], onDelete: Cascade)
  @@unique([listingId])
}

model ListingRule {
  id              String    @id @default(auto()) @map("_id") @db.ObjectId
  listingId       String    @db.ObjectId
  femaleOnly      Boolean   @default(false)
  maleOnly        Boolean   @default(false)
  visitorsAllowed Boolean   @default(true)
  petsAllowed     Boolean   @default(false)
  smokingAllowed  Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  listing         Listing   @relation(fields: [listingId], references: [id], onDelete: Cascade)
  @@unique([listingId])
}

model ListingFeature {
  id              String    @id @default(auto()) @map("_id") @db.ObjectId
  listingId       String    @db.ObjectId
  security24h     Boolean   @default(false)
  cctv            Boolean   @default(false)
  fireSafety      Boolean   @default(false)
  nearTransport   Boolean   @default(false)
  studyFriendly   Boolean   @default(false)
  quietEnvironment Boolean  @default(false)
  flexibleLease   Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  listing         Listing   @relation(fields: [listingId], references: [id], onDelete: Cascade)
  @@unique([listingId])
}

model Category {
  id              String    @id @default(auto()) @map("_id") @db.ObjectId
  name            String    @unique
  label           String
  icon            String
  description     String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  listingCategories ListingCategory[]
}

model ListingCategory {
  id              String    @id @default(auto()) @map("_id") @db.ObjectId
  listingId       String    @db.ObjectId
  categoryId      String    @db.ObjectId
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  listing         Listing   @relation(fields: [listingId], references: [id], onDelete: Cascade)
  category        Category  @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  @@unique([listingId, categoryId])
}

model RoomImage {
  id              String    @id @default(auto()) @map("_id") @db.ObjectId
  roomId          String    @db.ObjectId
  url             String
  caption         String    @default("Photo")
  order           Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  room            Room      @relation(fields: [roomId], references: [id], onDelete: Cascade)
}

model RoomAmenityType {
  id              String    @id @default(auto()) @map("_id") @db.ObjectId
  name            String    @unique
  icon            String?
  description     String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  roomAmenities   RoomAmenity[]
}

model RoomAmenity {
  id              String    @id @default(auto()) @map("_id") @db.ObjectId
  roomId          String    @db.ObjectId
  amenityTypeId   String    @db.ObjectId
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  room            Room      @relation(fields: [roomId], references: [id], onDelete: Cascade)
  amenityType     RoomAmenityType  @relation(fields: [amenityTypeId], references: [id], onDelete: Cascade)
  @@unique([roomId, amenityTypeId])
}
```

### 3. Updated Entities
```prisma
model EmailOTP {
  id                String    @id @default(auto()) @map("_id") @db.ObjectId
  userId            String?   @db.ObjectId
  email             String
  otpHash           String
  expiresAt         DateTime
  attempts          Int       @default(0)
  used              Boolean   @default(false)
  lockoutUntil      DateTime?
  isPermanentlyLocked Boolean  @default(false)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  user              User?     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([email])
  @@index([userId])
}

model Listing {
  id                String    @id @default(auto()) @map("_id") @db.ObjectId
  title             String
  description       String
  imageSrc          String
  roomCount         Int
  bathroomCount     Int
  userId            String    @db.ObjectId
  price             Int
  country           String?
  latitude          Float?
  longitude         Float?
  location          Json?
  region            String?
  rating            Float?    @default(4.8)
  reviewCount       Int       @default(0)
  status            String    @default("pending")
  approvedAt        DateTime?
  approvedBy        String?   @db.ObjectId
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  amenities         ListingAmenity?
  rules             ListingRule?
  features          ListingFeature?
  categories        ListingCategory[]
  rooms             Room[]
  images            ListingImage[]
  reviews           Review[]
  reservations      Reservation[]
  inquiries         Inquiry[]
}

model Room {
  id                String    @id @default(auto()) @map("_id") @db.ObjectId
  listingId         String    @db.ObjectId
  name              String
  price             Int
  capacity          Int
  availableSlots    Int
  roomType          RoomType
  bedType           BedType?
  size              Float?
  status            RoomStatus @default(AVAILABLE)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  listing           Listing   @relation(fields: [listingId], references: [id], onDelete: Cascade)
  images            RoomImage[]
  amenities         RoomAmenity[]
  inquiries         Inquiry[]
  reservations      Reservation[]
}

model Inquiry {
  id                String    @id @default(auto()) @map("_id") @db.ObjectId
  listingId         String    @db.ObjectId
  roomId            String    @db.ObjectId
  userId            String    @db.ObjectId
  moveInDate        Date
  stayDuration      Int
  occupantsCount    Int
  role              Role      @default(TENANT)
  hasPets           Boolean
  smokes            Boolean
  contactMethod     ContactMethod
  message           String?
  status            InquiryStatus @default(PENDING)
  paymentStatus     PaymentStatus @default(UNPAID)
  isApproved        Boolean   @default(false)
  approvedBy        String?   @db.ObjectId
  approvedAt        DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  listing           Listing   @relation(fields: [listingId], references: [id], onDelete: Cascade)
  room              Room      @relation(fields: [roomId], references: [id], onDelete: Cascade)
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  reservation       Reservation?
}

model Reservation {
  id                String    @id @default(auto()) @map("_id") @db.ObjectId
  userId            String    @db.ObjectId
  listingId         String    @db.ObjectId
  roomId            String    @db.ObjectId
  inquiryId         String?   @db.ObjectId
  startDate         DateTime
  endDate           DateTime
  durationInDays    Int
  totalPrice        Int
  status            ReservationStatus @default(PENDING)
  paymentStatus     PaymentStatus @default(PENDING)
  paymentMethod     PaymentMethod?
  paymentReference  String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  listing           Listing   @relation(fields: [listingId], references: [id], onDelete: Cascade)
  room              Room      @relation(fields: [roomId], references: [id], onDelete: Cascade)
  inquiry           Inquiry?  @relation(fields: [inquiryId], references: [id], onDelete: Cascade)
  @@unique([inquiryId])
}
```

## Data Migration Script

A detailed data migration script will be created to:
1. Move existing amenities, rules, and features from the listings table to the new entities
2. Convert the categories array field to the new categories and listing_categories tables
3. Separate the latlng field into latitude and longitude
4. Move existing room images and amenities from array fields to new tables
5. Convert string dates and durations to proper date/integer types
6. Populate new fields with default values

## Testing Strategy

### Pre-Migration Testing
- Unit tests for all new entities and relationships
- Integration tests for the migration script
- Performance tests for new query patterns

### Post-Migration Testing
- Verify all data is correctly migrated
- Test all existing functionality
- Test new features and filters
- Performance testing of new query patterns

## Risks and Mitigation

### 1. Data Loss
- **Risk**: Potential data loss during migration
- **Mitigation**:
  - Create a complete backup before any changes
  - Test migration on a separate environment first
  - Implement rollback procedure

### 2. Performance Issues
- **Risk**: New query patterns may be slower
- **Mitigation**:
  - Test all query patterns before deployment
  - Implement proper indexing
  - Monitor performance after deployment

### 3. Application Breakage
- **Risk**: Changes may break existing functionality
- **Mitigation**:
  - Maintain backward compatibility during implementation
  - Comprehensive testing before deployment
  - Staged rollout

## Conclusion

This database redesign will significantly improve the BoardTAU platform's data integrity, performance, and maintainability. The implementation plan is designed to minimize risk and ensure a smooth transition. By following this plan, we will create an enterprise-grade database structure that supports current and future business needs.

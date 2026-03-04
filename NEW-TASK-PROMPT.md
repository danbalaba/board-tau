# BoardTAU Database Redesign Implementation Task

## Task Overview
Implement the comprehensive database redesign for the BoardTAU platform following the detailed plan and specifications outlined in the `DATABASE-REDESIGN-PLAN.md` and `DATABASE-REDESIGN-PROMPT.md` files.

## Required Files to Reference
Both of these files are located in the current repository and contain all the necessary information for the implementation:

1. **DATABASE-REDESIGN-PLAN.md**: The complete design document outlining the why, what, and how of the redesign
2. **DATABASE-REDESIGN-PROMPT.md**: The detailed implementation prompt with step-by-step instructions and Prisma schema changes

## Current Database Structure Issues (from DATABASE-REDESIGN-PLAN.md)
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

## Key Improvements to Implement
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

## Implementation Plan Phases
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

## Success Criteria
- All new entities are created and properly linked
- All existing data is migrated correctly
- All existing functionality still works
- New features and filters are implemented correctly
- Performance is not negatively impacted
- The database follows normalization principles

## Important Instructions
- **Follow the phases strictly**: Do not skip any phase
- **Test everything thoroughly**: Always test changes in a separate environment
- **Maintain backward compatibility**: Until phase 6, keep old fields intact
- **Document all changes**: Keep track of what was modified and why
- **Have a rollback plan**: Be prepared to revert changes if something goes wrong

Please refer to both `DATABASE-REDESIGN-PLAN.md` and `DATABASE-REDESIGN-PROMPT.md` for detailed implementation instructions, Prisma schema changes, and data migration requirements.

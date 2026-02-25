# Plan: BoardTAU Multi-Question Filtering Fix

## 1. Frontend Tasks
1. **Budget Validation**
   - Add check: `minPrice <= maxPrice`
   - Prevent submission if invalid
2. **Room-Level Filters (Step 2)**
   - Solo Room: checkbox inputs for bathroom, kitchen, AC, desk, etc.
   - Bedspace Room: number input for capacity, checkboxes for shared amenities
   - Map inputs to Room model fields
3. **Gender & Rules Validation**
   - Prevent selecting both femaleOnly + maleOnly
   - Remove gender from category multi-select
4. **Listing-Level Filters (Steps 5–8)**
   - Multi-select checkboxes for categories, amenities, rules, advanced features
   - Only apply to Listing model fields
5. **Summary Step**
   - Display all selected filters
   - Option to "Clear All"

---

## 2. Backend Tasks
1. **Room-Level Filtering**
   - Ensure Step 2 filters query Room collection strictly
   - Match roomType, amenities, bedType, capacity, price
2. **Listing-Level Filtering**
   - Steps 5–8 query Listing collection
   - Apply boolean filters and amenities
3. **Availability Check**
   - For optional Step 4:
     ```typescript
     if (availabilityStartDate && availabilityEndDate) {
       where.NOT = {
         reservations: {
           some: {
             OR: [
               { endDate: { gte: startDate }, startDate: { lte: startDate } },
               { startDate: { lte: endDate }, endDate: { gte: endDate } },
               { startDate: { gte: startDate }, endDate: { lte: endDate } },
             ]
           }
         }
       }
     }
     ```
4. **Category & Amenities Validation**
   - Ensure selected categories exist in Listing.category[]
   - Ensure selected amenities exist in Listing.amenities[]

---

## 3. Database Update
- Update `Listing` and `Room` models to support all filters (see File 3)
- Room-level amenities separated from listing-level amenities
- Price handled per room for strict filtering, listing.price as base or min

---

## 4. Testing & QA
1. Verify **no conflicting filters** (gender, price)
2. Test room-level vs listing-level filters
3. Test multi-step wizard flow
4. Test availability filtering (optional)
5. Confirm results match expected filtering for all combinations

# Dynamic Amenities, Rules & Features Refactor Plan

## 1. Rationale & Architectural Goal
Currently, amenities, rules, and features are hardcoded as boolean columns inside `schema.prisma` (`ListingAmenity`, `ListingRule`, `ListingFeature`) and mapped to static arrays in `data/amenities.ts` and `data/roomAmenities.ts`. 

**Why we are changing this:**
1. **Scalability:** Adding a new amenity (e.g. "Solar Generator" or "Fiber WiFi") currently requires modifying database schemas, TypeScript files, and redeploying code.
2. **Super Admin Control:** Super Admins need to create, rename, or deactivate amenities dynamically from the dashboard.
3. **Property-Type Intelligence:** Amenities must smartly adapt to the property type (e.g., Boarding Houses get "Sampayan", while Apartments get "Private Balcony" and "Private Veranda / Terrace").
4. **Data Integrity:** Replacing 50+ boolean columns with a clean relational model eliminates database bloat and standardizes search indexing.

---

## 2. Do's and Don'ts (Strict Guardrails)

### Do's:
- **DO** reuse the existing `HelpTooltip.tsx` component to display amenity descriptions on hover/tap in both search modals and landlord creation steps.
- **DO** reuse the `@tanstack/react-table` architecture matching the User Directory for the Super Admin management page (`/admin/settings/property-configuration`).
- **DO** reuse the icon search grid modal pattern from `CustomAmenityModal.tsx` for picking Lucide icons in the admin interface.
- **DO** preserve custom landlord highlights (`CustomAmenityModal`, `CustomRuleModal`, `CustomFeatureModal`) as display-only JSON fields on the `Listing` model so landlords can add unique selling points without polluting global search filters.
- **DO** frame search filter labels positively and explicitly (e.g., *"24/7 Open Gate Access"* instead of *"No Curfew"*) to prevent user confusion when checking boxes.

### Don'ts (DO NOT TOUCH):
- **DO NOT** invent new UI design patterns or introduce unapproved styling libraries. All new admin components MUST inherit BoardTAU's existing Tailwind + Framer-Motion glassmorphic design system.
- **DO NOT** delete custom landlord notes or force custom landlord inputs into the master `DynamicAttribute` database table.
- **DO NOT** hard-delete attributes if active listings are linked to them; use `isActive = false` (soft delete / disable flow).
- **DO NOT** put lease contract terms (e.g., "Tenant pays for damages") into search filters. Keep contract terms strictly within the Inquiry & Reservation Agreement flow.

---

## 3. Master Dynamic Attributes Catalog & Categorization

The master seed data contains all attributes categorized into `AMENITY`, `ROOM_AMENITY`, `RULE`, and `FEATURE`.

### A. Outdoor Spaces & Structural Features (`FEATURE`)
- `Individual Electric Sub-Meter`, `Individual Water Sub-Meter`, `Private Balcony`, `Private Veranda / Terrace`, `Private Roof Deck`, `Private Garden / Yard`, `Gated Compound Perimeter`.

### B. In-Unit Kitchen Features & Appliances (`ROOM_AMENITY`)
- `Kitchen Sink`, `Cooking Stove Provided`, `Personal Refrigerator`, `Personal Microwave`, `Personal Electric Kettle`, `Rice Cooker Provided`, `Complete Utensils & Dishware Provided`, `Dish Drying Rack`.

### C. In-Unit Bathroom Features & Fixtures (`ROOM_AMENITY`)
- `Hot & Cold Shower Heater`, `Cold Shower Only`, `Bidet`, `Exhaust Fan`, `Toilet Flush`, `Water Storage Drum & Tabo`.

### D. Vehicle Parking Facilities (`FEATURE`)
- `Car Parking Slot`, `Private Covered Garage`, `Motorcycle Parking`, `Bicycle Rack`.

---

## 4. Database Schema Modifications (`schema.prisma`)

```prisma
enum AttributeType {
  AMENITY      // Property-level shared amenities
  ROOM_AMENITY // Room-level or in-unit amenities
  RULE         // House rules & occupant policies
  FEATURE      // Safety, security & building infrastructure
}

model DynamicAttribute {
  id               String          @id @default(auto()) @map("_id") @db.ObjectId
  name             String          @unique
  icon             String          // Lucide icon identifier (e.g. "Wifi", "Zap")
  type             AttributeType
  description      String?         // Plain-language tooltip description
  isActive         Boolean         @default(true)
  
  // Scoping to property types (Empty array = Universal to all types)
  propertyTypeIds  String[]        @db.ObjectId
  propertyTypes    PropertyType[]  @relation(fields: [propertyTypeIds], references: [id])

  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt
}
```

---

## 5. Summary & Verification Plan

### Automated Tests
- Run `npx prisma db seed` to seed all updated dynamic attributes.
- Verify relational mapping between `PropertyType` and `DynamicAttribute`.

### Manual Verification
- Test landlord listing creation wizard to ensure appropriate attributes render based on the selected property type.
- Test tenant search modal wizard to verify dynamic step execution and zero duplicate tags.

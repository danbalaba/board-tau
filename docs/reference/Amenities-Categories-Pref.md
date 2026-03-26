# BoardTAU Amenities & Categories Reference (Philippine Context)

This file is a master reference for all **room-level amenities**, **listing-level amenities**, and **boarding house categories** specifically tailored for students of Tarlac Agricultural University (TAU). It ensures consistent mapping between frontend filters, database storage, and the Heuristic Scoring Algorithm.

---

## 1. Room-Level Amenities

These amenities are physically contained within the specific room.

### Solo Room & Bedspace Room 
| Amenity               | Type / Notes                                   | Backend Field Mapping      |
|-----------------------|-----------------------------------------------|----------------------------|
| Private Bathroom (Own CR)| Yes / No                                | Room.amenities             |
| Air Conditioning (AC) | Yes / No                                      | Room.amenities             |
| Electric Fan Included | Yes / No (Wall/Stand Fan)                     | Room.amenities             |
| Foam / Mattress Included| Yes / No (Does not just provide bedframe)   | Room.amenities             |
| Bed Type              | Single / Double / Bunk Bed (Double Deck)      | Room.bedType               |
| Desk / Study Table    | Yes / No                                      | Room.amenities             |
| Closet / Cabinet with Lock | Yes / No                                 | Room.amenities             |
| Sub-Meter (Electricity)| Yes / No (Student pays exact consumption)    | Room.amenities             |
| Sub-Meter (Water)     | Yes / No                                      | Room.amenities             |
| Room Size (Sq. Meters)| Optional numeric                              | Room.size                  |

> ✅ Notes:
> - Room-level amenities are **strict filters** evaluated when a user is specifically looking inside a room category.
> - `Heating` and `Mini-Fridges` were removed as they are culturally inaccurate for generic provincial boarding houses.

---

## 2. Listing-Level Amenities

These amenities apply to the **entire boarding house or compound**:

| Amenity                           | Type / Notes                                   | Backend Field Mapping      |
|------------------------------------|-----------------------------------------------|----------------------------|
| WiFi / Internet Access             | Yes / No                                      | Listing.amenities          |
| Laundry Area / Sampayan            | Yes / No                                      | Listing.amenities          |
| Cooking / Gas Stove Allowed        | Yes / No (Or Rice Cooker allowed)             | Listing.amenities          |
| Water Dispenser / Purified Water   | Yes / No (Free drinking water provided)       | Listing.amenities          |
| Sari-Sari Store / Canteen Nearby   | Yes / No (Essential for midnight cravings)    | Listing.amenities          |
| Common TV / Lounge                 | Yes / No                                      | Listing.amenities          |
| Kitchen / Shared Kitchen           | Yes / No                                      | Listing.amenities          |
| Parking / Motorcycle Parking       | Yes / No                                      | Listing.amenities          |
| Gated / Secure                     | Yes / No                                      | Listing.amenities          |

> ✅ Notes:
> - Listing-level amenities are **strict filters** (Step 6 in the wizard). If checked, the DB strictly filters using `$all` on the string fields.

---

## 3. Rules & Preferences (Toggle Constraints)

These are strict dealbreakers for tenants/landlords.

| Rule / Preference         | Type / Notes                                   | Backend Field Mapping      |
|---------------------------|-----------------------------------------------|----------------------------|
| Female Only               | True / False                                  | Listing.femaleOnly         |
| Male Only                 | True / False                                  | Listing.maleOnly           |
| Visitors Allowed          | True / False (For strictly doing academic reqs)| Listing.visitorsAllowed    |
| Pets Allowed              | True / False                                  | Listing.petsAllowed        |
| Smoking Allowed           | True / False                                  | Listing.smokingAllowed     |
| No Curfew Enforced        | Yes / No (Essential for thesis students)      | Listing.amenities          |

> ✅ Notes:
> - Do not enforce Male AND Female at the same time in the URL, as this creates a Database paradox dropping all listings.
> - `No Curfew` is saved as a positive string trait in `amenities` so it can be queried dynamically.

---

## 4. Advanced Features (Heuristic Scoring Multipliers)

These features do **not** drop a boarding house from search results. Instead, they act as **Bonus Points** pushed into the `$addFields` MongoDB Aggregation stage. 

| Advanced Feature          | Points Allocated | Reason                                         | Backend Field Mapping    |
|---------------------------|------------------|------------------------------------------------|--------------------------|
| CCTV / Security Cameras   | +15 Points       | Massively highly requested safety feature.     | Listing.features.cctv    |
| 24/7 Security / Landlord  | +10 Points       | Landlord lives on premises or security guard.  | Listing.features.security24h |
| Near Transport / Tricycle  | +10 Points       | Easy commute access to TAU gates.              | Listing.features.nearTransport |
| Quiet / Study Environment | +5 Points        | Documented house rules against noise/drinking. | Listing.features.studyFriendly |

---

## 5. Recommended Categories (Listing Types)

| Category Name               | Database String          | Notes / Purpose |
|------------------------------|--------------------------|----------------|
| Student-Friendly            | Student-Friendly         | Near campus, study-focused environment |
| Budget Boarding House       | Budget Boarding House    | Highly affordable options. |
| Private Boarding House      | Private Boarding House   | Higher-end boarding houses or private rooms |
| Family-Friendly             | Family-Friendly          | Accommodates small families or professionals |
| Pet-Friendly                | Pet-Friendly             | Explicitly allows pets |
| Apartment                   | Apartment                | Full apartment unit with own meter/kitchen. |
| Short-Term / Flexible Lease | Short-Term / Flexible Lease| Temporary stays or Semestral rentals |
| Quiet / Study Environment   | Quiet / Study Environment| Focused on study-friendly, noise-controlled environment |

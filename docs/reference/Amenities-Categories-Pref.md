# BoardTAU Amenities & Categories Reference

This file is a master reference for all **room-level amenities**, **listing-level amenities**, and **boarding house categories**. It ensures consistent mapping between frontend filters and backend schema.

---

## 1. Room-Level Amenities

### Solo Room
| Amenity               | Type / Notes                                   | Backend Mapping            |
|-----------------------|-----------------------------------------------|----------------------------|
| Private Bathroom       | Yes / No                                      | Room.amenities             |
| Private Kitchen        | Yes / No                                      | Room.amenities             |
| Air Conditioning       | Yes / No                                      | Room.amenities             |
| Bed Type               | Single / Double / Queen                       | Room.bedType               |
| Desk / Study Table     | Yes / No                                      | Room.amenities             |
| Closet / Wardrobe      | Yes / No                                      | Room.amenities             |
| Balcony / Window       | Yes / No                                      | Room.amenities             |
| Mini-Fridge / Refrigerator | Yes / No                                  | Room.amenities             |
| Room Size (Sq. Meters) | Optional numeric                              | Room.size                  |
| Price per room         | Always a room-level property                  | Room.price                 |
| Natural Light / View   | Yes / No                                      | Room.amenities             |
| Heating / Fan          | Yes / No                                      | Room.amenities             |
| WiFi / Ethernet Access | Yes / No                                      | Room.amenities             |

### Bedspace Room
| Amenity               | Type / Notes                                   | Backend Mapping            |
|-----------------------|-----------------------------------------------|----------------------------|
| Shared Bathroom        | Number or Yes/No                              | Room.amenities             |
| Shared Kitchen         | Yes / No                                      | Room.amenities             |
| Air Conditioning       | Yes / No                                      | Room.amenities             |
| Bed Count / Capacity   | Max occupants per room                         | Room.capacity              |
| Available Slots        | Remaining beds                                 | Room.availableSlots        |
| Desk / Shared Table    | Yes / No                                      | Room.amenities             |
| Closet per Bed         | Yes / No                                      | Room.amenities             |
| Bed Type               | Single / Bunk / Double                        | Room.bedType               |
| Price per bed          | Always room-level property                     | Room.price                 |
| Personal Lock / Storage| Yes / No                                      | Room.amenities             |
| Fan / AC               | Yes / No                                      | Room.amenities             |
| Window / Ventilation   | Yes / No                                      | Room.amenities             |
| Desk Lamp / Reading Light | Yes / No                                   | Room.amenities             |

> ✅ Notes:
> - Room-level amenities are **strict filters** in Step 2 of the multi-question wizard.
> - Each room can have different values; Solo vs Bedspace rooms have separate applicable fields.
> - Price always comes from Room.price to avoid conflicts with listing-level price.

---

## 2. Listing-Level Amenities

These amenities apply to the **whole boarding house or apartment**:

| Amenity                   | Type / Notes                                   | Backend Mapping            |
|----------------------------|-----------------------------------------------|----------------------------|
| WiFi / Internet            | Yes / No                                      | Listing.amenities          |
| Laundry Area / Washer      | Yes / No                                      | Listing.amenities          |
| Parking / Garage           | Yes / No                                      | Listing.amenities          |
| Gated / Secure             | Yes / No                                      | Listing.amenities          |
| 24h Security / Guard       | Yes / No                                      | Listing.security24h        |
| CCTV / Surveillance        | Yes / No                                      | Listing.cctv               |
| Fire Safety Equipment      | Yes / No                                      | Listing.fireSafety         |
| Study Room / Common Area   | Yes / No                                      | Listing.amenities          |
| Kitchen / Shared Kitchen   | Yes / No                                      | Listing.amenities          |
| Elevator / Accessible      | Yes / No                                      | Listing.amenities          |
| Near Public Transport      | Yes / No                                      | Listing.nearTransport      |
| Quiet Environment / Noise Control | Yes / No                              | Listing.quietEnvironment   |
| Flexible Lease / Short-Term Stay | Yes / No                                | Listing.flexibleLease      |
| Pet-Friendly               | Yes / No                                      | Listing.petsAllowed        |
| Visitor-Friendly           | Yes / No                                      | Listing.visitorsAllowed    |
| Smoking Allowed            | Yes / No                                      | Listing.smokingAllowed     |
| Furnished                  | Yes / No                                      | Listing.amenities          |
| Gym / Pool / Recreation    | Yes / No                                      | Listing.amenities          |
| Elevator / Wheelchair Accessible | Yes / No                                | Listing.amenities          |

> ✅ Notes:
> - Listing-level amenities are **secondary filters** (Step 6 in the wizard)
> - Avoid duplication of room-level amenities here (e.g., private bathroom, private kitchen)

---

## 3. Recommended Categories

| Category Name               | Notes / Purpose |
|------------------------------|----------------|
| Student-Friendly            | Near campus, study-focused environment |
| Budget-Friendly             | Affordable for students or working individuals |
| Premium / Private           | Higher-end boarding houses or private rooms |
| Family-Friendly             | Allows visitors, pets, or accommodates small families |
| Pet-Friendly                | Explicitly allows pets |
| Apartment                   | Full apartment listing, not typical boarding rooms |
| Short-Term / Flexible Lease | Temporary stays or short-term rentals |
| Quiet / Study Environment   | Focused on study-friendly, noise-controlled environment |
| Extended Suggestions        | Optional: Near Cafeteria/Stores, Furnished, Pool/Gym, Accessible / Elevator |

> ✅ Notes:
> - Multi-select allowed in Step 5
> - Categories only filter **listing-level**, not individual rooms
> - Standardize category names in backend (e.g., kebab-case) for consistency

---

## 4. Extra / Optional Amenities (Ideas for Future)

- Solar Panels / Eco-Friendly
- Rooftop / Terrace
- Coffee Station / Pantry
- Bicycle Parking / Storage
- Community Lounge / TV Room
- Shared Garden / Outdoor Space
- Smart Lock / Keyless Entry
- Noise-Cancelling / Soundproofing
- Recycling / Composting Options

> These can be added as optional listing-level or room-level amenities in future iterations.

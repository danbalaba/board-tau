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
  status        String   @default("pending")
  approvedAt    DateTime?
  approvedBy    String? @db.ObjectId

  // Rules / Preferences
  femaleOnly    Boolean? @default(false)
  maleOnly      Boolean? @default(false)
  visitorsAllowed Boolean? @default(true)
  petsAllowed   Boolean? @default(false)
  smokingAllowed Boolean? @default(false)

  // Advanced Filters
  security24h   Boolean? @default(false)
  cctv          Boolean? @default(false)
  fireSafety    Boolean? @default(false)
  nearTransport Boolean? @default(false)
  studyFriendly Boolean? @default(false)
  quietEnvironment Boolean? @default(false)
  flexibleLease Boolean? @default(false)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  reservations Reservation[]
  reviews      Review[]
  rooms        Room[]
  inquiries    Inquiry[]
}

model Room {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  listingId      String   @db.ObjectId
  name           String
  price          Int
  capacity       Int           // for bedspace rooms
  availableSlots Int
  images         String[]
  roomType       String?   // solo, bedspace
  bedType        String?   // Single / Double / Queen / Bunk
  size           Float?    // optional sq.m
  amenities      String[]  // room-level amenities (bathroom, kitchen, AC, desk, etc.)
  status         String?   // available, full

  listing Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  inquiries Inquiry[]
}

model ListingImage {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  listingId String   @db.ObjectId
  url       String
  caption   String?  @default("Photo")
  order     Int      @default(0)
  roomType  String?  @default("General")
  createdAt DateTime @default(now())

  listing Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
}

model Reservation {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  userId        String   @db.ObjectId
  listingId     String   @db.ObjectId
  startDate     DateTime
  endDate       DateTime
  totalPrice    Int
  status        String   @default("pending")
  paymentStatus String   @default("pending")
  paymentMethod String?
  paymentReference String?
  createdAt     DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  listing Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
}

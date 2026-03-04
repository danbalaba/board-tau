// Enterprise-Grade DBML for BoardTAU with Explicit Relationship Multiplicity


// Enums for type safety
Enum Role {
  USER
  ADMIN
  LANDLORD
}


Enum InquiryStatus {
  PENDING
  APPROVED
  REJECTED
  EXPIRED
}


Enum PaymentStatus {
  UNPAID
  PENDING
  PAID
  REFUNDED
  FAILED
}


Enum ContactMethod {
  PHONE
  EMAIL
  SMS
}


Enum ReservationStatus {
  PENDING
  CONFIRMED
  CANCELLED
}


Enum PaymentMethod {
  GCASH
  MAYA
  BANK_TRANSFER
  CASH
}


Enum RoomType {
  SOLO
  BEDSPACE
}


Enum BedType {
  SINGLE
  DOUBLE
  QUEEN
  BUNK
}


Enum RoomStatus {
  AVAILABLE
  FULL
  MAINTENANCE
}


Table users {
  user_id varchar [primary key]
  name varchar
  email varchar [unique]
  email_verified timestamp
  image varchar
  password varchar
  favorite_ids varchar[] [note: 'default: []']
  role Role [note: 'default: USER']
  is_active boolean [note: 'default: true']
  deleted_at timestamp
  is_verified_landlord boolean [note: 'default: false']
  landlord_approved_at timestamp
  landlord_verification_docs varchar
  business_name varchar
  phone_number varchar
  last_login timestamp
  created_at timestamp [note: 'default: now()']
  updated_at timestamp [note: 'auto-updated']
}


Table accounts {
  account_id varchar [primary key]
  user_id varchar
  type varchar
  provider varchar
  provider_account_id varchar
  refresh_token varchar
  access_token varchar
  expires_at integer
  token_type varchar
  scope varchar
  id_token varchar
  session_state varchar
}


Table listings {
  listing_id varchar [primary key]
  title varchar
  description varchar
  image_src varchar
  room_count integer
  bathroom_count integer
  user_id varchar
  price integer [note: 'min price or base listing price']
  country varchar
  latitude float [note: 'range -90 to 90']
  longitude float [note: 'range -180 to 180']
  location json [note: 'GeoJSON point']
  region varchar
  rating float [note: 'default: 4.8']
  review_count integer [note: 'default: 0']
  status varchar [note: 'default: pending']
  approved_at timestamp
  approved_by varchar
  created_at timestamp [note: 'default: now()']
  updated_at timestamp [note: 'auto-updated']
}


Table listing_amenities {
  listing_amenities_id varchar [primary key]
  listing_id varchar
  wifi boolean [note: 'default: false']
  parking boolean [note: 'default: false']
  pool boolean [note: 'default: false']
  gym boolean [note: 'default: false']
  air_conditioning boolean [note: 'default: false']
  laundry boolean [note: 'default: false']
  created_at timestamp [note: 'default: now()']
  updated_at timestamp [note: 'auto-updated']
}


Table listing_rules {
  listing_rule_id varchar [primary key]
  listing_id varchar
  female_only boolean [note: 'default: false']
  male_only boolean [note: 'default: false']
  visitors_allowed boolean [note: 'default: true']
  pets_allowed boolean [note: 'default: false']
  smoking_allowed boolean [note: 'default: false']
  created_at timestamp [note: 'default: now()']
  updated_at timestamp [note: 'auto-updated']
}


Table listing_features {
  listing_features_id varchar [primary key]
  listing_id varchar
  security24h boolean [note: 'default: false']
  cctv boolean [note: 'default: false']
  fire_safety boolean [note: 'default: false']
  near_transport boolean [note: 'default: false']
  study_friendly boolean [note: 'default: false']
  quiet_environment boolean [note: 'default: false']
  flexible_lease boolean [note: 'default: false']
  created_at timestamp [note: 'default: now()']
  updated_at timestamp [note: 'auto-updated']
}


Table categories {
  category_id varchar [primary key]
  name varchar [unique]
  label varchar
  icon varchar
  description varchar
  created_at timestamp [note: 'default: now()']
  updated_at timestamp [note: 'auto-updated']
}


Table listing_categories {
  listing_categories_id varchar [primary key]
  listing_id varchar
  category_id varchar
  created_at timestamp [note: 'default: now()']
  updated_at timestamp [note: 'auto-updated']
}


Table rooms {
  room_id varchar [primary key]
  listing_id varchar
  name varchar
  price integer
  capacity integer
  available_slots integer
  room_type RoomType
  bed_type BedType
  size float [note: 'sq.m']
  status RoomStatus [note: 'default: AVAILABLE']
  created_at timestamp [note: 'default: now()']
  updated_at timestamp [note: 'auto-updated']
}


Table room_images {
  room_images_id varchar [primary key]
  room_id varchar
  url varchar
  caption varchar [note: 'default: Photo']
  order integer [note: 'default: 0']
  created_at timestamp [note: 'default: now()']
  updated_at timestamp [note: 'auto-updated']
}


Table room_amenity_types {
  amenity_type_id varchar [primary key]
  name varchar [unique]
  icon varchar
  description varchar
  created_at timestamp [note: 'default: now()']
  updated_at timestamp [note: 'auto-updated']
}


Table room_amenities {
  room_amenities_id varchar [primary key]
  room_id varchar
  amenity_type_id varchar
  created_at timestamp [note: 'default: now()']
  updated_at timestamp [note: 'auto-updated']
}


Table inquiries {
  inquiry_id varchar [primary key]
  listing_id varchar
  room_id varchar
  user_id varchar
  move_in_date date
  stay_duration integer [note: 'in days']
  occupants_count integer
  role Role [note: 'default: TENANT']
  has_pets boolean
  smokes boolean
  contact_method ContactMethod
  message varchar
  status InquiryStatus [note: 'default: PENDING']
  payment_status PaymentStatus [note: 'default: UNPAID']
  is_approved boolean [note: 'default: false']
  approved_by varchar
  approved_at timestamp
  created_at timestamp [note: 'default: now()']
  updated_at timestamp [note: 'auto-updated']
}


Table listing_images {
  listing_images_id varchar [primary key]
  listing_id varchar
  url varchar
  caption varchar [note: 'default: Photo']
  order integer [note: 'default: 0']
  room_type varchar [note: 'default: General']
  created_at timestamp [note: 'default: now()']
  updated_at timestamp [note: 'auto-updated']
}


Table reservations {
  reservation_id varchar [primary key]
  user_id varchar
  listing_id varchar
  room_id varchar
  inquiry_id varchar [unique]
  start_date timestamp
  end_date timestamp
  duration_in_days integer
  total_price integer
  status ReservationStatus [note: 'default: PENDING']
  payment_status PaymentStatus [note: 'default: PENDING']
  payment_method PaymentMethod
  payment_reference varchar
  created_at timestamp [note: 'default: now()']
  updated_at timestamp [note: 'auto-updated']
}


Table reviews {
  reviews_id varchar [primary key]
  user_id varchar
  listing_id varchar
  rating integer [note: '1-5']
  comment varchar
  cleanliness integer [note: '1-5']
  accuracy integer [note: '1-5']
  communication integer [note: '1-5']
  location integer [note: '1-5']
  value integer [note: '1-5']
  status varchar [note: 'default: approved']
  created_at timestamp [note: 'default: now()']
  response varchar
  responded_at timestamp
  updated_at timestamp [note: 'auto-updated']
}


Table messages {
  message_id varchar [primary key]
  sender_id varchar
  receiver_id varchar
  content varchar
  read boolean [note: 'default: false']
  created_at timestamp [note: 'default: now()']
  updated_at timestamp [note: 'auto-updated']
}


Table admin_activity_logs {
  admin_activity_logs_id varchar [primary key]
  admin_id varchar
  action varchar
  entity_type varchar
  entity_id varchar
  details varchar
  ip_address varchar
  user_agent varchar
  created_at timestamp [note: 'default: now()']
  updated_at timestamp [note: 'auto-updated']
}


Table email_otps {
  email_otps_id varchar [primary key]
  user_id varchar
  email varchar
  otp_hash varchar
  expires_at timestamp
  attempts integer [note: 'default: 0']
  used boolean [note: 'default: false']
  lockout_until timestamp
  is_permanently_locked boolean [note: 'default: false']
  created_at timestamp [note: 'default: now()']
  updated_at timestamp [note: 'auto-updated']
}


Table host_applications {
  host_applications_id varchar [primary key]
  user_id varchar [unique]
  status varchar [note: 'default: pending']
  business_info json
  property_info json
  contact_info json
  property_config json
  property_images json
  documents json
  admin_notes varchar
  approved_by varchar
  rejected_by varchar
  rejected_reason varchar
  created_at timestamp [note: 'default: now()']
  updated_at timestamp [note: 'auto-updated']
}


// Relationships with explicit multiplicity
// 1-to-many relationships
Ref: accounts.user_id > users.user_id [delete: cascade, update: cascade] // 1 user has many accounts
Ref: listings.user_id > users.user_id [delete: cascade, update: cascade] // 1 user has many listings
Ref: reservations.user_id > users.user_id [delete: cascade, update: cascade] // 1 user has many reservations
Ref: reviews.user_id > users.user_id [delete: cascade, update: cascade] // 1 user has many reviews
Ref: messages.sender_id > users.user_id [delete: cascade, update: cascade] // 1 user has many sent messages
Ref: messages.receiver_id > users.user_id [delete: cascade, update: cascade] // 1 user has many received messages
Ref: admin_activity_logs.admin_id > users.user_id [delete: cascade, update: cascade] // 1 user has many admin activity logs
Ref: inquiries.user_id > users.user_id [delete: cascade, update: cascade] // 1 user has many inquiries

Ref: rooms.listing_id > listings.listing_id [delete: cascade, update: cascade] // 1 listing has many rooms
Ref: reviews.listing_id > listings.listing_id [delete: cascade, update: cascade] // 1 listing has many reviews
Ref: reservations.listing_id > listings.listing_id [delete: cascade, update: cascade] // 1 listing has many reservations
Ref: inquiries.listing_id > listings.listing_id [delete: cascade, update: cascade] // 1 listing has many inquiries
Ref: listing_images.listing_id > listings.listing_id [delete: cascade, update: cascade] // 1 listing has many images
Ref: listing_amenities.listing_id > listings.listing_id [delete: cascade, update: cascade] // 1 listing has 1 amenities record (unique constraint)
Ref: listing_rules.listing_id > listings.listing_id [delete: cascade, update: cascade] // 1 listing has 1 rules record (unique constraint)
Ref: listing_features.listing_id > listings.listing_id [delete: cascade, update: cascade] // 1 listing has 1 features record (unique constraint)
Ref: listing_categories.listing_id > listings.listing_id [delete: cascade, update: cascade] // 1 listing has many categories (through junction table)

Ref: room_images.room_id > rooms.room_id [delete: cascade, update: cascade] // 1 room has many images
Ref: room_amenities.room_id > rooms.room_id [delete: cascade, update: cascade] // 1 room has many amenities
Ref: inquiries.room_id > rooms.room_id [delete: cascade, update: cascade] // 1 room has many inquiries
Ref: reservations.room_id > rooms.room_id [delete: cascade, update: cascade] // 1 room has many reservations

// 1-to-1 relationships (enforced by unique constraints)
Ref: host_applications.user_id > users.user_id [delete: cascade, update: cascade] // 1 user has at most 1 host application (unique constraint on user_id)
Ref: reservations.inquiry_id > inquiries.inquiry_id [delete: cascade, update: cascade] // 1 inquiry has at most 1 reservation (unique constraint on inquiry_id)

// Many-to-many relationships (through junction table)
Ref: listing_categories.category_id > categories.category_id [delete: cascade, update: cascade] // Categories and Listings have many-to-many relationship
Ref: room_amenities.amenity_type_id > room_amenity_types.amenity_type_id [delete: cascade, update: cascade] // RoomAmenityTypes and Rooms have many-to-many relationship

// Optional relationships
Ref: email_otps.user_id > users.user_id [delete: set null, update: cascade] // Optional: 1 user has many email OTPs, OTP can exist without user (for new registrations)

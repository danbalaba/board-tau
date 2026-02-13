import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Sample user data (landlord who owns all listings)
const landlord = {
  name: "TAU Property Management",
  email: "landlord@boardtau.test",
  password: "TestPassword@123",
  image: "https://api.placeholder.com/avatar.jpg",
};

const admin = {
  name: "BoardTAU Admin",
  email: "admin@boardtau.test",
  password: "AdminPassword@123",
  image: "https://api.placeholder.com/avatar-admin.jpg",
};

// Sample review users (students who reviewed)
const reviewUsers = [
  {
    name: "Maria Santos",
    email: "maria@student.edu",
    password: "Password@123",
    image: "https://api.placeholder.com/avatar1.jpg",
  },
  {
    name: "Juan Cruz",
    email: "juan@student.edu",
    password: "Password@123",
    image: "https://api.placeholder.com/avatar2.jpg",
  },
  {
    name: "Angela Garcia",
    email: "angela@student.edu",
    password: "Password@123",
    image: "https://api.placeholder.com/avatar3.jpg",
  },
  {
    name: "Pedro Reyes",
    email: "pedro@student.edu",
    password: "Password@123",
    image: "https://api.placeholder.com/avatar4.jpg",
  },
];

// College coordinates
const collegeCoords = {
  tau_main: { lat: 15.63518934952113, lng: 120.41534319307087 },
  business: { lat: 15.634774341020552, lng: 120.41528626800934 },
  agriculture: { lat: 15.635649073095486, lng: 120.41702286280831 },
  arts_sciences: { lat: 15.638503448247318, lng: 120.41833579832978 },
  engineering: { lat: 15.638672012492403, lng: 120.41936420944664 },
  education: { lat: 15.639791700860322, lng: 120.42096190207734 },
  veterinary: { lat: 15.634976705901163, lng: 120.41620260960734 },
};

// Distance zones for realistic location distribution (km to degrees)
const distanceZones = [
  { name: "0-0.5km", offset: 0.003 }, // ~0.5km
  { name: "0.5-2km", offset: 0.01 }, // ~2km
  { name: "2-6km", offset: 0.03 }, // ~6km
  { name: "6-15km", offset: 0.08 }, // ~15km
];

const generateNearbyCoords = (
  baseCoord: { lat: number; lng: number },
  distanceZone: string = "0-0.5km"
) => {
  const zone = distanceZones.find(z => z.name === distanceZone) || distanceZones[0];
  const latOffset = (Math.random() - 0.5) * zone.offset * 2;
  const lngOffset = (Math.random() - 0.5) * zone.offset * 2;
  return {
    lat: baseCoord.lat + latOffset,
    lng: baseCoord.lng + lngOffset,
  };
};

// Enhanced image URL pool with more variety
const FALLBACK_IMAGE_URLS = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop", // Living room
  "https://images.unsplash.com/photo-1537225228614-b4fb1607a215?w=1200&h=800&fit=crop", // Bedroom
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop", // Kitchen
  "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&h=800&fit=crop", // Bathroom
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop", // Bedroom interior
  "https://images.unsplash.com/photo-1538895122582-c06aa6c0e3c2?w=1200&h=800&fit=crop", // Living room 2
  "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=800&fit=crop", // Modern space
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=800&fit=crop", // Bedroom detail
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop", // Bedroom 3
  "https://images.unsplash.com/photo-1616594039964-ae9021eadecf?w=1200&h=800&fit=crop", // Bedroom 4
  "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200&h=800&fit=crop", // Living room 3
  "https://images.unsplash.com/photo-1574959902089-b4cea7e96ac1?w=1200&h=800&fit=crop", // Bathroom 2
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&h=800&fit=crop", // Exterior
  "https://images.unsplash.com/photo-1585399364352-19d6fb5e5b0d?w=1200&h=800&fit=crop", // Bathroom 3
  "https://images.unsplash.com/photo-1519167758993-44d79c5f3769?w=1200&h=800&fit=crop", // Dorm room
  "https://images.unsplash.com/photo-1560185007-6e8f0845d218?w=1200&h=800&fit=crop", // Study room
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=800&fit=crop", // Kitchen 2
  "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&h=800&fit=crop", // Balcony
];

const DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop";

// Helper to get reliable image URL with fallback
const getImageUrl = (url: string | null | undefined, index: number = 0): string => {
  if (url && url.startsWith("https://")) {
    return url;
  }
  return FALLBACK_IMAGE_URLS[index % FALLBACK_IMAGE_URLS.length] || DEFAULT_FALLBACK_IMAGE;
};

// ENHANCED: More stock images per listing with room types and fallback URLs
const generateListingImages = (listingTitle: string) => {
  const allImages = [
    { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop", roomType: "Living Room" },
    { url: "https://images.unsplash.com/photo-1537225228614-b4fb1607a215?w=1200&h=800&fit=crop", roomType: "Bedroom" },
    { url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop", roomType: "Kitchen" },
    { url: "https://images.unsplash.com/photo-1585399364352-19d6fb5e5b0d?w=1200&h=800&fit=crop", roomType: "Bathroom" },
    { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop", roomType: "Bedroom" },
    { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop", roomType: "Common Area" },
    { url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&h=800&fit=crop", roomType: "Exterior" },
    { url: "https://images.unsplash.com/photo-1616594039964-ae9021eadecf?w=1200&h=800&fit=crop", roomType: "Bedroom" },
    { url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=800&fit=crop", roomType: "Bedroom" },
    { url: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200&h=800&fit=crop", roomType: "Living Room" },
    { url: "https://images.unsplash.com/photo-1574959902089-b4cea7e96ac1?w=1200&h=800&fit=crop", roomType: "Bathroom" },
    { url: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=800&fit=crop", roomType: "Common Area" },
  ];

  const numImages = Math.floor(Math.random() * 4) + 5; // 5-8 images per listing
  const selectedImages: { url: string; roomType: string }[] = [];
  const availableImages = [...allImages];

  while (selectedImages.length < numImages && availableImages.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableImages.length);
    selectedImages.push(availableImages[randomIndex]);
    availableImages.splice(randomIndex, 1);
  }

  return selectedImages.map((img, index) => ({
    url: getImageUrl(img.url, index),
    caption: img.roomType,
    roomType: img.roomType,
    order: index,
  }));
};

// ENHANCED: More amenities (matching frontend)
const EXPANDED_AMENITIES = [
  "WiFi",
  "Own CR",
  "Shared CR",
  "Kitchen Access",
  "Laundry Area",
  "Air Conditioning",
  "Study Area / Quiet Room",
  "Gated / Secure",
  "Parking",
  "Curfew Enforced",
  "Dedicated workspace",
  "Refrigerator",
  "Microwave",
  "Water supply (24/7)",
  "Electricity included",
  "Visitors allowed",
  "Cooking allowed",
  "Pets allowed",
  "CCTV",
  "Security guard",
  "Study desk",
  "Closet",
  "Balcony",
  "Smoke alarm",
  "Fire extinguisher",
  "Hot water",
  "Fan",
  "Common lounge",
  "Library",
  "Medical clinic nearby",
  "ATM nearby",
  "Convenience store nearby",
  "Phone charging station",
  "Board games",
];

const titleSuffixes = [
  "(Block A)", "(Phase 2)", "(Near Gate 3)", "(North Campus)", "(South Wing)", "(East Tower)",
  "(West Annex)", "(New Building)", "(Renovated)", "(Premium)", "(Budget)", "(Deluxe)", "(Executive)",
  "(Student Special)", "(Family Friendly)", "(Modern)", "(Classic)", "(Cozy)", "(Spacious)", "(Quiet)",
  "(Lively)", "(Green)", "(Urban)", "(Rustic)", "(Minimalist)", "(Luxury)", "(Eco-Friendly)", "(Pet-Friendly)",
  "(Smoke-Free)", "(WiFi Only)", "(Near Transport)", "(Near Market)", "(Near Hospital)", "(Near Park)"
];

// Price ranges by room type
const PRICE_RANGES = {
  "Bed Spacer": { min: 1500, max: 3500 },
  "Shared": { min: 3000, max: 6000 },
  "Solo": { min: 5000, max: 9000 },
  "Premium Solo": { min: 9000, max: 15000 },
};

// Generate realistic price based on room type
const generateRealisticPrice = (roomType: string): number => {
  const range = PRICE_RANGES[roomType as keyof typeof PRICE_RANGES] || PRICE_RANGES["Solo"];
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
};

// Enhanced base listings with more variety
const baseListings = [
  {
    title: "Cozy Student Haven near TAU",
    description:
      "Affordable, clean boarding house perfect for TAU students. Walking distance to campus, shared kitchen, and free WiFi included. Spacious rooms with comfortable beds, good lighting, and a peaceful environment for studying. Common areas include a lounge and laundry room. Welcoming landlord who is available 24/7 for any concerns. Great for making friends with fellow students from different colleges.",
    imageSrc:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
    category: "Student-Friendly",
    roomCount: 5,
    roomType: "Solo",
    bedType: "Double Bed",
    bathroomCount: 2,
    guestCount: 1,
    price: generateRealisticPrice("Solo"),
    country: "Philippines",
    region: "Tarlac",
    amenities: [
      "WiFi",
      "Kitchen Access",
      "Parking",
      "Laundry Area",
      "Water supply (24/7)",
      "Electricity included",
      "Study Area / Quiet Room",
      "Dedicated workspace",
    ],
    rating: 4.8,
    reviewCount: 4,
    coords: generateNearbyCoords(collegeCoords.tau_main, "0-0.5km"),
      femaleOnly: false,
      maleOnly: false,
      visitorsAllowed: true,
      petsAllowed: false,
      smokingAllowed: false,
      security24h: false,
      cctv: false,
      fireSafety: false,
      nearTransport: false,
      studyFriendly: true,
      quietEnvironment: true,
      flexibleLease: false,
  },
  {
    title: "Budget Boarding House - Business District",
    description:
      "Very affordable option near College of Business. Basic amenities, shared rooms available. Perfect for tight budgets. Simple but clean rooms with essential furniture. Shared kitchen and dining area. Strong community atmosphere with weekend gatherings. Responsible landlord who maintains strict but fair house rules.",
    imageSrc:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
    category: "Budget Boarding House",
    roomCount: 8,
    roomType: "Shared",
    bedType: "Single Bed",
    bathroomCount: 3,
    guestCount: 2,
    price: generateRealisticPrice("Shared"),
    country: "Philippines",
    region: "Tarlac",
    amenities: [
      "Kitchen Access",
      "Parking",
      "Water supply (24/7)",
      "Electricity included",
      "Common lounge",
      "Security guard",
    ],
    rating: 4.3,
    reviewCount: 3,
    coords: generateNearbyCoords(collegeCoords.business, "0.5-2km"),
      femaleOnly: false,
      maleOnly: false,
      visitorsAllowed: true,
      petsAllowed: false,
      smokingAllowed: false,
      security24h: false,
      cctv: false,
      fireSafety: false,
      nearTransport: true,
      studyFriendly: false,
      quietEnvironment: false,
      flexibleLease: true,
  },
  {
    title: "Female-Only Boarding House - Secure & Safe",
    description:
      "Exclusively for female students and professionals. 24/7 security, CCTV, and caring management. Near Education College. Private rooms with secure locks. Strict visitor policy to ensure safety. Professional landlady who is like a mother to all residents. CCTV in common areas and entryway. Multiple fire safety equipment. Regular house meetings to address concerns.",
    imageSrc:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    category: "Female-Only",
    roomCount: 6,
    roomType: "Solo",
    bedType: "Single Bed",
    bathroomCount: 3,
    guestCount: 1,
    price: generateRealisticPrice("Solo"),
    country: "Philippines",
    region: "Tarlac",
    amenities: [
      "WiFi",
      "Security guard",
      "Kitchen Access",
      "Parking",
      "CCTV",
      "Water supply (24/7)",
      "Hot water",
      "Smoke alarm",
    ],
    rating: 4.9,
    reviewCount: 4,
    coords: generateNearbyCoords(collegeCoords.education, "0-0.5km"),
      femaleOnly: true,
      maleOnly: false,
      visitorsAllowed: false,
      petsAllowed: false,
      smokingAllowed: false,
      security24h: true,
      cctv: true,
      fireSafety: true,
      nearTransport: false,
      studyFriendly: true,
      quietEnvironment: true,
      flexibleLease: false,
  },
  {
    title: "Modern Rooms with AC - Premium Living",
    description:
      "Air-conditioned rooms with modern furnishings. WiFi, hot water, and laundry service included. Near Engineering College. Each room has its own bathroom (semi-private). Fully furnished with study desk and chair. Air conditioning with individual controls. Hot water available 24/7. Professional laundry service twice a week. Quiet and peaceful environment suitable for serious students.",
    imageSrc:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop",
    category: "Private Boarding House",
    roomCount: 4,
    roomType: "Solo",
    bedType: "Double Bed",
    bathroomCount: 2,
    guestCount: 1,
    price: generateRealisticPrice("Premium Solo"),
    country: "Philippines",
    region: "Tarlac",
    amenities: [
      "WiFi",
      "Air Conditioning",
      "Kitchen Access",
      "Parking",
      "Laundry Area",
      "Dedicated workspace",
      "Water supply (24/7)",
      "Hot water",
    ],
    rating: 4.7,
    reviewCount: 3,
    coords: generateNearbyCoords(collegeCoords.engineering, "0.5-2km"),
      femaleOnly: false,
      maleOnly: false,
      visitorsAllowed: true,
      petsAllowed: false,
      smokingAllowed: false,
      security24h: true,
      cctv: false,
      fireSafety: true,
      nearTransport: true,
      studyFriendly: true,
      quietEnvironment: true,
      flexibleLease: true,
  },
  {
    title: "Bed Spacer Rooms - Affordable Shared Living",
    description:
      "Budget-friendly bed spacer rooms in a hostel-style setup. Great for making friends. Shared amenities and common areas. Vibrant community of students from different colleges. Dorm-style rooms with good bedding. Shared kitchen with cooking schedule. Common lounge for socializing. Community events organized monthly. Perfect for outgoing students who want a social environment.",
    imageSrc:
      "https://images.unsplash.com/photo-1519167758993-44d79c5f3769?w=400&h=300&fit=crop",
    category: "Budget Boarding House",
    roomCount: 10,
    roomType: "Bed Spacer",
    bedType: "Single Bed (Shared Room)",
    bathroomCount: 4,
    guestCount: 3,
    price: generateRealisticPrice("Bed Spacer"),
    country: "Philippines",
    region: "Tarlac",
    amenities: [
      "WiFi",
      "Kitchen Access",
      "Parking",
      "Water supply (24/7)",
      "Electricity included",
      "Common lounge",
      "Board games",
    ],
    rating: 4.5,
    reviewCount: 4,
    coords: generateNearbyCoords(collegeCoords.tau_main, "2-6km"),
      femaleOnly: false,
      maleOnly: false,
      visitorsAllowed: true,
      petsAllowed: false,
      smokingAllowed: false,
      security24h: false,
      cctv: false,
      fireSafety: false,
      nearTransport: false,
      studyFriendly: false,
      quietEnvironment: false,
      flexibleLease: true,
  },
  {
    title: "Male-Only Dormitory - Near Engineering",
    description:
      "Exclusively for male students. Spacious rooms with study areas. Near Engineering College. 24/7 security and surveillance. Regular maintenance checks. Strict adherence to university guidelines. Social events every month. Professional management team. Great for engineering students looking for a focused study environment.",
    imageSrc:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
    category: "Male-Only",
    roomCount: 7,
    roomType: "Solo",
    bedType: "Single Bed",
    bathroomCount: 3,
    guestCount: 1,
    price: generateRealisticPrice("Solo"),
    country: "Philippines",
    region: "Tarlac",
    amenities: [
      "WiFi",
      "Security guard",
      "Kitchen Access",
      "Parking",
      "CCTV",
      "Water supply (24/7)",
      "Hot water",
      "Study Area / Quiet Room",
    ],
    rating: 4.6,
    reviewCount: 5,
    coords: generateNearbyCoords(collegeCoords.engineering, "0-0.5km"),
      femaleOnly: false,
      maleOnly: true,
      visitorsAllowed: false,
      petsAllowed: false,
      smokingAllowed: false,
      security24h: true,
      cctv: true,
      fireSafety: true,
      nearTransport: false,
      studyFriendly: true,
      quietEnvironment: true,
      flexibleLease: false,
  },
  {
    title: "Luxury Studio Apartments - Downtown",
    description:
      "Premium studio apartments with private bathrooms. Fully furnished with modern amenities. Near city center and transport. Each apartment has its own kitchenette. High-speed WiFi. 24/7 security and concierge service. Perfect for professionals and postgraduate students. Quiet building with strict noise regulations.",
    imageSrc:
      "https://images.unsplash.com/photo-1560185007-6e8f0845d218?w=400&h=300&fit=crop",
    category: "Luxury",
    roomCount: 3,
    roomType: "Premium Solo",
    bedType: "Queen Bed",
    bathroomCount: 3,
    guestCount: 1,
    price: generateRealisticPrice("Premium Solo"),
    country: "Philippines",
    region: "Tarlac",
    amenities: [
      "WiFi",
      "Air Conditioning",
      "Kitchen Access",
      "Parking",
      "Laundry Area",
      "Dedicated workspace",
      "Water supply (24/7)",
      "Hot water",
      "CCTV",
    ],
    rating: 4.9,
    reviewCount: 6,
    coords: generateNearbyCoords(collegeCoords.business, "0.5-2km"),
      femaleOnly: false,
      maleOnly: false,
      visitorsAllowed: true,
      petsAllowed: false,
      smokingAllowed: false,
      security24h: true,
      cctv: true,
      fireSafety: true,
      nearTransport: true,
      studyFriendly: true,
      quietEnvironment: true,
      flexibleLease: true,
  },
  {
    title: "Family-Friendly Boarding House",
    description:
      "Spacious rooms suitable for small families. Near education and agriculture colleges. Shared kitchen and dining area. Safe and secure neighborhood. Play area for children. Quiet environment with green surroundings. Professional and caring management. Suitable for married students and small families.",
    imageSrc:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop",
    category: "Family-Friendly",
    roomCount: 6,
    roomType: "Solo",
    bedType: "Queen Bed",
    bathroomCount: 3,
    guestCount: 2,
    price: generateRealisticPrice("Solo"),
    country: "Philippines",
    region: "Tarlac",
    amenities: [
      "WiFi",
      "Kitchen Access",
      "Parking",
      "Laundry Area",
      "Water supply (24/7)",
      "Electricity included",
      "Play area",
      "Garden",
    ],
    rating: 4.4,
    reviewCount: 4,
    coords: generateNearbyCoords(collegeCoords.agriculture, "2-6km"),
      femaleOnly: false,
      maleOnly: false,
      visitorsAllowed: true,
      petsAllowed: true,
      smokingAllowed: false,
      security24h: false,
      cctv: false,
      fireSafety: false,
      nearTransport: false,
      studyFriendly: false,
      quietEnvironment: true,
      flexibleLease: true,
  },
];

const generateListings = () => {
  const expandedListings: any[] = [];
  const numberOfVariations = 25; // This will give us 8 base * 25 = 200 listings, then we select 100 unique ones

  for (let i = 0; i < numberOfVariations; i++) {
    baseListings.forEach(baseListing => {
      const suffix = titleSuffixes[i % titleSuffixes.length];
      const priceVariance = Math.floor(Math.random() * 501) + 250; // ±250-750
      const priceMultiplier = Math.random() > 0.5 ? 1 : -1;
      const roomCountVariance = Math.floor(Math.random() * 3) - 1; // ±1
      const distanceZone = distanceZones[Math.floor(Math.random() * distanceZones.length)].name;

      const newListing = {
        ...baseListing,
        title: `${baseListing.title} ${suffix}`,
        price: Math.max(1500, baseListing.price + (priceVariance * priceMultiplier)),
        roomCount: Math.max(1, baseListing.roomCount + roomCountVariance),
        bathroomCount: Math.max(1, baseListing.bathroomCount + Math.floor(Math.random() * 2) - 0.5),
        guestCount: Math.max(1, baseListing.guestCount + Math.floor(Math.random() * 2) - 0.5),
        coords: generateNearbyCoords(baseListing.coords, distanceZone),
        amenities: generateRandomAmenities(),
        reviewCount: Math.floor(Math.random() * 16), // 0-15 reviews
        rating: 3 + Math.random() * 2, // 3-5 rating
        // Randomize boolean flags
          femaleOnly: Math.random() > 0.9, // 10% chance female only
          maleOnly: Math.random() > 0.9, // 10% chance male only
          visitorsAllowed: Math.random() > 0.2, // 80% chance visitors allowed
          petsAllowed: Math.random() > 0.8, // 20% chance pets allowed
          smokingAllowed: Math.random() > 0.8, // 20% chance smoking allowed
          security24h: Math.random() > 0.5, // 50% chance 24h security
          cctv: Math.random() > 0.5, // 50% chance CCTV
          fireSafety: Math.random() > 0.3, // 70% chance fire safety
          nearTransport: Math.random() > 0.5, // 50% chance near transport
          studyFriendly: Math.random() > 0.4, // 60% chance study friendly
          quietEnvironment: Math.random() > 0.4, // 60% chance quiet
          flexibleLease: Math.random() > 0.5, // 50% chance flexible lease
      };

      // Ensure no both maleOnly and femaleOnly true
      if (newListing.femaleOnly && newListing.maleOnly) {
        newListing.maleOnly = false;
      }

      expandedListings.push(newListing);
    });
  }

  // Select 100 unique listings
  const uniqueListings: any[] = [];
  const seenTitles = new Set();

  for (const listing of expandedListings) {
    if (!seenTitles.has(listing.title) && uniqueListings.length < 100) {
      uniqueListings.push(listing);
      seenTitles.add(listing.title);
    }
  }

  return uniqueListings;
};

// Helper function to generate random amenities from EXPANDED_AMENITIES
const generateRandomAmenities = () => {
  const numAmenities = Math.floor(Math.random() * 7) + 6; // 6-12 amenities
  const selectedAmenities: string[] = [];
  const availableAmenities = [...EXPANDED_AMENITIES];

  while (selectedAmenities.length < numAmenities && availableAmenities.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableAmenities.length);
    selectedAmenities.push(availableAmenities[randomIndex]);
    availableAmenities.splice(randomIndex, 1);
  }

  return selectedAmenities;
};

// Generate rooms for a listing with realistic room type alignment
const generateRooms = (listingId: string, listingTitle: string, listingPrice: number, roomCount: number, listingRoomType: string) => {
  const rooms = [];

  for (let i = 1; i <= roomCount; i++) {
    let roomType = listingRoomType;
    // 70% match listing room type, 30% random
    if (Math.random() > 0.7) {
      const otherTypes = ["Solo", "Shared", "Bed Spacer"].filter(t => t !== listingRoomType);
      roomType = otherTypes[Math.floor(Math.random() * otherTypes.length)];
    }

    let capacity = 1;
    let price = listingPrice;

    if (roomType === "Shared") {
      capacity = 2;
      price = Math.floor(generateRealisticPrice("Shared"));
    } else if (roomType === "Bed Spacer") {
      capacity = 4;
      price = Math.floor(generateRealisticPrice("Bed Spacer"));
    } else {
      price = Math.floor(generateRealisticPrice("Solo"));
    }

    const availableSlots = Math.floor(Math.random() * capacity) + 1; // 1 to capacity available slots

    rooms.push({
      listingId,
      name: `Room ${i}`,
      price,
      capacity,
      availableSlots,
      images: [
        "https://images.unsplash.com/photo-1537225228614-b4fb1607a215?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=800&fit=crop",
      ],
      roomType: roomType,
      status: availableSlots > 0 ? "available" : "full",
    });
  }

  return rooms;
};

const generateReviews = () => [
  {
    rating: 5,
    comment: "Excellent boarding house! Very clean and well-maintained. The owner is very responsive to any concerns. Perfect location for students!",
    cleanliness: 5,
    accuracy: 5,
    communication: 5,
    location: 4,
    value: 5,
  },
  {
    rating: 4,
    comment: "Good location near campus. Rooms are spacious and comfortable. A bit noisy during weekends but manageable. Would recommend!",
    cleanliness: 4,
    accuracy: 4,
    communication: 5,
    location: 5,
    value: 4,
  },
  {
    rating: 5,
    comment: "Perfect for students! WiFi is fast, the kitchen is well-equipped, and parking is convenient. Great value for money.",
    cleanliness: 5,
    accuracy: 5,
    communication: 4,
    location: 5,
    value: 5,
  },
  {
    rating: 4,
    comment: "Decent place to stay. Laundry service is convenient. Could improve the common area furniture. Overall satisfied.",
    cleanliness: 4,
    accuracy: 4,
    communication: 4,
    location: 4,
    value: 4,
  },
  {
    rating: 5,
    comment: "I've been staying here for 6 months and love it! The rooms are spotless, and the landlord is very kind. Highly recommend!",
    cleanliness: 5,
    accuracy: 5,
    communication: 5,
    location: 5,
    value: 5,
  },
  {
    rating: 3,
    comment: "The location is great but the WiFi can be spotty at times. The rooms are small but functional. Good for the price.",
    cleanliness: 3,
    accuracy: 4,
    communication: 3,
    location: 5,
    value: 4,
  },
  {
    rating: 4,
    comment: "Quiet and peaceful environment perfect for studying. The shared kitchen is well-maintained. Would stay again!",
    cleanliness: 4,
    accuracy: 4,
    communication: 5,
    location: 4,
    value: 4,
  },
  {
    rating: 5,
    comment: "Best boarding house near TAU! The owner goes above and beyond to make sure students are comfortable. Safe and secure.",
    cleanliness: 5,
    accuracy: 5,
    communication: 5,
    location: 5,
    value: 5,
  },
  {
    rating: 3,
    comment: "Rooms are clean but a bit pricey for the size. The water pressure in the bathroom could be better. Location is convenient though.",
    cleanliness: 4,
    accuracy: 3,
    communication: 3,
    location: 5,
    value: 3,
  },
  {
    rating: 4,
    comment: "Friendly community and good amenities. The laundry service is very convenient. Overall a great place to stay.",
    cleanliness: 4,
    accuracy: 4,
    communication: 4,
    location: 4,
    value: 5,
  },
];

// Generate reservations for availability testing
const generateReservations = (userId: string, listingId: string, listingPrice: number, checkInDate: Date) => {
  const stayDuration = Math.floor(Math.random() * 30) + 7; // 7-37 days
  const checkOutDate = new Date(checkInDate);
  checkOutDate.setDate(checkOutDate.getDate() + stayDuration);

  return {
    userId,
    listingId,
    startDate: checkInDate,
    endDate: checkOutDate,
    totalPrice: listingPrice * stayDuration,
  };
};

// Generate inquiries
const generateInquiries = (userId: string, listingId: string, roomId: string) => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const moveInMonth = months[Math.floor(Math.random() * months.length)];

  return {
    listingId,
    roomId,
    userId,
    moveInDate: `2024-${moveInMonth}-01`,
    stayDuration: `${Math.floor(Math.random() * 12) + 1} months`,
    occupantsCount: Math.floor(Math.random() * 2) + 1, // 1-2 people
    role: "Student",
    hasPets: Math.random() > 0.8, // 20% chance of having pets
    smokes: Math.random() > 0.8, // 20% chance of smoking
    contactMethod: Math.random() > 0.5 ? "Phone" : "Email",
    message: "I'm interested in this room. Can you provide more details?",
  };
};

async function main() {
  try {
    console.log("🌱 Starting enhanced database seed with 100 unique listings...\n");

    // Delete existing data
    await prisma.listingImage.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.reservation.deleteMany({});
    await prisma.inquiry.deleteMany({});
    await prisma.room.deleteMany({});
    await prisma.listing.deleteMany({});
    console.log("✓ Cleared existing listings, images, reviews, reservations, inquiries, and rooms");

    // Find or create admin user
    let adminUser = await prisma.user.findUnique({
      where: { email: admin.email },
    });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(admin.password, 10);
      adminUser = await prisma.user.create({
        data: {
          name: admin.name,
          email: admin.email,
          password: hashedPassword,
          image: admin.image,
          role: "admin",
          emailVerified: new Date(),
        },
      });
      console.log(`✓ Created admin user: ${admin.email}`);
    } else {
      if (!adminUser.emailVerified) {
        adminUser = await prisma.user.update({
          where: { id: adminUser.id },
          data: { emailVerified: new Date() },
        });
        console.log(`✓ Updated admin user emailVerified: ${admin.email}`);
      }
      console.log(`✓ Using existing admin user: ${admin.email}`);
    }

    // Find or create landlord user
     let landlordUser = await prisma.user.findUnique({
      where: { email: landlord.email },
    });

    if (!landlordUser) {
      const hashedPassword = await bcrypt.hash(landlord.password, 10);
      landlordUser = await prisma.user.create({
        data: {
          name: landlord.name,
          email: landlord.email,
          password: hashedPassword,
          image: landlord.image,
          role: "landlord",
          emailVerified: new Date(),
          isVerifiedLandlord: true, // Set to true so landlord can access dashboard
          landlordApprovedAt: new Date(), // Set approval date
        },
      });
      console.log(`✓ Created landlord user: ${landlord.email}`);
    } else {
      // Update existing landlord to be verified if not already
      if (!landlordUser.emailVerified || !landlordUser.isVerifiedLandlord) {
        landlordUser = await prisma.user.update({
          where: { id: landlordUser.id },
          data: {
            emailVerified: landlordUser.emailVerified || new Date(),
            isVerifiedLandlord: true,
            landlordApprovedAt: landlordUser.landlordApprovedAt || new Date(),
          },
        });
        console.log(`✓ Updated landlord user: ${landlord.email}`);
      } else {
        console.log(`✓ Using existing landlord user: ${landlord.email}`);
      }
    }

    // Create review users
    const reviewUserInstances: any[] = [];
    for (const reviewUserData of reviewUsers) {
      let reviewUser = await prisma.user.findUnique({
        where: { email: reviewUserData.email },
      });

      if (!reviewUser) {
        const hashedPassword = await bcrypt.hash(reviewUserData.password, 10);
        reviewUser = await prisma.user.create({
          data: {
            name: reviewUserData.name,
            email: reviewUserData.email,
            password: hashedPassword,
            image: reviewUserData.image,
            emailVerified: new Date(),
          },
        });
      } else {
        if (!reviewUser.emailVerified) {
          reviewUser = await prisma.user.update({
            where: { id: reviewUser.id },
            data: { emailVerified: new Date() },
          });
        }
      }
      reviewUserInstances.push(reviewUser);
    }
    console.log(`✓ Created/found ${reviewUserInstances.length} review users\n`);

    // Generate and insert listings with images and reviews
    const listings = generateListings();
    let createdCount = 0;
    let imageCount = 0;
    let reviewCount = 0;
    let reservationCount = 0;
    let inquiryCount = 0;
    let roomCount = 0;

    for (const listingData of listings) {
      const { coords, rating: initialRating, reviewCount: expectedReviews, ...rest } = listingData;

      const listing = await prisma.listing.create({
        data: {
          ...rest,
          latlng: [coords.lng, coords.lat], // Prisma expects [lng, lat]
          userId: landlordUser.id,
          rating: initialRating,
          reviewCount: expectedReviews,
          status: "active", // Set status to active so listings are visible
        },
      });

      // Create listing images with room types
      const listingImages = generateListingImages(listingData.title);
      for (const imageData of listingImages) {
        await prisma.listingImage.create({
          data: {
            url: imageData.url,
            caption: imageData.caption,
            roomType: imageData.roomType,
            order: imageData.order,
            listingId: listing.id,
          },
        });
        imageCount++;
      }

      // Create rooms for the listing
      const roomsData = generateRooms(listing.id, listingData.title, listingData.price, listingData.roomCount, listingData.roomType);
      const createdRooms: any[] = [];
      for (const roomData of roomsData) {
        const createdRoom = await prisma.room.create({
          data: roomData,
        });
        createdRooms.push(createdRoom);
        roomCount++;
      }

      // Create reviews with ratings
      const allReviews = generateReviews();
      const actualReviews: any[] = [];

      for (let i = 0; i < expectedReviews; i++) {
        const reviewData = allReviews[i % allReviews.length];
        const reviewUser = reviewUserInstances[Math.floor(Math.random() * reviewUserInstances.length)];
        const randomRating = Math.floor(Math.random() * 3) + 3; // 3-5 rating

        const createdReview = await prisma.review.create({
          data: {
            rating: randomRating,
            comment: reviewData.comment,
            cleanliness: Math.floor(Math.random() * 3) + 3,
            accuracy: Math.floor(Math.random() * 3) + 3,
            communication: Math.floor(Math.random() * 3) + 3,
            location: Math.floor(Math.random() * 3) + 3,
            value: Math.floor(Math.random() * 3) + 3,
            listingId: listing.id,
            userId: reviewUser.id,
          },
        });

        actualReviews.push(createdReview);
        reviewCount++;
      }

      // Recalculate average rating and review count
      if (actualReviews.length > 0) {
        const totalRating = actualReviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / actualReviews.length;

        await prisma.listing.update({
          where: { id: listing.id },
          data: {
            rating: parseFloat(averageRating.toFixed(1)),
            reviewCount: actualReviews.length,
          },
        });
      }

      // Create reservations for availability testing (50% of listings)
      if (Math.random() > 0.5) {
        const reviewUser = reviewUserInstances[Math.floor(Math.random() * reviewUserInstances.length)];
        const checkInDate = new Date();
        checkInDate.setDate(checkInDate.getDate() + Math.floor(Math.random() * 14)); // 0-14 days from now
        const reservationData = generateReservations(reviewUser.id, listing.id, listingData.price, checkInDate);

        await prisma.reservation.create({
          data: reservationData,
        });
        reservationCount++;
      }

      // Create inquiries (30% of listings)
      if (Math.random() > 0.7) {
        const reviewUser = reviewUserInstances[Math.floor(Math.random() * reviewUserInstances.length)];
        const randomRoom = createdRooms[Math.floor(Math.random() * createdRooms.length)];
        const inquiryData = generateInquiries(reviewUser.id, listing.id, randomRoom.id);

        await prisma.inquiry.create({
          data: inquiryData,
        });
        inquiryCount++;
      }

      createdCount++;
      console.log(
        `✓ Created listing ${createdCount}: "${listing.title}"`
      );
      console.log(`  └─ ${listingImages.length} images, ${actualReviews.length} reviews, ${rest.amenities.length} amenities, ${createdRooms.length} rooms`);
    }

    console.log(
      `\n🎉 Enhanced database seeding completed successfully!\n✓ Created ${createdCount} unique boarding house listings\n✓ Added ${imageCount} listing images\n✓ Added ${reviewCount} reviews\n✓ Added ${roomCount} rooms\n✓ Added ${reservationCount} reservations\n✓ Added ${inquiryCount} inquiries\n✓ All listings include expanded amenities list\n✓ Ready for testing with search and filtering functionality`
    );
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

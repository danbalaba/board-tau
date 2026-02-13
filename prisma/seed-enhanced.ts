import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Sample user data (landlord who owns all listings)
const landlord = {
  name: "TAU Property Management",
  email: "landlord@boardtau.test",
  password: "TestPassword123", // Will be hashed
  image: "https://api.placeholder.com/avatar.jpg",
};

// Sample review users (students who reviewed)
const reviewUsers = [
  {
    name: "Maria Santos",
    email: "maria@student.edu",
    password: "Password123",
    image: "https://api.placeholder.com/avatar1.jpg",
  },
  {
    name: "Juan Cruz",
    email: "juan@student.edu",
    password: "Password123",
    image: "https://api.placeholder.com/avatar2.jpg",
  },
  {
    name: "Angela Garcia",
    email: "angela@student.edu",
    password: "Password123",
    image: "https://api.placeholder.com/avatar3.jpg",
  },
  {
    name: "Pedro Reyes",
    email: "pedro@student.edu",
    password: "Password123",
    image: "https://api.placeholder.com/avatar4.jpg",
  },
];

// College coordinates for realistic placement
const collegeCoords = {
  tau_main: { lat: 15.63518934952113, lng: 120.41534319307087 },
  business: { lat: 15.634774341020552, lng: 120.41528626800934 },
  agriculture: { lat: 15.635649073095486, lng: 120.41702286280831 },
  arts_sciences: { lat: 15.638503448247318, lng: 120.41833579832978 },
  engineering: { lat: 15.638672012492403, lng: 120.41936420944664 },
  education: { lat: 15.639791700860322, lng: 120.42096190207734 },
  veterinary: { lat: 15.634976705901163, lng: 120.41620260960734 },
};

// Helper function to generate coordinates near a college (±300-500m for variation)
const generateNearbyCoords = (
  baseCoord: { lat: number; lng: number },
  offsetKm: number = 0.003
) => {
  const latOffset = (Math.random() - 0.5) * offsetKm * 2;
  const lngOffset = (Math.random() - 0.5) * offsetKm * 2;
  return {
    lat: baseCoord.lat + latOffset,
    lng: baseCoord.lng + lngOffset,
  };
};

// Sample images for listings (using Unsplash URLs)
const generateListingImages = (listingTitle: string) => {
  const imagesByListing: { [key: string]: string[] } = {
    "Cozy Student Haven near TAU": [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1537225228614-b4fb1607a215?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1585399364352-19d6fb5e5b0d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    ],
    "Budget Boarding House - Business District": [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1538895122582-c06aa6c0e3c2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1563429784482-da034e461b91?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&h=600&fit=crop",
    ],
    "Female-Only Boarding House - Secure & Safe": [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1536580494343-79b06f93c1e7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1574959902089-b4cea7e96ac1?w=800&h=600&fit=crop",
    ],
    "Modern Rooms with AC - Premium Living": [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1616594039964-ae9021eadecf?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop",
    ],
    "Bed Spacer Rooms - Affordable Shared Living": [
      "https://images.unsplash.com/photo-1519167758993-44d79c5f3769?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1534080221406-46ec66cf6fa5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1532611432672-a6995056e655?w=800&h=600&fit=crop",
    ],
  };

  return (imagesByListing[listingTitle] || [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
  ]).map((url, index) => ({
    url,
    caption: `Photo ${index + 1}`,
    order: index,
  }));
};

// Sample reviews with ratings
const generateReviews = () => [
  {
    rating: 5,
    comment: "Excellent boarding house! Very clean and well-maintained. The owner is very responsive to any concerns.",
    cleanliness: 5,
    accuracy: 5,
    communication: 5,
    location: 4,
    value: 5,
  },
  {
    rating: 4,
    comment: "Good location near campus. Rooms are spacious and comfortable. A bit noisy during weekends but manageable.",
    cleanliness: 4,
    accuracy: 4,
    communication: 5,
    location: 5,
    value: 4,
  },
  {
    rating: 5,
    comment: "Perfect for students! WiFi is fast, the kitchen is well-equipped, and parking is convenient.",
    cleanliness: 5,
    accuracy: 5,
    communication: 4,
    location: 5,
    value: 5,
  },
  {
    rating: 4,
    comment: "Decent place to stay. Laundry service is convenient. Could improve the common area furniture.",
    cleanliness: 4,
    accuracy: 4,
    communication: 4,
    location: 4,
    value: 4,
  },
];

// Sample boarding house listings
const generateListings = () => {
  return [
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
      price: 4500,
      country: "Philippines",
      region: "Tarlac",
      amenities: [
        "WiFi",
        "Kitchen",
        "Parking",
        "Laundry",
        "Water supply (24/7)",
        "Electricity included",
      ],
      rating: 4.8,
      reviewCount: 4,
      coords: generateNearbyCoords(collegeCoords.tau_main, 0.003),
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
      price: 3000,
      country: "Philippines",
      region: "Tarlac",
      amenities: [
        "Kitchen",
        "Parking",
        "Water supply (24/7)",
        "Electricity included",
      ],
      rating: 4.3,
      reviewCount: 3,
      coords: generateNearbyCoords(collegeCoords.business, 0.004),
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
      price: 5500,
      country: "Philippines",
      region: "Tarlac",
      amenities: [
        "WiFi",
        "Security guard",
        "Kitchen",
        "Parking",
        "CCTV",
        "Water supply (24/7)",
      ],
      rating: 4.9,
      reviewCount: 4,
      coords: generateNearbyCoords(collegeCoords.education, 0.003),
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
      price: 7000,
      country: "Philippines",
      region: "Tarlac",
      amenities: [
        "WiFi",
        "Air conditioning",
        "Kitchen",
        "Parking",
        "Laundry",
        "Dedicated workspace",
        "Water supply (24/7)",
      ],
      rating: 4.7,
      reviewCount: 3,
      coords: generateNearbyCoords(collegeCoords.engineering, 0.003),
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
      price: 2500,
      country: "Philippines",
      region: "Tarlac",
      amenities: [
        "WiFi",
        "Kitchen",
        "Parking",
        "Water supply (24/7)",
        "Electricity included",
      ],
      rating: 4.5,
      reviewCount: 4,
      coords: generateNearbyCoords(collegeCoords.tau_main, 0.0035),
    },
  ];
};

async function main() {
  try {
    console.log("🌱 Starting enhanced database seed with images and reviews...\n");

    // Delete existing data
    await prisma.listingImage.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.listing.deleteMany({});
    console.log("✓ Cleared existing listings, images, and reviews");

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
        },
      });
      console.log(`✓ Created landlord user: ${landlord.email}`);
    } else {
      console.log(`✓ Using existing landlord user: ${landlord.email}`);
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
          },
        });
      }
      reviewUserInstances.push(reviewUser);
    }
    console.log(`✓ Created/found ${reviewUserInstances.length} review users`);

    // Generate and insert listings with images and reviews
    const listings = generateListings();
    let createdCount = 0;
    let imageCount = 0;
    let reviewCount = 0;

    for (const listingData of listings) {
      const { coords, rating, reviewCount: expectedReviews, ...rest } = listingData;

      const listing = await prisma.listing.create({
        data: {
          ...rest,
          latlng: [coords.lat, coords.lng],
          userId: landlordUser.id,
          rating: rating,
          reviewCount: expectedReviews,
        },
      });

      // Create listing images
      const listingImages = generateListingImages(listingData.title);
      for (const imageData of listingImages) {
        await prisma.listingImage.create({
          data: {
            url: imageData.url,
            caption: imageData.caption,
            order: imageData.order,
            listingId: listing.id,
          },
        });
        imageCount++;
      }

      // Create reviews with ratings
      const reviews = generateReviews().slice(0, expectedReviews);
      for (let i = 0; i < reviews.length; i++) {
        const reviewData = reviews[i];
        const reviewUser = reviewUserInstances[i % reviewUserInstances.length];

        await prisma.review.create({
          data: {
            rating: reviewData.rating,
            comment: reviewData.comment,
            cleanliness: reviewData.cleanliness,
            accuracy: reviewData.accuracy,
            communication: reviewData.communication,
            location: reviewData.location,
            value: reviewData.value,
            listingId: listing.id,
            userId: reviewUser.id,
          },
        });
        reviewCount++;
      }

      createdCount++;
      console.log(
        `✓ Created listing: "${listing.title}" (${listingImages.length} images, ${expectedReviews} reviews)`
      );
    }

    console.log(
      `\n🎉 Enhanced database seeding completed successfully!\n✓ Created ${createdCount} boarding house listings\n✓ Added ${imageCount} listing images\n✓ Added ${reviewCount} reviews\n✓ All data is ready for testing with the new Airbnb-style layout`
    );
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

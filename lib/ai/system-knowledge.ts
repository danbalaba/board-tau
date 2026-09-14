/**
 * Authoritative BoardTAU Platform System Knowledge Base
 * Used for LLM grounding and Response Dictionary matching.
 */

export const SYSTEM_KNOWLEDGE_BASE = {
  platformName: "BoardTAU",
  tagline: "The Official Student Housing & Boarding House System for Tarlac Agricultural University (TAU)",
  location: "Camiling, Tarlac, Philippines",

  inquiryAndBookingFlow: [
    "Step 1: Search & Filter - Students search using the 4-Phase Guided Search Wizard or Interactive Campus Map.",
    "Step 2: Room Selection - Choose a specific room (Solo Room or Bedspace) and specify target move-in dates.",
    "Step 3: Identity Verification (KYC) - Attach a Government/Student ID and take a Biometric Selfie with liveness check.",
    "Step 4: Landlord Review - The landlord receives the inquiry notification and reviews tenant details.",
    "Step 5: Digital Lease Contract - Upon approval, both landlord and tenant review and digitally sign the official Lease Agreement.",
    "Step 6: Payment & Reservation - Pay the reservation fee via GCash, Maya, Bank Transfer, or Cash to lock in the room."
  ],

  landlordVerificationFlow: [
    "Step 1: Become a Host - Landlords register and complete the Host Application form.",
    "Step 2: Document Submission - Upload Business Permit, Fire Safety Certificate, Government ID, and Establishment Front Photo.",
    "Step 3: Super Admin Moderation - Super Admins inspect and verify landlord identity and property legitimacy.",
    "Step 4: Listing Approval - Once approved, landlords gain access to the Landlord Dashboard to manage properties and inquiries."
  ],

  paymentMethods: [
    "GCash e-wallet",
    "Maya e-wallet",
    "Direct Bank Transfer",
    "Over-the-counter Cash Payment"
  ],

  propertyTypes: [
    "Apartment (Private unit with flat-rate pricing)",
    "Boarding House (Shared or solo rooms for boarders)",
    "Dormitory (Student dormitory with shared facilities)",
    "Transient House (Short-term stays for guests)",
    "Agri-Hostel (Hostel suites for visitors and university guests)"
  ],

  tauLandmarks: [
    "TAU Main Campus Center",
    "College of Business and Management (CBM)",
    "College of Veterinary Medicine (CVM)",
    "College of Agriculture and Forestry (CAF)",
    "College of Arts and Sciences (CAS)",
    "College of Engineering and Technology (CET)",
    "Laboratory High School (LHS)",
    "College of Education (CED)"
  ],

  platformPages: [
    { title: "Become a Host", path: "/become-a-host", description: "Landlord registration & property submission" },
    { title: "Frequently Asked Questions", path: "/faqs", description: "Common questions regarding BoardTAU" },
    { title: "Community Standards", path: "/hosting/community-standards", description: "Landlord and tenant conduct policies" },
    { title: "Help Center", path: "/support/help-center", description: "Platform troubleshooting and student support" },
    { title: "Contact Us", path: "/support/contact", description: "Direct support contact options" },
    { title: "Trust & Safety", path: "/support/safety-guidelines", description: "Safety, KYC, and security guidelines" },
    { title: "About the Founders", path: "/about", description: "Background and mission of BoardTAU founders" },
    { title: "How BoardTAU Works", path: "/about/boardtau", description: "Detailed platform operation guide" },
    { title: "Accessibility Support", path: "/legal/accessibility", description: "Accessibility guidelines and support" },
    { title: "Privacy Policy", path: "/legal/privacy", description: "Data protection and privacy policy" },
    { title: "Terms of Service", path: "/legal/terms", description: "Platform terms and legal agreement" }
  ],

  socialMediaLinks: {
    facebook: "https://www.facebook.com/profile.php?id=61592140986863",
    twitter: "https://x.com/BoardTAU",
    tiktok: "https://www.tiktok.com/@boardtau.official",
    instagram: "https://www.instagram.com/boardtau.official/"
  },

  offTopicGuardrailNotice: "I am Kerby, the official AI Assistant for BoardTAU. I can answer general questions politely, but my primary focus is helping students find housing around Tarlac Agricultural University (TAU)."
};

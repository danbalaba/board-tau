/**
 * Authoritative BoardTAU Platform System Knowledge Base
 * Used for LLM grounding and Response Dictionary matching.
 */

export const SYSTEM_KNOWLEDGE_BASE = {
  platformName: "BoardTAU",
  tagline: "The Official Student Housing & Boarding House System for Tarlac Agricultural University (TAU)",
  location: "Camiling, Tarlac, Philippines",

  inquiryAndBookingFlow: [
    "Step 1: Search & Filter — Search using the 10-Step Guided Search Wizard or Spotlight AI Search.",
    "Step 2: Browse Listings & Rooms — Review property details, college walking distance, and compare room options under Available Rooms.",
    "Step 3: Submit Inquiry with KYC — Click 'Inquire Now' on the room card and complete the 8-step verification wizard (Zero immediate charge).",
    "Step 4: Landlord Review — Landlord reviews tenant identity, KYC credentials, and message note, then approves or declines.",
    "Step 5: Reservation Approved (Payment Pending) — Once approved by the host, the inquiry transitions into an official Reservation marked 'Payment Pending'.",
    "Step 6: Lease Review & Holding Deposit — In checkout, tenant clicks 'Read PDF' to review the contract & house rules, checks '[✓] I have read and agree to the Boarding House Lease Agreement & house rules', and slides to pay via GCash, Maya, or Card (Stripe) to secure 'Reserved' status.",
    "Step 7: Move-In (Checked-In) — When the student arrives at the property, the landlord marks them as 'Checked-In' in the system, which automatically deducts room availability slots.",
    "Step 8: Stay Concluded (Completed) — When the stay concludes, the reservation is marked as 'Completed', which automatically restores room availability slots.",
    "Step 9: Review & Rating (Optional) — Tenant can leave an optional review, rating, and feedback for future TAU boarders."
  ],

  reservationStatuses: {
    PENDING_PAYMENT: { label: "Payment Pending", description: "Inquiry approved by host; waiting for tenant holding fee" },
    RESERVED: { label: "Reserved", description: "Holding fee paid and lease accepted; room slot secured" },
    CHECKED_IN: { label: "Checked-In", description: "Tenant arrived at property; room slot deducted from availability" },
    COMPLETED: { label: "Completed", description: "Stay concluded and tenant checked out; room slot restored" },
    CANCELLED: { label: "Cancelled", description: "Reservation cancelled before check-in" },
    REJECTED: { label: "Declined", description: "Inquiry declined by host" }
  },

  inquiryModalSteps: [
    "Step 1: Select Payment Gateway (GCash, Maya, or Credit/Debit Card via Stripe - Zero immediate charge guarantee)",
    "Step 2: Target Stay Dates (Move-in and Move-out dates)",
    "Step 3: Message to Landlord (Personalized introductory note)",
    "Step 4: Prepare Guidelines (Review accepted IDs and verification rules)",
    "Step 5: Biometric Selfie (AI camera facial scan with active liveness check)",
    "Step 6: ID Card Scan (Capture Student ID or Government ID)",
    "Step 7: Email OTP Verification (6-digit security code sent to email)",
    "Step 8: Review & Submit (Final application preview and submission for landlord review)"
  ],

  landlordVerificationFlow: [
    "Step 1: Landlord Identity (Full name, mobile number, email, and property ownership role: Owner, Caretaker, Manager)",
    "Step 2: Establishment Profile (Business name, property accommodation type, and years of hosting experience)",
    "Step 3: Property Location & Evidence (Property address, campus map coordinates, and front facade photo of establishment)",
    "Step 4: Legal Permits & Bills (Mayor's Business Permit OR Utility Bill, plus BFP Fire Safety Inspection Certificate)",
    "Step 5: Host Guidelines (Review and agreement to BoardTAU Host Community Standards & Safety Guidelines)",
    "Step 6: Biometric Selfie Liveness (AI camera facial scan with real-time active liveness challenge)",
    "Step 7: Government ID Scan (Valid government-issued ID card capture and OCR verification)",
    "Step 8: Review & Submit (Final profile review and submission for Super Admin moderation with real-time auto-saving)"
  ],

  paymentMethods: [
    "GCash Mobile Wallet (Instant e-wallet transfer)",
    "Maya Wallet (Digital wallet app)",
    "Credit / Debit Card via Stripe (Visa, Mastercard, JCB, AMEX)"
  ],

  propertyTaxonomyNote: "All Property Types, Room Types, Bed Setups, Attributes (Amenities, Rules, Features), and Campus Colleges are dynamically defined and managed by Super Admins in the BoardTAU database.",

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

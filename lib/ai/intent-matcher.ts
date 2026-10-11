import { SYSTEM_KNOWLEDGE_BASE } from "./system-knowledge";

interface IntentMatchResult {
  isMatched: boolean;
  intentKey?: string;
  response?: {
    reply: string;
    suggestedPrompts: string[];
  };
}

/**
 * Deterministic Response Dictionary & Intent Matcher
 * Returns 100% pre-verified, accurate responses in 0ms for core platform flows.
 */
export function matchUserIntent(userMessage: string): IntentMatchResult {
  const query = userMessage.toLowerCase().trim();

  // 1. OWASP Security & Prompt Jailbreak Guardrail Check
  const securityJailbreakKeywords = [
    "ignore previous instructions", "system prompt", "developer mode", 
    "jailbreak", "root access", "sudo mode", "override rules"
  ];
  if (securityJailbreakKeywords.some(kw => query.includes(kw))) {
    return {
      isMatched: true,
      intentKey: "OFF_TOPIC_REJECTION",
      response: {
        reply: SYSTEM_KNOWLEDGE_BASE.offTopicGuardrailNotice,
        suggestedPrompts: [
          "How do I book a room?",
          "What is required for KYC?",
          "How do I search for a boarding house?"
        ]
      }
    };
  }

  // 2. Booking & Reservation Lifecycle Intent
  const bookingKeywords = [
    "how to book", "how do i book", "booking process", "how to reserve", 
    "reservation steps", "how does booking work", "steps to rent", "booking flow"
  ];
  if (bookingKeywords.some(kw => query.includes(kw))) {
    return {
      isMatched: true,
      intentKey: "HOW_TO_BOOK",
      response: {
        reply: `Here is the complete end-to-end booking and reservation journey on BoardTAU:\n\n` +
          `1. **Search & Filter**: Find your ideal accommodation using the 10-Step Guided Search Wizard or Spotlight AI Search.\n` +
          `2. **Compare Rooms**: View property details, campus proximity, and compare rooms under **Available Rooms**.\n` +
          `3. **Submit Inquiry (with KYC)**: Click **Inquire Now** on your room card and complete the 8-step verification wizard.\n` +
          `4. **Landlord Review**: The host reviews your inquiry note and verified credentials, then approves or rejects.\n` +
          `5. **Reservation Pending Payment**: Once approved, your inquiry becomes an official Reservation marked **Payment Pending**.\n` +
          `6. **Lease Agreement & Holding Deposit**: In checkout, click **Read PDF** to review the lease terms, check the agreement consent box, and **Slide to Pay** via GCash, Maya, or Card (Stripe).\n` +
          `7. **Check-In**: Upon arrival at the property, the landlord marks you as **Checked-In**, which automatically deducts room occupancy slots.\n` +
          `8. **Check-Out**: When your stay concludes, the reservation is marked **Completed**, and occupancy slots are restored.\n` +
          `9. **Review & Rating (Optional)**: Leave a review and rating for future TAU boarders.\n\n` +
          `[NAV: Browse Listings](/)`,
        suggestedPrompts: [
          "How do I inquire about a room?",
          "What is required for tenant KYC?",
          "What payment methods are accepted?"
        ]
      }
    };
  }

  // 2B. How to Inquire on a Room Intent (8-Step Inquiry Wizard)
  const inquiryKeywords = [
    "how to inquire", "how do i inquire", "inquiry process", "inquiry steps", 
    "steps to inquire", "send an inquiry", "how do i send inquiry", "inquire room"
  ];
  if (inquiryKeywords.some(kw => query.includes(kw))) {
    return {
      isMatched: true,
      intentKey: "HOW_TO_INQUIRE",
      response: {
        reply: `Submitting a room inquiry on BoardTAU is quick and secure via the 8-step Inquiry Wizard:\n\n` +
          `1. **Find Room & Click Inquire**: Go to your chosen listing, scroll to **Available Rooms**, and click **Inquire Now** on the room card.\n` +
          `2. **Step 1: Payment Method**: Choose GCash, Maya, or Credit/Debit Card (*Zero Immediate Charge Guarantee* — only charged after host approval).\n` +
          `3. **Step 2: Stay Dates**: Pick your target move-in and check-out dates.\n` +
          `4. **Step 3: Message to Landlord**: Write an introductory note or inquiry questions for the host.\n` +
          `5. **Step 4: Review Guidelines**: Review verification guidelines and accepted ID types.\n` +
          `6. **Step 5: Biometric Selfie**: Complete a quick camera selfie with AI liveness verification.\n` +
          `7. **Step 6: ID Card Scan**: Capture a clear photo of your Student ID or Government ID.\n` +
          `8. **Step 7: Email OTP**: Enter the 6-digit verification code sent to your email.\n` +
          `9. **Step 8: Review & Submit**: Preview your application and submit for landlord review!\n\n` +
          `[NAV: Browse Listings](/)`,
        suggestedPrompts: [
          "What documents are accepted for KYC?",
          "What happens after my inquiry is approved?",
          "What payment methods are accepted?"
        ]
      }
    };
  }

  // 2C. Housing Types & Accommodations Available Intent
  const housingTypesKeywords = [
    "housing types", "what type of housing", "types of housing", "what housing options",
    "accommodation types", "what accommodations", "types of accommodations"
  ];
  if (housingTypesKeywords.some(kw => query.includes(kw))) {
    return {
      isMatched: true,
      intentKey: "WHAT_HOUSING_AVAILABLE",
      response: {
        reply: `BoardTAU features student accommodations around Tarlac Agricultural University (TAU), managed dynamically by Super Admins:\n\n` +
          `• **Boarding House**: Traditional student living with shared facilities, offering private **Solo Rooms** or budget-friendly **Bedspaces**.\n` +
          `• **Dormitory**: Student dorms with shared lounges, resident caretakers, and campus-friendly house rules.\n` +
          `• **Apartment**: Self-contained whole units (**Studio**, **1-Bedroom**, or **2-Bedroom Units**) with private kitchenettes and CRs.\n` +
          `• **Transient House**: Short-term daily or weekly whole-unit stays for visiting guests, families, and researchers.\n` +
          `• **Agri-Hostel**: Specialized lodge suites and group suites for university visitors and delegation reviewees.\n\n` +
          `Every listing provides exact GIS walking distances and transit times to all 9 TAU colleges!\n\n` +
          `[NAV: Browse Listings](/)`,
        suggestedPrompts: [
          "Show me housing options near TAU campus",
          "How do I inquire about a room?",
          "What are the cheapest bedspaces available?"
        ]
      }
    };
  }

  // 3. KYC Verification Requirements Intent
  const kycKeywords = [
    "kyc", "id verification", "selfie", "what documents", "identity verification",
    "what id do i need", "verification requirements"
  ];
  if (kycKeywords.some(kw => query.includes(kw))) {
    return {
      isMatched: true,
      intentKey: "KYC_REQUIREMENTS",
      response: {
        reply: `To complete your KYC verification for room inquiries on BoardTAU, you need:\n\n` +
          `• **Valid ID**: Official TAU Student ID or any Government-issued ID (Driver's License, UMID, Passport, National ID, PhilHealth).\n` +
          `• **Biometric Selfie**: A quick camera selfie with real-time AI liveness verification.\n` +
          `• **Email OTP**: 6-digit confirmation code sent to your registered email address.\n\n` +
          `This protects both tenants and landlords, ensuring genuine boarder identity across campus.\n\n` +
          `[NAV: View Profile](/profile)`,
        suggestedPrompts: [
          "How do I inquire about a room?",
          "What payment methods are accepted?",
          "How do I reserve a room and sign a lease?"
        ]
      }
    };
  }

  // 4. Landlord Host Verification Intent (8-Step Host Onboarding)
  const hostKeywords = [
    "become a host", "landlord verification", "how to list property", 
    "business permit", "how do landlords register", "list my boarding house", "landlord onboarding"
  ];
  if (hostKeywords.some(kw => query.includes(kw))) {
    return {
      isMatched: true,
      intentKey: "HOST_APPLICATION",
      response: {
        reply: `To register as a verified landlord on BoardTAU, complete the 8-step onboarding wizard:\n\n` +
          `1. Click **Become a Host** in the top navigation bar.\n` +
          `2. **Step 1: Landlord Identity**: Enter your full name, mobile number, email, and property ownership role.\n` +
          `3. **Step 2: Establishment Profile**: Enter business name, accommodation type, and years of hosting experience.\n` +
          `4. **Step 3: Property Location & Facade**: Provide the address, pin location on the campus map, and upload a clear front facade photo.\n` +
          `5. **Step 4: Legal Permits & Bills**: Upload your Mayor's Business Permit OR Utility Bill, plus your BFP Fire Safety Certificate.\n` +
          `6. **Step 5: Host Guidelines**: Review and agree to the Host Community Standards.\n` +
          `7. **Step 6: Biometric Selfie**: Complete a quick facial scan with active liveness check.\n` +
          `8. **Step 7: Government ID Scan**: Capture your valid government-issued ID.\n` +
          `9. **Step 8: Review & Submit**: Review and submit for Super Admin approval *(auto-saves in real-time)*!\n\n` +
          `[NAV: Become a Host](/become-a-host)`,
        suggestedPrompts: [
          "What permits do landlords need?",
          "How does the landlord dashboard work?",
          "How long does landlord approval take?"
        ]
      }
    };
  }

  // 5. Digital Lease Agreement Intent (Checkout & Lease Review)
  const leaseKeywords = [
    "lease contract", "lease agreement", "sign contract", "digital lease", 
    "terms and agreement", "how does lease work"
  ];
  if (leaseKeywords.some(kw => query.includes(kw))) {
    return {
      isMatched: true,
      intentKey: "LEASE_CONTRACT",
      response: {
        reply: `BoardTAU features a streamlined **Digital Lease Contract & Agreement Review**:\n\n` +
          `• Once your inquiry is approved by the host, you can finalize your room reservation.\n` +
          `• In the checkout modal, click **Read PDF** to review the landlord's official lease terms, house rules, and move-out notice period.\n` +
          `• Check the digital consent box: **"I have read and agree to the Boarding House Lease Agreement & house rules"** (no drawing signature needed!).\n` +
          `• Checking the agreement box unlocks the **SLIDE TO PAY** slider to complete your holding deposit via GCash, Maya, or Card.\n\n` +
          `[NAV: My Inquiries](/inquiries)`,
        suggestedPrompts: [
          "What payment methods are accepted?",
          "What happens after my inquiry is approved?",
          "How do I inquire about a room?"
        ]
      }
    };
  }

  // 6. Payment Methods Intent (Payment Gateways & Holding Fee)
  const paymentKeywords = [
    "payment method", "how to pay", "gcash", "maya", "credit card", "stripe",
    "how do i pay reservation fee", "payment options"
  ];
  if (paymentKeywords.some(kw => query.includes(kw))) {
    return {
      isMatched: true,
      intentKey: "PAYMENT_METHODS",
      response: {
        reply: `BoardTAU supports 3 secure online payment gateways for holding fees and reservation deposits:\n\n` +
          `• **GCash Mobile Wallet** (Instant e-wallet transfer)\n` +
          `• **Maya Wallet** (Digital wallet app or card)\n` +
          `• **Credit / Debit Card via Stripe** (Visa, Mastercard, JCB, AMEX)\n\n` +
          `🛡️ **Zero Immediate Charge Guarantee:** When submitting an inquiry, your payment authorization is reserved securely. You are only charged after the landlord reviews and approves your reservation request!\n\n` +
          `[NAV: My Inquiries](/inquiries)`,
        suggestedPrompts: [
          "How do I inquire about a room?",
          "How do I reserve a room and sign a lease?",
          "What is required for tenant KYC?"
        ]
      }
    };
  }

  // 7. Contact Support & Help Center Intent
  const supportKeywords = [
    "contact support", "contact us", "help center", "customer support",
    "customer service", "report issue", "need help", "support email"
  ];
  if (supportKeywords.some(kw => query.includes(kw))) {
    return {
      isMatched: true,
      intentKey: "CONTACT_SUPPORT",
      response: {
        reply: `If you need assistance or want to contact our support team:\n\n` +
          `• **Help Center**: Browse platform guides and student support articles.\n` +
          `• **Contact Us**: Reach out directly to the BoardTAU Support Team.\n\n` +
          `[NAV: Contact Us](/support/contact)\n` +
          `[NAV: Help Center](/support/help-center)`,
        suggestedPrompts: [
          "Where are the Frequently Asked Questions?",
          "How do I report a safety concern?",
          "How do I book a room?"
        ]
      }
    };
  }

  // 8. Legal, Privacy & Terms of Service Intent
  const legalKeywords = [
    "privacy policy", "terms of service", "terms and conditions", "privacy",
    "terms", "legal", "user agreement", "data protection"
  ];
  if (legalKeywords.some(kw => query.includes(kw))) {
    return {
      isMatched: true,
      intentKey: "LEGAL_PAGES",
      response: {
        reply: `You can review BoardTAU's legal policies and privacy guidelines below:\n\n` +
          `• **Privacy Policy**: Explains how we collect, protect, and handle user data.\n` +
          `• **Terms of Service**: Outlines user obligations, host rules, and platform usage.\n\n` +
          `[NAV: Privacy Policy](/legal/privacy)\n` +
          `[NAV: Terms of Service](/legal/terms)`,
        suggestedPrompts: [
          "What is required for KYC?",
          "Where are the Community Standards?",
          "How do I book a room?"
        ]
      }
    };
  }

  // 9. FAQs, Community Standards & Safety Intent
  const faqKeywords = [
    "faq", "faqs", "frequently asked questions", "community standards",
    "safety guidelines", "trust and safety", "rules"
  ];
  if (faqKeywords.some(kw => query.includes(kw))) {
    return {
      isMatched: true,
      intentKey: "FAQS_AND_STANDARDS",
      response: {
        reply: `Explore BoardTAU rules, standards, and safety guidelines:\n\n` +
          `• **Frequently Asked Questions**: Quick answers for students and landlords.\n` +
          `• **Community Standards**: Expectations for tenant and host behavior.\n` +
          `• **Trust & Safety Guidelines**: Security practices and verification standards.\n\n` +
          `[NAV: Frequently Asked Questions](/faqs)\n` +
          `[NAV: Community Standards](/hosting/community-standards)\n` +
          `[NAV: Trust & Safety Guidelines](/support/safety-guidelines)`,
        suggestedPrompts: [
          "How do I book a room?",
          "What is required for KYC?",
          "How do I become a host?"
        ]
      }
    };
  }

  // 10. About BoardTAU & Founders Intent
  const aboutKeywords = [
    "about boardtau", "about the founders", "who made boardtau", "founders",
    "how boardtau works", "about us", "mission", "creator", "who created",
    "who is the creator", "who developed", "who built", "developer", "who made"
  ];
  if (aboutKeywords.some(kw => query.includes(kw))) {
    return {
      isMatched: true,
      intentKey: "ABOUT_BOARDTAU",
      response: {
        reply: `BoardTAU was created and developed for the Tarlac Agricultural University (TAU) community to provide a modern, secure, and seamless boarding house and student housing platform.\n\n` +
          `• **About the Founders**: Meet the team and creators behind BoardTAU.\n` +
          `• **How BoardTAU Works**: Explore how search, verification, and digital leasing operate.\n\n` +
          `[NAV: About the Founders](/about)\n` +
          `[NAV: How BoardTAU Works](/about/boardtau)`,
        suggestedPrompts: [
          "How do I book a room?",
          "How do I search for a boarding house?",
          "How do I become a host?"
        ]
      }
    };
  }

  // 11. Official Social Media Links Intent
  const socialKeywords = [
    "social media", "facebook", "tiktok", "instagram", "twitter", "x account",
    "socials", "follow us", "social links", "official page"
  ];
  if (socialKeywords.some(kw => query.includes(kw))) {
    return {
      isMatched: true,
      intentKey: "SOCIAL_MEDIA",
      response: {
        reply: `Connect with BoardTAU on our official social media platforms:\n\n` +
          `• **Facebook**: [facebook.com/BoardTAU](https://www.facebook.com/profile.php?id=61592140986863)\n` +
          `• **X (Twitter)**: [@BoardTAU](https://x.com/BoardTAU)\n` +
          `• **TikTok**: [@boardtau.official](https://www.tiktok.com/@boardtau.official)\n` +
          `• **Instagram**: [@boardtau.official](https://www.instagram.com/boardtau.official/)\n\n` +
          `Follow us for official announcements, housing tips, and TAU campus updates!`,
        suggestedPrompts: [
          "How do I contact support?",
          "How do I book a room?",
          "Where are the Frequently Asked Questions?"
        ]
      }
    };
  }

  return { isMatched: false };
}


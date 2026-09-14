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

  // 2. Booking & Inquiry Process Flow Intent
  const bookingKeywords = [
    "how to book", "how do i book", "booking process", "how to reserve", 
    "reservation steps", "how does inquiry work", "steps to rent"
  ];
  if (bookingKeywords.some(kw => query.includes(kw))) {
    return {
      isMatched: true,
      intentKey: "HOW_TO_BOOK",
      response: {
        reply: `Here is the step-by-step process to reserve a room on BoardTAU:\n\n` +
          `1. **Search & Filter**: Find your ideal property using the Guided Search Wizard or Map.\n` +
          `2. **Inquire/Reserve**: Open a listing, select your room option, and click **Inquire**.\n` +
          `3. **KYC Verification**: Provide your Student/Gov ID and a quick Biometric Selfie.\n` +
          `4. **Landlord Approval**: The landlord will review your request.\n` +
          `5. **Sign Lease Contract**: Review and digitally sign your official Lease Agreement.\n` +
          `6. **Pay Reservation Fee**: Pay via GCash, Maya, Bank Transfer, or Cash to lock in your room.\n\n` +
          `[NAV: Browse Listings](/)`,
        suggestedPrompts: [
          "What is required for KYC?",
          "What payment methods are accepted?",
          "How does digital lease signing work?"
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
        reply: `To complete your KYC verification for room booking on BoardTAU, you need:\n\n` +
          `• **Valid ID**: Government-issued ID or official TAU Student ID.\n` +
          `• **Biometric Selfie**: A clear camera selfie with liveness detection.\n\n` +
          `This protects both tenants and landlords and guarantees genuine boarder identity.\n\n` +
          `[NAV: View Profile](/profile)`,
        suggestedPrompts: [
          "How do I book a room?",
          "How long does landlord approval take?",
          "What payment methods are accepted?"
        ]
      }
    };
  }

  // 4. Landlord Host Verification Intent
  const hostKeywords = [
    "become a host", "landlord verification", "how to list property", 
    "business permit", "how do landlords register", "list my boarding house"
  ];
  if (hostKeywords.some(kw => query.includes(kw))) {
    return {
      isMatched: true,
      intentKey: "HOST_APPLICATION",
      response: {
        reply: `To register as a verified landlord on BoardTAU:\n\n` +
          `1. Click **Become a Host** in the top navigation bar.\n` +
          `2. Fill out your Business & Contact Details.\n` +
          `3. Upload your **Business Permit**, **Fire Safety Certificate**, Government ID, and Establishment Photo.\n` +
          `4. Wait for Super Admin review and verification.\n\n` +
          `[NAV: Become a Host](/become-a-host)`,
        suggestedPrompts: [
          "What documents do landlords need?",
          "How does landlord dashboard work?",
          "What is the property approval process?"
        ]
      }
    };
  }

  // 5. Digital Lease Agreement Intent
  const leaseKeywords = [
    "lease contract", "digital signature", "sign agreement", "contract signing",
    "digital lease", "lease agreement"
  ];
  if (leaseKeywords.some(kw => query.includes(kw))) {
    return {
      isMatched: true,
      intentKey: "LEASE_CONTRACT",
      response: {
        reply: `BoardTAU features **Digital Lease Contracts**:\n\n` +
          `• Once your inquiry is approved, both landlord and tenant receive an official Lease Contract.\n` +
          `• You can draw your signature directly on screen to execute the legal agreement.\n` +
          `• Signed contracts are stored securely with cryptographic verification hashes.\n\n` +
          `[NAV: My Inquiries](/inquiries)`,
        suggestedPrompts: [
          "How do I pay the reservation fee?",
          "What is required for KYC?",
          "How do I book a room?"
        ]
      }
    };
  }

  // 6. Payment Methods Intent
  const paymentKeywords = [
    "payment method", "how to pay", "gcash", "maya", "cash", "bank transfer",
    "how do i pay reservation fee"
  ];
  if (paymentKeywords.some(kw => query.includes(kw))) {
    return {
      isMatched: true,
      intentKey: "PAYMENT_METHODS",
      response: {
        reply: `BoardTAU supports multiple secure payment methods for reservation fees:\n\n` +
          `• **GCash e-wallet**\n` +
          `• **Maya e-wallet**\n` +
          `• **Direct Bank Transfer**\n` +
          `• **Over-the-counter Cash**\n\n` +
          `Payment is made directly after your Inquiry and Digital Lease Contract are approved by the landlord.\n\n` +
          `[NAV: My Inquiries](/inquiries)`,
        suggestedPrompts: [
          "How do I book a room?",
          "How does digital lease signing work?",
          "What is required for KYC?"
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


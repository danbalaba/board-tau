/**
 * Master List of Contextual Kerby Loading Poses, Dynamic Messages & Rotating Tips.
 * Provides tailored, context-specific loading titles, subtitles, and mascots
 * based on whether the user is authenticating, navigating the landlord portal,
 * accessing the super admin dashboard, exploring student accommodation, or managing bookings.
 */

export interface MascotPose {
  src: string;
  fallbackSrc: string;
  title: string;
  subtitle: string;
  badge?: string;
}

export interface LoadingContextConfig {
  name: string;
  poses: MascotPose[];
  tips: string[];
}

export type LoadingContextKey = 
  | 'auth'
  | 'landlord'
  | 'admin'
  | 'tenant'
  | 'inquiries'
  | 'reservations'
  | 'profile'
  | 'logout'
  | 'default';

export const MASTER_LOADING_CONFIGS: Record<LoadingContextKey, LoadingContextConfig> = {
  auth: {
    name: 'Authentication & Session Security',
    poses: [
      {
        src: '/assets/mascot/kerby-401-security.png',
        fallbackSrc: '/assets/mascot/kerby-desktop-identity.png',
        title: 'Securing Session',
        subtitle: 'Verifying identity credentials & encrypting connection...',
        badge: 'Security Check',
      },
      {
        src: '/assets/mascot/kerby-desktop-identity.png',
        fallbackSrc: '/assets/mascot/kerby-inquiry-otp.png',
        title: 'Authenticating',
        subtitle: 'Connecting securely with BoardTAU institutional services...',
        badge: 'Identity Validation',
      },
      {
        src: '/assets/mascot/kerby-desktop-welcome.png',
        fallbackSrc: '/assets/mascot/kerby-casual-waving.png',
        title: 'Welcome to BoardTAU',
        subtitle: 'Preparing your personalized account dashboard...',
        badge: 'Access Granted',
      },
      {
        src: '/assets/mascot/kerby-inquiry-otp.png',
        fallbackSrc: '/assets/mascot/kerby-401-security.png',
        title: 'Identity Confirmed',
        subtitle: 'Syncing your authorized session & preferences...',
        badge: 'Session Active',
      },
    ],
    tips: [
      "Security Tip: Always log out when using public campus or library computers.",
      "Account Tip: Two-factor email OTP ensures your student account remains protected.",
      "BoardTAU Tip: You can connect Google or Facebook logins for faster 1-click access.",
      "Privacy Tip: Your login credentials and passwords are encrypted with industry-standard bcrypt.",
      "Student Tip: Verified student accounts receive priority reservation responses from hosts.",
    ],
  },

  landlord: {
    name: 'Landlord & Host Portal',
    poses: [
      {
        src: '/assets/mascot/kerby-landlord-blueprint.png',
        fallbackSrc: '/assets/mascot/kerby-halfbody-blueprint.png',
        title: 'Loading Host Portal',
        subtitle: 'Syncing property listings, floorplans & slot specs...',
        badge: 'Property Management',
      },
      {
        src: '/assets/mascot/kerby-halfbody-revenue.png',
        fallbackSrc: '/assets/mascot/kerby-landlord-verified.png',
        title: 'Retrieving Host Data',
        subtitle: 'Calculating occupancy rates & monthly booking ledgers...',
        badge: 'Host Analytics',
      },
      {
        src: '/assets/mascot/kerby-halfbody-keys.png',
        fallbackSrc: '/assets/mascot/kerby-editor-rooms.png',
        title: 'Managing Units',
        subtitle: 'Checking tenant reservations & bedspace availability...',
        badge: 'Unit Inventory',
      },
      {
        src: '/assets/mascot/kerby-landlord-uploading.png',
        fallbackSrc: '/assets/mascot/kerby-editor-basics.png',
        title: 'Host Workspace Ready',
        subtitle: 'Finalizing landlord workspace & contract controls...',
        badge: 'Host Tools Ready',
      },
    ],
    tips: [
      "Host Tip: Detailed property descriptions with nearby TAU landmarks attract up to 40% more student views!",
      "Host Tip: High-quality photos of your facade & common areas build instant trust with student boarders.",
      "Host Tip: Keep available slot counts updated in real time so boarders don't apply to full rooms.",
      "Host Tip: Replying to student inquiries within 15 minutes doubles your reservation conversion rate!",
      "Host Tip: Highlighting aircon, study desks, and private CR amenities increases solo room bookings.",
      "Host Tip: Clearly stating utility inclusion (water, electricity, WiFi) prevents billing misunderstandings.",
      "Host Tip: Verified landlords earn an official trust badge shown across all TAU search results.",
      "Host Tip: Friendly, polite answers to student inquiries create a welcoming first impression.",
    ],
  },

  admin: {
    name: 'Super Admin Portal',
    poses: [
      {
        src: '/assets/mascot/kerby-admin-audit-specs.png',
        fallbackSrc: '/assets/mascot/kerby-admin-compliance-check.png',
        title: 'Loading Admin Portal',
        subtitle: 'Syncing governance telemetry, moderation & audit logs...',
        badge: 'Super Admin Desk',
      },
      {
        src: '/assets/mascot/kerby-admin-compliance-check.png',
        fallbackSrc: '/assets/mascot/kerby-admin-live-broadcast.png',
        title: 'Auditing Compliance',
        subtitle: 'Verifying landlord business permits & student safety standards...',
        badge: 'Permit Verification',
      },
      {
        src: '/assets/mascot/kerby-admin-live-broadcast.png',
        fallbackSrc: '/assets/mascot/kerby-admin-dispatch-ticket.png',
        title: 'Connecting Admin Desk',
        subtitle: 'Fetching moderation queue & live inquiry incident reports...',
        badge: 'Live Operations',
      },
      {
        src: '/assets/mascot/kerby-admin-gavel-approved.png',
        fallbackSrc: '/assets/mascot/kerby-admin-audit-specs.png',
        title: 'Admin Console Ready',
        subtitle: 'Enforcing institutional BoardTAU policies & security controls...',
        badge: 'Governance Active',
      },
    ],
    tips: [
      "Admin Tip: Strict verification of landlord permits maintains BoardTAU's top safety standards for TAU students.",
      "Admin Tip: Audit logs provide full forensic traceability for every administrative approval or rejection.",
      "Admin Tip: Providing specific feedback on rejected landlord applications expedites correct resubmissions.",
      "Admin Tip: Review flagged reviews promptly to ensure an authentic, respectful community for TAU boarders.",
      "Admin Tip: Verified landlords receive official trust badges automatically upon admin approval.",
    ],
  },

  tenant: {
    name: 'Student Accommodation & Explore',
    poses: [
      {
        src: '/assets/mascot/kerby-global-search.png',
        fallbackSrc: '/assets/mascot/kerby-casual-waving.png',
        title: 'Exploring Camiling Housing',
        subtitle: 'Finding verified student boarding houses near TAU campus...',
        badge: 'Campus Discovery',
      },
      {
        src: '/assets/mascot/kerby-global-scooter.png',
        fallbackSrc: '/assets/mascot/kerby-uniform-driving.png',
        title: 'Zooming to Route',
        subtitle: 'Calculating walking distance to TAU gates & colleges...',
        badge: 'Distance Matrix',
      },
      {
        src: '/assets/mascot/kerby-global-studying.png',
        fallbackSrc: '/assets/mascot/kerby-casual-studying.png',
        title: 'Checking Amenities',
        subtitle: 'Verifying study desks, high-speed WiFi, and aircon specs...',
        badge: 'Amenity Specs',
      },
      {
        src: '/assets/mascot/kerby-global-navigation.png',
        fallbackSrc: '/assets/mascot/kerby-casual-excited.png',
        title: 'Almost Ready!',
        subtitle: 'Curating student-friendly boarding accommodations...',
        badge: 'Ready to View',
      },
    ],
    tips: [
      "Student Tip: Compare walking distances to your specific TAU college building to save daily commute time.",
      "Student Tip: Solo rooms offer quiet study environments, while bedspaces help you make lifelong campus friends!",
      "Student Tip: Check whether electricity and water are included in the monthly rent to avoid budget surprises.",
      "Student Tip: Save your top boarding choices to Favorites so you can compare them side-by-side.",
      "Student Tip: Book an online inquiry or visit before signing long-term boarding house contracts.",
      "Student Tip: Look for the Verified Landlord badge to ensure the boarding house is officially registered.",
    ],
  },

  inquiries: {
    name: 'Live Chat & Inquiries',
    poses: [
      {
        src: '/assets/mascot/kerby-phone-contact.png',
        fallbackSrc: '/assets/mascot/kerby-mobile-contact.png',
        title: 'Opening Inquiries',
        subtitle: 'Connecting with boarding house hosts & live inquiries...',
        badge: 'Inquiry Dispatch',
      },
      {
        src: '/assets/mascot/kerby-mobile-contact.png',
        fallbackSrc: '/assets/mascot/kerby-phone-contact.png',
        title: 'Syncing Messages',
        subtitle: 'Loading your conversations and scheduled viewing visits...',
        badge: 'Chat Sync',
      },
      {
        src: '/assets/mascot/kerby-notification.png',
        fallbackSrc: '/assets/mascot/kerby-casual-waving.png',
        title: 'Live Chat Ready',
        subtitle: 'Establishing real-time student-host messaging channel...',
        badge: 'Live Channels',
      },
    ],
    tips: [
      "Chat Tip: Mention your expected move-in date and college program when inquiring with landlords.",
      "Chat Tip: Ask about curfew hours and visitor guidelines early to ensure the house fits your routine.",
      "Chat Tip: Keep communication on BoardTAU to maintain a secure record of all host agreements.",
      "Chat Tip: Landlords typically respond fastest between 8:00 AM and 7:00 PM on weekdays.",
    ],
  },

  reservations: {
    name: 'Reservations & Bookings',
    poses: [
      {
        src: '/assets/mascot/kerby-inquiry-prepare.png',
        fallbackSrc: '/assets/mascot/kerby-inquiry-stay.png',
        title: 'Accessing Bookings',
        subtitle: 'Retrieving official reservation holds & tenant records...',
        badge: 'Booking Portal',
      },
      {
        src: '/assets/mascot/kerby-inquiry-payment.png',
        fallbackSrc: '/assets/mascot/kerby-landlord-checklist.png',
        title: 'Verifying Contracts',
        subtitle: 'Confirming payment proof and lease contract terms...',
        badge: 'Contract Check',
      },
      {
        src: '/assets/mascot/kerby-halfbody-celebrate.png',
        fallbackSrc: '/assets/mascot/kerby-desktop-welcome.png',
        title: 'Reservation Ready!',
        subtitle: 'Generating your official BoardTAU move-in boarding pass...',
        badge: 'Ready to Move In',
      },
    ],
    tips: [
      "Booking Tip: Download and save a PDF copy of your verified lease contract for your personal records.",
      "Booking Tip: Upload clear payment transaction slips to speed up host reservation confirmation.",
      "Booking Tip: Double-check move-in dates so the landlord can ensure your bed and keys are prepared.",
      "Booking Tip: Reach out to your landlord 2 days before move-in to confirm arrival time.",
    ],
  },

  profile: {
    name: 'User Profile & Identity',
    poses: [
      {
        src: '/assets/mascot/kerby-desktop-selfie.png',
        fallbackSrc: '/assets/mascot/kerby-desktop-identity.png',
        title: 'Syncing Account',
        subtitle: 'Loading student credentials, trust badges & preferences...',
        badge: 'User Profile',
      },
      {
        src: '/assets/mascot/kerby-desktop-idscan.png',
        fallbackSrc: '/assets/mascot/kerby-401-security.png',
        title: 'Verifying Identity',
        subtitle: 'Validating TAU student ID & institutional trust tier...',
        badge: 'ID Verification',
      },
      {
        src: '/assets/mascot/kerby-casual-waving.png',
        fallbackSrc: '/assets/mascot/kerby-desktop-welcome.png',
        title: 'Profile Updated',
        subtitle: 'Finalizing your BoardTAU account settings...',
        badge: 'Account Ready',
      },
    ],
    tips: [
      "Profile Tip: Uploading your official TAU student ID earns you a verified student trust badge!",
      "Profile Tip: Keep your contact number updated so hosts can reach you regarding reservations.",
      "Profile Tip: You can customize email and push notification preferences anytime in Settings.",
    ],
  },

  logout: {
    name: 'Sign Out & Session Close',
    poses: [
      {
        src: '/assets/mascot/kerby-casual-waving.png',
        fallbackSrc: '/assets/mascot/kerby-desktop-welcome.png',
        title: 'See You Soon!',
        subtitle: 'Safely disconnecting your active session...',
        badge: 'Signing Out',
      },
      {
        src: '/assets/mascot/kerby-casual-driving.png',
        fallbackSrc: '/assets/mascot/kerby-uniform-driving.png',
        title: 'Safe Travels',
        subtitle: 'Clearing session security credentials...',
        badge: 'Safe Journey',
      },
      {
        src: '/assets/mascot/kerby-carabao-sleeping-pillow.png',
        fallbackSrc: '/assets/mascot/kerby-casual-sleeping.png',
        title: 'Have a Restful Day',
        subtitle: 'BoardTAU is always here when you return...',
        badge: 'Rest Well',
      },
      {
        src: '/assets/mascot/kerby-casual-loving.png',
        fallbackSrc: '/assets/mascot/kerby-desktop-welcome.png',
        title: 'Ingat Palagi!',
        subtitle: 'Always stay safe on campus and in town...',
        badge: 'Take Care',
      },
    ],
    tips: [
      "Security Tip: Always log out when using public campus or library devices to keep your account safe.",
      "Student Tip: You can easily pick up where you left off by viewing your Saved Favorites upon your return.",
      "Student Tip: Have a restful day! Kerby and the BoardTAU team will be here whenever you need a place.",
      "Campus Tip: Stay hydrated and stay safe walking across Camiling campus routes at night.",
      "Host Tip: Turn on email alerts so you never miss student reservation requests while away.",
      "Study Tip: Maintain a balanced study and sleep schedule for peak academic performance at TAU!",
      "BoardTAU Tip: All your inquiries, contracts, and receipts are safely encrypted and preserved.",
      "Host Tip: Regularly check your smoke alarms and emergency exits to maintain a 5-star safety rating.",
      "Student Tip: Keep emergency contact numbers and campus clinic numbers saved on your phone.",
      "BoardTAU Tip: Salamat sa paggamit ng BoardTAU! Ingat palagi sa iyong biyahe at pag-aaral.",
    ],
  },

  default: {
    name: 'General BoardTAU Navigation',
    poses: [
      {
        src: '/assets/mascot/kerby-global-search.png',
        fallbackSrc: '/assets/mascot/kerby-casual-waving.png',
        title: 'BoardTAU Syncing',
        subtitle: 'Preparing your destination & housing data...',
        badge: 'Data Sync',
      },
      {
        src: '/assets/mascot/kerby-global-scooter.png',
        fallbackSrc: '/assets/mascot/kerby-uniform-driving.png',
        title: 'Zooming to Route',
        subtitle: 'Navigating across campus & property listings...',
        badge: 'Navigation',
      },
      {
        src: '/assets/mascot/kerby-global-studying.png',
        fallbackSrc: '/assets/mascot/kerby-casual-studying.png',
        title: 'Fetching Live Data',
        subtitle: 'Calculating availability & amenity specs...',
        badge: 'Live Data',
      },
      {
        src: '/assets/mascot/kerby-global-navigation.png',
        fallbackSrc: '/assets/mascot/kerby-casual-excited.png',
        title: 'Almost Ready!',
        subtitle: 'Finalizing view layout & dynamic features...',
        badge: 'Ready',
      },
    ],
    tips: [
      "Tip: Filter by gender policies and aircon amenities to find your ideal boarding match.",
      "Tip: Verified landlords receive trust badges so students can book with complete peace of mind.",
      "Tip: You can chat directly with property hosts to ask questions before booking.",
      "Tip: Check the interactive TAU campus map to view boarding houses within walking distance.",
    ],
  },
};

/**
 * Automatically resolves the appropriate loading context key based on current or target URL path.
 */
export function getLoadingContextFromPath(pathname?: string | null): LoadingContextKey {
  if (!pathname) return 'tenant';

  const normalized = pathname.toLowerCase();

  if (normalized.startsWith('/admin')) {
    return 'admin';
  }

  if (normalized.startsWith('/landlord') || normalized.startsWith('/hosting') || normalized.startsWith('/become-a-host')) {
    return 'landlord';
  }

  if (normalized.startsWith('/inquiries') || normalized.startsWith('/messages')) {
    return 'inquiries';
  }

  if (normalized.startsWith('/reservations') || normalized.startsWith('/contracts') || normalized.startsWith('/bookings')) {
    return 'reservations';
  }

  if (normalized.startsWith('/profile') || normalized.startsWith('/settings') || normalized.startsWith('/kyc')) {
    return 'profile';
  }

  if (normalized.startsWith('/auth') || normalized.includes('/login') || normalized.includes('/register') || normalized.includes('/forgot-password')) {
    return 'auth';
  }

  return 'tenant';
}

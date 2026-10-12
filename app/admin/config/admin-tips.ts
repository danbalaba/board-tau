import { KerbyPose } from '@/components/modals/search-modal/KerbyMascot';

export interface AdminTip {
  speech: string;
  asset: string;
  pose: KerbyPose;
  badge: string;
}

// ─────────────────────────────────────────────────────────────
// SUPER ADMIN EXCLUSIVE TIPS (Governance, Infrastructure, Security, Platform)
// ─────────────────────────────────────────────────────────────
const SUPER_ADMIN_TIPS: Record<string, AdminTip[]> = {
  dashboard: [
    {
      speech: "Verify cold backups every Sunday to guarantee disaster recovery readiness across all database nodes.",
      asset: "/assets/mascot/kerby-500-mechanic.png",
      pose: "studying",
      badge: "Disaster Recovery",
    },
    {
      speech: "Check audit logs weekly for privilege escalations or unauthorized off-hours administrator logins.",
      asset: "/assets/mascot/kerby-admin-audit-specs.png",
      pose: "studying",
      badge: "Security Protocol",
    },
    {
      speech: "Monitor student traffic surges during enrollment season (July–August) to scale server capacity.",
      asset: "/assets/mascot/kerby-role-boss.png",
      pose: "excited",
      badge: "Capacity Planning",
    },
    {
      speech: "Reconcile platform gross booking volume monthly against landlord reservation payout statements.",
      asset: "/assets/mascot/kerby-halfbody-revenue.png",
      pose: "excited",
      badge: "Financial Governance",
    },
    {
      speech: "Enforce two-factor authentication and strong password policies for all administrative roles.",
      asset: "/assets/mascot/kerby-401-security.png",
      pose: "pointing",
      badge: "Access Control",
    },
  ],
  users: [
    {
      speech: "Apply the Principle of Least Privilege. Only grant Super Admin status when platform configuration is required.",
      asset: "/assets/mascot/kerby-role-boss.png",
      pose: "pointing",
      badge: "RBAC Governance",
    },
    {
      speech: "Periodically audit inactive accounts with elevated privileges and revoke dormant administrative access.",
      asset: "/assets/mascot/kerby-admin-compliance-check.png",
      pose: "studying",
      badge: "Account Hygiene",
    },
    {
      speech: "Inspect user role distributions to ensure balanced delegation between System Admins and Staff.",
      asset: "/assets/mascot/kerby-desktop-compliance.png",
      pose: "studying",
      badge: "Role Distribution",
    },
    {
      speech: "Maintain an immutable record of role elevation events in system audit logs for institutional compliance.",
      asset: "/assets/mascot/kerby-desktop-legal.png",
      pose: "pointing",
      badge: "Compliance Log",
    },
  ],
  moderation: [
    {
      speech: "Periodically audit disputed moderation decisions to maintain unbiased platform fairness and student trust.",
      asset: "/assets/mascot/kerby-admin-gavel-approved.png",
      pose: "pointing",
      badge: "Policy Oversight",
    },
    {
      speech: "Ensure all accredited boarding houses comply with Camiling LGU housing ordinances and fire safety standards.",
      asset: "/assets/mascot/kerby-desktop-legal.png",
      pose: "studying",
      badge: "LGU Regulatory",
    },
    {
      speech: "Review patterns of landlord suspensions to identify repeat safety violators across campus borders.",
      asset: "/assets/mascot/kerby-admin-revision-stop.png",
      pose: "pointing",
      badge: "Safety Compliance",
    },
    {
      speech: "Update student housing code of conduct annually in partnership with TAU Student Affairs.",
      asset: "/assets/mascot/kerby-editor-rules.png",
      pose: "studying",
      badge: "Institutional Policy",
    },
  ],
  monitoring: [
    {
      speech: "Failed authentication attempts above 5 from a single IP should be inspected for rate limiting.",
      asset: "/assets/mascot/kerby-401-security.png",
      pose: "studying",
      badge: "Threat Detection",
    },
    {
      speech: "Monitor database query latency. Slow queries during peak booking hours degrade student booking flow.",
      asset: "/assets/mascot/kerby-500-mechanic.png",
      pose: "studying",
      badge: "Performance Monitor",
    },
    {
      speech: "Export system activity logs before the close of each academic term for university compliance archival.",
      asset: "/assets/mascot/kerby-admin-audit-specs.png",
      pose: "pointing",
      badge: "Compliance Export",
    },
    {
      speech: "Monitor live dispatch tickets to ensure real-time push notifications maintain sub-50ms latency.",
      asset: "/assets/mascot/kerby-admin-dispatch-ticket.png",
      pose: "excited",
      badge: "Live Telemetry",
    },
  ],
  settings: [
    {
      speech: "Test newly toggled feature flags in staging before enabling them for all student boarders.",
      asset: "/assets/mascot/kerby-500-mechanic.png",
      pose: "studying",
      badge: "Feature Rollout",
    },
    {
      speech: "Review platform fee configurations quarterly to maintain competitive, student-friendly boarding rates.",
      asset: "/assets/mascot/kerby-halfbody-revenue.png",
      pose: "excited",
      badge: "Fee Configuration",
    },
    {
      speech: "Keep global property amenity tags standardized to prevent messy filter dropdowns for students.",
      asset: "/assets/mascot/kerby-editor-rules.png",
      pose: "pointing",
      badge: "Taxonomy Control",
    },
    {
      speech: "Automated database backup snapshots run every 24 hours. Verify cloud storage quota limits.",
      asset: "/assets/mascot/kerby-admin-compliance-check.png",
      pose: "studying",
      badge: "Backup Storage",
    },
  ],
  default: [
    {
      speech: "Platform infrastructure and security protocols are active and operational.",
      asset: "/assets/mascot/kerby-role-boss.png",
      pose: "waving",
      badge: "Super Admin Console",
    },
    {
      speech: "Scheduled security reviews keep BoardTAU secure for thousands of TAU boarders.",
      asset: "/assets/mascot/kerby-admin-audit-specs.png",
      pose: "pointing",
      badge: "Security Oversight",
    },
    {
      speech: "High platform uptime ensures student boarders can reach emergency contacts anytime.",
      asset: "/assets/mascot/kerby-admin-compliance-check.png",
      pose: "studying",
      badge: "Reliability Tip",
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// SYSTEM ADMIN OPERATIONAL TIPS (Moderation, Host Verification, Listings, Queue)
// ─────────────────────────────────────────────────────────────
const SYSTEM_ADMIN_TIPS: Record<string, AdminTip[]> = {
  dashboard: [
    {
      speech: "Triage unreviewed host accreditation applications first to keep listing inventory growing.",
      asset: "/assets/mascot/kerby-admin-compliance-check.png",
      pose: "pointing",
      badge: "Daily Priorities",
    },
    {
      speech: "Respond to student safety inquiries and flag reports within 24 hours for best community trust.",
      asset: "/assets/mascot/kerby-admin-dispatch-ticket.png",
      pose: "excited",
      badge: "SLA Target",
    },
    {
      speech: "Check active listing counts near TAU Gate 1 and Gate 2 to spot student housing shortages early.",
      asset: "/assets/mascot/kerby-halfbody-keys.png",
      pose: "studying",
      badge: "Campus Coverage",
    },
    {
      speech: "Review published listings daily to catch incorrect pricing or missing utility details early.",
      asset: "/assets/mascot/kerby-editor-rules.png",
      pose: "studying",
      badge: "Listing Quality",
    },
    {
      speech: "Ensure new landlord accounts have verified phone numbers before approving room submissions.",
      asset: "/assets/mascot/kerby-phone-contact.png",
      pose: "pointing",
      badge: "Contact Verification",
    },
  ],
  users: [
    {
      speech: "Verify student ID credentials against TAU enrollment guidelines before issuing verified badges.",
      asset: "/assets/mascot/kerby-desktop-idscan.png",
      pose: "studying",
      badge: "Student Verification",
    },
    {
      speech: "Assist locked-out landlords with fast password reset guidance so their rooms remain bookable.",
      asset: "/assets/mascot/kerby-casual-pointing.png",
      pose: "pointing",
      badge: "User Support",
    },
    {
      speech: "Contact newly registered property hosts to guide them through publishing their first listing.",
      asset: "/assets/mascot/kerby-desktop-welcome.png",
      pose: "waving",
      badge: "Host Onboarding",
    },
    {
      speech: "Check for duplicate student accounts to prevent confusion during online reservation hold deposits.",
      asset: "/assets/mascot/kerby-admin-correction-pencil.png",
      pose: "studying",
      badge: "Account Verification",
    },
  ],
  moderation: [
    {
      speech: "Investigate student reports thoroughly before taking down listings. Request photo evidence when needed.",
      asset: "/assets/mascot/kerby-admin-correction-pencil.png",
      pose: "studying",
      badge: "Evidence Check",
    },
    {
      speech: "Redact sensitive student contact info or private phone numbers posted accidentally in public fields.",
      asset: "/assets/mascot/kerby-401-security.png",
      pose: "pointing",
      badge: "Privacy Protection",
    },
    {
      speech: "Immediate action is required for reports involving safety hazards, broken locks, or harassment.",
      asset: "/assets/mascot/kerby-admin-revision-stop.png",
      pose: "pointing",
      badge: "Urgent Incident",
    },
    {
      speech: "Place listings in provisional hold if a landlord repeatedly fails to honor confirmed room slots.",
      asset: "/assets/mascot/kerby-suspended-warning.png",
      pose: "studying",
      badge: "Hold Policy",
    },
  ],
  hosts: [
    {
      speech: "Cross-reference the uploaded Barangay Clearance and Mayor's Permit with local Camiling LGU records.",
      asset: "/assets/mascot/kerby-desktop-legal.png",
      pose: "studying",
      badge: "Permit Verification",
    },
    {
      speech: "Confirm the owner's emergency contact number is active before granting official Host Verification.",
      asset: "/assets/mascot/kerby-landlord-verified.png",
      pose: "excited",
      badge: "Host Accreditation",
    },
    {
      speech: "Check that the landlord's government ID name matches their registered banking disbursement details.",
      asset: "/assets/mascot/kerby-desktop-idscan.png",
      pose: "studying",
      badge: "Identity Match",
    },
    {
      speech: "Boarding houses with on-site caretakers provide safer student accommodations. Note this in internal tags.",
      asset: "/assets/mascot/kerby-admin-compliance-check.png",
      pose: "pointing",
      badge: "Safety Tagging",
    },
  ],
  listings: [
    {
      speech: "Ensure walking distance to TAU campus gates is physically accurate and not underestimated by hosts.",
      asset: "/assets/mascot/kerby-desktop-location.png",
      pose: "studying",
      badge: "Distance Check",
    },
    {
      speech: "Check that electric and water billing policies (included vs submeter) are clearly specified in rules.",
      asset: "/assets/mascot/kerby-editor-rules.png",
      pose: "pointing",
      badge: "Utility Transparency",
    },
    {
      speech: "Reject listings with stock internet photos or blurry facades to protect students from room scams.",
      asset: "/assets/mascot/kerby-admin-stamp-rejected.png",
      pose: "pointing",
      badge: "Photo Standard",
    },
    {
      speech: "Approve verified room listings promptly so student boarders can submit booking reservations.",
      asset: "/assets/mascot/kerby-admin-gavel-approved.png",
      pose: "excited",
      badge: "Fast Approval",
    },
  ],
  reviews: [
    {
      speech: "Review negative feedback carefully. Encourage landlords to reply constructively rather than disputing.",
      asset: "/assets/mascot/kerby-halfbody-review.png",
      pose: "studying",
      badge: "Review Mediation",
    },
    {
      speech: "Remove reviews containing abusive, defamatory, or non-stay-related complaints promptly.",
      asset: "/assets/mascot/kerby-admin-revision-stop.png",
      pose: "pointing",
      badge: "Review Standard",
    },
    {
      speech: "Celebrate consistent 5-star hosts! High ratings motivate boarding houses to upgrade amenities.",
      asset: "/assets/mascot/kerby-halfbody-celebrate-popper.png",
      pose: "excited",
      badge: "Top Host Spotlight",
    },
    {
      speech: "Check timestamp patterns to catch fake review boosting or coordinated negative review bombs.",
      asset: "/assets/mascot/kerby-admin-audit-specs.png",
      pose: "studying",
      badge: "Fraud Detection",
    },
  ],
  default: [
    {
      speech: "Kerby is ready to assist you in moderating and verifying TAU student boarding.",
      asset: "/assets/mascot/kerby-casual-waving.png",
      pose: "waving",
      badge: "Admin Assistant",
    },
    {
      speech: "Keep student safety and transparent boarding policies top of mind in every review decision.",
      asset: "/assets/mascot/kerby-admin-compliance-check.png",
      pose: "pointing",
      badge: "Community Safety",
    },
    {
      speech: "Friendly communication with property owners helps them adopt platform guidelines faster.",
      asset: "/assets/mascot/kerby-casual-loving.png",
      pose: "loving",
      badge: "Host Relations",
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// CONTEXTUAL ROUTE RESOLVER
// ─────────────────────────────────────────────────────────────
function getCategoryKey(path: string): string {
  // Dashboard routes
  if (path === '/admin' || path === '/admin/overview' || path === '/admin/dashboard') {
    return 'dashboard';
  }

  // Users routes
  if (path.startsWith('/admin/user-management') || path.startsWith('/admin/users')) {
    return 'users';
  }

  // Specific Moderation sub-routes
  if (path.startsWith('/admin/moderation/hosts')) {
    return 'hosts';
  }
  if (path.startsWith('/admin/moderation/listings')) {
    return 'listings';
  }
  if (path.startsWith('/admin/moderation/reviews')) {
    return 'reviews';
  }
  if (path.startsWith('/admin/moderation')) {
    return 'moderation';
  }

  // Monitoring routes
  if (path.startsWith('/admin/monitoring')) {
    return 'monitoring';
  }

  // Settings routes
  if (path.startsWith('/admin/settings')) {
    return 'settings';
  }

  return 'default';
}

/**
 * Returns a dynamic pool of tips based on the active admin role and current page route.
 */
export function getAdminTips(role: string | undefined, pathname: string): AdminTip[] {
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const categoryKey = getCategoryKey(pathname);

  if (isSuperAdmin) {
    const pool = SUPER_ADMIN_TIPS[categoryKey];
    if (pool && pool.length > 0) return pool;
    return SUPER_ADMIN_TIPS.default;
  }

  // Standard Admin (System Admin)
  const pool = SYSTEM_ADMIN_TIPS[categoryKey];
  if (pool && pool.length > 0) return pool;
  return SYSTEM_ADMIN_TIPS.default;
}

/**
 * Global Image Preloader Utility for Kerby Mascot Assets & Loading Overlays.
 * Pre-loads mascot PNG images into browser RAM memory cache so loading screens
 * and mascot guidance display INSTANTLY with 0ms delay, 0 flickering, and no blank boxes.
 */

const KERBY_MASCOT_ASSETS = [
  // Standalone Poses (Casual & Uniform)
  '/assets/mascot/kerby-casual-waving.png',
  '/assets/mascot/kerby-casual-pointing.png',
  '/assets/mascot/kerby-casual-thinking.png',
  '/assets/mascot/kerby-casual-loving.png',
  '/assets/mascot/kerby-casual-studying.png',
  '/assets/mascot/kerby-casual-driving.png',
  '/assets/mascot/kerby-casual-sleeping.png',
  '/assets/mascot/kerby-casual-excited.png',
  '/assets/mascot/kerby-uniform-waving.png',
  '/assets/mascot/kerby-uniform-pointing.png',
  '/assets/mascot/kerby-uniform-thinking.png',
  '/assets/mascot/kerby-uniform-loving.png',
  '/assets/mascot/kerby-uniform-studying.png',
  '/assets/mascot/kerby-uniform-driving.png',
  '/assets/mascot/kerby-uniform-sleeping.png',
  '/assets/mascot/kerby-uniform-excited.png',
  '/assets/mascot/kerby-headshot.png',
  '/assets/mascot/kerby-ai-face.png',
  '/assets/mascot/kerby-notification.png',
  '/assets/mascot/kerby-phone-contact.png',
  '/assets/mascot/kerby-role-boss.png',
  '/assets/mascot/kerby-establishment-name.png',
  '/assets/mascot/kerby-accommodation-type.png',
  '/assets/mascot/kerby-offline.png',

  // Landlord Dashboard Half-Body Poses
  '/assets/mascot/kerby-halfbody-pointing.png',
  '/assets/mascot/kerby-halfbody-blueprint.png',
  '/assets/mascot/kerby-halfbody-revenue.png',
  '/assets/mascot/kerby-halfbody-keys.png',
  '/assets/mascot/kerby-halfbody-rating.png',
  '/assets/mascot/kerby-halfbody-review.png',
  '/assets/mascot/kerby-halfbody-celebrate.png',
  '/assets/mascot/kerby-halfbody-sleeping.png',

  // Landlord Property Creator & Submission Loader Poses
  '/assets/mascot/kerby-editor-basics.png',
  '/assets/mascot/kerby-editor-location.png',
  '/assets/mascot/kerby-editor-rooms.png',
  '/assets/mascot/kerby-editor-rules.png',
  '/assets/mascot/kerby-editor-gallery.png',
  '/assets/mascot/kerby-editor-documents.png',
  '/assets/mascot/kerby-editor-success.png',
  '/assets/mascot/kerby-landlord-blueprint.png',
  '/assets/mascot/kerby-landlord-checklist.png',
  '/assets/mascot/kerby-landlord-uploading.png',
  '/assets/mascot/kerby-landlord-verified.png',
  '/assets/mascot/kerby-401-security.png',
  '/assets/mascot/kerby-404-map.png',
  '/assets/mascot/kerby-500-mechanic.png',

  // Global Navigation & Page Loader Poses
  '/assets/mascot/kerby-global-search.png',
  '/assets/mascot/kerby-global-scooter.png',
  '/assets/mascot/kerby-global-studying.png',
  '/assets/mascot/kerby-global-navigation.png',

  // Super Admin Moderation Loader Poses (Approve & Reject)
  '/assets/mascot/kerby-admin-audit-specs.png',
  '/assets/mascot/kerby-admin-compliance-check.png',
  '/assets/mascot/kerby-admin-live-broadcast.png',
  '/assets/mascot/kerby-admin-gavel-approved.png',
  '/assets/mascot/kerby-admin-revision-stop.png',
  '/assets/mascot/kerby-admin-correction-pencil.png',
  '/assets/mascot/kerby-admin-dispatch-ticket.png',
  '/assets/mascot/kerby-admin-stamp-rejected.png',

  // Landlord Onboarding Flow Mascot Poses (Desktop & Mobile)
  '/assets/mascot/kerby-desktop-welcome.png',
  '/assets/mascot/kerby-desktop-identity.png',
  '/assets/mascot/kerby-desktop-establishment.png',
  '/assets/mascot/kerby-desktop-location.png',
  '/assets/mascot/kerby-desktop-legal.png',
  '/assets/mascot/kerby-desktop-guidelines.png',
  '/assets/mascot/kerby-desktop-selfie.png',
  '/assets/mascot/kerby-desktop-idscan.png',
  '/assets/mascot/kerby-desktop-review.png',
  '/assets/mascot/kerby-mobile-name.png',
  '/assets/mascot/kerby-mobile-contact.png',
  '/assets/mascot/kerby-mobile-role.png',
  '/assets/mascot/kerby-mobile-establishment.png',
  '/assets/mascot/kerby-mobile-accommodation.png',
  '/assets/mascot/kerby-mobile-experience.png',
  '/assets/mascot/kerby-mobile-firesafety.png',
  '/assets/mascot/kerby-mobile-guidelines.png',
  '/assets/mascot/kerby-mobile-selfie.png',
  '/assets/mascot/kerby-mobile-idscan.png',
  '/assets/mascot/kerby-mobile-review.png',
  '/assets/mascot/kerby-desktop-gate-closed.png',
  '/assets/mascot/kerby-desktop-gate-opening.png',
  '/assets/mascot/kerby-desktop-map.png',
  '/assets/mascot/kerby-desktop-compliance.png',
  '/assets/mascot/kerby-desktop-scanner.png',
  '/assets/mascot/kerby-desktop-celebration.png',
  '/assets/mascot/kerby-mobile-yawning.png',
  '/assets/mascot/kerby-mobile-stretching.png',
  '/assets/mascot/kerby-mobile-left-peeking.png',
  '/assets/mascot/kerby-mobile-right-peeking.png',
  '/assets/mascot/kerby-mobile-peeking-clipboard.png',
  '/assets/mascot/kerby-mobile-peeking-pin.png',
  '/assets/mascot/kerby-carabao-sleeping-pillow.png',
  '/assets/mascot/kerby-halfbody-celebrate-popper.png',
  '/assets/mascot/kerby-location-fullbody.png',
  '/assets/mascot/kerby-facade-fullbody.png',
  '/assets/mascot/kerby-permit-fullbody.png',
  '/assets/mascot/kerby-utility-bill-fullbody.png',
];

let isPreloaded = false;
const preloadedImageCache: HTMLImageElement[] = [];

export function preloadKerbyAssets(): void {
  if (typeof window === 'undefined' || isPreloaded || process.env.NODE_ENV === 'test') return;
  isPreloaded = true;

  const runPreload = () => {
    KERBY_MASCOT_ASSETS.forEach((src) => {
      const img = new Image();
      img.src = src;
      preloadedImageCache.push(img);
    });
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(runPreload);
  } else {
    setTimeout(runPreload, 100);
  }
}

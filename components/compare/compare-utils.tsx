import {
  Star,
  ShieldCheck,
  Flame,
  Sparkles,
  Clock,
  PawPrint,
  BadgeCheck
} from "lucide-react";

export const parseCustomItem = (item: string) => {
  if (!item || typeof item !== 'string') return { label: "", icon: null };
  if (item.includes("|")) {
    const [label, icon] = item.split("|");
    return { label: label.trim(), icon: icon.trim() };
  }
  return { label: item, icon: null };
};

export const computeStudentBadges = (listing: any, allComparedListings: any[]) => {
  const badges: { label: string; icon: any; color: string; bg: string; border: string }[] = [];
  const rawAttrs = [
    ...(Array.isArray(listing.amenities_list) ? listing.amenities_list : []),
    ...(Array.isArray(listing.amenities) ? listing.amenities : []),
    ...(Array.isArray(listing.listingLinks) ? listing.listingLinks.map((l: any) => l.attribute?.name || l.attribute?.id) : []),
    ...(Array.isArray(listing.customFeatures) ? listing.customFeatures : []),
    ...(Array.isArray(listing.securityFeatures) ? listing.securityFeatures : [])
  ].map(s => String(s).toLowerCase());

  const rules = listing.rules || {};
  const features = listing.features || {};

  // 1. Best Budget Value
  const validPrices = allComparedListings.map(l => l.price).filter((p): p is number => typeof p === "number" && p > 0);
  const lowestPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
  if (listing.price && listing.price <= lowestPrice && allComparedListings.length > 1) {
    badges.push({ label: "Best Budget Value", icon: Star, color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-500/15", border: "border-emerald-500/30" });
  }

  // 2. Brownout & Outage Ready
  const hasPowerWater = rawAttrs.some(a => a.includes("generator") || a.includes("water tank") || a.includes("poso") || a.includes("deep well"));
  if (hasPowerWater) {
    badges.push({ label: "Brownout & Outage Ready", icon: Flame, color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-500/15", border: "border-amber-500/30" });
  }

  // 3. High Security Verified
  const isHighSecurity = features.security24h || features.cctv || rawAttrs.some(a => a.includes("cctv") || a.includes("guard") || a.includes("rfid") || a.includes("biometric"));
  if (isHighSecurity) {
    badges.push({ label: "High Security Verified", icon: ShieldCheck, color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-500/15", border: "border-blue-500/30" });
  }

  // 4. Fiber WiFi Connected
  const hasFiber = rawAttrs.some(a => a.includes("fiber wifi") || a.includes("wifi"));
  if (hasFiber) {
    badges.push({ label: "Fiber WiFi Connected", icon: Sparkles, color: "text-indigo-700 dark:text-indigo-300", bg: "bg-indigo-500/15", border: "border-indigo-500/30" });
  }

  // 5. 24/7 Gate Access
  if (rules.noCurfew || rawAttrs.some(a => a.includes("no curfew") || a.includes("24/7"))) {
    badges.push({ label: "24/7 Gate Access", icon: Clock, color: "text-purple-700 dark:text-purple-300", bg: "bg-purple-500/15", border: "border-purple-500/30" });
  }

  // 6. Pet-Friendly
  if (rules.petsAllowed || rawAttrs.some(a => a.includes("pet"))) {
    badges.push({ label: "Pet-Friendly", icon: PawPrint, color: "text-rose-700 dark:text-rose-300", bg: "bg-rose-500/15", border: "border-rose-500/30" });
  }

  // Fallback Student Badge
  if (badges.length === 0) {
    badges.push({ label: "Student-Friendly Housing", icon: BadgeCheck, color: "text-teal-700 dark:text-teal-300", bg: "bg-teal-500/15", border: "border-teal-500/30" });
  }

  return badges;
};

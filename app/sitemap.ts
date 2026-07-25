import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://board-tau-rho.vercel.app";

  // Fetch active, approved listings from the database
  const listings = await db.listing.findMany({
    where: {
      status: "approved",
      isArchived: false,
    },
    select: {
      id: true,
      updatedAt: true,
    },
  });

  const listingRoutes = listings.map((listing) => ({
    url: `${baseUrl}/listings/${listing.id}`,
    lastModified: listing.updatedAt.toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Only include PUBLIC routes that search engines can actually see.
  // Private routes (favorites, profile, messages, inquiries) should NEVER be in the sitemap.
  const staticRoutes = [
    // Core pages
    { route: "", priority: 1.0 },
    { route: "/listings", priority: 0.9 },
    { route: "/faqs", priority: 0.8 },

    // About section
    { route: "/about", priority: 0.8 },
    { route: "/about/boardtau", priority: 0.8 },
    { route: "/about/contact", priority: 0.7 },

    // Hosting / Host information
    { route: "/hosting/community-standards", priority: 0.7 },
    { route: "/hosting/guidelines", priority: 0.7 },
    { route: "/hosting/responsibilities", priority: 0.7 },
    { route: "/hosting/safety", priority: 0.7 },

    // Legal
    { route: "/legal/terms", priority: 0.6 },
    { route: "/legal/privacy", priority: 0.6 },
    { route: "/legal/accessibility", priority: 0.5 },
    { route: "/legal/help", priority: 0.5 },

    // Support
    { route: "/support/help-center", priority: 0.7 },
    { route: "/support/contact", priority: 0.7 },
    { route: "/support/cancellation-policy", priority: 0.6 },
    { route: "/support/how-booking-works", priority: 0.7 },
    { route: "/support/safety-guidelines", priority: 0.6 },
  ].map(({ route, priority }) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: (priority >= 0.9 ? "daily" : "weekly") as "daily" | "weekly",
    priority,
  }));

  return [...staticRoutes, ...listingRoutes];
}

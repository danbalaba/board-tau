import { MetadataRoute } from "next";
import { db } from "@/lib/db";

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
    "",
    "/listings",
    "/about",
    "/about/mission",
    "/about/contact",
    "/about/capstone",
    "/hosting/community-standards",
    "/legal/terms",
    "/legal/privacy",
    "/support/help-center",
    "/support/contact",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  return [...staticRoutes, ...listingRoutes];
}

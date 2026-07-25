import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://board-tau-rho.vercel.app";

  return {
    rules: [
      {
        // Allow all bots to crawl public pages
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",           // Admin dashboard - private
          "/api/",             // API endpoints - not web pages
          "/landlord/",        // Landlord dashboard - private
          "/favorites/",       // User-specific private page
          "/profile/",         // User-specific private page
          "/messages/",        // User-specific private page
          "/inquiries/",       // User-specific private page
          "/reservations/",    // User-specific private page
          "/my-reviews/",      // User-specific private page
          "/auth/",            // Auth error pages (banned, locked, etc.)
          "/blocked/",         // User error page
          "/unauthorized/",    // Access denied page
          "/offline/",         // PWA offline page
          "/careers/",         // DELETED page - force Google to de-index
          "/about/mission/",   // Old route (now /about/boardtau)
          "/about/capstone/",  // Old route - no longer exists
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

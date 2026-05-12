import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://board-tau-rho.vercel.app";

  // In a real app, you would fetch your listing IDs from the database here
  // and map them to URLs like `${baseUrl}/listings/${listing.id}`

  const routes = ["", "/listings", "/favorites", "/legal/terms", "/legal/privacy"].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily" as const,
      priority: route === "" ? 1 : 0.8,
    })
  );

  return [...routes];
}

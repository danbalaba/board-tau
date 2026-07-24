import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { fontVariables } from "./admin/components/themes/font.config";

import "./globals.css";
import "react-loading-skeleton/dist/skeleton.css";
import LayoutContent from "@/components/layout/LayoutContent";
import Providers from "@/components/common/Provider";
import { Suspense } from "react";
import AuthErrorHandler from "@/components/auth/AuthErrorHandler";
import { LoadingProvider } from "@/components/loading/LoadingContext";
import GlobalLoadingOverlay from "@/components/loading/GlobalLoadingOverlay";
import { NetworkStatusManager } from "@/components/common/NetworkStatusManager";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import InstallPrompt from "@/components/pwa/InstallPrompt";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),

  title: {
    default: "BoardTAU | Boarding House System for TAU",
    template: "%s | BoardTAU",
  },
  applicationName: "BoardTAU",
  description:
    "The official boarding house management and search platform for Tarlac Agricultural University (TAU). Find safe, affordable, and vetted accommodations near campus.",
  keywords: [
    "BoardTAU",
    "TAU",
    "Tarlac Agricultural University",
    "Boarding House",
    "Student Accommodation",
    "Camiling Tarlac",
    "Housing",
    "Student Living",
  ],
  authors: [{ name: "BoardTAU Team" }],
  creator: "BoardTAU",
  publisher: "BoardTAU",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",

  openGraph: {
    title: "BoardTAU - Tarlac Agricultural University Boarding House System",
    description:
      "Find and manage boarding houses near TAU. A seamless experience for students, faculty, and staff to find safe and affordable accommodations.",
    url: baseUrl,
    siteName: "BoardTAU",
    images: [
      {
        url: "/images/TauBOARD-Dark.png",
        width: 1200,
        height: 630,
        alt: "BoardTAU - Modern Housing System",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BoardTAU | Find Your Next Home near TAU",
    description: "Discover the best boarding houses near Tarlac Agricultural University.",
    images: ["/images/TauBOARD-Dark.png"],
    creator: "@boardtau",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
  verification: {
    google: "Wll_yrudzbwvo6oAY_8skac6FOpGsG7ubSyw4eH4XHk",
  },
  other: {
    "geo.region": "PH-TAR",
    "geo.placename": "Camiling, Tarlac",
    "geo.position": "15.6888;120.4208",
    "ICBM": "15.6888, 120.4208",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme handling is done by next-themes */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "BoardTAU",
              "alternateName": ["Boarding House System for TAU", "TAU Housing"],
              "url": "https://board-tau-rho.vercel.app",
            })
          }}
        />
      </head>
      <body
        className={`${fontVariables} font-sans antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <NetworkStatusManager />
          <Suspense fallback={null}>
            <GlobalLoadingOverlay />
          </Suspense>
          <LayoutContent>
            {children}
            <InstallPrompt />
          </LayoutContent>
          <SpeedInsights />
          <Analytics />
        </Providers>
        {process.env.GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}

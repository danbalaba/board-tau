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

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),

  title: {
    default: "BoardTAU",
    template: "%s | BoardTAU",
  },
  description:
    "A comprehensive web-based platform designed to revolutionize the search and management of boarding houses near Tarlac Agricultural University (TAU). Find safe, affordable, and suitable accommodations with ease.",

  icons: {
    icon: "/images/TauBOARD-Dark.png",
    shortcut: "/images/TauBOARD-Dark.png",
    apple: "/images/TauBOARD-Dark.png",
  },
  manifest: "/manifest.json",

  openGraph: {
    title: "BoardTAU - Tarlac Agricultural University Boarding House System",
    description:
      "Find and manage boarding houses near TAU. A seamless experience for students, faculty, and staff to find safe and affordable accommodations.",
    url: "https://board-tau-rho.vercel.app",
    siteName: "BoardTAU",
    images: [
      {
        url: "/images/TauBOARD-Dark.png",
        width: 1200,
        height: 630,
        alt: "BoardTAU Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BoardTAU",
    description: "Find and manage boarding houses near Tarlac Agricultural University with ease.",
    images: ["/images/TauBOARD-Dark.png"],
  },
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
          </LayoutContent>
          <SpeedInsights />
        </Providers>
        {process.env.GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}

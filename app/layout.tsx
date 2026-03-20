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

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),

  title: "BoardTAU",
  description:
    "Your Ultimate Destination Connection. Discover a world of endless possibilities and seamless vacation planning at BoardTAU.",

  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },

  openGraph: {
    title: "BoardTAU",
    description:
    "Your Ultimate Destination Connection. Discover a world of endless possibilities and seamless vacation planning at BoardTAU.",
    images: [
    {
      url: "/logo.png",
      width: 512,
      height: 512,
      alt: "BoardTAU Logo",
    },
    ],
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
          <LoadingProvider>
            <Suspense fallback={null}>
              <AuthErrorHandler />
            </Suspense>
            <Suspense fallback={null}>
              <GlobalLoadingOverlay />
            </Suspense>
            <LayoutContent>
              {children}
            </LayoutContent>
          </LoadingProvider>
        </Providers>
      </body>
        {process.env.GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.GA_MEASUREMENT_ID} />
        )}
    </html>
  );
}

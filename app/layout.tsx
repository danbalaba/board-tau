    import type { Metadata } from "next";
    import { Inter } from "next/font/google";
    import { GoogleAnalytics } from "@next/third-parties/google";

    import "./globals.css";
    import "react-loading-skeleton/dist/skeleton.css";
    import LayoutContent from "@/components/layout/LayoutContent";
    import Providers from "@/components/common/Provider";

    const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter"
    });

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
            className={`${inter.variable} ${inter.className} font-sans antialiased`}
            suppressHydrationWarning
        >
            <Providers>
                <LayoutContent>
                    {children}
                </LayoutContent>
            </Providers>
        </body>
            {process.env.GA_MEASUREMENT_ID && (
                <GoogleAnalytics gaId={process.env.GA_MEASUREMENT_ID} />
            )}
        </html>
    );
}

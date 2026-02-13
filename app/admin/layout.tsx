import { requireAdmin } from "@/lib/admin";
import AdminLayoutClient from "./components/layout/AdminLayoutClient";
import Providers from "@/components/common/Provider";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import "react-loading-skeleton/dist/skeleton.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata = {
  title: "BoardTAU Admin",
  description: "BoardTAU Admin Dashboard",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

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
          <AdminLayoutClient>
            {children}
          </AdminLayoutClient>
        </Providers>
      </body>
    </html>
  );
}

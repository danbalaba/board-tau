import "./components/themes/extra-themes.css";
import { requireAdmin } from "@/lib/admin";
import KBar from "./components/kbar";
import AppSidebar from "./components/layout/app-sidebar";
import Header from "./components/layout/header";
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar";
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Providers from "./components/layout/providers";
import { DEFAULT_THEME } from "./components/themes/theme.config";

export const metadata: Metadata = {
  title: 'BoardTAU Admin Dashboard',
  description: 'BoardTAU Admin Dashboard',
  robots: {
    index: false,
    follow: false
  }
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Require admin authentication
  await requireAdmin();

  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  const activeTheme = cookieStore.get('active_theme')?.value;

  return (
    <Providers activeThemeValue={activeTheme || DEFAULT_THEME}>
      <KBar>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <SidebarInset>
            <Header />
            {/* page main content */}
            {children}
            {/* page main content ends */}
          </SidebarInset>
        </SidebarProvider>
      </KBar>
    </Providers>
  );
}

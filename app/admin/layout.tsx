import { requireAdmin } from "@/lib/admin";
import AdminLayoutClient from "./components/layout/AdminLayoutClient";
import Providers from "@/components/common/Provider";

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
    <Providers>
      <AdminLayoutClient>
        {children}
      </AdminLayoutClient>
    </Providers>
  );
}

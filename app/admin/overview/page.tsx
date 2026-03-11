import Overview from "../features/overview/components/overview";
import { requireAdmin } from "@/lib/admin";

export const metadata = {
  title: 'Dashboard : Overview'
};

export default async function page() {
  // Require admin authentication
  await requireAdmin();

  return <Overview />;
}

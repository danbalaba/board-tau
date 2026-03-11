import { requireAdmin } from '@/lib/admin';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  // Require admin authentication
  await requireAdmin();

  // Redirect to overview page
  redirect('/admin/overview');
}

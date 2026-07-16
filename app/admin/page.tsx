import { requireAdmin } from '@/lib/admin';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  // Require admin authentication
  const user = await requireAdmin();

  // Redirect based on role
  if (user.role === 'SUPER_ADMIN') {
    redirect('/admin/overview');
  } else {
    redirect('/admin/dashboard');
  }
}

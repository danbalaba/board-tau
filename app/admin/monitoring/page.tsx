import { redirect } from 'next/navigation';

export default function MonitoringRootPage() {
  redirect('/admin/monitoring/audit-logs');
}

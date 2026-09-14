import { redirect } from 'next/navigation';

export default function SettingsRootPage() {
  redirect('/admin/settings/property-configuration');
}

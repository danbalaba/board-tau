import { redirect } from 'next/navigation';

// General Settings has moved to /admin/settings/general
export default function SettingsRootPage() {
  redirect('/admin/settings/general');
}

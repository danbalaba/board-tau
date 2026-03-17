import { Metadata } from 'next';
import { EmailTemplates } from '@/app/admin/features/settings/components/email-templates';

export const metadata: Metadata = {
  title: 'Email Templates - BoardTAU Admin',
  description: 'Manage email templates for notifications and communications',
};

export default function EmailTemplatesPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <EmailTemplates />
    </div>
  );
}

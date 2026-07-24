export const dynamic = 'force-dynamic';
import ContactSupportContent from '@/components/informative/ContactSupportContent';

export default async function Page() {
  await new Promise(resolve => setTimeout(resolve, 400));
  return <ContactSupportContent />;
}

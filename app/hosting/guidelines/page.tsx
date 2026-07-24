export const dynamic = 'force-dynamic';
import HostingGuidelinesContent from '@/components/informative/HostingGuidelinesContent';

export default async function Page() {
  await new Promise(resolve => setTimeout(resolve, 400));
  return <HostingGuidelinesContent />;
}

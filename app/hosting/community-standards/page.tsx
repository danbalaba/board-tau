export const dynamic = 'force-dynamic';
import CommunityStandardsContent from '@/components/informative/CommunityStandardsContent';

export default async function Page() {
  await new Promise(resolve => setTimeout(resolve, 400));
  return <CommunityStandardsContent />;
}

export const dynamic = 'force-dynamic';
import HostResponsibilitiesContent from '@/components/informative/HostResponsibilitiesContent';

export default async function Page() {
  await new Promise(resolve => setTimeout(resolve, 400));
  return <HostResponsibilitiesContent />;
}

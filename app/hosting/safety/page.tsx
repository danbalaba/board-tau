export const dynamic = 'force-dynamic';
import HostSafetyContent from '@/components/informative/HostSafetyContent';

export default async function Page() {
  await new Promise(resolve => setTimeout(resolve, 400));
  return <HostSafetyContent />;
}

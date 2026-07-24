export const dynamic = 'force-dynamic';
import CancellationPolicyContent from '@/components/informative/CancellationPolicyContent';

export default async function Page() {
  await new Promise(resolve => setTimeout(resolve, 400));
  return <CancellationPolicyContent />;
}

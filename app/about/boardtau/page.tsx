export const dynamic = 'force-dynamic';
import HowBoardTAUWorksContent from '@/components/informative/HowBoardTAUWorksContent';

export default async function Page() {
  await new Promise(resolve => setTimeout(resolve, 400));
  return <HowBoardTAUWorksContent />;
}

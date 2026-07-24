export const dynamic = 'force-dynamic';
import AboutBoardTAUContent from '@/components/informative/AboutBoardTAUContent';

export default async function Page() {
  await new Promise(resolve => setTimeout(resolve, 400));
  return <AboutBoardTAUContent />;
}

import { Metadata } from 'next';
import { PricingOptimization } from '@/app/admin/features/properties/components/pricing-optimization';

export const metadata: Metadata = {
  title: 'Pricing Optimization - BoardTAU Admin',
  description: 'Optimize pricing based on market trends and occupancy',
};

export default function PricingOptimizationPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <PricingOptimization />
    </div>
  );
}

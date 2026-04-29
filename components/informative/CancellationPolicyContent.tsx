import FooterPageLayout from '@/components/layout/FooterPageLayout';
import { FaCalendarTimes, FaPercentage, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export default function CancellationPolicyContent() {
  return (
    <FooterPageLayout
      title="Cancellation Policy"
      description="Clear, transparent terms if your plans change. Understand your refund windows."
      lastUpdated="April 2026"
    >
      <p className="text-xl text-center max-w-2xl mx-auto mb-12 dark:text-gray-300">
        Landlords on BoardTAU choose their own corresponding cancellation tiers. Always read the specific property policy before finalizing a reservation.
      </p>

      <div className="space-y-8 mb-16">
        {/* Flexible Tier */}
        <div className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-green-200 dark:border-green-900/50 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <FaCheckCircle className="text-8xl text-green-500" />
          </div>
          <div className="relative z-10 w-full md:w-3/4">
            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold px-4 py-1 rounded-full inline-block mb-4 text-sm uppercase tracking-wider">
              Flexible Tier
            </div>
            <h3 className="text-3xl font-bold mb-4 dark:text-white">Full Refund 24h Prior</h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              Guests can cancel until 1 day before the official move-in date and receive a 100% full refund on their secure deposit.
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mt-6">
              <div className="bg-green-500 h-2 rounded-full w-[95%]"></div>
            </div>
            <p className="text-xs text-gray-500 mt-2 font-medium">95% of the timeline is covered for free cancellation</p>
          </div>
        </div>

        {/* Moderate Tier */}
        <div className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-yellow-200 dark:border-yellow-900/50 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <FaPercentage className="text-8xl text-yellow-500" />
          </div>
          <div className="relative z-10 w-full md:w-3/4">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 font-bold px-4 py-1 rounded-full inline-block mb-4 text-sm uppercase tracking-wider">
              Moderate Tier
            </div>
            <h3 className="text-3xl font-bold mb-4 dark:text-white">Full Refund 5 Days Prior</h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              Guests must cancel at least 5 full days before move-in. Conversions requested later will only yield a 50% return.
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mt-6">
              <div className="bg-yellow-500 h-2 rounded-full w-[70%]"></div>
            </div>
          </div>
        </div>

        {/* Strict Tier */}
        <div className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/50 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <FaExclamationCircle className="text-8xl text-red-500" />
          </div>
          <div className="relative z-10 w-full md:w-3/4">
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold px-4 py-1 rounded-full inline-block mb-4 text-sm uppercase tracking-wider">
              Strict Tier
            </div>
            <h3 className="text-3xl font-bold mb-4 dark:text-white">50% Refund Up To 1 Week Prior</h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              Designed for high-demand dorms. Cancellations made further than 7 days ahead will receive a 50% refund. Inside the 7 day window is non-refundable.
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mt-6 flex overflow-hidden">
              <div className="bg-red-500 h-2 w-[50%]"></div>
              <div className="bg-gray-400 h-2 w-[50%]"></div>
            </div>
          </div>
        </div>
      </div>

    </FooterPageLayout>
  );
}

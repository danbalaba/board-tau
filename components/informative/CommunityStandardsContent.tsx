import FooterPageLayout from '@/components/layout/FooterPageLayout';
import { FaHeart, FaHandshake, FaGlobeAsia, FaBalanceScale } from 'react-icons/fa';

export default function CommunityStandardsContent() {
  return (
    <FooterPageLayout
      title="Community Standards"
      description="The principles and values that keep BoardTAU safe, welcoming, and reliable for Tarlac Agricultural University students."
      lastUpdated="April 2026"
    >
      <div className="text-center mb-16">
        <FaGlobeAsia className="text-8xl text-green-500 mx-auto mb-6 opacity-80" />
        <h2 className="text-3xl font-extrabold dark:text-white max-w-2xl mx-auto leading-tight">
          A Community Built on Mutual Respect.
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg">
          We expect every host and every student to uphold these foundational pillars.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        <div className="bg-white dark:bg-gray-900 border border-red-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:border-red-400 dark:hover:border-red-500/50 transition-all duration-300 group hover:-translate-y-1">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
            <FaHeart className="text-3xl text-red-500" />
          </div>
          <h3 className="text-xl font-bold dark:text-gray-200 mb-3">Inclusion & Respect</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
            BoardTAU welcomes everyone from TAU regardless of background, gender, or orientation. Discrimination or hateful behavior results in an immediate permanent ban.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-500/50 transition-all duration-300 group hover:-translate-y-1">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
            <FaHandshake className="text-3xl text-blue-500" />
          </div>
          <h3 className="text-xl font-bold dark:text-gray-200 mb-3">Honesty</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
            No scams, no bait-and-switches. Landlords must provide accurate room listings. Students must provide truthful details on their reservation applications.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-purple-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:border-purple-400 dark:hover:border-purple-500/50 transition-all duration-300 group hover:-translate-y-1 lg:col-span-1 md:col-span-2">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
            <FaBalanceScale className="text-3xl text-purple-500" />
          </div>
          <h3 className="text-xl font-bold dark:text-gray-200 mb-3">Fair Accountability</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
            Mistakes happen, but responsibility is mandatory. If you cause property damage, you are expected to report and cover it. Landlords must fairly return deposits.
          </p>
        </div>

      </div>
    </FooterPageLayout>
  );
}

import FooterPageLayout from '@/components/layout/FooterPageLayout';
import { FaUniversalAccess, FaEye, FaKeyboard, FaLanguage } from 'react-icons/fa';

export default function AccessibilitySupportContent() {
  return (
    <FooterPageLayout
      title="Accessibility Support"
      description="We believe strongly that technology should empower everyone without friction."
      lastUpdated="April 2026"
    >
      <div className="flex flex-col md:flex-row items-center gap-8 bg-blue-50 dark:bg-blue-900/10 rounded-3xl p-8 md:p-12 mb-16 border border-blue-100 dark:border-blue-900/30">
        <FaUniversalAccess className="text-8xl text-blue-500 shrink-0 opacity-80" />
        <div>
          <h2 className="text-3xl font-extrabold text-blue-900 dark:text-blue-400 mb-4">BoardTAU for All</h2>
          <p className="text-blue-800 dark:text-blue-300 text-lg">
            We strive to ensure that our website and services are usable by everyone, strictly observing modern WAI-ARIA practices and maintaining high-contrast visual standards globally.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-800 transition-shadow">
          <FaEye className="text-4xl text-green-500 mb-6" />
          <h4 className="text-xl font-bold dark:text-white mb-2">Screen Readers</h4>
          <p className="text-gray-600 dark:text-gray-400">Images inherently utilize descriptive alt-tags and logical DOM hierarchies to ensure screen-reader engines properly parse listings.</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-800 transition-shadow">
          <FaKeyboard className="text-4xl text-purple-500 mb-6" />
          <h4 className="text-xl font-bold dark:text-white mb-2">Keyboard Navigation</h4>
          <p className="text-gray-600 dark:text-gray-400">Every single button, card, and modal is built strictly following keyboard 'tab' navigation standards and focus trapping boundaries.</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-800 transition-shadow">
          <FaLanguage className="text-4xl text-orange-500 mb-6" />
          <h4 className="text-xl font-bold dark:text-white mb-2">Localization</h4>
          <p className="text-gray-600 dark:text-gray-400">BoardTAU supports distinct toggles scaling across multiple reading semantics including localized Philippine monetary abstractions.</p>
        </div>

      </div>
    </FooterPageLayout>
  );
}

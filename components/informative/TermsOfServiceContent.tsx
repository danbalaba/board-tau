import FooterPageLayout from '@/components/layout/FooterPageLayout';
import { FaFileContract, FaRegHandshake } from 'react-icons/fa';

export default function TermsOfServiceContent() {
  return (
    <FooterPageLayout
      title="Terms of Service"
      description="The standard legal constraints dictating BoardTAU's usage limitations and liabilities."
      lastUpdated="April 2026"
    >
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-3xl p-8 mb-12 flex items-center justify-between shadow-lg">
        <div>
          <h2 className="text-2xl font-bold mb-2">Acceptance of Terms</h2>
          <p className="text-gray-300">By accessing or utilizing BoardTAU, you automatically execute your agreement below.</p>
        </div>
        <FaRegHandshake className="text-6xl text-gray-600 hidden md:block" />
      </div>

      <div className="space-y-6">
        
        <details className="group bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
          <summary className="font-bold text-xl dark:text-gray-200 flex justify-between items-center outline-none select-none">
            Platform Liabilities & Disclaimers
            <span className="text-gray-400 group-open:-rotate-180 transition-transform duration-300">▼</span>
          </summary>
          <div className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4">
            <p>BoardTAU is a facilitation platform. We do not directly own, handle, or manage any of the boarding house properties listed within the application.</p>
            <p className="mt-2">Consequently, we are not directly liable for physical injuries, contractual breaches, or damages resulting from tenant-landlord interactions outside our UI.</p>
          </div>
        </details>

        <details className="group bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
          <summary className="font-bold text-xl dark:text-gray-200 flex justify-between items-center outline-none select-none">
            Information Accuracy
            <span className="text-gray-400 group-open:-rotate-180 transition-transform duration-300">▼</span>
          </summary>
          <div className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4">
            <p>As a user creating listings, you guarantee that all submitted content (photos, pricing, amenities) is completely factual. Uploading fabricated graphics violates these Terms directly.</p>
          </div>
        </details>

        <details className="group bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
          <summary className="font-bold text-xl dark:text-gray-200 flex justify-between items-center outline-none select-none">
            User Termination
            <span className="text-gray-400 group-open:-rotate-180 transition-transform duration-300">▼</span>
          </summary>
          <div className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4">
            <p>BoardTAU administration reserves the exclusive right to permanently terminate or suspend any account found generating fraudulent inquiries or performing harassment.</p>
          </div>
        </details>

      </div>
    </FooterPageLayout>
  );
}

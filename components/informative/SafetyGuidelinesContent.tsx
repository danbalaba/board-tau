import FooterPageLayout from '@/components/layout/FooterPageLayout';
import { FaShieldAlt, FaIdBadge, FaPhoneAlt, FaExclamationTriangle } from 'react-icons/fa';
import Link from 'next/link';

export default function SafetyGuidelinesContent() {
  return (
    <FooterPageLayout
      title="Safety Guidelines"
      description="Your safety is our top priority. Review our detailed protocols for both hosts and guests."
      lastUpdated="April 2026"
    >
      <div className="relative rounded-3xl overflow-hidden mb-16 shadow-2xl group">
        <img src="https://picsum.photos/seed/safety1/1200/400" alt="Safe Boarding Community" className="w-full h-64 object-cover transform transition-transform duration-1000 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent flex items-end p-8">
          <h2 className="text-3xl font-bold text-white drop-shadow-md">Built on a Foundation of Trust</h2>
        </div>
      </div>

      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-8 border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <FaShieldAlt className="text-5xl text-blue-500 mx-auto mb-4" />
            <h3 className="font-bold text-xl mb-2 dark:text-gray-200">Secure Payments</h3>
            <p className="text-gray-600 dark:text-gray-400">Never transfer money outside the official BoardTAU framework. If someone asks you to wire money directly, report it.</p>
          </div>
          <div className="p-8 border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <FaIdBadge className="text-5xl text-purple-500 mx-auto mb-4" />
            <h3 className="font-bold text-xl mb-2 dark:text-gray-200">Verified IDs</h3>
            <p className="text-gray-600 dark:text-gray-400">Look for the 'Verified Host' badge. We ensure all landlords submit valid government IDs before listing their homes.</p>
          </div>
          <div className="p-8 border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <FaExclamationTriangle className="text-5xl text-yellow-500 mx-auto mb-4" />
            <h3 className="font-bold text-xl mb-2 dark:text-gray-200">Report Red Flags</h3>
            <p className="text-gray-600 dark:text-gray-400">If a property doesn't match the photos or the host acts suspiciously, use the direct report button on the listing.</p>
          </div>
        </div>
      </section>

      <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-8 border border-red-200 dark:border-red-900/30 flex flex-col md:flex-row items-center gap-8 justify-between hover:shadow-lg transition-shadow">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-3 text-red-800 dark:text-red-400 mb-2">
            <FaPhoneAlt /> Urgent Help Needed?
          </h3>
          <p className="text-red-700 dark:text-red-300 max-w-xl">
            If you feel unsafe or require immediate emergency assistance, contact local Camiling authorities and the TAU Campus Security immediately before contacting us.
          </p>
        </div>
        <Link href="/support/contact">
          <button className="bg-red-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-red-700 shadow-md hover:shadow-xl transition-all duration-300 whitespace-nowrap">
            Contact Security Hub
          </button>
        </Link>
      </div>
    </FooterPageLayout>
  );
}

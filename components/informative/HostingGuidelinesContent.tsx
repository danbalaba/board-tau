import FooterPageLayout from '@/components/layout/FooterPageLayout';
import { FaCheckCircle, FaTimesCircle, FaCameraRetro, FaRegCommentDots } from 'react-icons/fa';
import Link from 'next/link';

export default function HostingGuidelinesContent() {
  return (
    <FooterPageLayout
      title="Hosting Guidelines"
      description="Guidelines and pro-tips for successfully hosting your property and attracting more student tenants."
      lastUpdated="April 2026"
    >
      <div className="rounded-3xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 p-8 md:p-12 mb-16 text-center">
        <h2 className="text-3xl font-bold text-green-800 dark:text-green-400 mb-4">Set Yourself Up for Success</h2>
        <p className="text-green-700 dark:text-green-500 max-w-2xl mx-auto text-lg">
          Providing a fantastic experience starts before a tenant even steps through the door. A well-maintained listing guarantees higher visibility and better student retention.
        </p>
      </div>

      <section className="mb-16">
        <h3 className="text-2xl font-bold mb-8 text-center dark:text-white">The Golden Rules of Hosting</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <FaCameraRetro className="text-2xl text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-xl font-bold mb-3 dark:text-gray-200">High-Quality Photography</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Listings with bright, clear, and well-lit photos receive up to 70% more inquiries. Include photos of the bedroom, bathroom, exterior, and any shared spaces.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800">
            <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <FaRegCommentDots className="text-2xl text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="text-xl font-bold mb-3 dark:text-gray-200">Prompt Communication</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Students and parents value responsiveness. Aim to reply to all inquiries within 24 hours to secure bookings faster and build a reputable profile rating.
            </p>
          </div>

        </div>
      </section>

      <section className="mb-16">
        <h3 className="text-2xl font-bold mb-8 dark:text-white">Dos and Don'ts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="border border-green-200 dark:border-green-900/40 rounded-2xl overflow-hidden">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 border-b border-green-200 dark:border-green-900/40 flex items-center gap-3">
              <FaCheckCircle className="text-green-600" />
              <h4 className="font-bold text-green-800 dark:text-green-400">Do's</h4>
            </div>
            <ul className="p-6 space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">•</span>
                <span className="text-gray-700 dark:text-gray-300">Keep the calendar availability updated.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">•</span>
                <span className="text-gray-700 dark:text-gray-300">Clearly list all inclusive amenities (e.g., WiFi, water, electricity).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">•</span>
                <span className="text-gray-700 dark:text-gray-300">Establish clear house rules for curfews or visitors.</span>
              </li>
            </ul>
          </div>

          <div className="border border-red-200 dark:border-red-900/40 rounded-2xl overflow-hidden">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 border-b border-red-200 dark:border-red-900/40 flex items-center gap-3">
              <FaTimesCircle className="text-red-600" />
              <h4 className="font-bold text-red-800 dark:text-red-400">Don'ts</h4>
            </div>
            <ul className="p-6 space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-gray-700 dark:text-gray-300">Bait and switch: do not upload photos of a different room than the one available.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-gray-700 dark:text-gray-300">Hide hidden fees or charges in the fine print.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-gray-700 dark:text-gray-300">Conduct unexpected unannounced visits.</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      <div className="text-center mt-12 bg-white dark:bg-gray-900 rounded-3xl p-10 border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <h3 className="text-2xl font-bold mb-4 relative z-10 dark:text-gray-200">Ready to start earning?</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8 relative z-10">Join hundreds of verified landlords in Camiling.</p>
        <Link href="/hosting/list">
          <button className="relative z-10 bg-green-600 text-white font-bold px-8 py-3 rounded-full hover:bg-green-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            Add Your Listing
          </button>
        </Link>
      </div>

    </FooterPageLayout>
  );
}

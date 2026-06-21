import FooterPageLayout from '@/components/layout/FooterPageLayout';
import { FaSearch, FaUserGraduate, FaHome, FaShieldAlt, FaQuestionCircle } from 'react-icons/fa';
import Link from 'next/link';

export default function HelpCenterContent() {
  return (
    <FooterPageLayout
      title="Help Center"
      description="Find answers to commonly asked questions and learn how to use BoardTAU to its fullest potential."
      lastUpdated="April 2026"
    >
      {/* Search Bar Section */}
      <div className="relative -mt-6 mb-12 max-w-2xl group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400 group-hover:text-green-500 transition-colors" />
        </div>
        <input
          type="text"
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-300 hover:shadow-md text-lg dark:text-gray-200"
          placeholder="Search for articles, guides, or questions..."
        />
        <div className="absolute right-2 top-2">
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg font-medium active:scale-95">
            Search
          </button>
        </div>
      </div>

      <section className="mb-16">
        <h2 className="text-3xl font-extrabold mb-8 dark:text-white">Browse by Topic</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="group cursor-pointer p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl hover:border-green-500/50 dark:hover:border-green-500/50 transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
              <FaUserGraduate className="text-4xl text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-bold text-lg mb-2 dark:text-gray-200">For Students</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Everything you need to find the perfect boarding house securely.</p>
          </div>

          <div className="group cursor-pointer p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
              <FaHome className="text-4xl text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-bold text-lg mb-2 dark:text-gray-200">For Landlords</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage listings, handle bookings, and maximize your earnings.</p>
          </div>

          <div className="group cursor-pointer p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
              <FaShieldAlt className="text-4xl text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-bold text-lg mb-2 dark:text-gray-200">Trust & Safety</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Guidelines and best practices to stay safe on our platform.</p>
          </div>

          <div className="group cursor-pointer p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl hover:border-orange-500/50 dark:hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center">
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
              <FaQuestionCircle className="text-4xl text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-bold text-lg mb-2 dark:text-gray-200">General FAQ</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Answers to the most common setup and account queries.</p>
          </div>

        </div>
      </section>

      <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://picsum.photos/seed/boardtausf/1200/400')] bg-cover bg-center"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto text-lg hover:text-white transition-colors duration-300">
            Our support team is available 24/7 to assist you. Don't hesitate to reach out if you can't find what you're looking for.
          </p>
          <Link href="/support/contact">
            <button className="bg-white text-gray-900 hover:bg-green-50 font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:-translate-y-1 active:scale-95">
              Contact Support
            </button>
          </Link>
        </div>
      </div>
    </FooterPageLayout>
  );
}

import FooterPageLayout from '@/components/layout/FooterPageLayout';
import { FaPhoneAlt, FaEnvelope, FaCommentAlt, FaMapMarkerAlt } from 'react-icons/fa';

export default function ContactSupportContent() {
  return (
    <FooterPageLayout
      title="Contact Support"
      description="We're here to help you around the clock. Reach us through your preferred module."
      lastUpdated="April 2026"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        
        {/* Live Chat Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-green-600 to-green-800 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 opacity-20 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
            <FaCommentAlt className="text-[250px]" />
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4">Live Support Chat</h2>
            <p className="text-green-100 text-lg mb-8 max-w-md">
              Get instant answers from our dedicated BoardTAU student-support team. Typical wait time is under 3 minutes.
            </p>
            <button className="bg-white text-green-800 font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3">
              <FaCommentAlt /> Start a Conversation
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="bg-blue-50 dark:bg-blue-900/20 w-14 h-14 flex items-center justify-center rounded-2xl mb-6 group-hover:rotate-12 transition-transform">
              <FaPhoneAlt className="text-2xl text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-xl font-bold mb-2 dark:text-gray-200">Phone Support</h4>
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">+63 912 345 6789</p>
            <p className="text-sm text-gray-500">Available 9am to 6pm PHT</p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="bg-purple-50 dark:bg-purple-900/20 w-14 h-14 flex items-center justify-center rounded-2xl mb-6 group-hover:-rotate-12 transition-transform">
              <FaEnvelope className="text-2xl text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="text-xl font-bold mb-2 dark:text-gray-200">Email Updates</h4>
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">support@boardtau.edu.ph</p>
            <p className="text-sm text-gray-500">Expect replies within 24 hours</p>
          </div>
        </div>

      </div>

      <div className="w-full h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl overflow-hidden relative flex items-center justify-center border border-gray-200 dark:border-gray-700">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/mapTAU/1200/400')] bg-cover bg-center opacity-50 dark:opacity-30 blur-[2px]"></div>
        <div className="relative z-10 text-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20">
          <FaMapMarkerAlt className="text-3xl text-red-500 mx-auto mb-2" />
          <h4 className="font-bold text-lg dark:text-gray-200">Campus Office</h4>
          <p className="text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">IT Dept, Tarlac Agricultural University, Camiling</p>
        </div>
      </div>
    </FooterPageLayout>
  );
}

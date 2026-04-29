'use client';

import FooterPageLayout from '@/components/layout/FooterPageLayout';
import { FaFlag, FaBug, FaUserEdit, FaCommentSlash } from 'react-icons/fa';

export default function ReportProblemContent() {
  return (
    <FooterPageLayout
      title="Report a Problem"
      description="Help maintain a high-quality community by securely flagging issues to our moderation team."
      lastUpdated="April 2026"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        
        <div className="space-y-6">
          <h2 className="text-3xl font-bold dark:text-white mb-6">What are you reporting?</h2>
          
          <div className="flex items-center gap-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-red-500 cursor-pointer transition-colors group">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
              <FaFlag className="text-2xl text-red-500 group-hover:text-white" />
            </div>
            <div>
              <h4 className="font-bold text-lg dark:text-gray-200">Fake or Inaccurate Listing</h4>
              <p className="text-sm text-gray-500">The photos or description vastly differ from reality.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-purple-500 cursor-pointer transition-colors group">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
              <FaUserEdit className="text-2xl text-purple-500 group-hover:text-white" />
            </div>
            <div>
              <h4 className="font-bold text-lg dark:text-gray-200">Suspicious Host Behavior</h4>
              <p className="text-sm text-gray-500">Asking for advanced transfers outside BoardTAU.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-yellow-500 cursor-pointer transition-colors group">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl group-hover:bg-yellow-500 group-hover:text-white transition-colors duration-300">
              <FaCommentSlash className="text-2xl text-yellow-500 group-hover:text-white" />
            </div>
            <div>
              <h4 className="font-bold text-lg dark:text-gray-200">Inappropriate Messages</h4>
              <p className="text-sm text-gray-500">Harassment or unprofessional conduct in chat.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-500 cursor-pointer transition-colors group">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
              <FaBug className="text-2xl text-blue-500 group-hover:text-white" />
            </div>
            <div>
              <h4 className="font-bold text-lg dark:text-gray-200">Platform Technical Bug</h4>
              <p className="text-sm text-gray-500">Errors loading pages or finalizing reservations.</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-[#151515] p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-inner">
          <h3 className="text-xl font-bold mb-6 dark:text-white">File a Detailed Report</h3>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Link (Optional)</label>
              <input type="text" placeholder="https://boardtau.com/listing/123" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring focus:ring-gray-300 outline-none transition-shadow text-gray-800 dark:text-gray-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea rows={5} placeholder="Explain exactly what happened..." className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring focus:ring-gray-300 outline-none transition-shadow resize-none text-gray-800 dark:text-gray-200"></textarea>
            </div>
            <button className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-4 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              Submit Secure Report
            </button>
          </form>
        </div>

      </div>
    </FooterPageLayout>
  );
}

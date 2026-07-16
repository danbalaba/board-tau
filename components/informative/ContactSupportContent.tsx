import FooterPageLayout from '@/components/layout/FooterPageLayout';
import Link from 'next/link';

export default function ContactSupportContent() {
  return (
    <FooterPageLayout
      title="How can I request support via email?"
      lastUpdated="June 18, 2026"
    >
      <div className="space-y-6">
        <p>
          Our Support Team is available 24/7 to assist you with any issues or questions you may have. You can contact us via email and receive the help you need whenever you need it.
        </p>

        <p>
          To expedite the resolution of your request, please select the appropriate email address based on the product you are inquiring about or experiencing issues with. Describe your question or the situation you are facing, and <strong>send an email to the chosen address</strong>.
        </p>

        <p className="italic text-sm text-gray-600 dark:text-gray-400">
          Note: If you are an existing customer, please mention your Name and Student ID/Host ID in the email to speed up the resolution.
        </p>

        <p className="mt-8 mb-4">
          Check out the full list of BoardTAU contact information and departments below:
        </p>

        <h3 className="text-xl font-bold mt-8 mb-4">General</h3>
        <div className="overflow-hidden border border-gray-300 dark:border-slate-700 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-slate-700">
            <tbody className="divide-y divide-gray-300 dark:divide-slate-700 bg-white dark:bg-slate-900">
              <tr>
                <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white align-top w-2/3">
                  <div className="font-semibold mb-1">General</div>
                  <div className="text-gray-500 dark:text-slate-400 font-normal">To ask or resolve basic general BoardTAU-related questions.</div>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600 dark:text-slate-300 align-top w-1/3 border-l border-gray-300 dark:border-slate-700">
                  <a href="mailto:support@boardtau.com" className="hover:underline">support@boardtau.com</a>
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white align-top">
                  <div className="font-semibold mb-1">Pre-Sales / Pre-Booking inquiries</div>
                  <div className="text-gray-500 dark:text-slate-400 font-normal">For general questions about our booking process and to get help with choosing the right boarding house.</div>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600 dark:text-slate-300 align-top border-l border-gray-300 dark:border-slate-700">
                  <a href="mailto:sales@boardtau.com" className="hover:underline">sales@boardtau.com</a>
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white align-top">
                  <div className="font-semibold mb-1">Account access</div>
                  <div className="text-gray-500 dark:text-slate-400 font-normal">To get assistance if there are issues with accessing your BoardTAU account.</div>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600 dark:text-slate-300 align-top border-l border-gray-300 dark:border-slate-700">
                  <a href="mailto:accountaccess@boardtau.com" className="hover:underline">accountaccess@boardtau.com</a>
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white align-top">
                  <div className="font-semibold mb-1">Feedback</div>
                  <div className="text-gray-500 dark:text-slate-400 font-normal">To provide feedback on the website or our services.</div>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600 dark:text-slate-300 align-top border-l border-gray-300 dark:border-slate-700">
                  <a href="mailto:feedback@boardtau.com" className="hover:underline">feedback@boardtau.com</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">Trust & Safety</h3>
        <div className="overflow-hidden border border-gray-300 dark:border-slate-700 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-slate-700">
            <tbody className="divide-y divide-gray-300 dark:divide-slate-700 bg-white dark:bg-slate-900">
              <tr>
                <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white align-top w-2/3">
                  <div className="font-semibold mb-1">Identity Verification (KYC)</div>
                  <div className="text-gray-500 dark:text-slate-400 font-normal">For issues regarding ID verification or account validation.</div>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600 dark:text-slate-300 align-top w-1/3 border-l border-gray-300 dark:border-slate-700">
                  <a href="mailto:verification@boardtau.com" className="hover:underline">verification@boardtau.com</a>
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white align-top">
                  <div className="font-semibold mb-1">Report Abuse / Scam</div>
                  <div className="text-gray-500 dark:text-slate-400 font-normal">To report a suspicious listing, a fraudulent host, or a violation of community standards.</div>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600 dark:text-slate-300 align-top border-l border-gray-300 dark:border-slate-700">
                  <a href="mailto:abuse@boardtau.com" className="hover:underline">abuse@boardtau.com</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </FooterPageLayout>
  );
}

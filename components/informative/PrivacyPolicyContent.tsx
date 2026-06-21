import FooterPageLayout from '@/components/layout/FooterPageLayout';
import { FaUserLock, FaDatabase, FaCookieBite, FaShareAlt } from 'react-icons/fa';

export default function PrivacyPolicyContent() {
  return (
    <FooterPageLayout
      title="Privacy Policy"
      description="Transparent, straightforward outlines on how BoardTAU securely collects and protects your digital footprint."
      lastUpdated="April 2026"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-4xl font-extrabold mb-6 dark:text-white">Your data stays yours.</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            We operate BoardTAU tightly as a Capstone project. As such, our data collection protocols are strictly tied to providing necessary functionalities. We don't sell data. We don't share profiles to advertisers.
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-900/50">
            <h4 className="font-bold text-green-800 dark:text-green-400 mb-2">Our Promise</h4>
            <p className="text-green-700 dark:text-green-500 text-sm">
              We employ advanced hashing for passwords and maintain SSL encryption across the entire application to ensure absolutely zero intercept vulnerabilities.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          
          <div className="flex gap-4 group">
            <div className="mt-1">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full group-hover:scale-110 transition-transform">
                <FaDatabase className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm group-hover:shadow-md transition-shadow flex-1">
              <h4 className="font-bold text-lg dark:text-white mb-1">What we collect</h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Basic identities (email, name) and system usage data for algorithm matching.</p>
            </div>
          </div>

          <div className="flex gap-4 group">
            <div className="mt-1">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full group-hover:scale-110 transition-transform">
                <FaUserLock className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm group-hover:shadow-md transition-shadow flex-1">
              <h4 className="font-bold text-lg dark:text-white mb-1">3rd Party Logins</h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm">If using Google/OAuth, we only extract minimal authorized tokens to finalize logins.</p>
            </div>
          </div>

          <div className="flex gap-4 group">
            <div className="mt-1">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full group-hover:scale-110 transition-transform">
                <FaCookieBite className="text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm group-hover:shadow-md transition-shadow flex-1">
              <h4 className="font-bold text-lg dark:text-white mb-1">Strict Cookies</h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm">We only utilize essential session cookies needed to maintain login continuity.</p>
            </div>
          </div>

        </div>
      </div>
    </FooterPageLayout>
  );
}

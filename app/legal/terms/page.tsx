import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | BoardTAU',
  description: 'Terms and conditions for using the BoardTAU platform.',
};

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span>Home</span>
            <span>›</span>
            <span>Terms of Service</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Terms and conditions for using the BoardTAU platform
          </p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 md:p-12">
            <div className="space-y-12">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Acceptance of Terms
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  By accessing or using the BoardTAU platform, you agree to be bound by these Terms of Service.
                  If you do not agree to these terms, please do not use our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Platform Usage
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  BoardTAU is a capstone project focused on connecting users with boarding house accommodations
                  near Tarlac Agricultural University. The platform provides information and tools to help you
                  find, book, and manage boarding house stays.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  You may use our platform solely for personal, non-commercial purposes. You are responsible for
                  maintaining the confidentiality of your account information and for all activities that occur
                  under your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Listings and Bookings
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  The listings on BoardTAU are provided by individual hosts and property owners. We make every
                  effort to ensure the accuracy of listing information, but we do not guarantee its completeness
                  or reliability.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  When you book a boarding house through our platform, you are entering into a direct
                  relationship with the host. We facilitate the booking process but are not a party to the
                  transaction between you and the host.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  User Responsibilities
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  As a user of BoardTAU, you agree to:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                  <li>Provide accurate and complete information when creating an account</li>
                  <li>Use the platform only for lawful purposes</li>
                  <li>Respect the rights of other users and hosts</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Not engage in any fraudulent or deceptive activities</li>
                  <li>Not disrupt or interfere with the platform's functionality</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Host Responsibilities
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Hosts who list their properties on BoardTAU agree to:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                  <li>Provide accurate and complete information about their properties</li>
                  <li>Maintain their properties in a safe and clean condition</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Communicate honestly and promptly with guests</li>
                  <li>Respect the rights and privacy of guests</li>
                  <li>Comply with BoardTAU's hosting guidelines</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Privacy
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  We respect your privacy and are committed to protecting your personal information. Our Privacy
                  Policy explains how we collect, use, and safeguard your data. By using our platform, you agree
                  to the collection and use of your information in accordance with our Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Disclaimers
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  The BoardTAU platform is provided "as is" and "as available" without any warranties of any
                  kind, whether express or implied. We do not warrant that the platform will be error-free,
                  secure, or available at all times.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  We are not responsible for any damages or losses arising from your use of the platform or any
                  transactions you conduct through it. This includes, but is not limited to, damages from
                  bookings, property conditions, or interactions with other users.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Changes to Terms
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  We may update these Terms of Service from time to time. We will notify you of any changes by
                  posting the new Terms on this page. Your continued use of the platform after any changes
                  constitutes acceptance of the new Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Contact Information
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  For questions about these Terms of Service or to report any violations, please contact us at:
                  <br />
                  <strong>Email:</strong> support@boardtau.test
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;

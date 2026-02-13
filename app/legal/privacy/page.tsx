import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | BoardTAU',
  description: 'How BoardTAU collects, uses, and protects your information.',
};

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span>Home</span>
            <span>›</span>
            <span>Privacy Policy</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            How BoardTAU collects, uses, and protects your information
          </p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 md:p-12">
            <div className="space-y-12">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Introduction</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  BoardTAU is a capstone project focused on connecting students and residents with quality
                  boarding house accommodations near Tarlac Agricultural University. We are committed to
                  protecting your privacy and providing a safe, secure platform for all users.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  This Privacy Policy explains how we collect, use, and safeguard your information when you
                  use our platform. Please read this policy carefully to understand our practices regarding
                  your personal data and how we will treat it.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Information We Collect
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We collect various types of information to provide and improve our services:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                  <li>
                    <strong>Account Information:</strong> Name, email address, and password when you create
                    an account.
                  </li>
                  <li>
                    <strong>Profile Information:</strong> Profile picture, bio, and other details you choose
                    to share.
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Information about how you use the platform, including search
                    history, favorite listings, and reservation details.
                  </li>
                  <li>
                    <strong>Login Information:</strong> Data from third-party authentication providers (such
                    as Google) if you choose to use them.
                  </li>
                  <li>
                    <strong>Communication:</strong> Messages you send and receive through our platform, and
                    information about your interactions with customer support.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  How We Use Information
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We use your information for the following purposes:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                  <li>To create and manage your account</li>
                  <li>To provide and improve our services</li>
                  <li>To process bookings and reservations</li>
                  <li>To communicate with you about your account or bookings</li>
                  <li>To personalize your experience on our platform</li>
                  <li>To protect the security and integrity of our platform</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Data Protection
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We take your privacy seriously and implement reasonable security measures to protect your
                  information. These measures include:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                  <li>Hashing passwords using secure algorithms</li>
                  <li>Encrypting sensitive information in transit</li>
                  <li>Limiting access to personal data</li>
                  <li>Regular security assessments</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Third-Party Services
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We use third-party services to help us provide and improve our platform. These services may
                  include:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                  <li>
                    <strong>Authentication:</strong> Google Authentication for secure login
                  </li>
                  <li>
                    <strong>Payment Processing:</strong> Secure payment providers for booking transactions
                  </li>
                  <li>
                    <strong>Hosting:</strong> Cloud hosting services to store data and run our platform
                  </li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 mt-4">
                  These third-party services have their own privacy policies, and we encourage you to review
                  them.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">User Rights</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You have certain rights regarding your personal information:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                  <li>Access your personal information</li>
                  <li>Update or correct your personal information</li>
                  <li>Request deletion of your account</li>
                  <li>Export your data</li>
                  <li>Request restrictions on processing of your data</li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 mt-4">
                  To exercise these rights, please contact us at support@boardtau.test.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Contact Information
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  For questions about this Privacy Policy or to exercise your rights, please contact us at:
                  <br />
                  <strong>Email:</strong> support@boardtau.test
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Changes to This Policy
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by
                  posting the new Policy on this page. You are advised to review this Policy periodically.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;

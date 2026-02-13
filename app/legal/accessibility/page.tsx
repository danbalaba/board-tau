import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility | BoardTAU',
  description: 'BoardTAU commitment to accessibility for all users.',
};

const AccessibilityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span>Home</span>
            <span>›</span>
            <span>Accessibility</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Accessibility
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            BoardTAU commitment to accessibility for all users
          </p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 md:p-12">
            <div className="space-y-12">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Our Commitment
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  BoardTAU is committed to providing an accessible platform for all users, regardless of their
                  abilities or disabilities. We strive to ensure that our website and services are usable by
                  everyone, including individuals with visual, auditory, motor, or cognitive impairments.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Accessibility Features
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We have implemented various accessibility features to enhance user experience:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                  <li>
                    <strong>Screen Reader Support:</strong> Our platform is compatible with popular screen
                    readers
                  </li>
                  <li>
                    <strong>Keyboard Navigation:</strong> All interactive elements are accessible via keyboard
                    navigation
                  </li>
                  <li>
                    <strong>High Contrast Mode:</strong> Support for high contrast visual settings
                  </li>
                  <li>
                    <strong>Responsive Design:</strong> Optimized for various screen sizes and devices
                  </li>
                  <li>
                    <strong>Alternative Text:</strong> Images include descriptive alt text
                  </li>
                  <li>
                    <strong>Clear Visual Hierarchy:</strong> Well-structured content with clear headings
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Accessibility Standards
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  We are committed to following accessibility guidelines and standards, including:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                  <li>
                    <strong>WCAG 2.1 AA:</strong> Web Content Accessibility Guidelines 2.1 at the AA level
                  </li>
                  <li>
                    <strong>Section 508:</strong> U.S. government accessibility standards
                  </li>
                  <li>
                    <strong>ADA Compliance:</strong> Americans with Disabilities Act requirements
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Feedback and Support
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We are continuously working to improve the accessibility of our platform. If you encounter
                  any accessibility issues or have suggestions for improvement, please let us know.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Contact:</strong> support@boardtau.test
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Accessibility Statement
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  This Accessibility Statement applies to the BoardTAU platform and all its services. We are
                  committed to providing equal access to information and services for all individuals, including
                  those with disabilities.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Future Improvements
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We are constantly working to improve the accessibility of our platform. Some of our future
                  plans include:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                  <li>Enhanced keyboard navigation</li>
                  <li>Improved screen reader compatibility</li>
                  <li>Additional language support</li>
                  <li>Video captions and transcripts</li>
                  <li>More accessible booking forms</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Contact Information
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  For questions about our accessibility efforts or to report accessibility issues, please
                  contact us at:
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

export default AccessibilityPage;

import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Help Center | BoardTAU',
  description: 'Browse our full library of help topics.',
};

const HelpCenterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Link href="/" className="hover:text-gray-900 dark:hover:text-white">
              Home
            </Link>
            <span>›</span>
            <span>Help Center</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            All topics
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Browse our full library of help topics.
          </p>
        </div>

        {/* User Type Tabs */}
        <div className="flex flex-wrap gap-4 mb-12 border-b pb-2 border-gray-200 dark:border-gray-800">
          <button className="pb-2 px-2 border-b-2 border-gray-900 dark:border-gray-100 font-medium text-gray-900 dark:text-gray-100">
            Guest
          </button>
          <button className="pb-2 px-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
            Host
          </button>
          <button className="pb-2 px-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
            Admin
          </button>
        </div>

        {/* Help Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
          {/* Searching and Booking */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Searching and booking
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help/search-tips"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Search tips
                </Link>
              </li>
              <li>
                <Link
                  href="/help/booking-places-to-stay"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Booking places to stay
                </Link>
              </li>
              <li>
                <Link
                  href="/help/messaging"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Messaging
                </Link>
              </li>
              <li>
                <Link
                  href="/help/travel-insurance"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Travel insurance
                </Link>
              </li>
            </ul>
          </div>

          {/* Your Reservations */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Your reservations as a guest
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help/reservation-status"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Reservation status
                </Link>
              </li>
              <li>
                <Link
                  href="/help/changes-as-guest"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Changes as a guest
                </Link>
              </li>
              <li>
                <Link
                  href="/help/cancellations"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Cancellations
                </Link>
              </li>
              <li>
                <Link
                  href="/help/checking-in"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Checking in
                </Link>
              </li>
              <li>
                <Link
                  href="/help/checking-out"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Checking out
                </Link>
              </li>
              <li>
                <Link
                  href="/help/prepare-for-stay"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Preparing for your stay
                </Link>
              </li>
              <li>
                <Link
                  href="/help/booking-issues"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Issues with your reservation
                </Link>
              </li>
            </ul>
          </div>

          {/* Payments and Pricing */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Payments and pricing
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help/paying-reservation"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Paying for a reservation
                </Link>
              </li>
              <li>
                <Link
                  href="/help/refunds-reimbursements"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Guest refunds and reimbursements
                </Link>
              </li>
              <li>
                <Link
                  href="/help/pricing-fees"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Pricing and fees
                </Link>
              </li>
              <li>
                <Link
                  href="/help/coupons-credits"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Coupons, credits, and gift cards
                </Link>
              </li>
              <li>
                <Link
                  href="/help/invoices-receipts"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Invoices and receipts
                </Link>
              </li>
              <li>
                <Link
                  href="/help/taxes-guests"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Taxes for guests
                </Link>
              </li>
            </ul>
          </div>

          {/* Your Account and Reviews */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Your account and reviews
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help/creating-account"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Creating an account
                </Link>
              </li>
              <li>
                <Link
                  href="/help/managing-account"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Managing your account
                </Link>
              </li>
              <li>
                <Link
                  href="/help/id-verification"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  ID and verification
                </Link>
              </li>
              <li>
                <Link
                  href="/help/account-security"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Account security
                </Link>
              </li>
              <li>
                <Link
                  href="/help/reviews"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Safety
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help/safety-concerns"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Safety concerns
                </Link>
              </li>
              <li>
                <Link
                  href="/help/safety-tips"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Safety tips and guidelines
                </Link>
              </li>
              <li>
                <Link
                  href="/help/reporting-issues"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Reporting issues
                </Link>
              </li>
            </ul>
          </div>

          {/* About BoardTAU */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              About BoardTAU
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Getting started
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  How BoardTAU works
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Our community policies
                </Link>
              </li>
              <li>
                <Link
                  href="/partnerships"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Partnerships
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Contact info and feedback
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;

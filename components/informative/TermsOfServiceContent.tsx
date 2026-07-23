"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowRight } from 'lucide-react';
import { InteractiveCard } from '@/components/lightswind/interactive-card';
import Link from 'next/link';

export default function TermsOfServiceContent() {
  const sections = [
    {
      title: "1. Agreement",
      content: "By accessing or using BoardTAU (\"the Platform,\" \"we,\" \"us,\" \"our\"), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you must immediately discontinue your use of our website and services."
    },
    {
      title: "2. Account Eligibility",
      content: "Use of the Platform is permitted for individuals associated with the Tarlac Agricultural University (TAU) community—including students, faculty, staff, and authorized guests—as well as boarding house owners/landlords. You must be at least 18 years of age or have legal guardian consent to register an account and transact on the Platform."
    },
    {
      title: "3. Platform Role",
      content: "BoardTAU acts strictly as a digital directory and booking mediator. We provide the technology that allows renters to discover rooms and submit reservation inquiries, and allows landlords to manage listings. We are not a housing provider, property manager, or real estate broker."
    },
    {
      title: "4. Platform Purpose",
      content: "The Platform is designed to simplify accommodation search for the TAU community in Camiling, Tarlac. All listings must represent real, physical housing spaces located near the campus."
    },
    {
      title: "5. Acceptable Use & Conduct",
      content: "You agree to use the Platform only for legitimate boarding house discovery and management. The following activities are strictly prohibited:",
      bullets: [
        "Providing false identification during the identity and liveness check.",
        "Listing properties you do not own, manage, or have authorization to rent out.",
        "Bypassing our secure reservation payment systems to avoid fee logging.",
        "Using the in-app chat system to transmit abusive language, spam, or advertise external products."
      ]
    },
    {
      title: "6. Content and Intellectual Property",
      content: "Landlords retain ownership of listing photos, text descriptions, and floor plans uploaded to the Platform. However, you grant BoardTAU a perpetual license to display this content on the Platform to facilitate inquiries and promote accommodations."
    },
    {
      title: "7. Payments, Fees, and Refunds",
      content: "Reservation fees paid through our secure online payment partners (supporting GCash, Maya, and credit/debit cards) secure your room slot. Refund eligibility is governed by the specific cancellation terms chosen by the landlord on the property listing. BoardTAU is not responsible for refund disputes once funds have been disbursed to the landlord."
    },
    {
      title: "8. Booked Accommodation Access",
      content: "An approved reservation slip guarantees room priority. Renters must coordinate directly with the landlord regarding move-in schedules, key handovers, and physical verification checks."
    },
    {
      title: "9. Host Payouts",
      content: "Verified booking fees are routed to the host’s registered disbursement accounts according to our standard billing terms, minus any platform maintenance fees. Hosts are responsible for paying any local taxes associated with their rental income."
    },
    {
      title: "10. Third-Party Services",
      content: "We integrate third-party services for maps, file hosting, and payment routing. We do not control and are not responsible for the performance, terms of service, or accessibility of these third-party platforms."
    },
    {
      title: "11. Disclaimer and Liability",
      content: "BoardTAU is provided \"as is\" and \"as available.\" We do not guarantee the condition of properties listed or the actions of tenants or hosts. To the maximum extent permitted by law, BoardTAU shall not be liable for any direct, indirect, or consequential damages arising from room rentals or communications on the Platform."
    },
    {
      title: "12. Moderation, Suspension, and Termination",
      content: "To maintain safety, we monitor platform usage for systemic abuse. We enforce a strict three-strike policy on booking cancellations. Users who repeatedly request and cancel bookings, post fraudulent listings, or bypass payments will face account suspension, listing removal, and potential lifetime bans."
    },
    {
      title: "13. Governing Law",
      content: "These Terms of Service shall be governed by and construed in accordance with the laws of the Republic of the Philippines. Any legal actions arising from these terms must be filed in the courts of Tarlac."
    },
    {
      title: "14. Contact",
      content: "If you have questions or concerns regarding these Terms of Service, please contact us at:",
      link: { text: "support@boardtau.xyz", href: "mailto:support@boardtau.xyz" }
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-slate-900 text-gray-900 dark:text-slate-100 transition-colors duration-300">
      {/* Hero Header */}
      <div className="pt-32 pb-16 text-center border-b border-neutral-200/50 dark:border-slate-800">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-3 py-1.5 bg-[#2f7d6d]/10 dark:bg-[#2f7d6d]/20 text-[#2f7d6d] rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              Legal Documents
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
              Terms of <span className="text-[#2f7d6d]">Service</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 dark:text-slate-400 max-w-2xl mx-auto">
              Please read these terms carefully before using BoardTAU. Last updated on October 2023.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-10 lg:px-12 max-w-4xl py-20 space-y-16">
        
        {/* Document Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7 }}
          className="bg-white dark:bg-slate-800/60 rounded-3xl p-8 md:p-12 lg:p-16 border border-neutral-200/60 dark:border-slate-700 shadow-xl dark:shadow-2xl space-y-12"
        >
          {sections.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-neutral-100 dark:border-slate-700/50 pb-2">
                {section.title}
              </h2>
              <p className="text-gray-600 dark:text-slate-300 leading-relaxed text-lg">
                {section.content}
              </p>
              {section.bullets && (
                <ul className="list-disc pl-6 space-y-2 mt-4 text-gray-600 dark:text-slate-300 text-lg">
                  {section.bullets.map((bullet, bIdx) => (
                    <li key={bIdx}>{bullet}</li>
                  ))}
                </ul>
              )}
              {section.link && (
                <div className="pt-2">
                  <a href={section.link.href} className="text-[#2f7d6d] font-semibold hover:underline text-lg">
                    {section.link.text}
                  </a>
                </div>
              )}
            </section>
          ))}
        </motion.div>

        {/* Bottom CTA to Privacy Policy */}
        <InteractiveCard
          className="mt-16 !w-full max-w-4xl mx-auto !aspect-auto"
          tailwindBgClass="bg-white dark:bg-slate-800/40"
          InteractiveColor="#2f7d6d"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            className="p-10 md:p-12 text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-[#2f7d6d]/10 text-[#2f7d6d] flex items-center justify-center mx-auto mb-2">
              <FileText className="w-8 h-8" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
                Privacy Matters
              </h3>
              <p className="text-gray-600 dark:text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                By agreeing to these terms, you also agree to our Privacy Policy, which details how we collect, use, and protect your personal information.
              </p>
            </div>
            <div className="pt-4">
              <Link
                href="/legal/privacy"
                className="inline-flex items-center gap-2 bg-[#2f7d6d] hover:bg-[#1e5146] text-white px-8 py-4 rounded-xl font-bold shadow-md transition-all duration-300 hover:scale-[1.02] relative z-20"
              >
                Read Privacy Policy <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </InteractiveCard>

      </div>
    </div>
  );
}

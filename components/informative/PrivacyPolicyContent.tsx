"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight } from 'lucide-react';
import { InteractiveCard } from '@/components/lightswind/interactive-card';
import Link from 'next/link';

export default function PrivacyPolicyContent() {
  const sections = [
    {
      title: "1. Scope",
      content: "BoardTAU (\"we,\" \"us,\" \"our\") is dedicated to protecting your privacy and personal data. This Privacy Policy details our data collection, usage, and protection practices when you browse listings, submit booking inquiries, or register properties on the BoardTAU platform."
    },
    {
      title: "2. Data We Collect",
      content: "We collect information necessary to provide, secure, and maintain our boarding house directory and reservation services:",
      bullets: [
        "Account Data: Full name, email address, password hash, and profile details.",
        "Verification Records: Identification documents (e.g., student IDs, government-issued IDs for tenants, and Mayor's/Business permits and Fire Safety certificates for hosts) uploaded securely to verify identities and combat listing fraud.",
        "Liveness & Identity Check Data: Dynamic selfie scans to perform a secure verification check, proving the applicant is a real person.",
        "Transaction Data: Details of booking reservation fee transactions. We do not store your credit card or e-wallet credentials directly.",
        "Communications: Message histories and metadata generated when you contact landlords or tenants using our secure internal chat system."
      ]
    },
    {
      title: "3. How We Use Data",
      content: "We use your personal data to execute core platform operations:",
      bullets: [
        "To set up and manage user accounts and landlord registrations.",
        "To execute tenant verification and host validation.",
        "To route inquiry notifications, process reservation fees, and generate booking records.",
        "To secure the platform against unauthorized access, brute-force intrusions, and fraudulent listings.",
        "To deliver customer support when you reach out to our team."
      ]
    },
    {
      title: "4. Legal Basis for Processing",
      content: "Our data practices strictly comply with the Philippine Data Privacy Act of 2012 (Republic Act No. 10173). We process your data based on your explicit consent, to execute contract obligations (e.g., fulfilling a booking reservation), and to support legitimate security operations on the platform."
    },
    {
      title: "5. Data Sharing",
      content: "Your information is never sold to third parties. We share details between tenants and landlords strictly to fulfill booking requests (e.g., sharing a tenant's contact information with a host when an inquiry is approved). Sensitive documents and payment information are routed through our verified, secure cloud file storage and payment processing gateways."
    },
    {
      title: "6. Data Retention",
      content: "We retain account data as long as your account remains active. Transaction histories and security logs are retained for audit and legal compliance. Sensitive verification documents (like selfies and government IDs) are kept only as long as necessary to complete verification reviews, after which they are securely archived or deleted."
    },
    {
      title: "7. Security",
      content: "We employ industry-standard safeguards to secure your records. Passwords are encrypted using robust hashing algorithms before database storage. Chat messaging histories are protected with secure end-to-end database encryption. All payment transactions are completed via encrypted, PCI-compliant gateways."
    },
    {
      title: "8. Your Privacy Rights",
      content: "Under the Data Privacy Act of 2012, you have the right to access your personal records, request corrections to inaccurate details, object to certain processing activities, or request the deletion of your account and personal history from our active databases. To exercise these rights, please email our team."
    },
    {
      title: "9. International Transfers",
      content: "As our cloud hosting and security infrastructures are located globally, data processing may occur across secure servers in other regions, always matching the security levels required by local regulations."
    },
    {
      title: "10. Policy Updates",
      content: "We may revise this Privacy Policy periodically to reflect updates in legal standards or system features. We will announce significant updates on our home page or email active users directly."
    },
    {
      title: "11. Contact",
      content: "If you have questions, feedback, or data privacy requests regarding this policy, please reach out to us at:",
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
              Privacy <span className="text-[#2f7d6d]">Policy</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 dark:text-slate-400 max-w-2xl mx-auto">
              Learn how we collect, use, and protect your personal information on the BoardTAU platform.
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
                    <li key={bIdx}>
                      {bullet.includes(":") ? (
                        <>
                          <strong className="text-gray-900 dark:text-white font-semibold">
                            {bullet.split(":")[0]}:
                          </strong>
                          {bullet.split(":")[1]}
                        </>
                      ) : (
                        bullet
                      )}
                    </li>
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

        {/* Bottom CTA to Terms of Service */}
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
              <Shield className="w-8 h-8" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
                Platform Rules
              </h3>
              <p className="text-gray-600 dark:text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Make sure you also read our Terms of Service to understand the rules and guidelines for using the BoardTAU platform.
              </p>
            </div>
            <div className="pt-4">
              <Link
                href="/legal/terms"
                className="inline-flex items-center gap-2 bg-[#2f7d6d] hover:bg-[#1e5146] text-white px-8 py-4 rounded-xl font-bold shadow-md transition-all duration-300 hover:scale-[1.02] relative z-20"
              >
                Read Terms of Service <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </InteractiveCard>

      </div>
    </div>
  );
}

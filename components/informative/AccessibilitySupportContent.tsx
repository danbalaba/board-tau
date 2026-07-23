"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Accessibility, ArrowRight } from 'lucide-react';
import { InteractiveCard } from '@/components/lightswind/interactive-card';
import Link from 'next/link';

export default function AccessibilitySupportContent() {
  const sections = [
    {
      title: "1. Our Commitment",
      content: "At BoardTAU, we are committed to making our website and platform accessible to everyone, including individuals with disabilities. We believe that everyone should have equal access to secure housing options. We are actively working to increase the accessibility and usability of our website and in doing so adhere to many of the available standards and guidelines. Our goal is to meet the Web Content Accessibility Guidelines (WCAG) 2.1 at the AA level."
    },
    {
      title: "2. Features to Enhance Accessibility",
      content: "We have implemented the following features to ensure our platform is easy to use for all users:",
      bullets: [
        "Keyboard Navigation: Our site is designed to be fully navigable using a keyboard.",
        "Screen Reader Compatibility: We use semantic HTML and ARIA labels to ensure compatibility with screen readers.",
        "Color Contrast: We have carefully selected our color palette and use a dark/light mode toggle to ensure sufficient contrast for users with visual impairments.",
        "Scalable Text: Our layout responds to browser text-sizing options, allowing you to increase the font size without breaking the layout."
      ]
    },
    {
      title: "3. Accessibility for Listings",
      content: "We encourage all our hosts to clearly describe the accessibility features of their properties. If you have specific accessibility needs (e.g., ground-floor rooms, wheelchair ramps, grab bars), you can use our advanced filtering options to find listings that accommodate those needs. If the listing description is unclear, we recommend messaging the host directly for confirmation before booking."
    },
    {
      title: "4. Feedback and Assistance",
      content: "We are constantly working to improve our platform. If you experience any difficulty in accessing any part of this website, or if you have suggestions on how we can improve our accessibility features, please let us know.",
      link: { text: "accessibility@boardtau.xyz", href: "mailto:accessibility@boardtau.xyz" }
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
              Accessibility <span className="text-[#2f7d6d]">Statement</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 dark:text-slate-400 max-w-2xl mx-auto">
              Our ongoing commitment to making the BoardTAU platform welcoming, usable, and accessible for everyone.
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

        {/* Bottom CTA to FAQs/Support */}
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
              <Accessibility className="w-8 h-8" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
                Need extra assistance?
              </h3>
              <p className="text-gray-600 dark:text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                If you encounter any barriers while using our platform, our support team is ready to help you manually process requests or bookings.
              </p>
            </div>
            <div className="pt-4">
              <Link
                href="/support/faqs"
                className="inline-flex items-center gap-2 bg-[#2f7d6d] hover:bg-[#1e5146] text-white px-8 py-4 rounded-xl font-bold shadow-md transition-all duration-300 hover:scale-[1.02] relative z-20"
              >
                Contact Support <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </InteractiveCard>

      </div>
    </div>
  );
}

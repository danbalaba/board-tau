"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  ScanFace, 
  LockKeyhole,
  AlertOctagon,
  ArrowRight,
  CreditCard,
  Server
} from 'lucide-react';
import { GlowingCards, GlowingCard } from '@/components/lightswind/glowing-cards';
import { InteractiveCard } from '@/components/lightswind/interactive-card';

export default function SafetyGuidelinesContent() {
  const guidelines = [
    {
      icon: ScanFace,
      title: 'Identity Verification (KYC)',
      description: 'At BoardTAU, user safety and authenticity are our top priorities. To prevent rental scams, fake accounts, and unauthorized access, we enforce a strict Know Your Customer (KYC) process for all users (both tenants and landlords).',
      detail: 'Our identity verification process utilizes advanced computer vision. During onboarding, the system performs real-time Liveness Detection (including face tracking and blink detection) to ensure that the person registering is a real, live human being and not attempting to bypass security with a photograph or pre-recorded video.'
    },
    {
      icon: LockKeyhole,
      title: 'Secure Communications',
      description: 'Never take conversations off the BoardTAU platform before a booking is confirmed. Our in-app real-time messaging system is secured with industry-standard encryption.',
      detail: 'This means your conversations, negotiations, and shared personal details are completely private and protected against unauthorized interception.'
    },
    {
      icon: CreditCard,
      title: 'Verified Digital Payments',
      description: 'All reservation fees and transactions are processed through encrypted, industry-standard payment gateways to protect your financial details and ensure transparent bookings.',
      detail: 'By integrating with trusted payment providers for credit/debit cards and local e-wallets, we eliminate the need for risky direct cash handovers. Every transaction is securely logged, giving both tenants and landlords a reliable digital paper trail.'
    },
    {
      icon: Server,
      title: 'Platform Stability & Access Control',
      description: 'Our system employs strict role-based access controls and real-time monitoring to prevent fraudulent activities and protect user data at all times.',
      detail: 'We utilize advanced rate limiting to stop automated attacks, continuous error tracking to maintain platform stability, and secure session management. This ensures a safe, uninterrupted browsing and booking experience for the entire university community.'
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
              Trust & Safety
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
              Platform <span className="text-[#2f7d6d]">Safety Guidelines</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 dark:text-slate-400 max-w-2xl mx-auto">
              Learn how we utilize advanced verification and encryption technologies to keep the boardtau.xyzmunity safe and secure.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-10 lg:px-12 max-w-6xl py-20 space-y-16">
        
        {/* Guidelines Section */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <GlowingCards
            enableGlow={true}
            glowRadius={20}
            glowOpacity={0.85}
            gap="2rem"
            padding="0.5rem 0"
            maxWidth="100%"
            layout="wrap"
            className="justify-center items-stretch"
          >
            {guidelines.map((item, index) => {
              const Icon = item.icon;
              return (
                <GlowingCard
                  key={index}
                  glowColor="#2f7d6d"
                  className="flex flex-col gap-5 bg-white dark:bg-slate-800/40 border-neutral-200/60 dark:border-slate-700 shadow-sm w-full md:w-[calc(50%-1.5rem)] !flex-none"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#2f7d6d]/10 text-[#2f7d6d] flex items-center justify-center mb-2">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-2xl">{item.title}</h3>
                  <div className="space-y-4 flex-grow">
                    <p className="text-base text-gray-600 dark:text-slate-400 leading-relaxed font-medium">
                      {item.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-slate-500 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </GlowingCard>
              );
            })}
          </GlowingCards>
        </motion.section>

        {/* Suspicious Activity CTA */}
        <InteractiveCard
          className="mt-16 !w-full max-w-2xl mx-auto !aspect-auto"
          tailwindBgClass="bg-white dark:bg-slate-800/40"
          InteractiveColor="#e11d48"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            className="p-8 md:p-10 text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-2">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Reporting Suspicious Activity
              </h3>
              <p className="text-gray-600 dark:text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                If a landlord asks you to pay a reservation fee outside of the BoardTAU platform 
                (e.g., direct bank transfer or GCash send before the booking is approved in-app), 
                please decline and report the user immediately.
              </p>
            </div>
            <div className="pt-4">
              <a
                href="mailto:abuse@boardtau.xyz"
                className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-xl font-bold shadow-md transition-all duration-300 hover:scale-[1.02] relative z-20 cursor-pointer"
              >
                Report to abuse@boardtau.xyz <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </motion.div>
        </InteractiveCard>

      </div>
    </div>
  );
}

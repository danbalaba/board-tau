"use client";
import { motion } from 'framer-motion';
import { ShieldCheck, Fingerprint, Heart, AlertTriangle, ArrowRight } from 'lucide-react';
import { InteractiveCard } from '@/components/lightswind/interactive-card';

const standards = [
  {
    id: 1,
    icon: ShieldCheck,
    title: "1. Safety",
    intro: "Your BoardTAU experience begins with a safe environment.",
    items: [
      { term: "No Harassment", detail: "We do not tolerate physical or verbal abuse, sexual assault, harassment, or bullying of any kind." },
      { term: "No Dangerous Activities", detail: "Properties listed on BoardTAU must not be used for illegal activities, illicit drug use, or the unauthorized possession of firearms." },
      { term: "Self-Harm", detail: "If we are notified of a user who is at risk of self-harm, we may intervene by contacting emergency services." },
    ],
  },
  {
    id: 2,
    icon: Fingerprint,
    title: "2. Authenticity",
    intro: "Trust requires authenticity.",
    items: [
      { term: "Real Identities", detail: "You must accurately represent who you are. Do not use fake names or photos that are not of you. Our KYC process enforces this rule." },
      { term: "Real Properties", detail: "Hosts must not list properties they do not own or have the authority to rent out." },
      { term: "Honest Reviews", detail: "Reviews must be based on genuine experiences. Do not manipulate the review system by coercing guests or posting fake reviews." },
    ],
  },
  {
    id: 3,
    icon: Heart,
    title: "3. Respect",
    intro: "We expect all users to treat each other with dignity and care.",
    items: [
      { term: "Respect Privacy", detail: "Do not spy on guests or hosts. The use of undisclosed recording devices in private spaces is strictly prohibited." },
      { term: "Respect the Property", detail: "Guests must treat the boarding house with care and leave it in the condition they found it." },
      { term: "Respect Neighbors", detail: "Be mindful of noise levels and community rules to ensure you are a good neighbor." },
    ],
  },
  {
    id: 4,
    icon: AlertTriangle,
    title: "4. Reliability & System Abuse",
    intro: "Landlords rely on accurate bookings to manage their business, and users rely on landlords to honor their commitments.",
    items: [
      { term: "No Spamming", detail: "Repeatedly making and cancelling inquiries or reservations to maliciously block room availability is prohibited." },
      { term: "Strike System", detail: "We enforce a strict 3-strike rule for cancellation abuse. Excessive cancellations will automatically trigger account suspension and potential lifetime bans." },
      { term: "Forfeiture", detail: "Users suspended for violating these standards forfeit any paid reservation fees, and their un-started bookings are automatically voided to protect the host." },
    ],
  },
];

export default function CommunityStandardsContent() {
  return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-slate-900 text-gray-900 dark:text-slate-100 transition-colors duration-300">

      {/* Hero Header */}
      <div className="pt-32 pb-12 text-center border-b border-neutral-200/50 dark:border-slate-800">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
              Isang komunidad na{' '}
              <span className="text-[#2f7d6d]">puno ng tiwala.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 dark:text-slate-400 max-w-2xl mx-auto">
              These standards apply to every student, landlord, and administrator on BoardTAU — no exceptions.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Standards Cards */}
      <div className="container mx-auto px-6 md:px-10 lg:px-12 max-w-7xl pt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {standards.map((standard, index) => {
            const Icon = standard.icon;
            return (
              <motion.div
                key={standard.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800/40 border border-neutral-200/60 dark:border-slate-800 shadow-sm rounded-3xl p-6 md:p-8 flex flex-col gap-6"
              >
                {/* Card Header */}
                <div className="flex items-center gap-4 pb-5 border-b border-neutral-200/60 dark:border-slate-700/50">
                  <div className="w-11 h-11 rounded-full bg-[#2f7d6d]/10 text-[#2f7d6d] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {standard.title}
                  </h2>
                </div>

                {/* Intro */}
                <p className="text-sm md:text-base text-gray-500 dark:text-slate-400 leading-relaxed">
                  {standard.intro}
                </p>

                {/* Items */}
                <ul className="flex flex-col gap-4">
                  {standard.items.map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#2f7d6d] flex-shrink-0" />
                      <p className="text-sm md:text-base text-gray-700 dark:text-slate-300 leading-relaxed">
                        <strong className="text-gray-900 dark:text-white">{item.term}:</strong>{' '}
                        {item.detail}
                      </p>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <InteractiveCard
          className="mt-12 !w-full max-w-2xl mx-auto !aspect-auto"
          tailwindBgClass="bg-white dark:bg-slate-800/40"
          InteractiveColor="#2f7d6d"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
            className="p-8 md:p-10 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-[#2f7d6d]/10 text-[#2f7d6d] flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
              May concern ka sa isang miyembro?
            </h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm md:text-base max-w-lg mx-auto mb-6">
              Report violations directly to our moderation team. We act quickly to protect the community.
            </p>
            <a
              href="mailto:abuse@boardtau.xyz"
              className="inline-flex items-center gap-2 bg-[#2f7d6d] hover:bg-[#1e5146] text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all duration-300 hover:scale-[1.02] relative z-20 cursor-pointer"
            >
              Report a Violation <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </InteractiveCard>
      </div>
    </div>
  );
}

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  UserCheck, 
  MessageCircle, 
  CreditCard, 
  TrendingUp, 
  CalendarCheck, 
  BarChart, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { GlowingCards, GlowingCard } from '@/components/lightswind/glowing-cards';
import { InteractiveCard } from '@/components/lightswind/interactive-card';
import Link from 'next/link';

export default function HowBoardTAUWorksContent() {
  const studentFeatures = [
    {
      icon: Search,
      title: 'Smart Search & Filtering',
      description: 'Browse boarding houses, apartments, and dormitories. Filter by price, amenities, distance from campus, and room type.'
    },
    {
      icon: UserCheck,
      title: 'Verified Identity',
      description: 'To keep our community safe, all users go through a standard identity verification check before booking.'
    },
    {
      icon: MessageCircle,
      title: 'Real-time Messaging',
      description: 'Connect directly with landlords to ask questions or schedule viewings through our secure internal messaging system.'
    },
    {
      icon: CreditCard,
      title: 'Digital Payments',
      description: 'Process reservation fees seamlessly and securely via our integrated payment gateways.'
    }
  ];

  const hostFeatures = [
    {
      icon: TrendingUp,
      title: 'Property Promotion',
      description: 'Reach thousands of verified students looking for housing in your area with zero marketing effort.'
    },
    {
      icon: CalendarCheck,
      title: 'Availability Tracking',
      description: 'Easily manage your rooms, update availability statuses, and avoid double-bookings effortlessly.'
    },
    {
      icon: BarChart,
      title: 'Business Analytics',
      description: 'Monitor your property\'s performance, track inquiries, and generate reports right from your host dashboard.'
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
              How It Works
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
              Paano gumagana ang <span className="text-[#2f7d6d]">BoardTAU?</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 dark:text-slate-400 max-w-2xl mx-auto">
              Our platform simplifies the boarding house search and management process, 
              making it secure, fast, and completely hassle-free for everyone.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-10 lg:px-12 max-w-7xl py-20 space-y-32">
        
        {/* For Students Section */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="space-y-12"
        >
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">For Students and Renters</h2>
            <p className="text-gray-500 dark:text-slate-400 text-lg">
              Finding your next home near TAU is simple and secure. We provide you with all the tools 
              you need to make an informed decision without ever having to walk door-to-door.
            </p>
          </div>

          <GlowingCards
            enableGlow={true}
            glowRadius={20}
            glowOpacity={0.85}
            gap="1.5rem"
            padding="0.5rem 0"
            maxWidth="100%"
          >
            {studentFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <GlowingCard
                  key={index}
                  glowColor="#2f7d6d"
                  className="flex flex-col gap-4 bg-white dark:bg-slate-800/40 border-neutral-200/60 dark:border-slate-700 shadow-sm min-h-[220px]"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#2f7d6d]/10 text-[#2f7d6d] flex items-center justify-center mb-2">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{feature.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </GlowingCard>
              );
            })}
          </GlowingCards>
        </motion.section>

        {/* For Landlords Section */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="space-y-12"
        >
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">For Landlords and Hosts</h2>
            <p className="text-gray-500 dark:text-slate-400 text-lg">
              BoardTAU provides a comprehensive suite of digital tools designed to make 
              property management entirely effortless.
            </p>
          </div>

          <GlowingCards
            enableGlow={true}
            glowRadius={20}
            glowOpacity={0.85}
            gap="1.5rem"
            padding="0.5rem 0"
            maxWidth="100%"
          >
            {hostFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <GlowingCard
                  key={index}
                  glowColor="#2f7d6d"
                  className="flex flex-col gap-4 bg-white dark:bg-slate-800/40 border-neutral-200/60 dark:border-slate-700 shadow-sm min-h-[220px]"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{feature.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </GlowingCard>
              );
            })}
          </GlowingCards>
        </motion.section>

        {/* Platform Security Banner */}
        <InteractiveCard
          className="!w-full max-w-4xl mx-auto mt-16 !aspect-auto"
          tailwindBgClass="bg-white dark:bg-slate-800/40"
          InteractiveColor="#2f7d6d"
        >
          <div className="p-10 text-center space-y-6">
            <div className="w-12 h-12 rounded-full bg-[#2f7d6d]/10 text-[#2f7d6d] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
                Platform Security
              </h2>
              <p className="text-sm text-gray-600 dark:text-slate-400 max-w-md mx-auto">
                We take security seriously. BoardTAU undergoes regular vulnerability assessments and penetration 
                testing to ensure our infrastructure remains robust against threats, keeping your personal 
                and financial data safe at all times.
              </p>
            </div>
            <div>
              <Link 
                href="/support/safety-guidelines"
                className="inline-flex items-center gap-2 bg-[#2f7d6d] hover:bg-[#1e5146] text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all duration-300 hover:scale-[1.02] relative z-20"
              >
                View Safety Guidelines <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </InteractiveCard>

      </div>
    </div>
  );
}

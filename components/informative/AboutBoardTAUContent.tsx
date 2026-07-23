"use client";

import React from 'react';
import { Shield, Users, Zap, MapPin } from 'lucide-react';
import { TeamCarousel } from '@/components/lightswind/team-carousel';
import { GlowingCards, GlowingCard } from '@/components/lightswind/glowing-cards';
import { motion } from 'framer-motion';
const members = [
  {
    id: 'jerome',
    name: 'Jerome R. Autida',
    role: 'Systems Analyst & Database Administrator',
    bio: 'Jerome leads database mapping, document schemas, and system logic. He designs and optimizes query structures in MongoDB to support real-time listing analytics and reservation flows.',
    image: '/founders/jerome-formal.png',
    github: 'https://github.com/jeromeautida',
    linkedin: 'https://www.linkedin.com/in/jerome-autida/',
  },
  {
    id: 'dan',
    name: 'Dan Richie L. Balaba',
    role: 'Project Manager & Lead Developer',
    bio: 'Dan Richie manages capstone project management, full-stack architecture, and QA. He oversees core Platform services, payment gateways, and security protocols to ensure high-performance delivery.',
    image: '/founders/dan-formal.png',
    github: 'https://github.com/danbalaba',
    linkedin: 'https://www.linkedin.com/in/danbalaba/',
  },
  {
    id: 'jason',
    name: 'Marc Jason G. Gonzales',
    role: 'Lead UI/UX Designer & Frontend Engineer',
    bio: 'Jason directs user experience flows, micro-animations, and client-side layouts. He translates wireframes into responsive React views, ensuring both hosts and renters have an intuitive portal.',
    image: '/founders/jason-formal.png',
    github: 'https://github.com/marcjasongonzales',
    linkedin: 'https://www.linkedin.com/in/marc-jason-gonzales/',
  },
  {
    id: 'simon',
    name: 'John Roldan T. Simon',
    role: 'Operations Lead & DevOps Engineer',
    bio: 'John Roldan coordinates server orchestration, middleware validation, and verification tasks. He manages host verification checks, site health monitoring, and coordinates local outreach.',
    image: '/founders/simon-formal.png',
    github: 'https://github.com/johnroldansimon',
    linkedin: 'https://www.linkedin.com/in/johnroldansimon/',
  }
];

const pillars = [
  {
    icon: Shield,
    title: 'Secure by Design',
    description: 'KYC identity checks, liveness detection, and AES-256 encrypted messaging protect every user from day one.',
  },
  {
    icon: Zap,
    title: 'AI-Powered Discovery',
    description: 'Smart recommendations and side-by-side comparison tools help students find their ideal room faster.',
  },
  {
    icon: MapPin,
    title: 'Local-First Maps',
    description: 'Interactive map views show boarding house distances relative to the TAU campus so nothing is a surprise.',
  },
  {
    icon: Users,
    title: 'Built for Both Sides',
    description: 'Students get a safe, verified avenue to reserve rooms. Landlords get a full property management dashboard.',
  },
];

export default function AboutBoardTAUContent() {
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
            <div className="inline-block px-3 py-1.5 bg-[#2f7d6d]/10 dark:bg-[#2f7d6d]/20 text-[#2f7d6d] rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              About BoardTAU
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
              Ginawa namin ito para sa{' '}
              <span className="text-[#2f7d6d]">TAU community.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 dark:text-slate-400 max-w-2xl mx-auto">
              A secure, modern boarding house platform built by TAU students — for TAU students.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 md:px-10 lg:px-12 max-w-7xl pt-16 pb-20 space-y-16">

        {/* Founding Story */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white dark:bg-slate-800/40 border border-neutral-200/60 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-sm"
        >
          <div className="inline-block px-3 py-1.5 bg-[#2f7d6d]/10 dark:bg-[#2f7d6d]/20 text-[#2f7d6d] rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            Founding Story
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight tracking-tight mb-8">
            Ginawa namin ang <span className="text-[#2f7d6d]">BoardTAU</span> dahil deserve ng TAU community ang maaasahang tirahan.
          </h2>
          <div className="space-y-5 text-base text-gray-600 dark:text-slate-300 leading-relaxed max-w-4xl">
            <p>
              We are Jerome Autida, Dan Richie Balaba, Marc Jason Gonzales, and John Roldan Simon. We started as university classmates and friends at <strong>Tarlac Agricultural University (TAU)</strong>, built our software engineering skills, and spent months investigating the local student housing landscape in Camiling, Tarlac. We realized that while campus dorms had basic dormitory tracking, thousands of off-campus boarders were stuck with manual door-to-door search routines, word-of-mouth recommendations, and vulnerability to rental scams. We knew one thing clearly: <span className="text-[#2f7d6d] font-semibold">the TAU community deserves a modernized, secure, and unified digital housing ecosystem.</span>
            </p>
            <p>
              We decided to solve this problem by developing <strong>BoardTAU</strong>. We engineered a platform capable of handling the entire lifecycle of student accommodation — from discovery and inquiry, all the way through verified booking and move-in confirmation.
            </p>
            <p>
              To eliminate payment uncertainty, we implemented a secure booking checkout supporting digital e-wallets and cards. Additionally, we integrated intelligent AI assistance to power smart recommendations and side-by-side listing comparison tools, helping students choose the perfect place to live based on their budget and preferred amenities.
            </p>
            <p>
              BoardTAU is built to serve both sides of the community. For students, it provides a safe, verified avenue to reserve rooms. For local landlords, it delivers a powerful property management tool complete with real-time room availability, strike validation, and automated business performance analytics. Our goal is to bring student housing search in Camiling into the modern digital era.
            </p>
          </div>
        </motion.section>

        {/* Platform Pillars */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mb-6 flex items-start gap-4">
            <div className="w-1 self-stretch rounded-full bg-gradient-to-b from-[#2f7d6d] to-[#2f7d6d]/20 flex-shrink-0" />
            <div>
              <span className="inline-block px-2.5 py-1 bg-[#2f7d6d]/10 text-[#2f7d6d] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                Platform Features
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
                What Makes BoardTAU{' '}
                <span className="text-[#2f7d6d]">Different</span>
              </h2>
              <p className="text-gray-500 dark:text-slate-400 text-sm md:text-base">
                Every feature was built to address a real problem faced by TAU students and Camiling landlords.
              </p>
            </div>
          </div>
          <GlowingCards
            enableGlow={true}
            glowRadius={20}
            glowOpacity={0.85}
            gap="1.5rem"
            padding="0.5rem 0"
            maxWidth="100%"
          >
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <GlowingCard
                  key={index}
                  glowColor="#2f7d6d"
                  className="flex flex-col gap-4 bg-white dark:bg-slate-800/40 border-neutral-200/60 dark:border-slate-700 shadow-sm min-h-[180px]"
                >
                  <div className="w-10 h-10 rounded-full bg-[#2f7d6d]/10 text-[#2f7d6d] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">{pillar.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{pillar.description}</p>
                </GlowingCard>
              );
            })}
          </GlowingCards>
        </motion.section>

        {/* Founders Carousel */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="border-t border-neutral-200/50 dark:border-slate-800 pt-12"
        >
          <div className="mb-8 flex items-start gap-4">
            <div className="w-1 self-stretch rounded-full bg-gradient-to-b from-[#2f7d6d] to-[#2f7d6d]/20 flex-shrink-0" />
            <div>
              <span className="inline-block px-2.5 py-1 bg-[#2f7d6d]/10 text-[#2f7d6d] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                The Team
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
                People Behind{' '}
                <span className="text-[#2f7d6d]">BoardTAU</span>
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                We bring product, engineering, and operations together to build a platform made for local realities.
              </p>
            </div>
          </div>
          <div className="w-full relative py-4 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border border-neutral-200/50 dark:border-slate-800 shadow-inner">
            <TeamCarousel
              members={members}
              title="FOUNDERS"
              titleColor="#2f7d6d"
              infoTextColor="#2f7d6d"
              cardWidth={240}
              cardHeight={320}
              visibleCards={1}
              grayscaleEffect={true}
              autoPlay={0}
              infoPosition="bottom"
              className="min-h-[620px] bg-transparent"
              cardClassName="border border-neutral-200 dark:border-slate-800 rounded-2xl shadow-md"
              titleClassName="text-6xl md:text-8xl opacity-30 dark:opacity-15 tracking-widest font-extrabold select-none pointer-events-none"
            />
          </div>
        </motion.section>

      </div>
    </div>
  );
}

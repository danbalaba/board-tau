"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { GlowingCards, GlowingCard } from '@/components/lightswind/glowing-cards';
import { Mail, HelpCircle, Tag, Key, MessageSquare, ShieldAlert, CheckCircle } from 'lucide-react';

export default function ContactSupportContent() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Smooth scroll to top on mount, typical in BoardTAU dashboard views
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const isDark = mounted ? theme === 'dark' : false;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900 text-slate-300' : 'bg-gray-50 text-gray-800'}`}>
      
      {/* Hero Header matching About/Help Center */}
      <div className="pt-32 pb-16 text-center border-b border-neutral-200/50 dark:border-slate-800 bg-white dark:bg-slate-800/50">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-3 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              Contact Support
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
              We are here to <span className="text-primary">support you.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 dark:text-slate-400 max-w-2xl mx-auto mb-10">
              Our Support Team is available 24/7. Select the appropriate department below to get the help you need.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-7xl pt-16 pb-20">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-4 text-lg mb-12 text-center max-w-3xl mx-auto"
        >
          <p className="text-gray-700 dark:text-slate-300">
            To expedite the resolution of your request, please select the appropriate email address based on the product you are inquiring about or experiencing issues with. Describe your question or the situation you are facing, and <strong>send an email to the chosen address</strong>.
          </p>
          <p className="italic text-sm text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm inline-block">
            <strong>Note:</strong> If you are an existing customer, please mention your Name and Student ID/Host ID in the email to speed up the resolution.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="mt-12"
        >
          <h3 className="text-2xl font-bold mb-6 text-primary text-center">General Departments</h3>
          <GlowingCards 
            enableGlow={true} 
            glowOpacity={0.8}
            className="w-full"
            layout="wrap"
            gap="1.5rem"
            responsive={true}
          >
            <GlowingCard glowColor="var(--primary-color, #2f7d6d)" className="flex flex-col h-full bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-full text-primary">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">General</h4>
              </div>
              <p className="text-gray-600 dark:text-slate-400 mb-6 flex-grow">
                To ask or resolve basic general BoardTAU-related questions.
              </p>
              <a href="mailto:support@boardtau.xyz" className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-50 dark:bg-slate-800 hover:bg-primary/5 dark:hover:bg-primary/10 text-primary font-semibold rounded-lg transition-colors border border-gray-200 dark:border-slate-700">
                <Mail className="w-4 h-4" /> support@boardtau.xyz
              </a>
            </GlowingCard>

            <GlowingCard glowColor="var(--primary-color, #2f7d6d)" className="flex flex-col h-full bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-full text-primary">
                  <Tag className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">Pre-Sales</h4>
              </div>
              <p className="text-gray-600 dark:text-slate-400 mb-6 flex-grow">
                To ask questions about features, capabilities, or pricing of BoardTAU plans.
              </p>
              <a href="mailto:sales@boardtau.xyz" className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-50 dark:bg-slate-800 hover:bg-primary/5 dark:hover:bg-primary/10 text-primary font-semibold rounded-lg transition-colors border border-gray-200 dark:border-slate-700">
                <Mail className="w-4 h-4" /> sales@boardtau.xyz
              </a>
            </GlowingCard>

            <GlowingCard glowColor="var(--primary-color, #2f7d6d)" className="flex flex-col h-full bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-full text-primary">
                  <Key className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">Billing</h4>
              </div>
              <p className="text-gray-600 dark:text-slate-400 mb-6 flex-grow">
                To address payment-related issues, invoices, refunds, and account limits.
              </p>
              <a href="mailto:billing@boardtau.xyz" className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-50 dark:bg-slate-800 hover:bg-primary/5 dark:hover:bg-primary/10 text-primary font-semibold rounded-lg transition-colors border border-gray-200 dark:border-slate-700">
                <Mail className="w-4 h-4" /> billing@boardtau.xyz
              </a>
            </GlowingCard>
          </GlowingCards>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="mt-16"
        >
          <h3 className="text-2xl font-bold mb-6 text-primary text-center">Specialized Departments</h3>
          <GlowingCards 
            enableGlow={true} 
            glowOpacity={0.8}
            className="w-full"
            layout="wrap"
            gap="1.5rem"
            responsive={true}
          >
            <GlowingCard glowColor="#f59e0b" className="flex flex-col h-full bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">Press & Media</h4>
              </div>
              <p className="text-gray-600 dark:text-slate-400 mb-6 flex-grow">
                For media inquiries, interviews, or content partnerships with BoardTAU.
              </p>
              <a href="mailto:pr@boardtau.xyz" className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-semibold rounded-lg transition-colors border border-gray-200 dark:border-slate-700">
                <Mail className="w-4 h-4" /> pr@boardtau.xyz
              </a>
            </GlowingCard>

            <GlowingCard glowColor="#ef4444" className="flex flex-col h-full bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">Abuse</h4>
              </div>
              <p className="text-gray-600 dark:text-slate-400 mb-6 flex-grow">
                To report fake listings, spam, scams, or other terms of service violations.
              </p>
              <a href="mailto:abuse@boardtau.xyz" className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold rounded-lg transition-colors border border-gray-200 dark:border-slate-700">
                <Mail className="w-4 h-4" /> abuse@boardtau.xyz
              </a>
            </GlowingCard>

            <GlowingCard glowColor="#3b82f6" className="flex flex-col h-full bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">Compliance</h4>
              </div>
              <p className="text-gray-600 dark:text-slate-400 mb-6 flex-grow">
                For legal matters, data privacy requests, or law enforcement inquiries.
              </p>
              <a href="mailto:legal@boardtau.xyz" className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold rounded-lg transition-colors border border-gray-200 dark:border-slate-700">
                <Mail className="w-4 h-4" /> legal@boardtau.xyz
              </a>
            </GlowingCard>
          </GlowingCards>
        </motion.div>

      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Mail, Send, CheckCircle2, AlertCircle, X, HelpCircle } from 'lucide-react';
import { GlowingCards, GlowingCard } from '@/components/lightswind/glowing-cards';
import { InteractiveCard } from '@/components/lightswind/interactive-card';

interface FAQItem {
  question: string;
  answer: string;
  id: string;
}

interface FAQCategory {
  id: string;
  title: string;
  items: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    id: 'general',
    title: 'About BoardTAU',
    items: [
      {
        id: 'what-is-boardtau',
        question: 'What is BoardTAU?',
        answer: 'BoardTAU is a premium, localized community boarding house directory and management platform designed specifically for the Tarlac Agricultural University (TAU) community in Camiling, Tarlac. It bridges the gap between renters (students, faculty, staff, and guests) looking for safe, vetted accommodations, and local landlords managing listings and reservation inquiries.'
      },
      {
        id: 'who-can-use-boardtau',
        question: 'Who can use the platform?',
        answer: 'BoardTAU is open to everyone in the TAU community—including students looking for bedspaces or solo rooms, faculty/staff seeking long-term apartments near campus, and guests visiting the university. It is also designed for local landlords who want to digitize their listing promotion and tenant reservation management.'
      },
      {
        id: 'is-boardtau-free',
        question: 'Is it free to use BoardTAU?',
        answer: 'Browsing listings, using search filters, and messaging landlords is completely free for renters. For landlords, basic listing creation is free, though standard verification rules (like providing business permits) apply to ensure tenant safety.'
      }
    ]
  },
  {
    id: 'renters',
    title: 'For Renters',
    items: [
      {
        id: 'how-to-book',
        question: 'How do I book a room on BoardTAU?',
        answer: 'Booking is simple: \n1. Browse listings using filters (pricing, wifi, air conditioning, distance to campus). \n2. Select your preferred room type (Solo or Bedspace) and click "Send Inquiry". \n3. Fill in your target move-in date, staying duration, and upload a copy of your valid ID. \n4. Once the landlord approves your inquiry, pay the secure reservation fee online to finalize your slot.'
      },
      {
        id: 'what-is-identity-check',
        question: 'Why do I need to complete an identity check?',
        answer: 'To protect our community and prevent fraudulent activities, all users submitting inquiries or listing properties must complete a secure identity check. For renters, this involves uploading a valid government or student ID. For hosts, it requires business permit verification.'
      },
      {
        id: 'can-i-schedule-viewings',
        question: 'Can I message landlords directly?',
        answer: 'Yes! BoardTAU features a secure internal messaging system. You can easily communicate directly with landlords to ask questions about amenities, request virtual tours, or coordinate physical ocular viewings before sending booking requests.'
      }
    ]
  },
  {
    id: 'hosts',
    title: 'For Hosts & Landlords',
    items: [
      {
        id: 'how-to-become-host',
        question: 'How do I register as a host?',
        answer: 'Click "Become a Host" in the header or footer. You will be guided through a simple host application wizard where you provide your business name, emergency contact details, and upload copy of your Mayor\'s/Business Permit and Fire Safety Certificate. Our administration team reviews applications within 24–48 hours.'
      },
      {
        id: 'how-to-add-rooms',
        question: 'How do I manage room inventory and slots?',
        answer: 'Once approved as a verified landlord, you can access your Host Dashboard. Under room management, you can define different room types (Solo rooms or shared Bedspaces), set monthly pricing rates, input slot counts, track available/occupied beds, and manage walk-in tenants manually.'
      },
      {
        id: 'can-i-approve-manually',
        question: 'Do bookings approve automatically?',
        answer: 'No. As a landlord, you have complete control. When a tenant sends a booking inquiry, it goes into your dashboard queue. You can review their details, move-in dates, and uploaded ID, and manually approve or reject the request.'
      }
    ]
  },
  {
    id: 'payments',
    title: 'Payments & Security',
    items: [
      {
        id: 'payment-methods',
        question: 'What secure payment methods do you support?',
        answer: 'We support modern payment methods popular in the Philippines, including GCash, Maya, and credit/debit cards, handled through secure online payment gateways. Cash payments are also supported for manual on-site walk-ins.'
      },
      {
        id: 'reservation-fee',
        question: 'Is the reservation fee refundable?',
        answer: 'Reservation fees are securely processed to hold your slot. Refundability depends on the landlord\'s cancellation policy and standard community terms. If a landlord rejects your inquiry after you make a payment request, the reservation fee is not charged or is voided immediately.'
      },
      {
        id: 'are-messages-secure',
        question: 'Are my chats and personal data secure?',
        answer: 'Yes. All chat transcripts are secured with end-to-end database encryption to prevent unauthorized access. Files (like selfies or business permits) are uploaded to secure private storage buckets, accessible only to authorized administrators and the respective host.'
      }
    ]
  }
];

export default function FaqsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const targetCategory = searchParams.get('category') || 'general';
  const targetExpand = searchParams.get('expand') || '';

  const [activeCategory, setActiveCategory] = useState<string>(targetCategory);
  const [expandedId, setExpandedId] = useState<string>(targetExpand);
  
  // Contact support form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle outside click close modal
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Section refs for scroll triggering
  const sectionRefs = {
    general: useRef<HTMLDivElement>(null),
    renters: useRef<HTMLDivElement>(null),
    hosts: useRef<HTMLDivElement>(null),
    payments: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    // Sync query parameters with state
    const cat = searchParams.get('category');
    if (cat && faqData.some(c => c.id === cat)) {
      setActiveCategory(cat);
      // Smooth scroll to the element
      const ref = sectionRefs[cat as keyof typeof sectionRefs];
      if (ref && ref.current) {
        setTimeout(() => {
          ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }

    const exp = searchParams.get('expand');
    if (exp) {
      setExpandedId(exp);
    }
  }, [searchParams]);

  const handleCategoryClick = (id: string) => {
    setActiveCategory(id);
    router.replace(`/faqs?category=${id}`, { scroll: false });
    const ref = sectionRefs[id as keyof typeof sectionRefs];
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleToggle = (id: string) => {
    setExpandedId(prev => (prev === id ? '' : id));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const res = await fetch('/api/support/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to send your request. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('An unexpected error occurred. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
              May tanong ka? <span className="text-[#2f7d6d]">Sagot namin.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 dark:text-slate-400">
              Everything you need to know about booking and hosting on BoardTAU.
            </p>
          </motion.div>
        </div>
      </div>
      
      {/* Main content container gets top padding to clear navbar */}
      <div className="container mx-auto px-6 md:px-10 lg:px-12 max-w-7xl pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Navigation Sidebar */}
          <aside className="lg:col-span-4 sticky top-32 z-10 bg-white dark:bg-slate-800/40 border border-neutral-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-4">
              Browse Categories
            </h3>
            
            {/* Desktop list */}
            <div className="hidden lg:flex flex-col space-y-2">
              {faqData.map((category) => {
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`flex items-center text-left py-3 px-4 rounded-xl text-sm font-semibold transition-all relative ${
                      isActive 
                        ? 'text-[#2f7d6d] bg-[#2f7d6d]/10' 
                        : 'text-gray-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {category.title}
                    {isActive && (
                      <motion.div 
                        layoutId="sidebarActiveLine" 
                        className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#2f7d6d] rounded-full" 
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile Dropdown tab selectors */}
            <div className="flex lg:hidden overflow-x-auto gap-2 pb-2 scrollbar-thin">
              {faqData.map((category) => {
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`flex-none py-2 px-4 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      isActive 
                        ? 'text-white bg-[#2f7d6d]' 
                        : 'text-gray-600 dark:text-slate-400 bg-neutral-100 dark:bg-slate-800 hover:bg-neutral-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {category.title}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Column: Accordions list */}
          <div className="lg:col-span-8">
            <GlowingCards
              enableGlow={true}
              glowRadius={25}
              glowOpacity={0.85}
              gap="2rem"
              padding="0"
              maxWidth="100%"
              layout="stack"
              className="mt-4"
            >
            {faqData.map((category, index) => (
              <GlowingCard
                key={category.id}
                glowColor="#2f7d6d"
                className="bg-white dark:bg-slate-800/40 border border-neutral-200/60 dark:border-slate-800 shadow-sm rounded-3xl transition-all p-0"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.08 }}
              >
                <div 
                  ref={sectionRefs[category.id as keyof typeof sectionRefs]}
                  className="scroll-mt-32 p-6 md:p-8"
                >
                  <div className="flex items-center gap-4 mb-2 pb-6 border-b border-neutral-200/60 dark:border-slate-700/50">
                  <div className="w-10 h-10 rounded-full bg-[#2f7d6d]/10 text-[#2f7d6d] flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {category.title}
                  </h2>
                </div>
                <div className="flex flex-col">
                  {category.items.map((item, index) => {
                    const isExpanded = expandedId === item.id;
                    const isLast = index === category.items.length - 1;
                    return (
                      <div 
                        key={item.id}
                        className={`overflow-hidden transition-all ${!isLast ? 'border-b border-neutral-200/60 dark:border-slate-700/50' : ''}`}
                      >
                        <button
                          onClick={() => handleToggle(item.id)}
                          className="w-full text-left py-5 pr-2 flex justify-between items-center gap-4 transition-colors hover:text-[#2f7d6d] dark:hover:text-[#42a893]"
                        >
                          <span className="font-semibold text-sm md:text-base text-gray-900 dark:text-white">
                            {item.question}
                          </span>
                          <ChevronDown 
                            className={`w-5 h-5 flex-shrink-0 text-gray-500 transition-transform duration-300 ${
                              isExpanded ? 'transform rotate-180 text-[#2f7d6d] dark:text-[#42a893]' : ''
                            }`} 
                          />
                        </button>
                        
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                            >
                              <div className="pb-5 pr-2 text-sm md:text-base text-gray-600 dark:text-slate-400 border-t border-neutral-100 dark:border-slate-800/50 whitespace-pre-line leading-relaxed">
                                {item.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
                </div>
              </GlowingCard>
            ))}
            </GlowingCards>
          </div>
          </div>
        </div>

        {/* Premium Contact CTA Card */}
        <InteractiveCard
          className="!w-full max-w-2xl mx-auto mt-16 !aspect-auto"
          tailwindBgClass="bg-white dark:bg-slate-800/40"
          InteractiveColor="#2f7d6d"
        >
          <div className="p-10 text-center space-y-6">
            <div className="w-12 h-12 rounded-full bg-[#2f7d6d]/10 text-[#2f7d6d] flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
                May tanong ka pa?
              </h2>
              <p className="text-sm text-gray-600 dark:text-slate-400 max-w-md mx-auto">
                Can't find the answer you're looking for? Message our support team directly — we reply fast.
              </p>
            </div>
            <div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#2f7d6d] hover:bg-[#1e5146] text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all duration-300 hover:scale-[1.02] relative z-20 cursor-pointer"
              >
                Contact Support
              </button>
            </div>
          </div>
        </InteractiveCard>

      {/* Support Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              ref={modalRef}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-neutral-200/50 dark:border-slate-800 overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200/50 dark:border-slate-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#2f7d6d]" />
                  Send Support Ticket
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleContactSubmit} className="p-6 space-y-4">
                {status === 'success' ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-8 text-center space-y-3"
                  >
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">Ticket Sent Successfully</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
                      Thank you for contacting us! A support ticket has been opened and sent to our team. We'll get back to you shortly.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="bg-neutral-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors mt-4"
                    >
                      Close
                    </button>
                  </motion.div>
                ) : (
                  <>
                    {status === 'error' && (
                      <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div className="text-sm text-red-600 dark:text-red-400">
                          {errorMessage}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 text-sm rounded-xl border bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2f7d6d]/55 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 text-sm rounded-xl border bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2f7d6d]/55 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">Subject</label>
                      <input
                        type="text"
                        required
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        placeholder="Booking issue, Listing validation error, etc."
                        className="w-full px-4 py-3 text-sm rounded-xl border bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2f7d6d]/55 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">Message</label>
                      <textarea
                        required
                        rows={4}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Please describe your issue or question in detail..."
                        className="w-full px-4 py-3 text-sm rounded-xl border bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2f7d6d]/55 outline-none transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#2f7d6d] hover:bg-[#1e5146] disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors duration-200 mt-4 shadow-sm"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

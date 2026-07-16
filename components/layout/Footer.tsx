'use client';
// Force SSR cache invalidation

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Globe, ArrowRight } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaPinterest } from 'react-icons/fa';
import LanguageCurrencyModal from '../modals/LanguageCurrencyModal';

const Footer: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialModalTab, setInitialModalTab] = useState<'language' | 'currency'>('language');

  const openModal = (tab: 'language' | 'currency') => {
    setInitialModalTab(tab);
    setIsModalOpen(true);
  };

  const footerSections = [
    {
      title: 'For Students',
      links: [
        { name: 'Search Properties', href: '/search' },
        { name: 'How to Book', href: '/about/capstone' },
        { name: 'Student FAQ', href: '/support/help-center' },
        { name: 'Campus Guides', href: '/guides' },
      ],
    },
    {
      title: 'For Hosts',
      links: [
        { name: 'List Property', href: '/hosting/list' },
        { name: 'Host Dashboard', href: '/host/dashboard' },
        { name: 'Host FAQ', href: '/support/help-center' },
        { name: 'Community Standards', href: '/hosting/community-standards' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/support/help-center' },
        { name: 'Report a Problem', href: '/support/report-problem' },
        { name: 'Contact Us', href: '/support/contact' },
        { name: 'Trust & Safety', href: '/support/safety-guidelines' },
      ],
    },
    {
      title: 'BoardTAU',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/about/mission' },
        { name: 'Privacy Policy', href: '/legal/privacy' },
        { name: 'Terms of Service', href: '/legal/terms' },
      ],
    },
  ];

  return (
    <>
      <footer className="bg-[#f7f7f7] dark:bg-slate-900 text-[#222222] dark:text-slate-300 border-t border-[#dddddd] dark:border-slate-800">
        <div className="container mx-auto px-6 md:px-10 lg:px-20 py-12">
          
          {/* Main Footer Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-10">
            
            {/* Column 1: Brand & Newsletter (Takes up 4 columns on large screens) */}
            <div className="lg:col-span-4 flex flex-col space-y-6">
              <Link href="/">
                <Image
                  src="/images/TauBOARD-Light.png"
                  alt="BoardTAU Logo"
                  width={150}
                  height={40}
                  className="object-contain dark:hidden"
                />
                <Image
                  src="/images/TauBOARD-Dark.png"
                  alt="BoardTAU Logo"
                  width={150}
                  height={40}
                  className="object-contain hidden dark:block"
                />
              </Link>
              <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                We make finding, booking, and managing boarding houses easy and secure, because the TAU community deserves a reliable home.
              </p>
              
              <div className="flex flex-col space-y-3">
                <Link href="/about" className="flex items-center text-sm font-medium hover:underline text-black dark:text-white">
                  About BoardTAU <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <Link href="/blog" className="flex items-center text-sm font-medium hover:underline text-black dark:text-white">
                  Read our blog <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <div className="pt-4">
                <h4 className="text-sm font-semibold mb-2 text-black dark:text-white">Join Our Newsletter & Updates</h4>
                <p className="text-xs mb-3 text-gray-500 dark:text-slate-400">We'll send you news and housing tips.</p>
                <div className="flex">
                  <input 
                    type="email" 
                    placeholder="you@yours.com" 
                    className="flex-1 px-3 py-2 text-sm rounded-l-md outline-none border bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-black dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-gray-400 dark:focus:border-slate-500"
                  />
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium rounded-r-md transition-colors">
                    Join
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-5 pt-4">
                <Link href="#" className="hover:opacity-70 transition-opacity text-gray-600 dark:text-slate-300 hover:text-black dark:hover:text-white">
                  <FaTwitter className="w-5 h-5" />
                </Link>
                <Link href="#" className="hover:opacity-70 transition-opacity text-gray-600 dark:text-slate-300 hover:text-black dark:hover:text-white">
                  <FaFacebook className="w-5 h-5" />
                </Link>
                <Link href="#" className="hover:opacity-70 transition-opacity text-gray-600 dark:text-slate-300 hover:text-black dark:hover:text-white">
                  <FaInstagram className="w-5 h-5" />
                </Link>
                <Link href="#" className="hover:opacity-70 transition-opacity text-gray-600 dark:text-slate-300 hover:text-black dark:hover:text-white">
                  <FaPinterest className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Columns 2-5: The Links (Takes up 8 columns total) */}
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
              {footerSections.map((section, index) => (
                <div key={index}>
                  <h3 className="text-sm font-semibold mb-4 text-[#222222] dark:text-white">
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link
                          href={link.href}
                          className="text-sm hover:underline text-gray-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

          </div>

          {/* Bottom Row */}
          <div className="pt-6 border-t border-[#dddddd] dark:border-slate-800 flex flex-col-reverse md:flex-row justify-between items-center gap-6">
            {/* Left side: Copyright & Legal */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs md:text-sm text-gray-600 dark:text-slate-400">
              <span>© 2026 BoardTAU, Inc.</span>
              <span className="hidden md:inline">·</span>
              <Link href="/legal/privacy" className="hover:underline">Privacy</Link>
              <span className="hidden md:inline">·</span>
              <Link href="/legal/terms" className="hover:underline">Terms</Link>
              <span className="hidden md:inline">·</span>
              <Link href="/legal/accessibility" className="hover:underline">Accessibility</Link>
            </div>

            {/* Right side: Language, Currency */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => openModal('language')}
                className="flex items-center gap-2 text-sm font-medium hover:underline text-[#222222] dark:text-slate-300 dark:hover:text-white"
              >
                <Globe className="w-4 h-4" />
                English (US)
              </button>
              <button
                onClick={() => openModal('currency')}
                className="text-sm font-medium hover:underline text-[#222222] dark:text-slate-300 dark:hover:text-white"
              >
                ₱ PHP
              </button>
            </div>
          </div>
        </div>
      </footer>

      <LanguageCurrencyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTab={initialModalTab}
      />
    </>
  );
};

export default Footer;

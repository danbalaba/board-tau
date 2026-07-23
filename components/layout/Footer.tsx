'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail } from 'lucide-react';
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useSession } from 'next-auth/react';
import Modal from '../modals/Modal';
import AuthModal from '../modals/AuthModal';
import HostApplicationModal from '../modals/HostApplicationModal';

const Footer: React.FC = () => {
  const { data: session } = useSession();
  const currentUser = session?.user;

  return (
    <>
      <footer className="bg-[#f7f7f7] dark:bg-slate-900 text-[#222222] dark:text-slate-300 border-t border-[#dddddd] dark:border-slate-800 transition-colors duration-300">
        <div className="container mx-auto px-6 md:px-10 lg:px-20 pt-12 pb-28">
          
          {/* Main Footer Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-10">
            
            {/* Column 1: Brand (Takes up 4 columns on large screens) */}
            <div className="lg:col-span-4 flex flex-col space-y-6">
              <Link href="/" prefetch={false}>
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
              
              {/* Contact Information */}
              <div className="flex flex-col space-y-1">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Contact Support</span>
                <a 
                  href="mailto:support@boardtau.com" 
                  className="flex items-center gap-2 text-sm font-medium text-[#2f7d6d] hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  support@boardtau.com
                </a>
              </div>

              {/* Social Media Icons (Squircle Buttons in Brand Green) */}
              <div className="flex items-center space-x-3 pt-2">
                <a
                  href="https://www.facebook.com/profile.php?id=61592140986863"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-[#2f7d6d] text-white flex items-center justify-center transition-all duration-300 hover:bg-[#1e5146] hover:scale-105 shadow-md"
                  aria-label="Facebook"
                >
                  <FaFacebook className="w-5 h-5" />
                </a>
                <a
                  href="https://x.com/BoardTAU"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-[#2f7d6d] text-white flex items-center justify-center transition-all duration-300 hover:bg-[#1e5146] hover:scale-105 shadow-md"
                  aria-label="X (Twitter)"
                >
                  <FaXTwitter className="w-5 h-5" />
                </a>
                <a
                  href="https://www.tiktok.com/@boardtau.official"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-[#2f7d6d] text-white flex items-center justify-center transition-all duration-300 hover:bg-[#1e5146] hover:scale-105 shadow-md"
                  aria-label="TikTok"
                >
                  <FaTiktok className="w-5 h-5" />
                </a>
                <a
                  href="https://www.instagram.com/boardtau.official/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-[#2f7d6d] text-white flex items-center justify-center transition-all duration-300 hover:bg-[#1e5146] hover:scale-105 shadow-md"
                  aria-label="Instagram"
                >
                  <FaInstagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Columns 2-4: Balanced Grid Columns (Exactly 3 Links per Column) */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
              
              {/* Column 2: Platform */}
              <div>
                <h3 className="text-sm font-semibold mb-4 text-[#222222] dark:text-white uppercase tracking-wider">
                  Platform & Guides
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Modal>
                      {currentUser ? (
                        <Modal.Trigger name="host-application">
                          <button className="text-sm hover:underline text-gray-600 dark:text-slate-400 hover:text-black dark:hover:text-white text-left w-full">
                            Become a Host
                          </button>
                        </Modal.Trigger>
                      ) : (
                        <Modal.Trigger name="Login">
                          <button className="text-sm hover:underline text-gray-600 dark:text-slate-400 hover:text-black dark:hover:text-white text-left w-full">
                            Become a Host
                          </button>
                        </Modal.Trigger>
                      )}
                      
                      <Modal.Window name="Login" size="sm" closeOnOutsideClick={false}>
                        <AuthModal name="Login" />
                      </Modal.Window>
                      
                      <Modal.Window name="host-application" size="xl">
                        <HostApplicationModal />
                      </Modal.Window>
                    </Modal>
                  </li>
                  <li>
                    <Link
                      href="/faqs"
                      prefetch={false}
                      className="text-sm hover:underline text-gray-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
                    >
                      Frequently Asked Questions
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/hosting/community-standards"
                      prefetch={false}
                      className="text-sm hover:underline text-gray-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
                    >
                      Community Standards
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: Support */}
              <div>
                <h3 className="text-sm font-semibold mb-4 text-[#222222] dark:text-white uppercase tracking-wider">
                  Support
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/support/help-center"
                      prefetch={false}
                      className="text-sm hover:underline text-gray-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
                    >
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/support/contact"
                      prefetch={false}
                      className="text-sm hover:underline text-gray-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
                    >
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/support/safety-guidelines"
                      prefetch={false}
                      className="text-sm hover:underline text-gray-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
                    >
                      Trust & Safety
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 4: About */}
              <div>
                <h3 className="text-sm font-semibold mb-4 text-[#222222] dark:text-white uppercase tracking-wider">
                  About
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/about"
                      prefetch={false}
                      className="text-sm hover:underline text-gray-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
                    >
                      About the Founders
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about/boardtau"
                      prefetch={false}
                      className="text-sm hover:underline text-gray-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
                    >
                      How BoardTAU Works
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/legal/accessibility"
                      prefetch={false}
                      className="text-sm hover:underline text-gray-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
                    >
                      Accessibility Support
                    </Link>
                  </li>
                </ul>
              </div>

            </div>
          </div>

          {/* Centered Bottom Bar */}
          <div className="pt-8 border-t border-[#dddddd] dark:border-slate-800 flex flex-col items-center justify-center text-center gap-3">
            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs md:text-sm text-gray-600 dark:text-slate-400 font-medium">
              <Link href="/legal/privacy" prefetch={false} className="hover:underline hover:text-black dark:hover:text-white">
                Privacy Policy
              </Link>
              <span>·</span>
              <Link href="/legal/terms" prefetch={false} className="hover:underline hover:text-black dark:hover:text-white">
                Terms of Service
              </Link>
            </div>
            
            {/* Copyright */}
            <div className="text-xs text-gray-500 dark:text-slate-500">
              © 2026 BoardTAU, Inc. All rights reserved.
            </div>
          </div>

        </div>
      </footer>
    </>
  );
};

export default Footer;

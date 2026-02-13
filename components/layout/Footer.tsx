'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';

const Footer: React.FC = () => {
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(theme === 'dark');
  }, [theme]);

  // During SSR and initial hydration, render with light theme to avoid mismatch
  if (!mounted) {
    return (
      <footer className="bg-gray-50 text-gray-700 pt-16 pb-8 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-800">
                  Loading...
                </h3>
                <ul className="space-y-3">
                  {[...Array(6)].map((_, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href="#"
                        className="text-sm hover:underline text-gray-600 hover:text-gray-900"
                      >
                        Loading...
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t pt-8 pb-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-sm text-gray-600 hover:text-gray-900"
                aria-label="Facebook"
              >
                <FaFacebook size={18} />
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-600 hover:text-gray-900"
                aria-label="Instagram"
              >
                <FaInstagram size={18} />
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-600 hover:text-gray-900"
                aria-label="Twitter"
              >
                <FaTwitter size={18} />
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-600 hover:text-gray-900"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={18} />
              </Link>
            </div>

            <div className="text-sm flex flex-col md:flex-row items-center gap-4">
              <p className="text-gray-500">
                © 2026 BoardTAU — Capstone Project
              </p>
              <div className="flex space-x-6">
                <Link
                  href="/legal/privacy"
                  className="hover:underline text-gray-600 hover:text-gray-900"
                >
                  Privacy
                </Link>
                <Link
                  href="/legal/terms"
                  className="hover:underline text-gray-600 hover:text-gray-900"
                >
                  Terms
                </Link>
                <Link
                  href="/legal/accessibility"
                  className="hover:underline text-gray-600 hover:text-gray-900"
                >
                  Accessibility
                </Link>
              </div>
            </div>

            <div className="flex space-x-6">
              <button className="text-sm hover:underline text-gray-600 hover:text-gray-900">
                English (EN)
              </button>
              <button className="text-sm hover:underline text-gray-600 hover:text-gray-900">
                PHP (₱)
              </button>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  const footerSections = [
    {
      title: 'Explore',
      links: [
        { name: 'Near Tarlac Agricultural University', href: '/?location=TAU' },
        { name: 'Student-Friendly Boarding Houses', href: '/?category=student' },
        { name: 'Female-Only Boarding Houses', href: '/?gender=female' },
        { name: 'Male-Only Boarding Houses', href: '/?gender=male' },
        { name: 'Budget Boarding Houses', href: '/?price=budget' },
        { name: 'Family / Visitor Friendly', href: '/?category=family' },
        { name: 'View all listings', href: '/listings' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/legal/help' },
        { name: 'Safety Guidelines', href: '/safety' },
        { name: 'How Booking Works', href: '/how-it-works' },
        { name: 'Cancellation Policy', href: '/cancellation' },
        { name: 'Report a Problem', href: '/report' },
        { name: 'Accessibility Support', href: '/legal/accessibility' },
        { name: 'Contact Support', href: '/contact' },
      ],
    },
    {
      title: 'Hosting',
      links: [
        { name: 'List Your Boarding House', href: '/host' },
        { name: 'Become a BoardTAU Host', href: '/host' },
        { name: 'Hosting Guidelines', href: '/host/guidelines' },
        { name: 'Host Responsibilities', href: '/host/responsibilities' },
        { name: 'Safety for Hosts', href: '/host/safety' },
        { name: 'Community Standards', href: '/standards' },
      ],
    },
    {
      title: 'BoardTAU',
      links: [
        { name: 'About BoardTAU', href: '/about' },
        { name: 'Capstone Project Overview', href: '/about/capstone' },
        { name: 'Our Mission', href: '/about/mission' },
         { name: 'Privacy Policy', href: '/legal/privacy' },
        { name: 'Terms of Service', href: '/legal/terms' },
        { name: 'Contact Us', href: '/contact' },
      ],
    },
  ];

  return (
    <footer className={`${isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-700'} pt-16 pb-8 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className={`text-sm hover:underline ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t pt-8 pb-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex space-x-4">
            <Link
              href="#"
              className={`text-sm ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
              aria-label="Facebook"
            >
              <FaFacebook size={18} />
            </Link>
            <Link
              href="#"
              className={`text-sm ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
              aria-label="Instagram"
            >
              <FaInstagram size={18} />
            </Link>
            <Link
              href="#"
              className={`text-sm ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
              aria-label="Twitter"
            >
              <FaTwitter size={18} />
            </Link>
            <Link
              href="#"
              className={`text-sm ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
              aria-label="LinkedIn"
            >
              <FaLinkedin size={18} />
            </Link>
          </div>

          <div className="text-sm flex flex-col md:flex-row items-center gap-4">
            <p className={isDark ? 'text-gray-500' : 'text-gray-500'}>
              © 2026 BoardTAU — Capstone Project
            </p>
            <div className="flex space-x-6">
              <Link
                href="/legal/privacy"
                className={`hover:underline ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Privacy
              </Link>
              <Link
                href="/legal/terms"
                className={`hover:underline ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Terms
              </Link>
              <Link
                href="/legal/accessibility"
                className={`hover:underline ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Accessibility
              </Link>
            </div>
          </div>

          <div className="flex space-x-6">
            <button className={`text-sm hover:underline ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}>
              English (EN)
            </button>
            <button className={`text-sm hover:underline ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}>
              PHP (₱)
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

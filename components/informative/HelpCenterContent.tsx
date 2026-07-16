'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Search, UserCircle, CreditCard, ShieldCheck, Settings, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HelpCenterContent() {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? theme === 'dark' : false;

  const categories = [
    { name: 'Account Access', icon: <UserCircle className="w-5 h-5 text-blue-500" />, href: '/support/contact' },
    { name: 'Checkout & Billing', icon: <CreditCard className="w-5 h-5 text-purple-500" />, href: '/support/cancellation-policy' },
    { name: 'Host Management', icon: <Settings className="w-5 h-5 text-green-500" />, href: '/hosting/guidelines' },
    { name: 'Account Security', icon: <ShieldCheck className="w-5 h-5 text-red-500" />, href: '/support/safety-guidelines' },
  ];

  const popularArticles = [
    { title: 'What is the Identity Verification (KYC) process?', href: '/support/safety-guidelines' },
    { title: 'How do I pay my reservation fee securely? (Stripe & PayMongo)', href: '/legal/terms' },
    { title: 'What is the step-by-step booking workflow?', href: '/about/capstone' },
    { title: 'How does BoardTAU protect my messages and data?', href: '/legal/privacy' },
    { title: 'How do I list my property and verify my business permit?', href: '/hosting/guidelines' },
    { title: 'Can landlords process walk-in bookings manually?', href: '/hosting/responsibilities' },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900 text-slate-300' : 'bg-gray-50 text-gray-800'}`}>
      
      {/* Hero Section with Search */}
      <div className={`pt-24 pb-16 px-6 ${isDark ? 'bg-slate-800' : 'bg-white'} border-b ${isDark ? 'border-slate-700' : 'border-gray-200'} text-center`}>
        <div className="container mx-auto max-w-4xl">
          <h1 className={`text-4xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            How can we help you?
          </h1>
          <div className="relative max-w-2xl mx-auto flex shadow-sm rounded-lg overflow-hidden">
            <input 
              type="text" 
              placeholder="Search knowledgebase..." 
              className={`w-full py-4 pl-6 pr-4 outline-none border-y border-l ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
            />
            <button className="bg-red-500 hover:bg-red-600 text-white px-8 font-medium transition-colors border-y border-r border-red-500">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto max-w-5xl px-6 py-12">
        
        <h2 className={`text-2xl font-bold text-center mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          General Support
        </h2>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {categories.map((cat, idx) => (
            <Link key={idx} href={cat.href}>
              <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer ${isDark ? 'bg-slate-800 border-slate-700 hover:border-slate-500' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}>
                <div className="flex items-center gap-3">
                  {cat.icon}
                  <span className={`font-medium text-sm ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>{cat.name}</span>
                </div>
                <ArrowRight className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
              </div>
            </Link>
          ))}
        </div>

        {/* Popular Articles */}
        <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Popular articles
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mb-20">
          {popularArticles.map((article, idx) => (
            <Link key={idx} href={article.href}>
              <div className={`flex items-center justify-between py-4 border-b ${isDark ? 'border-slate-700 hover:bg-slate-800/50' : 'border-gray-200 hover:bg-gray-100/50'} transition-colors group cursor-pointer -mx-4 px-4 rounded-lg`}>
                <span className={`text-sm ${isDark ? 'text-slate-300 group-hover:text-white' : 'text-gray-700 group-hover:text-black'}`}>
                  {article.title}
                </span>
                <ArrowRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-slate-400' : 'text-gray-500'}`} />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}

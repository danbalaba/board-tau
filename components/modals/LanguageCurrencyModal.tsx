'use client';

import React, { useState } from 'react';
import { X, Globe, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LanguageCurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'language' | 'currency';
}

const languages = [
  { name: 'English', region: 'United States' },
  { name: 'English', region: 'United Kingdom' },
  { name: 'English', region: 'Philippines' },
  { name: 'Tagalog', region: 'Pilipinas' },
  { name: 'Cebuano', region: 'Pilipinas' },
  { name: 'Español', region: 'España' },
  { name: 'Français', region: 'France' },
  { name: 'Deutsch', region: 'Deutschland' },
  { name: '日本語', region: '日本' },
  { name: '한국어', region: '대한민국' },
  { name: '中文 (简体)', region: '中国' },
  { name: 'Italiano', region: 'Italia' },
];

const currencies = [
  { name: 'Philippine peso', code: 'PHP', symbol: '₱' },
  { name: 'United States dollar', code: 'USD', symbol: '$' },
  { name: 'Euro', code: 'EUR', symbol: '€' },
  { name: 'British pound', code: 'GBP', symbol: '£' },
  { name: 'Japanese yen', code: 'JPY', symbol: '¥' },
  { name: 'Australian dollar', code: 'AUD', symbol: '$' },
  { name: 'Canadian dollar', code: 'CAD', symbol: '$' },
  { name: 'Singapore dollar', code: 'SGD', symbol: '$' },
  { name: 'Hong Kong dollar', code: 'HKD', symbol: '$' },
  { name: 'South Korean won', code: 'KRW', symbol: '₩' },
];

export default function LanguageCurrencyModal({ isOpen, onClose, initialTab = 'language' }: LanguageCurrencyModalProps) {
  const [activeTab, setActiveTab] = useState<'language' | 'currency'>(initialTab);
  const [selectedLanguage, setSelectedLanguage] = useState('English-United States');
  const [selectedCurrency, setSelectedCurrency] = useState('PHP');

  // Sync initial tab when modal opens
  React.useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-[1032px] h-[90vh] md:h-[80vh] bg-white dark:bg-slate-900 rounded-xl shadow-2xl flex flex-col overflow-hidden m-4"
        >
          {/* Header */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-slate-800">
            <button
              onClick={onClose}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-800 dark:text-gray-200" />
            </button>
          </div>

          {/* Tabs */}
          <div className="px-6 flex space-x-6 border-b border-gray-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('language')}
              className={`py-4 text-sm font-semibold transition-colors relative ${activeTab === 'language' ? 'text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              Language and region
              {activeTab === 'language' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('currency')}
              className={`py-4 text-sm font-semibold transition-colors relative ${activeTab === 'currency' ? 'text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              Currency
              {activeTab === 'currency' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white" />
              )}
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === 'language' ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
              >
                {languages.map((lang) => {
                  const id = `${lang.name}-${lang.region}`;
                  const isSelected = selectedLanguage === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setSelectedLanguage(id)}
                      className={`text-left p-3 rounded-lg border transition-all duration-200 ${isSelected ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-slate-800' : 'border-transparent hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                    >
                      <div className={`text-sm ${isSelected ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-800 dark:text-slate-200'}`}>
                        {lang.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                        {lang.region}
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
              >
                {currencies.map((curr) => {
                  const isSelected = selectedCurrency === curr.code;
                  return (
                    <button
                      key={curr.code}
                      onClick={() => setSelectedCurrency(curr.code)}
                      className={`text-left p-3 rounded-lg border transition-all duration-200 ${isSelected ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-slate-800' : 'border-transparent hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                    >
                      <div className={`text-sm ${isSelected ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-800 dark:text-slate-200'}`}>
                        {curr.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                        {curr.code} - {curr.symbol}
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

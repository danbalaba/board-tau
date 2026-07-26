"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubject?: string;
  title?: string;
}

export default function ContactSupportModal({ isOpen, onClose, initialSubject = '', title = 'Send Support Ticket' }: ContactSupportModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // When initialSubject changes (e.g. different button clicked), update subject
  useEffect(() => {
    setSubject(initialSubject);
  }, [initialSubject]);

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setName('');
        setEmail('');
        setSubject(initialSubject);
        setMessage('');
        setStatus('idle');
        setErrorMessage('');
      }, 300); // Wait for close animation
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    const body = document.body;
    const rootNode = document.documentElement;

    const restoreScroll = () => {
      const top = parseFloat(body.style.top) * -1;
      body.style.overflow = '';
      body.style.paddingRight = '';
      body.style.top = '';
      body.classList.remove("fixed", "w-full");
      if (top) {
        window.scrollTo(0, top);
      }
    };

    if (isOpen) {
      const scrollTop = window.pageYOffset || rootNode.scrollTop || body.scrollTop;
      body.style.overflow = 'hidden';
      body.style.paddingRight = '17px';
      body.style.top = `-${scrollTop}px`;
      body.classList.add("fixed", "w-full");
    } else {
      restoreScroll();
    }
    
    return () => {
      if (isOpen) {
        restoreScroll();
      }
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
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
        setSubject(initialSubject);
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-neutral-200/50 dark:border-slate-800 overflow-hidden z-10"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200/50 dark:border-slate-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#2f7d6d]" />
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                    onClick={onClose}
                    className="bg-neutral-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors mt-4"
                  >
                    Close
                  </button>
                </motion.div>
              ) : (
                <>
                  {status === 'error' && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-600 dark:text-red-400">{errorMessage}</div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">Name</label>
                    <input
                      type="text"
                      required
                      maxLength={100}
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
                      maxLength={255}
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
                      maxLength={150}
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
                      maxLength={2000}
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
                    className="w-full bg-[#2f7d6d] hover:bg-[#1e5146] disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors duration-200 mt-4 shadow-sm cursor-pointer disabled:cursor-not-allowed"
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
  );
}

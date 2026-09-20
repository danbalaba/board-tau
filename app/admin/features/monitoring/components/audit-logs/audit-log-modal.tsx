'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, User, Tag, Hash, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/app/admin/components/ui/sonner';

import { formatAuditActionLabel } from './columns';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: any | null;
}

export function AuditLogModal({ isOpen, onClose, log }: AuditLogModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!log || !mounted) return null;

  const formattedAction = formatAuditActionLabel(log.action, log.entityType);

  const handleCopyPayload = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('JSON payload copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const payloadString = (() => {
    if (!log.details || log.details === '{}') return null;
    try {
      const parsed = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return String(log.details);
    }
  })();

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-300"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
          >
            <div className="p-6 sm:p-8 space-y-6 max-h-[88vh] overflow-y-auto custom-scrollbar text-slate-800 dark:text-slate-200 w-full">
              {/* Header Banner - Matching AddCollegeModal & AddPropertyTypeModal */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary dark:text-primary-light flex items-center justify-center border border-primary/20 shrink-0">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                      Audit Log Details
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                      {log.createdAt ? format(new Date(log.createdAt), 'MMMM d, yyyy • h:mm:ss a') : 'Recorded log activity entry'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0"
                  title="Close Modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Grid Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <User size={13} className="text-primary" /> Admin User
                  </p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {log.admin?.name || 'System Administrator'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize font-medium">
                    Role: {log.admin?.role ? log.admin.role.replace('_', ' ').toLowerCase() : 'Super Admin'}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Tag size={13} className="text-primary" /> Performed Action
                  </p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      {formattedAction}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Target: <span className="font-bold text-slate-700 dark:text-slate-200">{log.entityType || 'System'}</span>
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 sm:col-span-2 space-y-1">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Hash size={13} className="text-primary" /> Record Reference ID
                  </p>
                  <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-200/60 dark:bg-slate-800 px-3 py-1.5 rounded-xl break-all inline-block border border-slate-300/60 dark:border-slate-700">
                    {log.entityId || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Theme-Adapted JSON Terminal Section */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Payload Data Details</span>
                  {payloadString && (
                    <span className="text-[10px] text-slate-400 font-normal">JSON Payload</span>
                  )}
                </label>

                {payloadString ? (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-50 dark:bg-slate-950 transition-colors">
                    <div className="bg-slate-100 dark:bg-slate-900 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-400 dark:bg-rose-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 dark:bg-amber-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 dark:bg-emerald-500/80" />
                        <span className="ml-2 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                          JSON Payload
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyPayload(payloadString)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-200/60 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Copy JSON Payload"
                      >
                        {copied ? (
                          <>
                            <Check size={12} className="text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-4 overflow-x-auto max-h-[250px] custom-scrollbar bg-slate-100/50 dark:bg-slate-950">
                      <pre className="text-xs text-emerald-700 dark:text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed">
                        {payloadString}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl text-center text-xs text-slate-500 italic border border-slate-200/60 dark:border-slate-700/60">
                    No additional payload metadata recorded for this action.
                  </div>
                )}
              </div>

              {/* Modal Footer - Matching Property Configuration Modals */}
              <div className="pt-4 flex items-center justify-end border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-11 px-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

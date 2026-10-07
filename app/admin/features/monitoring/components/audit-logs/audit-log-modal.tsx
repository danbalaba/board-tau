'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, User, Tag, Hash, Copy, Check, ShieldCheck, Lock, KeyRound, Unlock } from 'lucide-react';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { toast } from '@/app/admin/components/ui/sonner';

import { formatAuditActionLabel, formatTargetLabel } from './columns';
import { AuditOtpModal } from './AuditOtpModal';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: any | null;
}

export function AuditLogModal({ isOpen, onClose, log }: AuditLogModalProps) {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPayloadUnlocked, setIsPayloadUnlocked] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setIsPayloadUnlocked(false);
    }
  }, [isOpen, log]);

  useEffect(() => {
    if (!isOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const mainContainers = document.querySelectorAll('main, [data-slot="sidebar-inset"]');
    const containerStyles: Array<{ el: HTMLElement; overflow: string }> = [];

    mainContainers.forEach((el) => {
      const htmlEl = el as HTMLElement;
      containerStyles.push({ el: htmlEl, overflow: htmlEl.style.overflow });
      htmlEl.style.overflow = 'hidden';
    });

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      containerStyles.forEach(({ el, overflow }) => {
        el.style.overflow = overflow;
      });
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsPayloadUnlocked(false);
    onClose();
  };

  if (!log || !mounted) return null;

  const formattedAction = formatAuditActionLabel(log.action, log.entityType);
  const adminEmail = session?.user?.email || log.admin?.email || '';

  const handleCopyPayload = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('JSON payload copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const parsedDetails = (() => {
    if (!log.details || log.details === '{}') return {};
    try {
      return typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
    } catch (e) {
      return {};
    }
  })();

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
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-300"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
            >
              <div className="p-6 sm:p-8 space-y-6 max-h-[88vh] overflow-y-auto custom-scrollbar text-slate-800 dark:text-slate-200 w-full">
                {/* Header Banner */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary dark:text-emerald-400 flex items-center justify-center border border-primary/20 shrink-0">
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
                    onClick={handleClose}
                    className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0"
                    title="Close Modal"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Grid Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                    <p className="text-xs text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <User size={13} className="text-primary dark:text-emerald-400" /> Admin User
                    </p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {log.admin?.name || 'System Administrator'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize font-medium">
                      Role: {log.admin?.role ? log.admin.role.replace('_', ' ').toLowerCase() : 'Super Admin'}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                    <p className="text-xs text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Tag size={13} className="text-primary dark:text-emerald-400" /> Performed Action
                    </p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 dark:bg-emerald-500/10 text-primary dark:text-emerald-400 border border-primary/20 dark:border-emerald-500/20">
                        {formattedAction}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Target: <span className="font-bold text-slate-700 dark:text-slate-200">{formatTargetLabel(log.entityType)}</span>
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 sm:col-span-2 space-y-1">
                    <p className="text-xs text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Hash size={13} className="text-primary dark:text-emerald-400" /> Record Reference ID
                    </p>
                    <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-200/60 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl break-all inline-block border border-slate-300/60 dark:border-slate-700">
                      {log.entityId || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* JSON Payload Section with OTP Security Gate */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Payload Data Details</span>
                    {payloadString && isPayloadUnlocked && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <Unlock size={12} /> Unlocked via OTP
                      </span>
                    )}
                  </label>

                  {!payloadString ? (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl text-center text-xs text-slate-500 dark:text-slate-400 italic border border-slate-200/60 dark:border-slate-700/60">
                      No additional payload metadata recorded for this action.
                    </div>
                  ) : !isPayloadUnlocked ? (
                    /* Locked Security Banner */
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 flex flex-col items-center text-center space-y-3.5 transition-colors">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
                        <Lock size={22} />
                      </div>
                      <div className="space-y-1 max-w-md">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Sensitive JSON Payload Protected
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                          For security and audit compliance, raw metadata & change logs are protected by 2-Factor Authentication.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsOtpModalOpen(true)}
                        className="h-10 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        <KeyRound size={15} />
                        <span>Unlock Payload via Security OTP</span>
                      </button>
                    </div>
                  ) : (
                    /* Syntax-Highlighted JSON Terminal */
                    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-900 transition-colors">
                      <div className="bg-slate-800/90 px-4 py-2.5 border-b border-slate-700/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="ml-2 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-300">
                            JSON Payload (Unlocked)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyPayload(payloadString)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors cursor-pointer"
                            title="Copy JSON Payload"
                          >
                            {copied ? (
                              <>
                                <Check size={12} className="text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsPayloadUnlocked(false)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700"
                            title="Lock Payload"
                          >
                            <Lock size={11} />
                            <span>Lock</span>
                          </button>
                        </div>
                      </div>
                      <div className="p-4 overflow-x-auto max-h-[250px] custom-scrollbar bg-slate-950">
                        <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed">
                          {payloadString}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                  {log.action === 'GENERATED_SUMMARY_REPORT' || log.entityType?.includes('Report') ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={`/verify/${parsedDetails?.encryptedToken || log.entityId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-11 px-4 rounded-2xl bg-[#2f7d6d] hover:bg-[#256356] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer"
                      >
                        <ShieldCheck size={16} />
                        <span>Verify Report Certificate</span>
                      </a>
                      {parsedDetails?.pdfUrl && (
                        <a
                          href={parsedDetails.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-11 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white dark:border-slate-700 text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                        >
                          <FileText size={16} className="text-emerald-600 dark:text-emerald-400" />
                          <span>Download Original PDF</span>
                        </a>
                      )}
                    </div>
                  ) : <div />}
                  <button
                    type="button"
                    onClick={handleClose}
                    className="h-11 px-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security OTP Modal */}
      <AuditOtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        adminEmail={adminEmail}
        onSuccess={() => setIsPayloadUnlocked(true)}
      />
    </>,
    document.body
  );
}


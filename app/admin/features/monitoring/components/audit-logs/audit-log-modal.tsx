'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileJson } from 'lucide-react';
import { format } from 'date-fns';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: any | null;
}

export function AuditLogModal({ isOpen, onClose, log }: AuditLogModalProps) {
  if (!log) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 z-[101] pointer-events-none flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <FileJson size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-900 dark:text-white">Audit Log Details</h2>
                    <p className="text-xs text-gray-500">
                      {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">User</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{log.admin?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400 capitalize">{log.admin?.role?.toLowerCase() || 'Admin'}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Action</p>
                    <p className="text-sm font-black text-emerald-500 uppercase tracking-widest">{log.action}</p>
                    <p className="text-xs text-gray-400">{log.entityType}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl col-span-2">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Entity ID</p>
                    <p className="text-sm font-mono text-gray-900 dark:text-gray-300 break-all">{log.entityId || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Payload Details</h3>
                  {log.details && log.details !== '{}' ? (
                    <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                      <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap">
                        {(() => {
                          try {
                            // Format JSON if it's stringified
                            const parsed = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                            return JSON.stringify(parsed, null, 2);
                          } catch (e) {
                            return log.details;
                          }
                        })()}
                      </pre>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl text-center text-sm text-gray-500 italic">
                      No additional details provided.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

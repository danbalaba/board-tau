'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/modals/Modal';
import { ReservationRequest } from '../hooks/use-reservation-logic';
import Button from '@/components/common/Button';
import Avatar from '@/components/common/Avatar';
import { 
  IconUser, 
  IconMail, 
  IconCalendar, 
  IconHome, 
  IconCreditCard, 
  IconPlayerPlay, 
  IconCheck, 
  IconX,
  IconClock
} from '@tabler/icons-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { cn } from '@/utils/helper';

interface LandlordReservationDetailsModalProps {
  reservation: ReservationRequest;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => Promise<void>;
}

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  RESERVED: 'bg-green-500/10 text-green-600 border-green-500/20',
  CHECKED_IN: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  CANCELLED: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export function LandlordReservationDetailsModal({
  reservation,
  isOpen,
  onClose,
  onUpdateStatus
}: LandlordReservationDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsInitialLoading(true);
      const timer = setTimeout(() => setIsInitialLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleAction = async (status: string) => {
    setIsLoading(true);
    try {
      await onUpdateStatus(reservation.id, status);
      onClose();
    } catch (error) {
      // toast handled in hook
    } finally {
      setIsLoading(false);
      setShowRevokeConfirm(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reservation Details" width="lg">
      <div className="p-8 space-y-8 bg-white dark:bg-gray-900 overflow-hidden">
        
        <AnimatePresence mode="wait">
          {isInitialLoading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-96 flex flex-col items-center justify-center gap-4"
            >
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Fetching Reservation Data...</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  }
                }
              }}
              className="space-y-8"
            >
              {/* Profile Card Overlay (If Confirming Revoke) */}
              {showRevokeConfirm && (
                <div className="absolute inset-x-0 bottom-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-8 border-t border-rose-100 dark:border-rose-900/30 rounded-b-[32px] animate-in slide-in-from-bottom-full duration-300">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <IconX size={32} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Cancel Reservation?</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-medium italic">
                      This will remove the reservation. The tenant will be notified immediately.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        outline
                        onClick={() => setShowRevokeConfirm(false)}
                        className="rounded-xl py-3 text-xs font-black uppercase tracking-widest border-gray-100 dark:border-gray-800"
                      >
                        Wait, Keep It
                      </Button>
                      <Button
                        variant="danger"
                        isLoading={isLoading}
                        onClick={() => handleAction('CANCELLED')}
                        className="rounded-xl py-3 text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-500/10"
                      >
                        Confirm Revoke
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Card */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, scale: 0.95, y: 10 },
                  visible: { opacity: 1, scale: 1, y: 0 }
                }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-emerald-500/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 backdrop-blur-sm">
                  <div className="flex items-center gap-5">
                     <Avatar 
                        src={reservation.user.image} 
                        name={reservation.user.name} 
                        className="w-16 h-16 rounded-[1.25rem] shadow-2xl border-4 border-white dark:border-gray-800" 
                     />
                     <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-none mb-2">{reservation.user.name || 'Anonymous Guest'}</h3>
                        <div className="flex items-center gap-2">
                          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verified Identity</p>
                        </div>
                     </div>
                  </div>
                  <span className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm backdrop-blur-md", 
                    statusColors[reservation.status] || 'bg-gray-100 text-gray-500'
                  )}>
                    {reservation.status.replace('_', ' ')}
                  </span>
                </div>
              </motion.div>

              {/* Detailed Info Sections */}
              <div className="space-y-6">
                {/* Property Overview */}
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  className="bg-gray-50/30 dark:bg-gray-800/30 p-6 rounded-3xl border border-gray-100/50 dark:border-gray-800/50"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-3 bg-primary rounded-full"></div>
                    Booking Details
                  </span>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden shadow-inner border border-gray-100 dark:border-gray-800">
                      <img src={reservation.listing.imageSrc} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-xl font-black text-gray-900 dark:text-white leading-tight mb-2">
                        {reservation.listing.title}
                      </h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                        Requested Room: <span className="text-primary">{reservation.room?.name || 'Standard Room'}</span>
                      </p>
                      <div className="mt-4 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-50 dark:border-gray-800/50 flex items-center gap-3">
                        <IconMail size={16} className="text-primary" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300 truncate">
                          {reservation.user.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Stay Logistics */}
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div className="bg-gray-50/30 dark:bg-gray-800/30 p-5 rounded-3xl border border-gray-100/50 dark:border-gray-800/50 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <IconCalendar size={24} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Check-In Date</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white">
                        {format(new Date(reservation.moveInDate), 'MMMM do, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50/30 dark:bg-gray-800/30 p-5 rounded-3xl border border-gray-100/50 dark:border-gray-800/50 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                      <IconClock size={24} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Stay Length</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white">
                        {reservation.stayDuration} Days
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Financial Reference */}
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1 }
                  }}
                  className="p-6 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-3xl border border-emerald-500/10 dark:border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-950 flex items-center justify-center shadow-sm border border-emerald-500/20 shrink-0">
                      <IconCreditCard size={24} className="text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] block mb-1">Payment Info</span>
                      <p className="text-sm font-black text-gray-900 dark:text-white leading-none">
                        {(reservation as any).occupantsCount || 1} {(reservation as any).occupantsCount === 1 ? 'Person' : 'People'} × ₱{((reservation.room as any)?.reservationFee || (((reservation as any).totalPrice || 0) / ((reservation as any).occupantsCount || 1))).toLocaleString()}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total Fee Paid</p>
                    </div>
                  </div>
                  <div className="bg-emerald-600 text-white px-6 py-2 rounded-2xl shadow-xl shadow-emerald-500/20">
                    <span className="text-xl font-black tracking-tighter italic">₱{(reservation as any).totalPrice.toLocaleString()}</span>
                  </div>
                </motion.div>
              </div>

              {/* Management Actions */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="pt-8 border-t border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white">Manage Booking</h4>
                  <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800 mx-6"></div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(reservation.status === 'RESERVED' || reservation.status === 'CONFIRMED') && (
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 py-5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] group/act"
                      onClick={() => handleAction('CHECKED_IN')}
                      isLoading={isLoading}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <IconPlayerPlay size={18} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                        Confirm Check-In
                      </span>
                    </Button>
                  )}

                  {reservation.status !== 'CANCELLED' && (
                    <Button 
                      outline
                      className={cn(
                        "rounded-[1.25rem] py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all group/rev",
                        (reservation.status === 'RESERVED' || reservation.status === 'CONFIRMED') 
                          ? "border-rose-100 text-rose-500 hover:bg-rose-50 dark:border-rose-900/30" 
                          : "sm:col-span-2 border-rose-100 text-rose-500 hover:bg-rose-50 dark:border-rose-900/30"
                      )}
                      onClick={() => setShowRevokeConfirm(true)}
                      isLoading={isLoading}
                    >
                      <span className="flex items-center justify-center gap-2">
                         <IconX size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> 
                         Cancel Reservation
                      </span>
                    </Button>
                  )}
                </div>
                
                <div className="mt-6 flex items-center justify-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                  <IconClock size={12} className="text-gray-400" />
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest text-center px-4">
                    This action will update the booking status immediately
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}

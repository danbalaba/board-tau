'use client';

import React, { useState } from 'react';
import Modal from '@/components/modals/Modal';
import { Booking } from '../hooks/use-booking-logic';
import { LandlordBookingStatusBadge } from './landlord-booking-status-badge';
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
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface LandlordBookingDetailsModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => Promise<void>;
  isUpdatingStatus?: boolean;
}

export function LandlordBookingDetailsModal({
  booking,
  isOpen,
  onClose,
  onUpdateStatus,
  isUpdatingStatus
}: LandlordBookingDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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
      await onUpdateStatus(booking.id, status);
      toast.success(`Booking status updated to ${status.replace('_', ' ')}`);
      onClose();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Booking Details" width="lg">
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
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Stay Information...</p>
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
              {/* Profile Card */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, scale: 0.95, y: 10 },
                  visible: { opacity: 1, scale: 1, y: 0 }
                }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 backdrop-blur-sm">
                  <div className="flex items-center gap-5">
                     <Avatar 
                        src={booking.user.image} 
                        name={booking.user.name} 
                        className="w-16 h-16 rounded-[1.25rem] shadow-2xl border-4 border-white dark:border-gray-800" 
                     />
                     <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-none mb-2">{booking.user.name || 'Anonymous Guest'}</h3>
                        <div className="flex items-center gap-2">
                          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ongoing Stay</p>
                        </div>
                     </div>
                  </div>
                  <LandlordBookingStatusBadge status={booking.status} />
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
                    Booked Room
                  </span>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden shadow-inner border border-gray-100 dark:border-gray-800">
                      <img src={booking.listing.imageSrc} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-xl font-black text-gray-900 dark:text-white leading-tight mb-2">
                        {booking.listing.title}
                      </h4>
                      <div className="space-y-3 mt-4">
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-50 dark:border-gray-800/50 shadow-sm">
                          <IconMail size={16} className="text-primary" />
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-300 truncate">
                            {booking.user.email}
                          </span>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                          <IconCreditCard size={20} className="text-emerald-500 mt-0.5" />
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-gray-900 dark:text-gray-100">
                              ₱{booking.totalPrice.toLocaleString()} Total Paid
                            </span>
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5">
                              {(booking as any).occupantsCount || 1} {(booking as any).occupantsCount === 1 ? 'Person' : 'People'} • ₱{(((booking as any).room as any)?.reservationFee || (((booking as any).totalPrice || 0) / ((booking as any).occupantsCount || 1))).toLocaleString()} each
                            </span>
                            <span className="text-[9px] font-black text-emerald-600 uppercase mt-1 tracking-[0.2em]">Verified • {booking.paymentStatus}</span>
                          </div>
                        </div>
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
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Start Date</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white">
                        {format(new Date(booking.startDate), 'MMMM do, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50/30 dark:bg-gray-800/30 p-5 rounded-3xl border border-gray-100/50 dark:border-gray-800/50 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
                      <IconCheck size={24} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">End Date</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white">
                        {format(new Date(booking.endDate), 'MMMM do, yyyy')}
                      </p>
                    </div>
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
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white">Manage Stay</h4>
                  <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800 mx-6"></div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {booking.status === 'CHECKED_IN' && (
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-xl shadow-purple-600/20 py-5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] group/act"
                      onClick={() => handleAction('COMPLETED')}
                      isLoading={isLoading || isUpdatingStatus}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <IconCheck size={18} className="group-hover:scale-110 transition-transform" />
                        Complete Stay & Ask for Review
                      </span>
                    </Button>
                  )}
                </div>
                
                <div className="mt-6 flex items-center justify-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                  <IconClock size={12} className="text-gray-400" />
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-relaxed text-center px-4">
                    This will end the stay and notify the student to leave a review.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>  );
}

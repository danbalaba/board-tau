'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  IconCalendar, 
  IconUser, 
  IconHome, 
  IconClock, 
  IconArrowLeft,
  IconCheck,
  IconX,
  IconCurrencyPeso,
  IconLoader2,
  IconDots,
  IconMessage,
  IconHistory,
  IconMapPin
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import Button from "@/components/common/Button";
import { useResponsiveToast } from '@/components/common/ResponsiveToast';

interface ReservationRequest {
  id: string;
  listing: {
    id: string;
    title: string;
    imageSrc: string;
  };
  room?: {
    id: string;
    name: string;
    price: number;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  status: string;
  paymentStatus?: string;
  moveInDate: Date;
  stayDuration: number;
  createdAt: Date;
}

export default function ReservationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { success, error: toastError } = useResponsiveToast();
  const [reservation, setReservation] = useState<ReservationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const resolvedParams = await params;
      try {
        const response = await fetch(`/api/landlord/reservations?id=${resolvedParams.id}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setReservation(data.data);
        } else {
          setError('Failed to fetch reservation details');
        }
      } catch (err) {
        setError('An unexpected error occurred while loading reservation details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params]);

  const handleRespond = useCallback(async (status: 'approved' | 'rejected') => {
    if (!reservation) return;
    setIsProcessing(true);

    try {
      const response = await fetch(`/api/landlord/reservations?id=${reservation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        success(`Reservation has been successfully ${status}.`);
        setReservation((prev: any) => ({ ...prev, status }));
        router.refresh();
      } else {
        toastError(`Failed to ${status} reservation request.`);
      }
    } catch (error) {
      toastError('Connection error while processing response.');
    } finally {
      setIsProcessing(false);
    }
  }, [reservation, router, success, toastError]);

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-amber-500/10',
    approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-emerald-500/10',
    rejected: 'bg-rose-500/10 text-rose-600 border-rose-500/20 shadow-rose-500/10',
  };

  const paymentStatusColors: Record<string, string> = {
    unpaid: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    paid: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="text-primary">
            <IconLoader2 size={40} />
          </motion.div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">Analyzing Request Data</p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-xl shadow-rose-500/10">
            <IconX size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Unknown request</h2>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 leading-relaxed italic border-l-2 border-rose-200 dark:border-rose-900 pl-4 py-2">
            "{error || 'The reservation request might have been expired or is currently unavailable.'}"
          </p>
          <Button onClick={() => router.push('/landlord/reservations')} className="rounded-2xl px-10 py-4 shadow-2xl shadow-primary/20">
            <IconArrowLeft size={16} className="mr-3" strokeWidth={3} />
            Back to Queue
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 selection:bg-primary/20 selection:text-white">
      <div className="max-w-5xl mx-auto">
        {/* Advanced Navigation Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
          <Link href="/landlord/reservations" className="group flex items-center gap-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-6 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-2xl active:scale-95">
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
              <IconArrowLeft size={16} strokeWidth={3} />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] block leading-none mb-1">Back to List</span>
              <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">Reservations Queue</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
             {/* Status Badge */}
             <div className={cn("flex items-center gap-3 px-6 py-3 rounded-2xl border backdrop-blur-md shadow-xl", statusColors[reservation.status])}>
                <div className={cn("w-2 h-2 rounded-full animate-pulse", statusColors[reservation.status].split(' ')[1].replace('text-', 'bg-'))} />
                <span className="text-[12px] font-black uppercase tracking-[0.2em]">{reservation.status}</span>
             </div>
             
             <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-gray-400 group cursor-pointer hover:border-primary/40 transition-colors shadow-sm">
                <IconDots size={20} className="group-hover:text-primary transition-colors" />
             </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Tenant & Request Summary */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 p-8 shadow-2xl relative overflow-hidden">
               {/* Bloom Decor */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
               
               <div className="relative z-10">
                 <div className="flex items-center justify-between mb-10">
                   <h2 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full inline-block">Request Intelligence</h2>
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400">
                     <IconClock size={12} className="text-primary" />
                     Received {new Date(reservation.createdAt).toLocaleDateString()}
                   </div>
                 </div>

                 <div className="flex items-center gap-8 mb-12">
                   <div className="relative group">
                     <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary to-blue-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
                     <div className="relative w-24 h-24 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center text-3xl font-black text-primary shadow-xl border border-white dark:border-gray-700">
                        {reservation.user.name?.charAt(0) || 'U'}
                     </div>
                   </div>
                   <div>
                     <p className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-1 leading-none shadow-sm shadow-primary/5">Perspective Tenant</p>
                     <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-3">{reservation.user.name || 'Anonymous'}</h1>
                     <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">{reservation.user.email}</p>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6 mb-12">
                   <div className="p-6 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100/50 dark:border-gray-700/50 rounded-3xl group hover:bg-white dark:hover:bg-gray-800 transition-all hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-none">
                     <div className="flex items-center gap-4 mb-3">
                       <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-lg shadow-primary/20">
                         <IconCalendar size={20} strokeWidth={2.5} />
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Target Move-in</span>
                     </div>
                     <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{new Date(reservation.moveInDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                   </div>

                   <div className="p-6 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100/50 dark:border-gray-700/50 rounded-3xl group hover:bg-white dark:hover:bg-gray-800 transition-all hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-none">
                     <div className="flex items-center gap-4 mb-3">
                       <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 shadow-lg shadow-blue-500/20">
                         <IconClock size={20} strokeWidth={2.5} />
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Stay Duration</span>
                     </div>
                     <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{reservation.stayDuration} <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">Days</span></p>
                   </div>
                 </div>

                 {reservation.paymentStatus && (
                   <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 via-gray-50/50 to-transparent dark:from-gray-800/50 dark:via-gray-800/30 dark:to-transparent rounded-3xl border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                           <IconCheck size={20} className={cn(reservation.paymentStatus === 'paid' ? "text-emerald-500" : "text-amber-500")} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 text-left">Payment Integrity</p>
                          <p className="text-sm font-black text-gray-900 dark:text-white leading-none">Security Deposit & Reservations</p>
                        </div>
                      </div>
                      <div className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm", paymentStatusColors[reservation.paymentStatus])}>
                         {reservation.paymentStatus}
                      </div>
                   </div>
                 )}
               </div>
            </motion.div>

            {/* Statistics / Quick Stats */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 gap-6">
               <div className="p-8 bg-gray-900 dark:bg-black rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-700" />
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Verification Check</p>
                  <p className="text-[11px] font-bold text-gray-400 leading-relaxed group-hover:text-gray-200 transition-colors">"User account is verified and has a positive engagement history in the BoardTAU ecosystem."</p>
               </div>
               <div className="p-8 bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-xl flex flex-col justify-center gap-2">
                  <div className="flex items-center gap-3 text-emerald-500 mb-2">
                    <IconCheck size={16} strokeWidth={3} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Optimal Match</span>
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 italic">"Based on move-in date and property availability."</p>
               </div>
            </motion.div>
          </div>

          {/* Right Column: Listing & Decisions */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-2xl">
               <div className="relative h-64 overflow-hidden group">
                 {/* High-res image */}
                 {reservation.listing.imageSrc ? (
                   <img src={reservation.listing.imageSrc} alt={reservation.listing.title} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-110" />
                 ) : (
                   <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300">
                     <IconHome size={60} />
                   </div>
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
                 
                 <div className="absolute bottom-6 left-8 right-8">
                   <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 drop-shadow-md">Unit Reference</p>
                   <h3 className="text-2xl font-black text-white leading-none tracking-tight group-hover:translate-x-2 transition-transform duration-500">{reservation.listing.title}</h3>
                 </div>
               </div>

               <div className="p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-800">
                       <div className="flex items-center gap-3 mb-2">
                          <IconHome size={14} className="text-blue-500" />
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Target Unit</span>
                       </div>
                       <p className="text-base font-black text-gray-900 dark:text-white leading-none truncate">{reservation.room?.name || 'Full Unit'}</p>
                    </div>

                    <div className="p-5 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 shadow-inner">
                       <div className="flex items-center gap-3 mb-2">
                          <IconCurrencyPeso size={14} className="text-emerald-500" />
                          <span className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest">Rate (Projected)</span>
                       </div>
                       <p className="text-xl font-black text-emerald-600 leading-none tracking-tight">₱{(reservation.room?.price || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                     <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] mb-6">Decision Authority</p>
                     
                     <div className="space-y-4">
                       <AnimatePresence mode="wait">
                         {reservation.status === 'pending' ? (
                           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-4">
                             <Button 
                               onClick={() => handleRespond('approved')} 
                               disabled={isProcessing}
                               className="w-full rounded-2xl py-5 bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all text-xs font-black uppercase tracking-[0.2em]"
                             >
                               <span className="flex items-center justify-center gap-3">
                                 {isProcessing ? <IconLoader2 className="animate-spin" size={18} /> : <IconCheck size={18} strokeWidth={3} />}
                                 {isProcessing ? 'Synchronizing...' : 'Authorize Request'}
                               </span>
                             </Button>
                             
                             <Button 
                               outline 
                               onClick={() => handleRespond('rejected')} 
                               disabled={isProcessing}
                               className="w-full rounded-2xl py-5 border-rose-100 dark:border-rose-900/50 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/5 transition-all text-xs font-black uppercase tracking-[0.2em]"
                             >
                               <span className="flex items-center justify-center gap-3">
                                 <IconX size={18} strokeWidth={3} />
                                 Decline Request
                               </span>
                             </Button>
                           </motion.div>
                         ) : (
                           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700">
                              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">This request has reached a terminal state</p>
                              <div className={cn("inline-flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-[0.2em]", statusColors[reservation.status])}>
                                 {reservation.status === 'approved' ? <IconCheck size={14} strokeWidth={3} /> : <IconX size={14} strokeWidth={3} />}
                                 Fully {reservation.status}
                              </div>
                           </motion.div>
                         )}
                       </AnimatePresence>

                       <Button className="w-full bg-transparent hover:bg-primary/5 text-primary border border-primary/20 rounded-2xl py-4 group transition-all duration-500">
                          <span className="flex items-center justify-center gap-3">
                             <IconMessage size={18} className="group-hover:scale-110 transition-transform" />
                             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Contact Tenant</span>
                          </span>
                       </Button>
                     </div>
                  </div>
               </div>
            </motion.div>

            {/* Quick Actions / Helpers */}
            <div className="flex items-center gap-4">
              <div className="flex-1 p-6 bg-white dark:bg-gray-900 rounded-[30px] border border-gray-100 dark:border-gray-800 shadow-lg group cursor-pointer hover:border-blue-400/40 transition-all">
                <IconHistory size={24} className="text-blue-500 mb-4 group-hover:rotate-12 transition-transform" />
                <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest mb-1 leading-none">Activity Log</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Full History</p>
              </div>
              <div className="flex-1 p-6 bg-white dark:bg-gray-900 rounded-[30px] border border-gray-100 dark:border-gray-800 shadow-lg group cursor-pointer hover:border-orange-400/40 transition-all">
                <IconMapPin size={24} className="text-orange-500 mb-4 group-hover:-rotate-12 transition-transform" />
                <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest mb-1 leading-none">Map View</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Locate Unit</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

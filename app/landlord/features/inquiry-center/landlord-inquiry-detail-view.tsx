'use client';

import React from 'react';
import { 
  IconChevronLeft, 
  IconMail, 
  IconUser, 
  IconBuilding, 
  IconCalendar, 
  IconClock, 
  IconCheck, 
  IconX,
  IconMapPin,
  IconMessage
} from "@tabler/icons-react";
import Button from "@/components/common/Button";
import { cn } from "@/utils/helper";
import { useInquiryDetailLogic } from './hooks/use-inquiry-detail-logic';

interface LandlordInquiryDetailViewProps {
  inquiry: any;
}

export function LandlordInquiryDetailView({ inquiry }: LandlordInquiryDetailViewProps) {
  const { isResponding, handleRespond, router } = useInquiryDetailLogic(inquiry);

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    APPROVED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    REJECTED: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 p-4">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-gray-400 hover:text-primary transition-colors"
        >
          <div className="p-2 rounded-xl group-hover:bg-primary group-hover:text-white transition-all shadow-sm border border-gray-100 dark:border-gray-800">
            <IconChevronLeft size={18} strokeWidth={3} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest px-2">Back to List</span>
        </button>

        <div className={cn("px-4 py-2 border-2 rounded-2xl text-[10px] font-black uppercase tracking-widest", statusColors[inquiry.status] || "bg-gray-100")}>
          Status: {inquiry.status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Inquiry Body */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-950 p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <IconMessage size={120} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">Inquiry Message</h1>
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                    Received {new Date(inquiry.createdAt).toLocaleDateString()} at {new Date(inquiry.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="p-8 bg-gray-50/50 dark:bg-gray-900/50 rounded-[32px] border border-gray-100 dark:border-gray-800/50 min-h-[160px]">
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
                  {inquiry.message || "No message provided by the sender."}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-950 p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <IconBuilding size={20} />
              </div>
              Requested Property Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-5 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-primary shadow-sm overflow-hidden">
                   {inquiry.listing.imageSrc ? (
                     <img src={inquiry.listing.imageSrc} className="w-full h-full object-cover" />
                   ) : <IconBuilding size={18} />}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-0.5">Title</p>
                  <p className="text-sm font-black text-gray-900 dark:text-white line-clamp-1">{inquiry.listing.title}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-emerald-500 shadow-sm">
                   <IconCalendar size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-0.5">Planned Stay</p>
                  <p className="text-sm font-black text-gray-900 dark:text-white tabular-nums">
                    {new Date(inquiry.moveInDate).toLocaleDateString()} - {new Date(inquiry.checkOutDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {inquiry.room && (
              <div className="mt-6 p-6 bg-primary/5 rounded-[32px] border border-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
                    <IconClock size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">Requested Room: {inquiry.room.name}</h4>
                    <p className="text-xs font-bold text-primary/70 uppercase tracking-widest">₱{inquiry.room.price.toLocaleString()} Monthly Rate</p>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <span className="px-5 py-2.5 bg-white dark:bg-gray-950 rounded-2xl text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] shadow-sm border border-gray-100 dark:border-gray-800">
                    Occupants: {inquiry.occupantsCount || 1}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: User Info & Actions */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-950 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm text-center">
             <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-purple-600 rounded-[32px] p-0.5 shadow-xl shadow-primary/20">
                  <div className="w-full h-full bg-white dark:bg-gray-950 rounded-[30px] flex items-center justify-center overflow-hidden">
                    {inquiry.user.image ? (
                        <img src={inquiry.user.image} className="w-full h-full object-cover" />
                    ) : <IconUser size={32} className="text-primary" />}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center border-4 border-white dark:border-gray-950 shadow-lg">
                  <IconCheck size={18} strokeWidth={3} />
                </div>
             </div>
             
             <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1 tracking-tighter">{inquiry.user.name || "Anonymous"}</h3>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">{inquiry.user.role || "Potential Tenant"}</p>

             <div className="space-y-3 text-left">
                <div className="p-4 bg-gray-50/50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                  <IconMail size={16} className="text-gray-400" />
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300 truncate">{inquiry.user.email}</span>
                </div>
                <div className="p-4 bg-gray-50/50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                  <IconMapPin size={16} className="text-gray-400" />
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Requested from Makati</span>
                </div>
             </div>
          </div>

          <div className="bg-white dark:bg-gray-950 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-[0.15em]">Conversation Controls</h3>
            
            {inquiry.status === 'PENDING' ? (
              <div className="flex flex-col gap-4">
                <Button 
                   onClick={() => handleRespond('APPROVED')}
                   className="rounded-[20px] py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[11px] tracking-[0.2em] shadow-lg shadow-emerald-500/30"
                   isLoading={isResponding}
                >
                  <span className="flex items-center justify-center gap-2">
                    <IconCheck size={16} strokeWidth={3} />
                    Approve Inquiry
                  </span>
                </Button>
                <Button 
                   outline
                   onClick={() => handleRespond('REJECTED')}
                   className="rounded-[20px] py-4 border-rose-100 dark:border-rose-900/50 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 font-black uppercase text-[11px] tracking-[0.2em]"
                   isLoading={isResponding}
                >
                  <span className="flex items-center justify-center gap-2">
                    <IconX size={16} strokeWidth={3} />
                    Reject Inquiry
                  </span>
                </Button>
              </div>
            ) : (
                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Decision Made</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Status is {inquiry.status}</p>
                </div>
            )}
            
            <p className="text-[9px] text-gray-400 font-bold uppercase mt-6 text-center tracking-widest leading-relaxed">
              Accepting will notify the tenant and generate a reservation record.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

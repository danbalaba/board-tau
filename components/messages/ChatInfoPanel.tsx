"use client";

import React, { useEffect, useState } from "react";
import Avatar from "@/components/common/Avatar";
import { TenantConversation } from "@/hooks/use-messages";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconCalendar,
  IconMapPin,
  IconExternalLink,
  IconShieldCheck,
  IconMail,
  IconPhone,
  IconUser,
  IconCircleCheck,
  IconAlertCircle,
  IconBuildingStore,
  IconChecklist,
  IconArchive,
  IconX
} from "@tabler/icons-react";
import { format } from "date-fns";
import { cn } from "@/utils/helper";
import Skeleton from "react-loading-skeleton";
import SafeImage from "@/components/common/SafeImage";
import "react-loading-skeleton/dist/skeleton.css";

interface LandlordProfile {
  id: string;
  name: string;
  image: string;
  email: string;
  emailVerified: string | null;
  phoneNumber: string | null;
  bio: string | null;
  createdAt: string;
  listings: {
    id: string;
    title: string;
    imageSrc: string;
    images?: any;
    category: string;
    _count: { reviews: number };
  }[];
}

interface ChatInfoPanelProps {
  activeId: string | null;
  activeConversation: TenantConversation | null;
}

export const ChatInfoPanel: React.FC<ChatInfoPanelProps> = ({ activeConversation }) => {
  const [landlord, setLandlord] = useState<LandlordProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (!activeConversation) {
      setLandlord(null);
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `/api/landlord-profile/${activeConversation.landlordId}`
        );
        if (response.data.success) {
          setLandlord(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch landlord profile", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [activeConversation]);

  if (!activeConversation) return null;

  const memberSince = landlord ? format(new Date(landlord.createdAt), "MMMM yyyy") : null;
  const isEmailVerified = !!landlord?.emailVerified;

  return (
    <div className="h-full flex flex-col bg-gray-50/50 dark:bg-gray-900/50 border-l border-gray-100 dark:border-gray-800 p-6 overflow-y-auto scrollbar-hide gap-6">

      {/* Header — Landlord Avatar & Name */}
      <div className="flex flex-col items-center text-center pt-2">
        <div className="relative mb-4">
          {isLoading ? (
            <Skeleton width={80} height={80} borderRadius={28} enableAnimation={false} />
          ) : (
            <>
              <button 
                onClick={() => setIsPreviewOpen(true)}
                className="relative block rounded-[1.75rem] shadow-xl border-4 border-white dark:border-gray-800 hover:scale-105 transition-transform active:scale-95 focus:outline-none"
              >
                <Avatar
                  src={activeConversation.landlordImage}
                  name={activeConversation.landlordName}
                  className="w-20 h-20 rounded-[1.5rem]"
                />
              </button>
              <div className={cn(
                "absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center",
                isEmailVerified ? "bg-emerald-500" : "bg-amber-400"
              )}>
                {isEmailVerified
                  ? <IconCircleCheck size={14} className="text-white" />
                  : <IconAlertCircle size={14} className="text-white" />
                }
              </div>
            </>
          )}
        </div>
        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-0.5 min-w-[120px]">
          {isLoading ? <Skeleton width="80%" enableAnimation={false} /> : activeConversation.landlordName}
        </h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          {isLoading ? <Skeleton width="60%" enableAnimation={false} /> : (isEmailVerified ? "Verified Account" : "Unverified Account")}
        </p>
        
        {(activeConversation.isArchived || activeConversation.isPendingArchive) && (
          <div className="mt-3 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
            <IconArchive size={10} className="text-amber-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Archived
            </span>
          </div>
        )}
      </div>

      {/* Trust Indicators */}
      <section className="space-y-2">
        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
          <IconShieldCheck size={12} />
          Verified Host Info
        </label>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          {/* Email Verified */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-800">
            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
              <IconMail size={14} />
              Identity
            </div>
            {isLoading ? (
              <Skeleton width={60} height={16} borderRadius={8} enableAnimation={false} />
            ) : (
              <span className={cn(
                "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                isEmailVerified
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-400/10 text-amber-600 dark:text-amber-400"
              )}>
                {isEmailVerified ? "Verified" : "Unverified"}
              </span>
            )}
          </div>

          {/* Member Since */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
              <IconCalendar size={14} />
              Host Since
            </div>
            <span className="text-[11px] font-black text-gray-900 dark:text-white">
              {isLoading ? <Skeleton width={60} enableAnimation={false} /> : memberSince ?? "—"}
            </span>
          </div>
        </div>
      </section>

      {/* Bio */}
      <section className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Host Bio
        </label>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
          {isLoading ? (
            <Skeleton count={2} enableAnimation={false} />
          ) : (
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 italic leading-relaxed">
              "{landlord?.bio || "This host hasn't added a bio yet."}"
            </p>
          )}
        </div>
      </section>

      {/* Contact Information */}
      <section className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Contact Details
        </label>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <IconMail size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Email</p>
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {isLoading ? <Skeleton width="90%" enableAnimation={false} /> : landlord?.email ?? "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <IconPhone size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Phone</p>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                {isLoading ? <Skeleton width="70%" enableAnimation={false} /> : landlord?.phoneNumber ?? "Not available publicly"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Context */}
      <section className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
          <IconChecklist size={14} className="text-primary" />
          Chat Context
        </label>

        <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/20 p-4">
            <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Inquiry Regarding</p>
                    <h4 className="text-xs font-black text-gray-900 dark:text-white truncate leading-tight">
                        {activeConversation.listingTitle || "Unknown Property"}
                    </h4>
                </div>
                <SafeImage 
                    src={activeConversation.listingImage} 
                    containerClassName="w-10 h-10 shrink-0"
                    className="rounded-lg border-2 border-white dark:border-gray-800 shadow-sm"
                    alt="" 
                />
            </div>
        </div>
      </section>

      {/* Landlord's Portfolio */}
      <section className="space-y-3">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
          <IconBuildingStore size={14} />
          Host's Portfolio
        </label>

        <div className="space-y-2">
           {isLoading ? (
             [1, 2].map(i => (
               <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-2 pr-4 border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                 <Skeleton width={48} height={48} borderRadius={12} enableAnimation={false} />
                 <div className="flex-1"><Skeleton width="60%" enableAnimation={false} /><Skeleton width="40%" enableAnimation={false} /></div>
               </div>
             ))
           ) : landlord?.listings?.slice(0, 3).map((listing) => (
            <a 
              key={listing.id}
              href={`/listings/${listing.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white dark:bg-gray-900 rounded-2xl p-2 pr-4 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3 hover:border-primary/20 transition-all cursor-pointer"
            >
              <SafeImage
                src={(Array.isArray(listing.images) && (listing.images as any).length > 0)
                  ? (typeof (listing.images as any)[0] === 'string' 
                      ? (listing.images as any)[0] 
                      : (listing.images as any)[0].url)
                  : listing.imageSrc || ""}
                containerClassName="w-12 h-12 shrink-0"
                className="rounded-xl shadow-sm"
                alt=""
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-[11px] font-black text-gray-900 dark:text-white truncate">
                  {listing.title || "Untitled"}
                </h4>
                <p className="text-[9px] font-bold text-gray-400 truncate">
                  {listing.category ? (Array.isArray(listing.category) ? listing.category.join(", ") : listing.category) : "Uncategorized"}
                </p>
              </div>
              <IconExternalLink size={12} className="text-gray-300 group-hover:text-primary transition-colors shrink-0" />
            </a>
           )) || (
             <p className="text-[10px] font-bold italic text-gray-400 text-center">No other listings found.</p>
           )}
           
           {landlord?.listings && landlord.listings.length > 3 && (
             <p className="text-[9px] font-black text-center text-primary uppercase tracking-widest py-2">
               + {landlord.listings.length - 3} More Properties
             </p>
           )}
        </div>
      </section>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" onClick={() => setIsPreviewOpen(false)}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 max-w-2xl w-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="absolute -top-12 sm:-top-16 right-0 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all sm:right-auto sm:left-1/2 sm:-translate-x-1/2"
              >
                <IconX size={24} />
              </button>
              
              <div className="relative w-full aspect-square sm:w-[480px] sm:aspect-square md:w-[600px] bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/10">
                <SafeImage
                  src={activeConversation.landlordImage || ''}
                  alt={activeConversation.landlordName}
                  priority={true}
                />
              </div>
              <p className="mt-4 text-white font-black tracking-widest uppercase text-sm drop-shadow-md">
                {activeConversation.landlordName}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

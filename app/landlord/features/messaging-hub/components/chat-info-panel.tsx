"use client";

import React, { useEffect, useState } from "react";
import Avatar from "@/components/common/Avatar";
import { Conversation } from "../hooks/use-messaging-hub";
import axios from "axios";
import {
  IconCalendar,
  IconUsers,
  IconMapPin,
  IconExternalLink,
  IconShieldCheck,
  IconMail,
  IconPhone,
  IconUser,
  IconCircleCheck,
  IconAlertCircle,
  IconX
} from "@tabler/icons-react";
import { format, formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/helper";
import SafeImage from "@/components/common/SafeImage";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface TenantProfile {
  id: string;
  name: string;
  image: string;
  email: string;
  emailVerified: string | null;
  phoneNumber: string | null;
  bio: string | null;
  city: string | null;
  region: string | null;
  createdAt: string;
  isActive: boolean;
  inquiries: {
    id: string;
    status: string;
    moveInDate: string | null;
    checkOutDate: string | null;
    occupantsCount: number | null;
    createdAt: string;
    listing: { id: string; title: string; imageSrc: string; images?: any };
  }[];
}

interface ChatInfoPanelProps {
  activeConversation: Conversation | null;
}

export const ChatInfoPanel: React.FC<ChatInfoPanelProps> = ({ activeConversation }) => {
  const [tenant, setTenant] = useState<TenantProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (!activeConversation) return;
    setTenant(null);

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `/api/landlord/tenant-profile/${activeConversation.tenantId}`
        );
        if (response.data.success) {
          setTenant(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch tenant profile", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [activeConversation]);

  if (!activeConversation) return null;

  const latestInquiry = tenant?.inquiries?.[0] ?? null;
  const memberSince = tenant ? format(new Date(tenant.createdAt), "MMM yyyy") : null;
  const isEmailVerified = !!tenant?.emailVerified;

  return (
    <div className="h-full flex flex-col bg-gray-50/50 dark:bg-gray-900/50 border-l border-gray-100 dark:border-gray-800 p-6 overflow-y-auto scrollbar-hide gap-6">

      {/* Header — Tenant Avatar & Name */}
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
                  src={activeConversation.tenantImage}
                  name={activeConversation.tenantName}
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
          {isLoading ? <Skeleton width="80%" enableAnimation={false} /> : activeConversation.tenantName}
        </h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          {isLoading ? <Skeleton width="60%" enableAnimation={false} /> : (isEmailVerified ? "Verified Account" : "Unverified Account")}
        </p>
      </div>

      {/* Trust Indicators */}
      <section className="space-y-2">
        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
          <IconShieldCheck size={12} />
          Trust Indicators
        </label>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          {/* Email Verified */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-800">
            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
              <IconMail size={14} />
              Email Verified
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
                {isEmailVerified ? "Confirmed" : "Pending"}
              </span>
            )}
          </div>

          {/* Member Since */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-800">
            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
              <IconCalendar size={14} />
              Member Since
            </div>
            <span className="text-[11px] font-black text-gray-900 dark:text-white">
              {isLoading ? <Skeleton width={60} enableAnimation={false} /> : memberSince ?? "—"}
            </span>
          </div>

          {/* Account Status */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
              <IconUser size={14} />
              Account Status
            </div>
            {isLoading ? (
              <Skeleton width={50} height={16} borderRadius={8} enableAnimation={false} />
            ) : (
              <span className={cn(
                "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                tenant?.isActive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-500"
              )}>
                {tenant?.isActive ? "Active" : "Inactive"}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Bio */}
      <section className="space-y-2">
        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
          Personal Bio
        </label>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
          {isLoading ? (
            <Skeleton count={2} enableAnimation={false} />
          ) : (
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 italic leading-relaxed">
              "{tenant?.bio || "This tenant hasn't added a bio yet."}"
            </p>
          )}
        </div>
      </section>

      {/* Contact Information */}
      <section className="space-y-2">
        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
          Contact Info
        </label>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <IconMail size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Email</p>
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {isLoading ? <Skeleton width="90%" enableAnimation={false} /> : tenant?.email ?? "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <IconPhone size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Phone</p>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                {isLoading ? <Skeleton width="70%" enableAnimation={false} /> : tenant?.phoneNumber ?? "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <IconMapPin size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Location</p>
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {isLoading ? <Skeleton width="80%" enableAnimation={false} /> : [tenant?.city, tenant?.region].filter(Boolean).join(", ") || "Not provided"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Details */}
      <section className="space-y-2">
        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
          <IconCalendar size={12} />
          Latest Inquiry
        </label>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex justify-between"><Skeleton width={60} enableAnimation={false} /><Skeleton width={100} enableAnimation={false} /></div>
              <div className="flex justify-between"><Skeleton width={60} enableAnimation={false} /><Skeleton width={40} enableAnimation={false} /></div>
              <div className="flex justify-between pt-2 border-t border-gray-50 dark:border-gray-800"><Skeleton width={40} enableAnimation={false} /><Skeleton width={60} enableAnimation={false} /></div>
            </div>
          ) : latestInquiry ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Stay Dates</span>
                <span className="text-xs font-black text-gray-900 dark:text-white">
                  {latestInquiry.moveInDate ? format(new Date(latestInquiry.moveInDate), "MMM d") : "TBA"}
                  {" – "}
                  {latestInquiry.checkOutDate ? format(new Date(latestInquiry.checkOutDate), "MMM d") : "TBA"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Occupants</span>
                <div className="flex items-center gap-1 text-xs font-black text-gray-900 dark:text-white">
                  <IconUsers size={12} className="text-primary" />
                  {latestInquiry.occupantsCount ?? 1} person
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800">
                <span className="text-[11px] font-bold text-gray-500">Status</span>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                  latestInquiry.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-500" :
                  latestInquiry.status === "REJECTED" ? "bg-rose-500/10 text-rose-500" :
                  "bg-amber-500/10 text-amber-500"
                )}>
                  {latestInquiry.status}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[10px] font-bold italic text-gray-400 text-center">No inquiry record found.</p>
          )}
        </div>
      </section>

      {/* Property */}
      <section className="space-y-2">
        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
          <IconMapPin size={12} />
          Property
        </label>

        <div 
          onClick={() => window.location.href = `/landlord/properties?listingId=${activeConversation.listingId}`}
          className="group bg-white dark:bg-gray-900 rounded-2xl p-2 pr-4 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3 hover:border-primary/20 transition-all cursor-pointer"
        >
          <SafeImage
            src={activeConversation.listingImage || "/images/placeholder.jpg"}
            className="w-14 h-14 rounded-xl object-cover shadow-sm group-hover:scale-95 transition-transform shrink-0"
            alt=""
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-gray-900 dark:text-white truncate mb-1">
              {activeConversation.listingTitle}
            </h4>
            <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
              View Listing <IconExternalLink size={11} />
            </div>
          </div>
        </div>
      </section>

      {/* Manage Booking CTA */}
      <section className="pb-4">
        <button 
          onClick={() => window.location.href = `/landlord/reservations?tenantId=${activeConversation.tenantId}`}
          className="w-full py-3.5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Manage Booking
        </button>
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
                  src={activeConversation.tenantImage || '/images/placeholder.jpg'}
                  alt={activeConversation.tenantName}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="mt-4 text-white font-black tracking-widest uppercase text-sm drop-shadow-md">
                {activeConversation.tenantName}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

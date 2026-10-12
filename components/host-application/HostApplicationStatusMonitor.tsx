"use client";

import React, { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ShieldCheck,
  Clock,
  AlertCircle,
  Building2,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  Camera,
  RefreshCw,
  ArrowRight,
  Eye,
  Pencil,
  Sparkles,
  Calendar,
  Info,
  BadgeCheck,
  ExternalLink,
  X,
} from "lucide-react";
import SafeImage from "@/components/common/SafeImage";
import MediaPreviewOverlay from "@/components/common/MediaPreviewOverlay";
import { TAU_COORDINATES } from "@/utils/constants";
import { cn, formatPhoneNumber, formatPropertyType } from "@/utils/helper";

// Dynamically import Map to prevent SSR Leaflet window errors
const Map = dynamic(() => import("@/components/common/Map"), { ssr: false });

const SECTION_TABS = [
  { id: "PERSONAL", label: "Personal Info", shortLabel: "Personal", icon: User },
  { id: "PROPERTY", label: "Property Details", shortLabel: "Property", icon: Building2 },
  { id: "LOCATION", label: "Location & Map", shortLabel: "Location", icon: MapPin },
  { id: "IDENTITY", label: "Face & ID", shortLabel: "Face & ID", icon: Camera },
  { id: "PERMITS", label: "Photos & Permits", shortLabel: "Permits", icon: ShieldCheck },
];

const ReviewField = ({
  label,
  value,
  icon: FieldIcon,
  onEdit,
  placeholder = "No details provided",
}: {
  label: string;
  value: any;
  icon?: any;
  onEdit?: () => void;
  placeholder?: string;
}) => (
  <div className="flex flex-col gap-1.5 min-w-0 w-full group">
    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1 transition-colors flex items-center justify-between">
      <span>{label}</span>
    </label>
    <div
      onClick={onEdit}
      className={cn(
        "relative w-full rounded-2xl bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700/80 shadow-xs px-4 py-3.5 flex items-center min-h-[52px] transition-all",
        onEdit &&
          "cursor-pointer hover:border-primary/60 dark:hover:border-primary/60 hover:shadow-md active:scale-[0.998]"
      )}
    >
      {FieldIcon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors flex items-center justify-center pointer-events-none">
          <FieldIcon size={18} />
        </div>
      )}
      <div
        className={cn(
          "w-full text-xs sm:text-sm font-extrabold truncate",
          FieldIcon ? "pl-8" : "pl-0"
        )}
      >
        {value ? (
          <span className="truncate block text-slate-900 dark:text-slate-100">{value}</span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500 italic font-medium">{placeholder}</span>
        )}
      </div>
    </div>
  </div>
);

export interface HostApplicationStatusMonitorProps {
  application: any;
  user: any;
  onStartEdit?: () => void;
}

export const HostApplicationStatusMonitor: React.FC<HostApplicationStatusMonitorProps> = ({
  application,
  user,
  onStartEdit,
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<string>("PERSONAL");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [preview, setPreview] = useState<{ url: string; title: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Lock body & html scroll and add Escape key listener when review modal is open
  useEffect(() => {
    if (isReviewModalOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsReviewModalOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isReviewModalOpen]);

  const status = application?.status || "pending";
  const isRejected = status === "rejected";
  const isApproved = status === "approved";
  const isUnderReview = status === "pending";

  const businessInfo = application?.businessInfo || {};
  const contactInfo = application?.contactInfo || {};
  const latlng = application?.latlng || TAU_COORDINATES;

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const openPreview = (url: string | null | undefined, title: string) => {
    if (!url) return;
    setPreview({ url, title });
  };

  const showSection = (tabId: string) => activeTab === tabId;

  const formattedSubmittedDate = application?.createdAt
    ? new Date(application.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Recently submitted";

  const appReferenceId = application?.id
    ? `APP-${application.id.slice(-6).toUpperCase()}`
    : "APP-PENDING";

  // Mascot dynamic copy and artwork based on status
  const mascotConfig = isRejected
    ? {
        image: "/assets/mascot/kerby-landlord-checklist.png",
        title: "Update Needed",
        speech:
          "Please check the admin note below, update what was requested, and send it back to us.",
        badge: "Update Needed",
      }
    : isApproved
    ? {
        image: "/assets/mascot/kerby-desktop-celebration.png",
        title: "Application Approved!",
        speech:
          "Hooray! You are now an approved BoardTAU Landlord! You can start adding your properties.",
        badge: "Approved",
      }
    : {
        image: "/assets/mascot/kerby-desktop-review.png",
        title: "Application In Review",
        speech:
          "Great job! We received your application and our team is checking your details now. This usually takes 24 to 48 hours.",
        badge: "In Review",
      };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f8fafc] dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 flex flex-col justify-center py-8 sm:py-16 px-4 sm:px-8">
      <div className="max-w-4xl lg:max-w-5xl mx-auto w-full space-y-6">
        
        {/* CENTERED STATUS HERO CARD */}
        <div className="bg-white dark:bg-slate-900/90 rounded-[2.5rem] sm:rounded-[3rem] border border-slate-200/80 dark:border-slate-800 shadow-2xl p-7 sm:p-12 lg:p-14 relative overflow-hidden backdrop-blur-xl">
          {/* Subtle Ambient Background Glows */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-40 bg-gradient-to-br from-primary/30 to-emerald-500/20" />
          {isRejected && (
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-40 bg-rose-500/20" />
          )}

          <div className="relative z-10 space-y-8">
            {/* Top Badges Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex flex-wrap items-center gap-2.5">
                {isUnderReview && (
                  <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs sm:text-sm font-black uppercase tracking-wider">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                    Application Under Review
                  </span>
                )}

                {isRejected && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs sm:text-sm font-black uppercase tracking-wider">
                    <AlertCircle size={16} />
                    Updates Needed
                  </span>
                )}

                {isApproved && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-black uppercase tracking-wider">
                    <ShieldCheck size={16} />
                    Verified Landlord
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold tracking-wider">
                  {appReferenceId}
                </span>
              </div>

              <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500">
                <Calendar size={15} />
                {formattedSubmittedDate}
              </span>
            </div>

            {/* Hero Main Content Row: Text & Kerby Mascot Graphic */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
              {/* Left/Middle Content (7 Cols) */}
              <div className="md:col-span-7 space-y-5">
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-[family-name:var(--font-outfit)] text-slate-900 dark:text-white leading-[1.15]">
                    {isUnderReview && "Host Application Status"}
                    {isRejected && "Your Application Needs an Update"}
                    {isApproved && "Congratulations! You're Approved!"}
                  </h1>
                  <p className="text-sm sm:text-base font-semibold text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                    {isUnderReview &&
                      "We received your application. The BoardTAU team is currently checking your details and documents."}
                    {isRejected &&
                      "The BoardTAU team reviewed your application and noted some items that need your attention."}
                    {isApproved &&
                      "Your host application has been verified. You can now start adding your properties and welcoming TAU student boarders."}
                  </p>
                </div>

                {/* Kerby Guide Speech Bubble */}
                <div className="p-5 sm:p-6 rounded-[24px] bg-slate-50 dark:bg-[#0E1A1E] border-2 border-slate-200/80 dark:border-[#2f7d6d]/40 shadow-xs relative text-left">
                  <div className="flex items-center justify-between gap-2 mb-2 text-[#2f7d6d]">
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={14} />
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider">KERBY GUIDE</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#2f7d6d]/10 text-[#2f7d6d] px-2.5 py-0.5 rounded-full font-bold">
                      {mascotConfig.badge}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold leading-relaxed text-slate-700 dark:text-slate-200">
                    {mascotConfig.speech}
                  </p>
                </div>
              </div>

              {/* Right Mascot Artwork (5 Cols) */}
              <div className="md:col-span-5 flex flex-col items-center justify-center">
                <div className="w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 relative flex items-center justify-center animate-kerby-float pointer-events-none">
                  <SafeImage
                    src={mascotConfig.image}
                    alt={mascotConfig.title}
                    className="w-full h-full object-contain filter drop-shadow-2xl"
                  />
                </div>
                <div className="w-44 h-4 bg-slate-900/10 dark:bg-black/30 rounded-full blur-md -mt-2 animate-kerby-shadow" />
              </div>
            </div>

            {/* PENDING: Estimated Review Time Notice */}
            {isUnderReview && (
              <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                      Estimated Review Time: 24 to 48 Hours
                    </h5>
                    <p className="text-xs sm:text-sm font-medium text-amber-800/80 dark:text-amber-400/80 mt-0.5">
                      Applications are reviewed in the order they are received. We'll send you an email once there is an update.
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>In Review</span>
                </div>
              </div>
            )}

            {/* REJECTED: Admin Notes Alert Box */}
            {isRejected && application?.rejectedReason && (
              <div className="p-6 rounded-3xl bg-rose-500/10 border-2 border-rose-500/30 space-y-2">
                <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
                  <AlertCircle size={20} />
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider">Note from the Admin Team</h4>
                </div>
                <p className="text-sm sm:text-base font-semibold text-rose-900 dark:text-rose-200 pl-7 leading-relaxed">
                  "{application.rejectedReason}"
                </p>
              </div>
            )}

            {/* ACTION BUTTONS BAR */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                {/* View Submitted Application Modal Trigger */}
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 sm:px-7 sm:py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 border border-slate-200 dark:border-slate-700"
                >
                  <FileText size={17} />
                  <span>View Submitted Application</span>
                </button>

                {/* Refresh Status Button */}
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isPending}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 sm:px-6 sm:py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                >
                  <RefreshCw size={16} className={isPending ? "animate-spin" : ""} />
                  <span>{isPending ? "Checking..." : "Refresh Status"}</span>
                </button>
              </div>

              {/* Status Specific Primary CTA */}
              {isRejected && onStartEdit && (
                <button
                  type="button"
                  onClick={onStartEdit}
                  className="flex items-center gap-2.5 px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-rose-600/20 active:scale-95"
                >
                  <Pencil size={17} />
                  <span>Update & Resubmit</span>
                </button>
              )}

              {isApproved && (
                <Link
                  href="/landlord/dashboard"
                  className="flex items-center gap-2.5 px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-primary/20 active:scale-95"
                >
                  <span>Go to Landlord Dashboard</span>
                  <ArrowRight size={17} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM HELPER FOOTER / RETURN LINKS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm font-bold text-slate-400 px-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={17} className="text-primary" />
            <span>Need help with documents?</span>
            <Link href="/contact" className="text-primary hover:underline font-bold inline-flex items-center gap-1 ml-1">
              <span>Support Center</span>
              <ExternalLink size={12} />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Return to Campus Home
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Landlord Terms
            </Link>
          </div>
        </div>
      </div>

      {/* REVIEW APPLICATION MODAL - FULLSCREEN ON MOBILE ONLY */}
      {isMounted &&
        createPortal(
          <AnimatePresence>
            {isReviewModalOpen && (
              <div className="fixed inset-0 z-[9990] flex items-center justify-center p-0 sm:p-6 overflow-hidden sm:overflow-y-auto">
                {/* Modal Backdrop - Desktop only */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsReviewModalOpen(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm hidden sm:block"
                />

                {/* Modal Dialog Container - Fullscreen on mobile, centered dialog on desktop */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="relative z-10 bg-white dark:bg-slate-900 rounded-none sm:rounded-3xl border-0 sm:border border-slate-200 dark:border-slate-800 shadow-2xl max-w-none sm:max-w-4xl w-full h-full sm:h-auto sm:max-h-[90vh] min-h-[100dvh] sm:min-h-0 flex flex-col overflow-hidden my-0 sm:my-auto"
                >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
                <div className="space-y-0.5 sm:space-y-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 sm:p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                      <FileText size={17} className="sm:w-[18px] sm:h-[18px]" />
                    </div>
                    <h3 className="text-sm sm:text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white truncate">
                      Review Your Application
                    </h3>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold pl-7 sm:pl-9 truncate">
                    {appReferenceId} • Submitted on {formattedSubmittedDate}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-2 sm:p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer shrink-0"
                  aria-label="Close review modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Tab Bar (Horizontal Scrollable with Short Labels on Mobile) */}
              <div className="p-2 sm:p-3 sm:px-6 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-1 sm:p-1.5 border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-center justify-start sm:justify-between gap-1 sm:gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {SECTION_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-tight transition-all select-none cursor-pointer whitespace-nowrap shrink-0",
                          isActive
                            ? "bg-primary text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60"
                        )}
                      >
                        <Icon size={14} className="shrink-0" />
                        <span className="sm:hidden">{tab.shortLabel}</span>
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Body (Scrollable Review Details) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-5 [scrollbar-width:thin]">
                {/* Personal Information */}
                {showSection("PERSONAL") && (
                  <div className="space-y-5">
                    <ReviewField
                      label="Full Legal Name"
                      value={contactInfo?.fullName || user?.name}
                      icon={User}
                      placeholder="e.g. Juan De La Cruz"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ReviewField
                        label="Primary Contact No."
                        value={formatPhoneNumber(contactInfo?.phoneNumber)}
                        icon={Phone}
                        placeholder="(+63) 9XX-XXXXXXX"
                      />
                      <ReviewField
                        label="Official Email"
                        value={contactInfo?.email || user?.email}
                        icon={Mail}
                        placeholder="your@email.com"
                      />
                    </div>
                    <ReviewField
                      label="Property Relationship / Role"
                      value={
                        contactInfo?.ownershipRole === "OWNER"
                          ? "Property Owner (Title Holder)"
                          : contactInfo?.ownershipRole === "CO_OWNER_FAMILY"
                          ? "Co-Owner / Family Representative"
                          : contactInfo?.ownershipRole === "AUTHORIZED_CARETAKER"
                          ? "Authorized Manager / Caretaker"
                          : contactInfo?.ownershipRole === "SUBLESSOR"
                          ? "Master Tenant / Sub-lessor"
                          : contactInfo?.ownershipRole || "Property Owner"
                      }
                      placeholder="Select role..."
                    />
                  </div>
                )}

                {/* Property Details */}
                {showSection("PROPERTY") && (
                  <div className="space-y-5">
                    <ReviewField
                      label="Business / Establishment Name"
                      value={businessInfo?.businessName}
                      icon={Building2}
                      placeholder="e.g. De La Cruz Student Boarding"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ReviewField
                        label="Property Type"
                        value={formatPropertyType(businessInfo?.businessType)}
                        placeholder="Select property type..."
                      />
                      <ReviewField
                        label="Experience Level"
                        value={
                          businessInfo?.yearsExperience === "less-than-1"
                            ? "First-Time Landlord (< 1 year)"
                            : businessInfo?.yearsExperience === "1-3-years"
                            ? "Experienced (1 - 3 years)"
                            : businessInfo?.yearsExperience === "3-5-years"
                            ? "Established (3 - 5 years)"
                            : businessInfo?.yearsExperience === "5-plus-years"
                            ? "Veteran Landlord (5+ years)"
                            : businessInfo?.yearsExperience || "Established"
                        }
                        placeholder="Select experience level..."
                      />
                    </div>
                  </div>
                )}

                {/* Location & Map Preview */}
                {showSection("LOCATION") && (
                  <div className="space-y-5">
                    <ReviewField
                      label="Full Property Address"
                      value={
                        contactInfo?.address ||
                        businessInfo?.address ||
                        "Vicinity near Tarlac Agricultural University, Camiling, Tarlac"
                      }
                      icon={MapPin}
                      placeholder="No address selected..."
                    />

                    <div className="flex flex-col gap-1.5 min-w-0 w-full">
                      <div className="flex items-center justify-between ml-1">
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">
                          Pinned Coordinates Preview
                        </label>
                        {latlng && (
                          <span className="text-[10px] font-bold text-primary dark:text-[#4fa89a] uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-md">
                            {latlng[0]?.toFixed(4)}, {latlng[1]?.toFixed(4)}
                          </span>
                        )}
                      </div>

                      <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden border-2 border-gray-100 dark:border-slate-700/80 shadow-xs relative bg-slate-100 dark:bg-slate-900">
                        <Map
                          center={latlng || TAU_COORDINATES}
                          readonly={true}
                          allowPinDrop={false}
                          title={businessInfo?.businessName || "Property Location"}
                          imageSrc={application?.facadePhotoUrl || undefined}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Face & ID Verification */}
                {showSection("IDENTITY") && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
                    {/* Selfie Field Box */}
                    <div className="flex flex-col gap-1.5 h-full">
                      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">
                        Selfie Photo Verification
                      </label>
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700/80 shadow-xs flex-1 flex flex-col items-center justify-between text-center min-h-[175px]">
                        <div className="flex-1 flex items-center justify-center w-full">
                          <div
                            onClick={() => openPreview(application?.selfieUrl, "Selfie Photo")}
                            className="w-20 h-20 sm:w-22 sm:h-22 rounded-full border-4 border-primary/30 overflow-hidden shadow-md cursor-pointer group relative bg-slate-200 dark:bg-slate-900 transition-transform active:scale-95 my-1"
                          >
                            {application?.selfieUrl ? (
                              <>
                                <SafeImage src={application.selfieUrl} alt="Selfie Photo" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Eye className="text-white" size={20} />
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <User size={28} />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-primary dark:text-[#4fa89a]">
                          <ShieldCheck size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            Selfie Uploaded
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Government ID Field Box */}
                    <div className="flex flex-col gap-1.5 h-full">
                      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">
                        Government Issued ID
                      </label>
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700/80 shadow-xs flex-1 flex flex-col items-center justify-between text-center min-h-[175px]">
                        <div className="flex-1 flex items-center justify-center w-full">
                          <div
                            onClick={() => openPreview(application?.idCardUrl, "Government ID")}
                            className="w-full max-w-[190px] aspect-[1.586/1] rounded-xl border-4 border-primary/30 overflow-hidden shadow-md bg-slate-100 dark:bg-slate-900 cursor-pointer group relative transition-transform active:scale-95 my-1"
                          >
                            {application?.idCardUrl ? (
                              <>
                                <SafeImage src={application.idCardUrl} alt="Government ID" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Eye className="text-white" size={22} />
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <FileText size={28} />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-primary dark:text-[#4fa89a]">
                          <ShieldCheck size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            ID Uploaded
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Photos & Permits */}
                {showSection("PERMITS") && (
                  <div className="space-y-5">
                    {/* Facade Photo Input Representation */}
                    <div className="flex flex-col gap-1.5">
                      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">
                        Building Front View Photo
                      </label>
                      <div
                        onClick={() =>
                          openPreview(application?.facadePhotoUrl, "Building Front View Photo")
                        }
                        className="w-full h-28 sm:h-32 rounded-2xl border-2 border-gray-100 dark:border-slate-700/80 overflow-hidden cursor-pointer group relative bg-slate-100 dark:bg-slate-800 transition-all hover:border-primary"
                      >
                        {application?.facadePhotoUrl ? (
                          <>
                            <SafeImage
                              src={application.facadePhotoUrl}
                              alt="Front View Photo"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex items-center gap-1.5 text-white font-black text-xs uppercase tracking-widest">
                                <Eye size={16} /> View Photo
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 gap-2 font-bold text-xs">
                            <Building2 size={24} /> No photo uploaded
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Permits & Legal Documents List */}
                    <div className="grid grid-cols-1 gap-3">
                      {/* Utility Bill or Business Permit */}
                      <div className="flex flex-col gap-1.5">
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">
                          Primary Verification Document
                        </label>
                        <div
                          onClick={() =>
                            openPreview(
                              application?.businessPermitUrl || application?.additionalDocsUrl,
                              application?.businessPermitUrl
                                ? "Mayor's Business Permit"
                                : "Utility Bill (Electric/Water)"
                            )
                          }
                          className={cn(
                            "w-full rounded-2xl border-2 px-4 py-3.5 flex items-center justify-between transition-all group",
                            application?.businessPermitUrl || application?.additionalDocsUrl
                              ? "bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700/80 cursor-pointer hover:border-primary"
                              : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={cn(
                                "p-2.5 rounded-xl shrink-0",
                                application?.businessPermitUrl || application?.additionalDocsUrl
                                  ? "bg-primary/10 text-primary dark:text-[#4fa89a]"
                                  : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                              )}
                            >
                              <BadgeCheck size={18} />
                            </div>
                            <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                              {application?.businessPermitUrl
                                ? "Mayor's Business Permit"
                                : "Utility Bill (Electric / Water)"}
                            </span>
                          </div>
                          {(application?.businessPermitUrl || application?.additionalDocsUrl) && (
                            <div className="flex items-center gap-1 text-[10px] font-black text-primary dark:text-[#4fa89a] uppercase tracking-widest bg-primary/10 dark:bg-primary/20 px-3 py-1.5 rounded-xl border border-primary/20 shrink-0">
                              <Eye size={12} /> View
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Fire Safety Certificate */}
                      <div className="flex flex-col gap-1.5">
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">
                          Safety Compliance Document
                        </label>
                        <div
                          onClick={() =>
                            openPreview(
                              application?.fireSafetyUrl,
                              "Fire Safety Inspection Certificate"
                            )
                          }
                          className={cn(
                            "w-full rounded-2xl border-2 px-4 py-3.5 flex items-center justify-between transition-all group",
                            application?.fireSafetyUrl
                              ? "bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700/80 cursor-pointer hover:border-primary"
                              : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={cn(
                                "p-2.5 rounded-xl shrink-0",
                                application?.fireSafetyUrl
                                  ? "bg-primary/10 text-primary dark:text-[#4fa89a]"
                                  : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                              )}
                            >
                              <BadgeCheck size={18} />
                            </div>
                            <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                              Fire Safety Inspection Certificate
                            </span>
                          </div>
                          {application?.fireSafetyUrl && (
                            <div className="flex items-center gap-1 text-[10px] font-black text-primary dark:text-[#4fa89a] uppercase tracking-widest bg-primary/10 dark:bg-primary/20 px-3 py-1.5 rounded-xl border border-primary/20 shrink-0">
                              <Eye size={12} /> View
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Data Protection Notice inside Modal */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-amber-900 dark:text-amber-300">
                  <Info size={18} className="shrink-0 text-amber-600 dark:text-amber-400" />
                  <p className="text-[11px] font-medium text-amber-800/90 dark:text-amber-400/90">
                    Your submitted documents are stored safely and only accessible by authorized BoardTAU moderators for verification.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between gap-3 p-3.5 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 sm:flex-none px-5 py-3 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 transition-all cursor-pointer text-center"
                >
                  Close
                </button>

                {isRejected && onStartEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsReviewModalOpen(false);
                      onStartEdit();
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-primary/20 text-center"
                  >
                    <Pencil size={14} />
                    <span>Update & Resubmit</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}

      {/* MEDIA PREVIEW OVERLAY MODAL */}
      <MediaPreviewOverlay
        isOpen={!!preview}
        onClose={() => setPreview(null)}
        images={preview ? [preview.url] : []}
        currentIndex={0}
        title={preview?.title || "Document Preview"}
        isDocument={Boolean(
          preview?.title?.toLowerCase().includes("document") ||
            preview?.title?.toLowerCase().includes("permit") ||
            preview?.title?.toLowerCase().includes("certificate") ||
            preview?.title?.toLowerCase().includes("id")
        )}
      />
    </div>
  );
};

export default HostApplicationStatusMonitor;

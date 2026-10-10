import React from "react";
import { db as prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { decryptEntityIdWithIntegrity } from "@/lib/encryption";
import {
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Calendar,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Award,
  CreditCard,
  Receipt,
  ClipboardCheck,
  KeyRound,
  FileCheck2,
  Home,
  UserCheck,
  SearchX,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import SafeImage from "@/components/common/SafeImage";

export const metadata = {
  title: "Boarding Pass Verification | BoardTAU",
  description: "Official boarding pass verification portal for BoardTAU reservations.",
};

type SlipVerifyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SlipVerifyPage({ params }: SlipVerifyPageProps) {
  const { id } = await params;

  if (!id) {
    return notFound();
  }

  // 1. Decrypt token with integrity verification
  const tokenResult = decryptEntityIdWithIntegrity(id);

  // STATE A: CRYPTOGRAPHIC TAMPER / FORGERY DETECTED
  if (tokenResult.isTampered) {
    return (
      <div className="min-h-screen bg-[#090C12] text-slate-100 flex flex-col items-center justify-between p-4 sm:p-8 relative overflow-hidden font-sans transition-colors duration-300">
        {/* Ambient Pulsing Hazard Background Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-red-600/20 rounded-full blur-[140px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[350px] h-[250px] bg-rose-700/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Brand Header */}
        <header className="w-full max-w-lg flex items-center justify-between py-4 mb-4 relative z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 backdrop-blur-md border border-red-500/20 flex items-center justify-center p-2 shadow-md group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="BoardTAU" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block">BoardTAU</span>
              <span className="text-[10px] font-bold tracking-widest text-red-400 uppercase block">Boarding Pass Security</span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-[11px] font-bold text-red-300 shadow-sm backdrop-blur-md">
            <ShieldAlert size={14} className="text-red-400 animate-pulse" />
            <span>Integrity Alert</span>
          </div>
        </header>

        {/* Main High-Impact Danger Card */}
        <main className="w-full max-w-lg bg-slate-900/90 backdrop-blur-2xl rounded-[32px] overflow-hidden shadow-2xl shadow-red-950/60 border border-red-500/30 relative z-10 transition-all">
          {/* Header Banner - Deep Crimson Gradient */}
          <div className="p-8 sm:p-10 text-center bg-gradient-to-br from-red-900 via-rose-950 to-slate-950 relative overflow-hidden border-b border-red-500/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-black/50 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl bg-red-500/20 text-red-400 border border-red-500/40 backdrop-blur-md flex items-center justify-center mb-4 shadow-xl ring-8 ring-red-500/10">
                <AlertOctagon size={48} className="drop-shadow-md text-red-400 animate-pulse" />
              </div>

              <h1 className="text-2xl font-black text-white tracking-tight mb-1.5 drop-shadow-md">
                BOARDING PASS INTEGRITY COMPROMISED
              </h1>
              <p className="text-red-200/90 text-xs font-semibold max-w-xs mx-auto mb-4 leading-relaxed drop-shadow-sm">
                Cryptographic authentication failed. This QR code or verification link has been altered, forged, or tampered with.
              </p>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-950/80 backdrop-blur-md rounded-full text-red-300 text-[10px] font-black uppercase tracking-widest border border-red-500/40 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                STATUS: FORGERY DETECTED / TAMPERED
              </div>
            </div>
          </div>

          {/* Details Content */}
          <div className="p-6 sm:p-8 space-y-5">
            {/* Warning Alert Banner for Caretakers */}
            <div className="bg-red-950/40 rounded-2xl p-4 border border-red-500/30 space-y-2 text-red-200">
              <div className="flex items-center gap-2 font-bold text-xs text-red-400 uppercase tracking-wider">
                <ShieldAlert size={16} /> Caretaker Action Advisory
              </div>
              <p className="text-xs leading-relaxed text-red-200/90">
                <strong>Do NOT hand over keys or grant room access.</strong> The encrypted verification token presented does not match BoardTAU's authentic digital records.
              </p>
            </div>

            {/* Security Incident Code */}
            <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800 space-y-1 text-slate-300">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                SECURITY INCIDENT REFERENCE
              </span>
              <p className="text-xs font-mono font-bold text-red-400 tracking-wider">
                BTAU_SEC_PASS_TAMPER_DETECTED
              </p>
              <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                System Notice: Cryptographic payload MAC failed integrity validation.
              </p>
            </div>

            {/* Return Action */}
            <div className="pt-2">
              <Link
                href="/"
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 border border-red-500 shadow-lg shadow-red-950/50"
              >
                <Home size={14} /> Return to BoardTAU Home
              </Link>
            </div>
          </div>
        </main>

        <footer className="mt-8 text-center text-xs font-semibold text-slate-500 relative z-10">
          <p>© {new Date().getFullYear()} BoardTAU • Official Boarding Pass Verification Portal</p>
        </footer>
      </div>
    );
  }

  const realReservationId = tokenResult.id || id;
  const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(realReservationId);

  // 2. Fetch reservation from database
  const reservation = isValidObjectId
    ? await prisma.reservation.findUnique({
        where: {
          id: realReservationId,
        },
        select: {
          id: true,
          status: true,
          startDate: true,
          endDate: true,
          durationInDays: true,
          occupantsCount: true,
          totalPrice: true,
          paymentMethod: true,
          paymentReference: true,
          guestName: true,
          inquiry: {
            select: {
              paymentMethod: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
          room: {
            select: {
              name: true,
              price: true,
              roomTypeDefinition: {
                select: {
                  name: true,
                },
              },
            },
          },
          listing: {
            select: {
              title: true,
              imageSrc: true,
              region: true,
              country: true,
            },
          },
        },
      })
    : null;

  // STATE B: RESERVATION NOT FOUND IN DATABASE
  if (!reservation) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden text-slate-100 font-sans">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Header */}
        <header className="w-full max-w-md flex items-center justify-between py-4 mb-6 relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center p-2 shadow-md">
              <img src="/logo.png" alt="BoardTAU" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block">BoardTAU</span>
              <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase block">Pass Verification</span>
            </div>
          </Link>
        </header>

        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-8 text-center shadow-2xl border border-amber-500/20 relative z-10">
          <div className="w-20 h-20 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-amber-500/20">
            <SearchX size={44} />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-300 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 border border-amber-500/20">
            <AlertTriangle size={12} /> STATUS: UNREGISTERED / INVALID PASS
          </div>

          <h1 className="text-2xl font-black text-white mb-2 tracking-tight">BOARDING PASS NOT FOUND</h1>
          <p className="text-xs font-medium text-slate-400 mb-6 leading-relaxed">
            This reservation pass code could not be found in the BoardTAU database. The pass may have expired, been cancelled, or never existed in official records.
          </p>

          <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-left mb-6 space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">QUERY REFERENCE</span>
            <p className="text-xs font-mono text-slate-300 truncate">
              {realReservationId || id}
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all border border-primary/30 shadow-lg shadow-primary/20 dark:shadow-primary/30"
          >
            <Home size={14} /> Return to BoardTAU Home
          </Link>
        </div>

        <footer className="mt-8 text-center text-xs font-semibold text-slate-500 relative z-10">
          <p>© {new Date().getFullYear()} BoardTAU • Official Boarding Pass Verification Portal</p>
        </footer>
      </div>
    );
  }

  // STATE C: OFFICIAL VERIFIED BOARDING PASS
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return {
          gradient: "from-purple-600 via-indigo-600 to-purple-800",
          ringColor: "ring-purple-400/40",
          iconBg: "bg-purple-500/30 text-purple-200 border-purple-400/40",
          title: "Stay Completed",
          subtitle: "This reservation has been successfully completed and archived in official records.",
          badgeText: "STATUS: COMPLETED STAY",
          icon: CheckCircle2,
          isValid: true,
        };
      case "CHECKED_IN":
        return {
          gradient: "from-[#2f7d6d] via-teal-600 to-emerald-800",
          ringColor: "ring-teal-400/40",
          iconBg: "bg-teal-500/30 text-teal-200 border-teal-400/40",
          title: "Checked In (Active Stay)",
          subtitle: "Tenant is currently checked in and residing at this verified property.",
          badgeText: "STATUS: CHECKED IN",
          icon: CheckCircle2,
          isValid: true,
        };
      case "RESERVED":
        return {
          gradient: "from-emerald-600 via-teal-600 to-emerald-800",
          ringColor: "ring-emerald-400/40",
          iconBg: "bg-emerald-500/30 text-emerald-200 border-emerald-400/40",
          title: "Confirmed Booking",
          subtitle: "Valid reservation confirmed and fully secured in BoardTAU database. Ready for check-in.",
          badgeText: "STATUS: CONFIRMED BOOKING",
          icon: CheckCircle2,
          isValid: true,
        };
      case "CANCELLED":
        return {
          gradient: "from-rose-600 via-red-600 to-pink-800",
          ringColor: "ring-rose-400/40",
          iconBg: "bg-rose-500/30 text-rose-200 border-rose-400/40",
          title: "Booking Cancelled",
          subtitle: "This reservation pass was cancelled and is no longer active. Do not grant check-in.",
          badgeText: "STATUS: CANCELLED",
          icon: XCircle,
          isValid: false,
        };
      case "EXPIRED":
        return {
          gradient: "from-slate-700 via-slate-800 to-slate-900",
          ringColor: "ring-slate-500/40",
          iconBg: "bg-slate-600/30 text-slate-300 border-slate-500/40",
          title: "Pass Expired",
          subtitle: "This reservation pass has expired and the move-in window has closed.",
          badgeText: "STATUS: EXPIRED",
          icon: XCircle,
          isValid: false,
        };
      default:
        return {
          gradient: "from-amber-600 via-orange-600 to-amber-800",
          ringColor: "ring-amber-400/40",
          iconBg: "bg-amber-500/30 text-amber-200 border-amber-400/40",
          title: "Reservation Record",
          subtitle: `Current Status: ${status.replace(/_/g, " ")}`,
          badgeText: `STATUS: ${status}`,
          icon: CheckCircle2,
          isValid: true,
        };
    }
  };

  const statusConfig = getStatusConfig(reservation.status);
  const StatusIcon = statusConfig.icon;

  // Tenant display name
  let rawName = (reservation.guestName || reservation.user?.name || "Verified Tenant").trim();
  let tenantName = rawName;
  const nameParts = rawName.split(" ");
  if (nameParts.length > 1) {
    tenantName = `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const location = [reservation.listing?.region, reservation.listing?.country].filter(Boolean).join(", ") || "Camiling, Tarlac, Philippines";
  const refCode = (reservation.id || "").slice(-8).toUpperCase();

  // Financial details
  const rawMethod = (reservation.paymentMethod || reservation.inquiry?.paymentMethod || "").toUpperCase();
  let displayPaymentMethod = "Online Payment";
  if (["STRIPE", "CREDIT_CARD", "CARD"].includes(rawMethod)) displayPaymentMethod = "Credit / Debit Card (Stripe)";
  else if (rawMethod === "GCASH") displayPaymentMethod = "GCash E-Wallet";
  else if (rawMethod === "MAYA") displayPaymentMethod = "Maya Wallet";
  else if (rawMethod === "CASH") displayPaymentMethod = "Cash Payment";
  else if (rawMethod === "BANK_TRANSFER") displayPaymentMethod = "Bank Transfer";

  const displayPaymentReference = reservation.paymentReference || `REF-${refCode}`;
  const totalAmountStr = `PHP ${Number(reservation.totalPrice || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-[#0B0F19] text-gray-900 dark:text-slate-100 flex flex-col items-center justify-between p-4 sm:p-8 relative overflow-hidden font-sans transition-colors duration-300">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#2f7d6d]/15 via-teal-600/10 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Standalone Brand Navigation Header */}
      <header className="w-full max-w-lg flex items-center justify-between py-4 mb-4 relative z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-white dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/15 flex items-center justify-center p-2 shadow-md group-hover:scale-105 transition-transform">
            <img src="/logo.png" alt="BoardTAU" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-gray-900 dark:text-white block">BoardTAU</span>
            <span className="text-[10px] font-bold tracking-widest text-[#2f7d6d] uppercase block">Official Pass Verification</span>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 text-[11px] font-bold text-gray-700 dark:text-slate-300 shadow-sm backdrop-blur-md">
          <ShieldCheck size={14} className="text-[#2f7d6d]" />
          <span>Verified System</span>
        </div>
      </header>

      {/* Main Executive Boarding Pass Card */}
      <main className="w-full max-w-lg bg-white dark:bg-slate-900/90 backdrop-blur-2xl rounded-[32px] overflow-hidden shadow-xl dark:shadow-2xl border border-gray-200/80 dark:border-slate-800 relative z-10 transition-all">
        {/* Dynamic Status Banner Header */}
        <div className={`p-8 sm:p-10 text-center bg-gradient-to-br ${statusConfig.gradient} relative overflow-hidden border-b border-white/10`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-black/30 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-20 h-20 rounded-3xl ${statusConfig.iconBg} border backdrop-blur-md flex items-center justify-center mb-4 shadow-xl ring-8 ${statusConfig.ringColor} transition-transform hover:scale-105`}>
              <StatusIcon size={44} className="drop-shadow-md text-white" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2 drop-shadow-md">
              {statusConfig.title}
            </h1>
            <p className="text-white/95 text-xs font-semibold max-w-xs mx-auto mb-4 leading-relaxed drop-shadow-sm">
              {statusConfig.subtitle}
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/30 backdrop-blur-md rounded-full text-white text-[11px] font-black uppercase tracking-widest border border-white/25 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {statusConfig.badgeText}
            </div>
          </div>
        </div>

        {/* Verification Details Content */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Tenant Details Card */}
          <div className="bg-gray-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-gray-200/80 dark:border-slate-800/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#2f7d6d]/10 dark:bg-[#2f7d6d]/20 text-[#2f7d6d] border border-[#2f7d6d]/30 flex items-center justify-center font-black text-lg shrink-0">
                {tenantName.charAt(0)}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400 block mb-0.5">
                  REGISTERED TENANT
                </span>
                <p className="text-base font-bold text-gray-900 dark:text-white capitalize">{tenantName}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-slate-400">{reservation.user?.email || "Verified Student Account"}</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider shrink-0">
              <Award size={12} /> Verified
            </div>
          </div>

          {/* Property & Room Details Card */}
          <div className="bg-gray-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-gray-200/80 dark:border-slate-800/80 space-y-3.5">
            <div className="flex items-start gap-3.5">
              <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-slate-800 border border-gray-300 dark:border-slate-700/80 overflow-hidden shrink-0 relative">
                <SafeImage
                  src={reservation.listing?.imageSrc || "/images/placeholder.jpg"}
                  alt={reservation.listing?.title || "Property"}
                  unoptimized={true}
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400 block mb-0.5">
                  LEASED PREMISES
                </span>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {reservation.listing?.title || "Boarding Property"}
                </h3>
                <p className="text-xs font-medium text-gray-500 dark:text-slate-400 flex items-center gap-1 mt-1 truncate">
                  <MapPin size={12} className="text-[#2f7d6d] shrink-0" />
                  <span className="truncate">{location}</span>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-[#2f7d6d]" />
                <span className="font-bold text-gray-900 dark:text-slate-200">
                  {reservation.room?.name || "Room Assignment"}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-[#2f7d6d] dark:text-teal-300 font-bold text-[10px] uppercase tracking-wider border border-gray-200 dark:border-slate-700 shadow-sm">
                {reservation.room?.roomTypeDefinition?.name || "Hostel Suite"}
              </span>
            </div>
          </div>

          {/* Stay Schedule Card */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-gray-200/80 dark:border-slate-800/80">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                <Calendar size={12} className="text-[#2f7d6d]" /> Move-In / Check-In
              </span>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{formatDate(reservation.startDate)}</p>
              <p className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 mt-1">Standard 2:00 PM</p>
            </div>

            <div className="bg-gray-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-gray-200/80 dark:border-slate-800/80">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                <Calendar size={12} className="text-[#2f7d6d]" /> Move-Out / Check-Out
              </span>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{formatDate(reservation.endDate)}</p>
              <p className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 mt-1">
                {reservation.durationInDays || 1} Nights Stay
              </p>
            </div>
          </div>

          {/* Payment & Financial Settlement Card */}
          <div className="bg-gray-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-gray-200/80 dark:border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400 flex items-center gap-1.5">
                <Receipt size={13} className="text-[#2f7d6d]" /> PAYMENT SETTLEMENT
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                PAID IN FULL
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div>
                <span className="text-[10px] text-gray-500 dark:text-slate-400 block">Total Billed & Paid</span>
                <span className="font-bold text-gray-900 dark:text-white text-sm">{totalAmountStr}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 dark:text-slate-400 block">Balance Due</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">PHP 0.00</span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200/80 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-gray-600 dark:text-slate-400">
              <span className="flex items-center gap-1 truncate">
                <CreditCard size={12} className="text-[#2f7d6d] shrink-0" />
                <span className="truncate">{displayPaymentMethod}</span>
              </span>
              <span className="font-mono text-[10px] font-bold text-gray-500 dark:text-slate-400 shrink-0">
                {displayPaymentReference}
              </span>
            </div>
          </div>

          {/* Caretaker Check-In Guidance Checklist */}
          <div className="bg-[#2f7d6d]/5 dark:bg-[#2f7d6d]/10 rounded-2xl p-4 border border-[#2f7d6d]/20 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2f7d6d] dark:text-teal-300 uppercase tracking-wider">
              <ClipboardCheck size={15} /> Caretaker Arrival Checklist
            </div>
            <ul className="text-xs text-gray-700 dark:text-slate-300 space-y-1.5 leading-relaxed">
              <li className="flex items-center gap-2">
                <UserCheck size={13} className="text-[#2f7d6d] shrink-0" />
                <span>Verify student identification card upon arrival.</span>
              </li>
              <li className="flex items-center gap-2">
                <KeyRound size={13} className="text-[#2f7d6d] shrink-0" />
                <span>Hand over room key or keycard for {reservation.room?.name || "assigned room"}.</span>
              </li>
              <li className="flex items-center gap-2">
                <FileCheck2 size={13} className="text-[#2f7d6d] shrink-0" />
                <span>Confirm house rules, curfew schedule, and emergency contacts.</span>
              </li>
            </ul>
          </div>

          {/* Monospace Booking Reference Card */}
          <div className="bg-gray-50 dark:bg-slate-950/90 rounded-2xl p-4 border border-gray-200/80 dark:border-slate-800 text-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400 block">
              AUTHENTICATED BOOKING REFERENCE
            </span>
            <p className="text-base font-black tracking-widest text-[#2f7d6d] font-mono">
              REF-{refCode}
            </p>
            <p className="text-[10px] font-medium text-gray-500 dark:text-slate-500">
              Official Digital Record Encrypted & Verified by BoardTAU Security
            </p>
          </div>

          {/* Action Link Back */}
          <div className="pt-2">
            <Link
              href="/"
              className="w-full py-3.5 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 border border-primary/30 shadow-lg shadow-primary/25 dark:shadow-primary/30"
            >
              <Home size={14} /> Return to BoardTAU Home
            </Link>
          </div>
        </div>
      </main>

      {/* Standalone Minimalist Footer */}
      <footer className="mt-8 text-center text-xs font-semibold text-gray-400 dark:text-slate-500 relative z-10">
        <p>© {new Date().getFullYear()} BoardTAU • Official Boarding Pass Verification Portal</p>
      </footer>
    </div>
  );
}

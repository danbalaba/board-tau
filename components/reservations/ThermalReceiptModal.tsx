"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Printer, RotateCcw, CheckCircle2, Copy, Check } from "lucide-react";
import { generateConfirmationSlipPDF } from "@/utils/slipGenerator";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import { encryptEntityId } from "@/lib/encryption";
import { cn } from "@/utils/helper";
import QRCode from "qrcode";
import { generateCode128SvgDataUrl } from "@/utils/barcode";

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: any;
  tenantName?: string;
  tenantEmail?: string;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  isOpen,
  onClose,
  reservation,
  tenantName = "Tenant Guest",
  tenantEmail = "tenant@example.com",
}) => {
  const responsiveToast = useResponsiveToast();
  const [mounted, setMounted] = useState(false);
  const [printKey, setPrintKey] = useState(0);
  const [isPrintingDone, setIsPrintingDone] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset container scroll position when printing starts
  useEffect(() => {
    if (!isOpen) return;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isOpen, printKey]);

  // Lock background scrolling completely when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isOpen]);

  // Generate QR Code on mount/reservation change
  useEffect(() => {
    if (!isOpen || !reservation?.id) return;

    let isSubscribed = true;
    const generateQr = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL ||
          process.env.NEXTAUTH_URL ||
          (typeof window !== "undefined" ? window.location.origin : "https://board-tau-rho.vercel.app");
        const verifyUrl = `${baseUrl}/verify/slip/${encryptEntityId(reservation.id)}`;
        const url = await QRCode.toDataURL(verifyUrl, {
          margin: 1,
          width: 240,
          color: {
            dark: "#111827",
            light: "#FFFFFF",
          },
        });
        if (isSubscribed) {
          setQrCodeUrl(url);
        }
      } catch (err) {
        console.error("Failed to generate QR code for preview:", err);
      }
    };

    generateQr();
    return () => {
      isSubscribed = false;
    };
  }, [isOpen, reservation?.id]);

  // Reset printing animation state whenever opened
  useEffect(() => {
    if (isOpen) {
      setIsPrintingDone(false);
      setPrintKey((prev) => prev + 1);
    }
  }, [isOpen]);

  const rawResId = String(reservation?.id || "BOARDING-PASS");
  const refCode = rawResId.slice(-8).toUpperCase();
  const resStatus = String(reservation?.status || "RESERVED").toUpperCase();
  const barcodeValue = `RES-${refCode}`;

  const barcodeDataUrl = useMemo(() => {
    return generateCode128SvgDataUrl(barcodeValue, {
      height: 44,
      barColor: "#111827",
      bgColor: "transparent",
      quietZoneModules: 10,
    });
  }, [barcodeValue]);

  const formattedDates = useMemo(() => {
    if (!reservation) return { moveIn: "", moveOut: "", issuedDate: "", issuedTime: "" };
    const now = new Date();
    return {
      issuedDate: now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      issuedTime: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      moveIn: new Date(reservation.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      moveOut: new Date(reservation.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    };
  }, [reservation]);

  const propTitle = reservation?.listing?.title || reservation?.listingTitle || "Boarding House Property";
  const roomName = reservation?.room?.name || "Selected Room";
  const roomType =
    reservation?.room?.roomType ||
    reservation?.room?.roomTypeDefinition?.name ||
    reservation?.listing?.propertyType?.name ||
    "Standard Unit";

  const totalBillStr = `PHP ${Number(reservation?.totalPrice || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const paymentMethodDisplay = useMemo(() => {
    const raw = (reservation?.paymentMethod || reservation?.inquiry?.paymentMethod || "").toUpperCase();
    if (raw === "STRIPE" || raw === "CREDIT_CARD" || raw === "CARD") return "Credit/Debit Card (Stripe)";
    if (raw === "GCASH") return "GCash E-Wallet";
    if (raw === "MAYA") return "Maya Wallet";
    if (raw === "CASH") return "Cash Payment";
    if (raw === "BANK_TRANSFER") return "Bank Transfer";
    return "Online Payment";
  }, [reservation?.paymentMethod, reservation?.inquiry?.paymentMethod]);

  const paymentRefDisplay = reservation?.paymentReference?.trim() || `REF-${refCode}`;

  const statusLabel = useMemo(() => {
    switch (resStatus) {
      case "COMPLETED":
        return "COMPLETED STAY";
      case "CHECKED_IN":
        return "CHECKED IN";
      case "CANCELLED":
        return "CANCELLED";
      case "PENDING_PAYMENT":
        return "PAYMENT PENDING";
      case "RESERVED":
      default:
        return "RESERVATION CONFIRMED";
    }
  }, [resStatus]);

  const handleDownload = async () => {
    setIsDownloading(true);
    const toastId = responsiveToast.loading("Preparing boarding slip PDF...");
    try {
      await generateConfirmationSlipPDF(reservation, tenantName, tenantEmail);
      responsiveToast.success("Confirmation slip downloaded!", { id: toastId });
    } catch (e) {
      responsiveToast.error("Failed to download confirmation slip.", { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReprint = () => {
    setIsPrintingDone(false);
    setPrintKey((prev) => prev + 1);
  };

  const handleCopyRef = async () => {
    try {
      await navigator.clipboard.writeText(refCode);
      setCopied(true);
      responsiveToast.success(`Copied booking reference #${refCode}!`);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      responsiveToast.error("Failed to copy reference.");
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[25000] flex items-center justify-center p-0 sm:p-5 bg-slate-900/50 dark:bg-slate-950/85 backdrop-blur-md overflow-hidden select-none transition-colors duration-300"
          onWheel={(e) => {
            // Prevent mouse wheel on background blur from scrolling underlying page
            if (e.target === e.currentTarget) {
              e.preventDefault();
            }
          }}
        >
          {/* Backdrop Click Dismiss */}
          <div className="fixed inset-0 -z-10" onClick={onClose} />

          {/* Modal Container: Fullscreen on mobile, elegant dialog on desktop */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-full h-[100dvh] sm:h-[92vh] sm:max-h-[820px] sm:max-w-[500px] flex flex-col justify-between overflow-hidden bg-slate-900/30 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. TOP HEADER & PRINTER SLOT (Always Fixed / Pinned) */}
            <div className="shrink-0 w-full z-20 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-0 sm:pt-0">
              {/* Friendly Title Bar */}
              <div className="w-full flex items-center justify-between pb-2 sm:pb-3 px-1 text-slate-800 dark:text-white transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tracking-wide text-slate-900 dark:text-zinc-100 drop-shadow-sm">
                    Confirmation Pass
                  </span>
                  <span
                    className={cn(
                      "text-[11px] font-semibold px-2 py-0.5 rounded-md transition-colors",
                      isPrintingDone
                        ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/60"
                        : "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/60 animate-pulse"
                    )}
                  >
                    {isPrintingDone ? "Ready" : "Printing..."}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full bg-slate-200/80 hover:bg-slate-300/80 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-colors shadow-sm"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Simplified Printer Head Mouth */}
              <div className="w-full bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-zinc-800 dark:to-zinc-900 border border-slate-200/90 dark:border-zinc-700/80 rounded-t-2xl px-4 sm:px-5 py-2.5 sm:py-3 shadow-xl dark:shadow-2xl relative transition-colors">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-300 font-semibold tracking-wide mb-2">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={15} className={isPrintingDone ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500 dark:text-amber-400 animate-pulse"} />
                    <span>{isPrintingDone ? "Official Boarding Slip" : "Thermal Print Head Active..."}</span>
                  </span>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold font-mono">BTAU-POS</span>
                </div>
                {/* Paper Dispenser Slit with Active Thermal Print Head */}
                <div className="h-3 w-full bg-slate-900 dark:bg-black rounded-full border border-slate-300/70 dark:border-zinc-950 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] relative overflow-hidden flex items-center justify-center">
                  {!isPrintingDone ? (
                    <motion.div
                      className="w-20 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399]"
                      animate={{ x: [-160, 160] }}
                      transition={{ repeat: Infinity, duration: 0.45, ease: "linear" }}
                    />
                  ) : (
                    <div className="w-3/4 h-[1.5px] bg-emerald-500/25" />
                  )}
                </div>
              </div>
            </div>

            {/* 2. SCROLLABLE RECEIPT AREA (Smooth Scroll between Slot & Sticky Toolbar) */}
            <div
              ref={scrollContainerRef}
              className={cn(
                "flex-1 min-h-0 py-2 px-3 sm:px-0 flex justify-center relative custom-scrollbar",
                isPrintingDone ? "overflow-y-auto" : "overflow-hidden"
              )}
            >
              {/* Hardware Depth Shadow directly beneath the dispenser slot */}
              <div className="sticky top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/15 via-black/5 to-transparent dark:from-black/30 dark:via-black/10 pointer-events-none z-30 shrink-0" />

              <motion.div
                key={printKey}
                initial={{ y: "-100%" }}
                animate={{
                  y: [
                    "-100%", // 0.0s: fully inside dispenser slot
                    "-80%",  // 0.7s: Header and store branding emerges
                    "-80%",  // 0.9s: Micro-pause (thermal head line feed)
                    "-62%",  // 1.6s: Leased premises & room emerge
                    "-62%",  // 1.8s: Micro-pause
                    "-43%",  // 2.5s: Stay schedule & dates emerge
                    "-43%",  // 2.7s: Micro-pause
                    "-24%",  // 3.4s: Financial breakdown & paid in full
                    "-24%",  // 3.6s: Micro-pause
                    "-6%",   // 4.3s: Caretaker guidelines & QR code
                    "-6%",   // 4.45s: Micro-pause
                    "0%",    // 4.9s: Barcode & footer emerge completely
                    "1.2%",  // 5.05s: Cutter blade mechanical snip jolt
                    "0%",    // 5.2s: Paper settles smoothly into place
                  ],
                }}
                transition={{
                  duration: 5.2,
                  times: [
                    0,
                    0.135,
                    0.173,
                    0.308,
                    0.346,
                    0.481,
                    0.519,
                    0.654,
                    0.692,
                    0.827,
                    0.856,
                    0.942,
                    0.971,
                    1.0,
                  ],
                  ease: "easeInOut",
                }}
                onAnimationComplete={() => setIsPrintingDone(true)}
                ref={receiptRef}
                id="thermal-receipt-paper"
                className="w-full max-w-[450px] bg-[#FEFEFD] text-zinc-900 font-mono shadow-[0_20px_45px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.55)] border-x border-zinc-200 relative leading-relaxed my-auto overflow-hidden will-change-transform"
              >
                {/* Faint Official BoardTAU Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
                  <div className="w-64 h-64 sm:w-72 sm:h-72 opacity-[0.09] flex items-center justify-center">
                    <img
                      src="/BoardTAU_Main_Logo.png"
                      alt="BoardTAU Watermark"
                      className="w-full h-full object-contain grayscale contrast-115"
                    />
                  </div>
                </div>

                {/* Serrated Top Edge */}
                <div className="w-full overflow-hidden leading-none -mt-1 text-zinc-200 select-none relative z-10">
                  <svg viewBox="0 0 450 8" className="w-full h-2.5 fill-[#FEFEFD] stroke-zinc-300 stroke-[0.5]">
                    <pattern id="sawtooth-top" width="12" height="8" patternUnits="userSpaceOnUse">
                      <polygon points="0,0 6,7 12,0" fill="#FEFEFD" stroke="#E4E4E7" strokeWidth="0.5" />
                    </pattern>
                    <rect width="450" height="8" fill="url(#sawtooth-top)" />
                  </svg>
                </div>

                <div className="px-5 sm:px-7 py-4 space-y-3.5 relative z-10">
                  {/* Store Header */}
                  <div className="text-center space-y-1">
                    <h2 className="text-xl font-black tracking-widest text-black">
                      B O A R D T A U
                    </h2>
                    <p className="text-[11px] font-bold tracking-wider text-zinc-600">
                      HOUSING & ACCOMMODATION
                    </p>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      CAMILING, TARLAC, PHILIPPINES
                    </p>
                  </div>

                  {/* Double Divider */}
                  <div className="border-t-2 border-b-2 border-black py-1 text-center">
                    <p className="text-xs font-black tracking-wider uppercase text-black">
                      OFFICIAL BOARDING PASS
                    </p>
                    <p className="text-[10.5px] font-bold text-zinc-700">
                      & CONFIRMATION SLIP
                    </p>
                  </div>

                  {/* Receipt Meta */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-medium">DATE/TIME :</span>
                      <span className="font-bold text-zinc-800">{formattedDates.issuedDate} {formattedDates.issuedTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-medium">BOOKING REF:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-black">#{refCode}</span>
                        <button
                          onClick={handleCopyRef}
                          className="p-1 hover:bg-zinc-200/80 rounded text-zinc-500 hover:text-black transition-colors"
                          title="Copy booking reference"
                        >
                          {copied ? (
                            <Check size={13} className="text-emerald-600" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-0.5">
                      <span className="text-zinc-500 font-medium">STATUS    :</span>
                      <span className="font-extrabold text-[10px] bg-zinc-900 text-white px-2 py-0.5 rounded-sm">
                        {statusLabel}
                      </span>
                    </div>
                  </div>

                  {/* Tenant Details */}
                  <div className="border-t border-dashed border-zinc-400 pt-2.5 space-y-1 text-xs">
                    <p className="font-black text-black tracking-wider text-[11.5px]">
                      TENANT / GUEST DETAILS
                    </p>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">NAME   :</span>
                      <span className="font-bold text-right truncate max-w-[240px] text-black">{tenantName.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">EMAIL  :</span>
                      <span className="text-zinc-700 text-right truncate max-w-[240px] font-medium">{tenantEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">GUESTS :</span>
                      <span className="font-bold">{reservation?.occupantsCount || 1} PERSON(S)</span>
                    </div>
                  </div>

                  {/* Leased Premises */}
                  <div className="border-t border-dashed border-zinc-400 pt-2.5 space-y-1 text-xs">
                    <p className="font-black text-black tracking-wider text-[11.5px]">
                      LEASED PREMISES & UNIT
                    </p>
                    <div className="flex justify-between items-start gap-3">
                      <span className="text-zinc-500 shrink-0">PROPERTY:</span>
                      <span className="font-bold text-right text-[11px] leading-tight text-black">{propTitle.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">ROOM    :</span>
                      <span className="font-bold text-black">{roomName.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">UNIT TYP:</span>
                      <span className="text-zinc-700 font-medium">{roomType.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Schedule Itinerary */}
                  <div className="border-t border-dashed border-zinc-400 pt-2.5 space-y-1 text-xs">
                    <p className="font-black text-black tracking-wider text-[11.5px]">
                      STAY SCHEDULE & ITINERARY
                    </p>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">CHECK-IN :</span>
                      <span className="font-bold text-black">{formattedDates.moveIn} (2:00 PM)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">CHECK-OUT:</span>
                      <span className="font-bold text-black">{formattedDates.moveOut} (12:00 PM)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">DURATION :</span>
                      <span className="font-bold text-emerald-800">{reservation?.durationInDays || 1} NIGHTS</span>
                    </div>
                  </div>

                  {/* Payment Breakdown */}
                  <div className="border-t border-zinc-500 pt-2.5 space-y-1.5 text-xs">
                    <p className="font-black text-black tracking-wider text-[11.5px]">
                      PAYMENT SUMMARY & RECEIPT
                    </p>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Holding Fee / Bill</span>
                      <span className="font-bold text-black">{totalBillStr}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500">Stay Duration ({reservation?.durationInDays || 1} Nights)</span>
                      <span className="font-semibold text-zinc-500">INCL.</span>
                    </div>
                    <div className="border-t border-dashed border-zinc-400 pt-1 flex justify-between font-black text-black text-sm">
                      <span>TOTAL BILLED</span>
                      <span>{totalBillStr}</span>
                    </div>
                    <div className="flex justify-between font-bold text-zinc-800">
                      <span>AMOUNT PAID</span>
                      <span>{totalBillStr}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500 text-[11px]">
                      <span>BALANCE DUE</span>
                      <span>PHP 0.00</span>
                    </div>
                    <div className="pt-1 text-[10.5px] text-zinc-700 space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">PAY METHOD :</span>
                        <span className="font-semibold text-right">{paymentMethodDisplay}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">PAY REF NO :</span>
                        <span className="font-mono text-right">{paymentRefDisplay}</span>
                      </div>
                    </div>
                  </div>

                  {/* Caretaker Guidelines */}
                  <div className="border-t border-dashed border-zinc-400 pt-2.5 space-y-1 text-[10px] text-zinc-700">
                    <p className="font-black text-black tracking-wider text-[11px]">
                      CHECK-IN GUIDELINES
                    </p>
                    <p>[1] Present this slip (screen or paper) upon arrival.</p>
                    <p>[2] Present valid Student / Gov ID for verification.</p>
                    <p>[3] Standard check-in starts at 2:00 PM.</p>
                    <p>[4] Retain reference #{refCode} for your record.</p>
                  </div>

                  {/* QR Code Verification Box */}
                  <div className="border-t-2 border-black pt-2.5 text-center space-y-1.5">
                    <p className="text-[10px] font-black tracking-wider text-black">
                      DIGITAL SCAN VERIFICATION
                    </p>
                    <div className="flex justify-center py-1">
                      {qrCodeUrl ? (
                        <div className="p-1.5 bg-white border border-zinc-300 rounded shadow-sm">
                          <img src={qrCodeUrl} alt="Verification QR Code" className="w-28 h-28 object-contain" />
                        </div>
                      ) : (
                        <div className="w-28 h-28 bg-zinc-100 flex items-center justify-center text-xs text-zinc-400">
                          Generating QR...
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-black tracking-widest text-black">
                      * * {refCode} * *
                    </p>
                    <p className="text-[9.5px] text-zinc-500 tracking-wider">
                      SCAN TO VERIFY WITH CARETAKER
                    </p>

                    {/* Real Standards-Compliant Code 128 Barcode */}
                    <div className="pt-1.5 flex flex-col items-center">
                      <div className="w-56 h-9 flex items-center justify-center overflow-hidden px-1">
                        <img
                          src={barcodeDataUrl}
                          alt={`Barcode ${barcodeValue}`}
                          className="w-full h-full object-contain filter contrast-125"
                        />
                      </div>
                      <p className="text-[10px] font-bold text-zinc-800 tracking-wider mt-1 font-mono">
                        *{barcodeValue}*
                      </p>
                    </div>

                    <div className="pt-1 text-[9px] text-zinc-500 space-y-0.5">
                      <p>AUTHENTIC DIGITAL RECORD</p>
                      <p className="font-bold text-zinc-700">*** THANK YOU FOR CHOOSING BOARDTAU ***</p>
                    </div>
                  </div>
                </div>

                {/* Serrated Bottom Edge */}
                <div className="w-full overflow-hidden leading-none -mb-1 text-zinc-200 select-none">
                  <svg viewBox="0 0 450 8" className="w-full h-2.5 fill-[#FEFEFD] stroke-zinc-300 stroke-[0.5]">
                    <pattern id="sawtooth-bottom" width="12" height="8" patternUnits="userSpaceOnUse">
                      <polygon points="0,8 6,1 12,8" fill="#FEFEFD" stroke="#E4E4E7" strokeWidth="0.5" />
                    </pattern>
                    <rect width="450" height="8" fill="url(#sawtooth-bottom)" />
                  </svg>
                </div>
              </motion.div>
            </div>

            {/* 3. STICKY / PINNED BOTTOM ACTION TOOLBAR (Always Visible!) */}
            <div className="shrink-0 w-full pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:pt-3 px-3 sm:px-0 z-20">
              <div className="w-full bg-white/95 dark:bg-zinc-900/95 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-2.5 sm:p-3 shadow-xl dark:shadow-2xl flex items-center justify-between gap-1.5 sm:gap-2.5 backdrop-blur-md transition-colors">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex-1 py-2.5 px-3 sm:px-4 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 transition-all active:scale-95 disabled:opacity-50 min-w-0"
                >
                  <Download size={15} className="shrink-0" />
                  <span className="truncate">{isDownloading ? "Saving..." : "PDF Slip"}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="py-2.5 px-2.5 sm:px-4 bg-slate-100 hover:bg-slate-200/90 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 border border-slate-200 dark:border-zinc-700/80 shadow-xs transition-all active:scale-95 shrink-0"
                  title="Print Slip"
                >
                  <Printer size={15} className="shrink-0" />
                  <span>Print</span>
                </button>

                <button
                  onClick={handleReprint}
                  className="py-2.5 px-2.5 sm:px-4 bg-slate-100 hover:bg-slate-200/90 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 border border-slate-200 dark:border-zinc-700/80 shadow-xs transition-all active:scale-95 shrink-0"
                  title="Replay printing animation"
                >
                  <RotateCcw size={15} className="shrink-0" />
                  <span>Reprint</span>
                </button>

                <button
                  onClick={onClose}
                  className="py-2.5 px-3 sm:px-4 bg-slate-100 hover:bg-slate-200/90 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white rounded-xl text-xs sm:text-sm font-bold border border-slate-200 dark:border-transparent transition-all active:scale-95 shrink-0"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ThermalReceiptModal;

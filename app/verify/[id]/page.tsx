import React from "react";
import { db as prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { CheckCircle, XCircle, User, Calendar, Home, MapPin, Search } from "lucide-react";
import Link from "next/link";
import SafeImage from "@/components/common/SafeImage";

export const metadata = {
  title: "Boarding Pass Verification | BoardTAU",
  description: "Verify a BoardTAU reservation.",
};

type VerifyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { id } = await params;

  if (!id) {
    return notFound();
  }

  // Fetch only necessary non-sensitive data
  const reservation = await prisma.reservation.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      status: true,
      startDate: true,
      endDate: true,
      durationInDays: true,
      occupantsCount: true,
      guestName: true,
      user: {
        select: {
          name: true,
        },
      },
      room: {
        select: {
          name: true,
          roomType: true,
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
  });

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-8 text-center shadow-xl border border-gray-100 dark:border-gray-800">
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <XCircle size={40} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Invalid Pass</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8">
            This reservation ID does not exist in our system. The pass may be fake or expired.
          </p>
          <Link
            href="/"
            className="block w-full py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const isValid = ["RESERVED", "CHECKED_IN", "COMPLETED"].includes(reservation.status);
  
  // Format tenant name (First Name + Last Initial for privacy if we only have full name)
  let tenantName = reservation.guestName || reservation.user?.name || "Guest";
  const nameParts = tenantName.split(" ");
  if (nameParts.length > 1) {
    tenantName = `${nameParts[0]} ${nameParts[nameParts.length - 1].charAt(0)}.`;
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const location = [reservation.listing.region, reservation.listing.country].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center p-4 sm:p-8">
      {/* Brand Header */}
      <div className="w-full max-w-md flex justify-center mb-8">
         <div className="text-xl font-black tracking-widest uppercase text-primary flex items-center gap-2">
            BoardTAU <span className="text-gray-300 dark:text-gray-700">|</span> <span className="text-sm text-gray-400">Verify</span>
         </div>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
        
        {/* Status Header */}
        <div className={`p-8 text-center ${isValid ? 'bg-emerald-500' : 'bg-amber-500'} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 flex flex-col items-center">
            {isValid ? (
               <CheckCircle size={56} className="text-white mb-4 drop-shadow-md" />
            ) : (
               <Search size={56} className="text-white mb-4 drop-shadow-md" />
            )}
            
            <h1 className="text-3xl font-black text-white tracking-tight mb-2 drop-shadow-sm">
               {isValid ? "Valid Booking" : "Invalid Status"}
            </h1>
            <p className="text-white/90 text-sm font-bold uppercase tracking-widest">
               Status: {reservation.status.replace("_", " ")}
            </p>
          </div>
        </div>

        {/* Verification Details */}
        <div className="p-8 space-y-8">
          
          {/* Guest Info */}
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <User size={24} />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Registered Tenant</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{tenantName}</p>
             </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Property Info */}
          <div className="space-y-4">
             <div className="flex items-start gap-4">
               <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 shrink-0 overflow-hidden relative">
                  <SafeImage src={reservation.listing.imageSrc || "/images/placeholder.jpg"} alt="Listing" />
               </div>
               <div className="flex flex-col justify-center min-h-[48px]">
                  <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{reservation.listing.title}</p>
                  <p className="text-xs font-medium text-gray-500 flex items-center gap-1 mt-1">
                     <MapPin size={12} />
                     <span className="truncate">{location || "Location Not Specified"}</span>
                  </p>
               </div>
             </div>
             
             <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Room Assignment</p>
                   <p className="text-sm font-bold text-gray-900 dark:text-white">{reservation.room.name}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Type</p>
                   <p className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg uppercase">{reservation.room.roomType}</p>
                </div>
             </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Stay Dates */}
          <div className="grid grid-cols-2 gap-4">
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1.5">
                   <Calendar size={12} /> Check-In
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                   {formatDate(reservation.startDate)}
                </p>
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1.5">
                   <Calendar size={12} /> Check-Out
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                   {formatDate(reservation.endDate)}
                </p>
             </div>
          </div>

          {/* Reference ID */}
          <div className="pt-4 text-center">
             <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                Booking Reference: {reservation.id.slice(-8).toUpperCase()}
             </p>
          </div>

        </div>
      </div>
      
      <div className="mt-8 text-center text-xs font-bold text-gray-400">
         <p>Scanned via BoardTAU Verification System</p>
      </div>
    </div>
  );
}

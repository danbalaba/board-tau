'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  IconCalendarEvent, 
  IconEye,
  IconBuildingCommunity
} from '@tabler/icons-react';
import { ArchiveRestore, Trash2, Clock, CheckCircle2, XCircle, Camera, FileCheck, MapPin, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/app/admin/components/ui/button';
import SafeImage from '@/components/common/SafeImage';

interface AdminListingCardProps {
  listing: any;
  idx: number;
  viewMode: 'grid' | 'list';
  onApprove: () => void;
  onReject: () => void;
  isDeciding?: boolean;
  onViewDetails: () => void;
  onArchive?: (listing: any) => void;
  onDelete?: (listing: any) => void;
  isArchived?: boolean;
  isSuperAdmin?: boolean;
  isDeleting?: boolean;
}

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
  pending: { color: 'text-white', bg: 'bg-amber-500/90 text-white border-amber-400/50 shadow-lg shadow-amber-500/20', icon: Clock },
  approved: { color: 'text-white', bg: 'bg-primary/90 text-white border-primary/40 shadow-lg shadow-primary/20', icon: CheckCircle2 },
  active: { color: 'text-white', bg: 'bg-primary/90 text-white border-primary/40 shadow-lg shadow-primary/20', icon: CheckCircle2 },
  rejected: { color: 'text-white', bg: 'bg-rose-500/90 text-white border-rose-400/50 shadow-lg shadow-rose-500/20', icon: XCircle },
  archived: { color: 'text-white', bg: 'bg-slate-700/90 text-white border-slate-600/50 shadow-lg shadow-slate-700/20', icon: ArchiveRestore },
};

export function AdminListingCard({
  listing,
  idx,
  viewMode,
  onApprove,
  onReject,
  isDeciding,
  onViewDetails,
  onArchive,
  onDelete,
  isArchived,
  isSuperAdmin,
  isDeleting
}: AdminListingCardProps) {
  const isItemArchived = Boolean(isArchived || listing.isAdminArchived);
  const rawStatus = String(listing.status || 'pending').toLowerCase();
  const rawConfig = statusConfig[rawStatus] || statusConfig.pending;
  const RawStatusIcon = rawConfig.icon;
  const archiveConfig = statusConfig.archived;
  const rawImage = (Array.isArray(listing.images) && listing.images.length > 0)
    ? listing.images[0]
    : listing.imageSrc;
  const imageUrl = typeof rawImage === 'object' && rawImage !== null
    ? (rawImage.url || rawImage.src || '')
    : (typeof rawImage === 'string' ? rawImage : '');

  // Calculate uploaded legal docs
  const docUrls: Record<string, string> = {
    governmentId: listing.businessInfo?.documents?.governmentId || listing.governmentIdUrl || listing.documents?.governmentId || '',
    businessPermit: listing.businessInfo?.documents?.businessPermit || listing.businessPermitUrl || listing.documents?.businessPermit || '',
    landTitle: listing.businessInfo?.documents?.landTitle || listing.landTitleUrl || listing.documents?.landTitle || '',
    barangayClearance: listing.businessInfo?.documents?.barangayClearance || listing.barangayClearanceUrl || listing.documents?.barangayClearance || '',
    fireSafetyCertificate: listing.businessInfo?.documents?.fireSafetyCertificate || listing.fireSafetyUrl || listing.documents?.fireSafetyCertificate || '',
  };
  const docCount = Object.values(docUrls).filter(Boolean).length;
  const photoCount = (Array.isArray(listing.images) ? listing.images.length : 0) || (listing.imageSrc ? 1 : 0);

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.04 }}
        className="group relative bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[2rem] border border-gray-100 dark:border-gray-800 p-3 sm:p-5 hover:shadow-xl transition-all duration-300 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
          {/* Left: Thumbnail & Details */}
          <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
            {/* Thumbnail */}
            <div className="relative w-28 h-28 sm:w-52 sm:h-36 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm flex-shrink-0 bg-gray-100 dark:bg-gray-800">
              {imageUrl ? (
                <SafeImage
                  src={imageUrl}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <IconBuildingCommunity size={32} strokeWidth={1.5} />
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-2 left-2 z-20 flex flex-wrap gap-1">
                {isItemArchived && (
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-wider shadow-md backdrop-blur-md border",
                    archiveConfig.bg
                  )}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    <span>archived</span>
                  </span>
                )}
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-wider shadow-md backdrop-blur-md border",
                  rawConfig.bg
                )}>
                  <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  <span>{rawStatus}</span>
                </span>
              </div>

              {/* Media & Docs Badge */}
              <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1">
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-white text-[8px] font-black uppercase">
                  <Camera size={9} />
                  {photoCount}
                </span>
                <span className={cn(
                  "flex items-center gap-0.5 px-1.5 py-0.5 rounded backdrop-blur-md text-[8px] font-black uppercase",
                  docCount >= 4 ? "bg-primary/90 text-white" : "bg-amber-500/90 text-white"
                )}>
                  <FileCheck size={9} />
                  {docCount}/5
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1 truncate">
                    <MapPin size={10} className="text-primary shrink-0" />
                    {listing.address || listing.city || 'Camiling, Tarlac'}
                  </span>
                  <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                    {listing.propertyType?.name || listing.category || 'Boarding House'}
                  </span>
                </div>
                <h3 className="text-base sm:text-xl font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate tracking-tight">
                  {listing.title}
                </h3>
              </div>

              {/* Property Owner Info */}
              <div className="flex items-center gap-2">
                {listing.user?.image ? (
                  <SafeImage
                    src={listing.user.image}
                    alt={listing.user.name}
                    className="w-6 h-6 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-black text-[10px] flex items-center justify-center shrink-0">
                    {(listing.user?.name || 'H').charAt(0)}
                  </div>
                )}
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">
                  {listing.user?.name || 'Landlord Host'}
                </span>
                <span className="text-[9px] font-medium text-gray-400">
                  • Submitted {new Date(listing.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Price Row & Stats Pills */}
              <div className="flex items-center gap-3 pt-1 flex-wrap">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg sm:text-xl font-black text-primary tracking-tighter">
                    ₱{listing.price?.toLocaleString() || '0'}
                  </span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">/ mo</span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-[9px] font-black text-gray-600 dark:text-gray-300 uppercase">
                  <Building2 size={11} className="text-primary" />
                  <span>{listing.roomCount || listing.rooms?.length || 1} Units</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Buttons Column */}
          <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800 pt-3 sm:pt-0 sm:pl-5">
            {isItemArchived ? (
              <>
                <Button
                  onClick={onViewDetails}
                  className="flex-1 sm:w-36 rounded-xl py-2.5 h-auto bg-primary hover:bg-primary/90 text-white text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <IconEye size={13} />
                    Details
                  </span>
                </Button>

                {onArchive && (
                  <Button
                    onClick={() => onArchive(listing)}
                    disabled={isDeciding}
                    className="flex-1 sm:w-36 rounded-xl py-2.5 h-auto text-[10px] font-black uppercase tracking-widest bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white border border-amber-200 dark:border-amber-900/30 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <ArchiveRestore size={13} />
                      Restore
                    </span>
                  </Button>
                )}

                {isSuperAdmin && onDelete && (
                  <Button
                    onClick={() => onDelete(listing)}
                    disabled={isDeleting}
                    className="flex-1 sm:w-36 rounded-xl py-2.5 h-auto text-[10px] font-black uppercase tracking-widest bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-200 dark:border-rose-900/30 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <Trash2 size={13} />
                      Delete
                    </span>
                  </Button>
                )}
              </>
            ) : rawStatus === 'pending' ? (
              <Button
                onClick={onViewDetails}
                className="w-full sm:w-44 rounded-xl py-3 h-auto text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 transition-all active:scale-[0.98] cursor-pointer"
              >
                <span className="flex items-center justify-center gap-2">
                  <IconEye size={15} />
                  Review & Audit
                </span>
              </Button>
            ) : (
              <>
                <Button
                  onClick={onViewDetails}
                  className="flex-1 sm:w-36 rounded-xl py-2.5 h-auto bg-primary hover:bg-primary/90 text-white text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <IconEye size={13} />
                    Details
                  </span>
                </Button>

                {onArchive && (
                  <Button
                    onClick={() => onArchive(listing)}
                    disabled={isDeciding}
                    className="flex-1 sm:w-36 rounded-xl py-2.5 h-auto text-[10px] font-black uppercase tracking-widest bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white border border-amber-200 dark:border-amber-900/30 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <ArchiveRestore size={13} />
                      {listing.isAdminArchived ? 'Restore' : 'Archive'}
                    </span>
                  </Button>
                )}

                {isSuperAdmin && onDelete && (
                  <Button
                    onClick={() => onDelete(listing)}
                    disabled={isDeleting}
                    className="flex-1 sm:w-36 rounded-xl py-2.5 h-auto text-[10px] font-black uppercase tracking-widest bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-200 dark:border-rose-900/30 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <Trash2 size={13} />
                      Delete
                    </span>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid View (Default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition-all duration-300 shadow-sm overflow-hidden flex flex-col p-6 rounded-[2rem] hover:shadow-2xl hover:shadow-primary/20 dark:hover:shadow-primary/10 hover:border-primary/20 hover:-translate-y-1"
    >
      {/* Top Image Section */}
      <div className="relative h-44 mb-6 w-full rounded-[1.5rem] overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 z-10">
        {imageUrl ? (
          <SafeImage
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <IconBuildingCommunity size={40} strokeWidth={1.5} />
          </div>
        )}

        {/* Status Badge — top left */}
        <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5 max-w-[calc(100%-4rem)]">
          {isItemArchived && (
            <span className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md backdrop-blur-md border",
              archiveConfig.bg
            )}>
              <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              <span>archived</span>
            </span>
          )}
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md backdrop-blur-md border",
            rawConfig.bg
          )}>
            <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            <span>{rawStatus}</span>
          </span>
        </div>

        {/* Media & Docs Pills — bottom left */}
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest">
            <Camera size={11} />
            {photoCount} Photos
          </span>
          <span className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-lg backdrop-blur-md text-[9px] font-black uppercase tracking-widest",
            docCount >= 4 ? "bg-primary/90 text-white" : "bg-amber-500/90 text-white"
          )}>
            <FileCheck size={11} />
            {docCount}/5 Docs
          </span>
        </div>

        {/* Archive / Restore Button — top right */}
        {onArchive && (
          <div className="absolute top-3 right-3 z-20">
            <button
              onClick={(e) => { e.stopPropagation(); onArchive(listing); }}
              disabled={isDeciding}
              className={cn(
                "p-2 rounded-xl backdrop-blur shadow-sm transition-all border cursor-pointer",
                (isArchived || listing.isAdminArchived)
                  ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white border-amber-500/30"
                  : "bg-white/80 dark:bg-gray-900/80 text-gray-500 hover:text-primary hover:bg-white dark:hover:bg-gray-900 border-white/20 dark:border-gray-800"
              )}
              title={(isArchived || listing.isAdminArchived) ? "Restore Listing" : "Archive Listing"}
            >
              <ArchiveRestore size={14} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col z-10">
        <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1 truncate mb-3">
          {listing.title}
        </h3>

        {/* Owner Info Box */}
        <div className="flex items-center gap-3 mb-4 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-2xl border border-gray-100/50 dark:border-gray-800 w-full">
          {listing.user?.image ? (
            <SafeImage
              src={listing.user.image}
              alt={listing.user.name}
              className="w-9 h-9 rounded-xl object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
              {(listing.user?.name || 'H').charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5 leading-none">Property Owner</p>
            <p className="text-xs font-black text-gray-900 dark:text-gray-100 truncate leading-none">{listing.user?.name || 'Landlord Host'}</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 mb-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="flex-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Property Type</p>
            <p className="text-xs font-black text-gray-900 dark:text-white truncate uppercase">{listing.propertyType?.name || listing.category || 'Boarding House'}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Starting Rate</p>
            <p className="text-base font-black text-primary leading-none">₱{listing.price?.toLocaleString() || '0'}</p>
          </div>
        </div>

        {/* Date Submitted */}
        <div className="flex items-center justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-4">
          <div className="flex items-center gap-1.5">
            <IconCalendarEvent size={12} className="text-gray-300 dark:text-gray-600" />
            Submitted: {new Date(listing.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Grid View Actions */}
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
          {isItemArchived ? (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  onClick={onViewDetails}
                  className="flex-1 py-2.5 h-auto rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <IconEye size={14} />
                    Details
                  </span>
                </Button>
                {onArchive && (
                  <Button
                    onClick={() => onArchive(listing)}
                    disabled={isDeciding}
                    className="flex-1 py-2.5 h-auto rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white border border-amber-200 dark:border-amber-900/30 active:scale-[0.98] cursor-pointer"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <ArchiveRestore size={14} />
                      Restore
                    </span>
                  </Button>
                )}
              </div>
              {isSuperAdmin && onDelete && (
                <Button
                  onClick={() => onDelete(listing)}
                  disabled={isDeleting}
                  className="group/btn w-full py-2.5 h-auto rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-200 dark:border-rose-900/30 active:scale-[0.98] cursor-pointer"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Trash2 size={14} className="group-hover/btn:rotate-12 transition-transform" />
                    Delete Permanently
                  </span>
                </Button>
              )}
            </div>
          ) : rawStatus === "pending" ? (
            <Button
              onClick={onViewDetails}
              className="w-full py-3 h-auto rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              <span className="flex items-center justify-center gap-2">
                <IconEye size={15} />
                Review & Audit Listing
              </span>
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={onViewDetails}
                className="flex-1 py-3 h-auto rounded-xl bg-primary hover:bg-primary/90 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 active:scale-[0.98] cursor-pointer"
              >
                <span className="flex items-center justify-center gap-2">
                  <IconEye size={15} />
                  Details
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

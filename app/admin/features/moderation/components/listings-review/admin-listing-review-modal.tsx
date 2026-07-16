'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/modals/Modal';
import { Button } from '@/app/admin/components/ui/button';
import { 
  User, 
  Building, 
  Check, 
  X,
  Clock,
  MapPin,
  Eye,
  ShieldCheck,
  CircleDollarSign,
  List,
  FileText,
  Award,
  Building2,
  Bath,
  Bed,
  Users,
  Maximize,
  ClipboardList,
  ShieldAlert,
  Sparkles,
  Wifi,
  Wind,
  SquareParking,
  Waves,
  Cigarette,
  PawPrint,
  Wine,
  Flame,
  Bus,
  WashingMachine,
  ChefHat,
  Tv,
  Zap,
  Droplets,
  Book,
  Dumbbell,
  Image
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import MediaPreviewOverlay from '@/components/common/MediaPreviewOverlay';
import SafeImage from '@/components/common/SafeImage';

interface AdminListingReviewModalProps {
  listing: any | null;
  isOpen: boolean;
  onClose: () => void;
  onDecision: (id: string, action: 'approve' | 'reject', reason?: string) => void;
  isDeciding?: boolean;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500 text-white',
  approved: 'bg-emerald-500 text-white',
  active: 'bg-emerald-500 text-white',
  rejected: 'bg-rose-500 text-white',
};

const AMENITY_ICONS: Record<string, any> = {
  'WiFi': Wifi,
  'Air Conditioning': Wind,
  'Kitchen': ChefHat,
  'Laundry Area': WashingMachine,
  'Parking': SquareParking,
  'Security': ShieldCheck,
  'Gym': Dumbbell,
  'TV': Tv,
  'Pool': Waves,
  'Water': Droplets,
  'Electricity': Zap,
  'No Curfew': Clock,
};

export function AdminListingReviewModal({
  listing,
  isOpen,
  onClose,
  onDecision,
  isDeciding
}: AdminListingReviewModalProps) {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [customReason, setCustomReason] = useState("");
  
  // Media Preview State
  const [previewState, setPreviewState] = useState<{
    isOpen: boolean;
    images: string[];
    currentIndex: number;
    title: string;
  }>({
    isOpen: false,
    images: [],
    currentIndex: 0,
    title: ''
  });

  useEffect(() => {
    if (isOpen && listing) {
      setIsInitialLoading(true);
      setShowRejectConfirm(false);
      setCustomReason("");
      setPreviewState(prev => ({ ...prev, isOpen: false }));
      
      const timer = setTimeout(() => setIsInitialLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isOpen, listing]);

  if (!listing) return null;

  const handleAction = async (action: 'approve' | 'reject', reason?: string) => {
    onDecision(listing.id, action, reason);
  };

  const handleOpenPreview = (images: string[], index: number, title: string) => {
    setPreviewState({
      isOpen: true,
      images,
      currentIndex: index,
      title
    });
  };

  const PREDEFINED_REASONS = [
    "Fraudulent or forged business documents",
    "Fire safety certificate expired or invalid",
    "Property images do not meet quality standards",
    "Missing required legal information"
  ];

  const renderAmenity = (ca: string) => {
    const [label] = ca.includes('|') ? ca.split('|') : [ca];
    const Icon = AMENITY_ICONS[label] || Sparkles;
    return (
      <span key={ca} className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
        <Icon size={12} className="opacity-70" />
        {label}
      </span>
    );
  };

  const renderDocumentCard = (title: string, url: string | null | undefined) => {
    if (!url) return (
      <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 h-24 text-center">
        <FileText size={20} className="text-gray-300 mb-1" />
        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">No {title}</span>
      </div>
    );

    return (
      <div 
        onClick={() => handleOpenPreview([url], 0, title)}
        className="group relative h-24 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer bg-gray-100 shadow-sm transition-all hover:shadow-md"
      >
        <SafeImage src={url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={title} />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Eye size={20} className="text-white" />
        </div>
        <div className="absolute bottom-0 inset-x-0 bg-black/70 backdrop-blur-sm text-[8px] text-white font-black text-center py-1 uppercase tracking-widest">
          {title}
        </div>
      </div>
    );
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Listing Review" width="lg">
        {/* Modal content starts here. Redundant overflow removed to fix double scrollbar. */}
        <div className="p-8 space-y-8 bg-white dark:bg-gray-900">
          
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
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Listing Data...</p>
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
                    transition: { staggerChildren: 0.1 }
                  }
                }}
                className="space-y-10"
              >
                {/* Decision Overlay */}
                {showRejectConfirm && (
                  <div className="absolute inset-x-0 bottom-0 z-[100] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-8 border-t border-rose-100 dark:border-rose-900/30 rounded-b-[32px] animate-in slide-in-from-bottom-full duration-300 shadow-2xl">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1 text-left">Reject Listing</h3>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest text-left">Issue formal rejection notice</p>
                        </div>
                        <button onClick={() => setShowRejectConfirm(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                          <X size={20} />
                        </button>
                      </div>

                      <div className="space-y-4 mb-6 text-left">
                        <div className="flex flex-wrap gap-2">
                          {PREDEFINED_REASONS.map((reason) => (
                            <button
                              key={reason}
                              onClick={() => handleAction('reject', reason)}
                              disabled={isDeciding}
                              className="px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 border border-gray-100 dark:border-gray-700 hover:border-rose-200 rounded-xl text-xs font-bold transition-all"
                            >
                              {reason}
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={customReason}
                          onChange={(e) => setCustomReason(e.target.value)}
                          placeholder="Detailed rejection reason for the landlord..."
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all min-h-[100px]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" onClick={() => setShowRejectConfirm(false)} className="rounded-xl py-6 h-auto text-xs font-black uppercase tracking-widest border-gray-200 dark:border-gray-800">Cancel</Button>
                        <Button disabled={isDeciding || !customReason.trim()} onClick={() => handleAction('reject', customReason)} className="rounded-xl py-6 h-auto text-xs font-black uppercase tracking-widest shadow-lg bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20">Confirm Rejection</Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 01: Landlord Profile */}
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-amber-500/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  <div className="relative flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 backdrop-blur-sm">
                    <div className="flex items-center gap-5">
                       {listing.user?.image ? (
                         <SafeImage src={listing.user.image} alt={listing.user.name} className="w-16 h-16 rounded-[1.25rem] shadow-xl border-2 border-white dark:border-gray-700 object-cover" />
                       ) : (
                         <div className="w-16 h-16 rounded-[1.25rem] shadow-xl border-2 border-white dark:border-gray-700 bg-primary/10 flex items-center justify-center text-primary text-xl font-black">{listing.user?.name?.charAt(0) || 'U'}</div>
                       )}
                       <div>
                          <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-none mb-1.5">{listing.user?.name || 'Unknown Host'}</h3>
                          <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">Property Owner</p>
                          </div>
                       </div>
                    </div>
                    <span className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm", statusColors[listing.status] || 'bg-gray-100 text-gray-500')}>{listing.status}</span>
                  </div>
                </motion.div>

                {/* Section 02: Property Assets */}
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2">
                      <div className="w-1.5 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                      Property Images
                    </span>
                    <span className="text-[9px] font-black px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full uppercase tracking-widest border border-emerald-100 dark:border-emerald-500/20">
                      {(listing.images?.length || 0)} Total Images
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Main Showcase & Meta */}
                    <div className="space-y-6">
                       <div 
                        className="aspect-video rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 group relative cursor-pointer shadow-lg"
                        onClick={() => handleOpenPreview([listing.imageSrc, ...(listing.images?.map((img: any) => img.url || img) || [])], 0, listing.title)}
                      >
                        {listing.imageSrc ? (
                          <SafeImage src={listing.imageSrc} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><Building size={48} /></div>
                        )}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye size={32} className="text-white" />
                        </div>
                        <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white text-[8px] font-black uppercase tracking-widest border border-white/10">Primary Display</div>
                      </div>

                      <div className="p-6 bg-amber-500/5 dark:bg-amber-500/10 rounded-[2rem] border border-amber-500/20">
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2"><FileText size={14} /> Description</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic">"{listing.description}"</p>
                      </div>
                    </div>

                    {/* Categorized Buckets View */}
                    <div className="space-y-6">
                      {["Bedroom", "Living Room", "Kitchen", "Bathroom", "Exterior", "General"].map((category) => {
                        const catImages = listing.images?.filter((img: any) => img.roomType === category) || [];
                        if (catImages.length === 0 && category !== "General") return null;
                        if (catImages.length === 0 && category === "General" && listing.images?.length > 0 && !listing.images.some((img: any) => img.roomType)) {
                           // Show legacy images in General if no roomType exists
                           catImages.push(...listing.images);
                        }
                        if (catImages.length === 0) return null;

                        return (
                          <div key={category} className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                             <h5 className="text-[9px] font-black text-gray-900 dark:text-white uppercase tracking-widest mb-3 flex items-center justify-between">
                               {category}
                               <span className="text-[8px] opacity-50">{catImages.length} Photos</span>
                             </h5>
                             <div className="flex flex-wrap gap-2">
                               {catImages.map((img: any, idx: number) => (
                                 <div 
                                   key={idx} 
                                   onClick={() => handleOpenPreview([img.url || img], 0, `${category} View`)}
                                   className="w-12 h-12 rounded-xl overflow-hidden border border-white dark:border-gray-700 cursor-pointer hover:scale-105 transition-transform shadow-sm"
                                  >
                                   <SafeImage 
                                     src={img.url || img} 
                                     alt={`${category} Image ${idx + 1}`} 
                                     className="w-full h-full object-cover" 
                                   />
                                 </div>
                               ))}
                             </div>
                          </div>
                        );
                      })}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Pricing Model</p>
                           <p className="text-sm font-black text-gray-900 dark:text-white">₱{(listing.price || 0).toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Inventory</p>
                           <p className="text-sm font-black text-gray-900 dark:text-white">{listing.rooms?.length || listing.roomCount} Registered Units</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Section 03: Business Identity */}
                {listing.businessInfo && (
                  <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="bg-primary/5 dark:bg-primary/10 p-6 rounded-[2rem] border border-primary/10 text-left">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 mb-6"><Building2 size={14} />Business Identity & Commitment</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-5">
                          <div><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Registered Entity Name</p><p className="text-base font-black text-gray-900 dark:text-white">{listing.businessInfo.businessName || 'Not Specified'}</p></div>
                          <div><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Business Classification</p><p className="text-xs font-bold text-primary uppercase tracking-wider">{listing.businessInfo.businessType?.replace('-', ' ') || 'General Housing'}</p></div>
                       </div>
                       <div className="p-5 bg-white dark:bg-gray-900 rounded-3xl border border-primary/10 flex items-center gap-4 shadow-sm">
                          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl"><Award size={24} /></div>
                          <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Years in Industry</p><p className="text-lg font-black text-gray-900 dark:text-white">{listing.businessInfo.yearsExperience?.replace('-', ' ') || 'New'} Years</p></div>
                       </div>
                    </div>
                    {listing.businessInfo.businessDescription && (
                      <div className="mt-8 pt-6 border-t border-primary/10"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Award size={14} className="text-primary" /> Corporate Mission & Vision</p><p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed italic font-medium">"{listing.businessInfo.businessDescription}"</p></div>
                    )}
                  </motion.div>
                )}

                {/* Section 04: Room Inventory Audit */}
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="space-y-6 text-left">
                   <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2"><div className="w-1.5 h-3 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.4)]" />Rooms</span>
                     <span className="text-[9px] font-black px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full uppercase tracking-widest border border-blue-100 dark:border-blue-500/20">{listing.rooms?.length || 0} Rooms</span>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {listing.rooms?.map((room: any) => (
                        <div key={room.id} className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-800 flex gap-4 transition-all hover:bg-white dark:hover:bg-gray-800 shadow-sm hover:shadow-md">
                           <div 
                             className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 relative cursor-pointer group"
                             onClick={() => room.images?.length > 0 && handleOpenPreview(room.images.map((i: any) => i.url || i), 0, `Unit ${room.name} Images`)}
                           >
                             {room.images?.[0]?.url ? (
                               <SafeImage 
                                 src={room.images[0].url} 
                                 alt={`Room ${room.name} Thumbnail`} 
                                 className="w-full h-full object-cover" 
                               />
                             ) : (
                               <Image className="w-full h-full p-6 text-gray-300" />
                             )}
                             <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <Eye size={16} className="text-white" />
                             </div>
                             <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 text-[6px] font-black text-white rounded uppercase tracking-widest">{room.roomType}</div>
                           </div>
                           <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <h5 className="text-[11px] font-black text-gray-900 dark:text-white uppercase truncate">{room.name}</h5>
                                  <span className="text-[11px] font-black text-primary tracking-tighter">₱{(room.price || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex flex-wrap gap-x-3 gap-y-1">
                                   <div className="flex items-center gap-1 text-[8px] font-bold text-gray-400"><Users size={10} className="text-blue-500" /> Cap: {room.capacity}</div>
                                   <div className="flex items-center gap-1 text-[8px] font-bold text-gray-400"><Bed size={10} className="text-purple-500" /> {room.bedType || 'Single'}</div>
                                   {room.size && <div className="flex items-center gap-1 text-[8px] font-bold text-gray-400"><Maximize size={10} className="text-emerald-500" /> {room.size}sqm</div>}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {room.amenities?.slice(0, 4).map((ra: any, idx: number) => (
                                  <span key={idx} className="px-1.5 py-0.5 bg-white dark:bg-gray-900 rounded-md text-[6px] font-black text-gray-500 uppercase tracking-widest border border-gray-100 dark:border-gray-700">{(ra.amenityType?.name || ra.name || ra).substring(0, 10)}</span>
                                ))}
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </motion.div>

                {/* Section 05: Compliance & Legal Assets */}
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="space-y-6 text-left">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 flex items-center gap-2"><div className="w-1.5 h-3 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.4)]" />Legal Documents</span>
                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {renderDocumentCard('Govt ID', listing.businessInfo?.documents?.governmentId || listing.governmentIdUrl)}
                      {renderDocumentCard('Business Permit', listing.businessInfo?.documents?.businessPermit || listing.businessPermitUrl)}
                      {renderDocumentCard('Land Title', listing.businessInfo?.documents?.landTitle || listing.landTitleUrl)}
                      {renderDocumentCard('Barangay Clear', listing.businessInfo?.documents?.barangayClearance || listing.barangayClearanceUrl)}
                      {renderDocumentCard('Fire Safety', listing.businessInfo?.documents?.fireSafetyCertificate || listing.fireSafetyUrl)}
                      {renderDocumentCard('Others', listing.businessInfo?.documents?.otherDocuments || listing.otherDocumentsUrl)}
                   </div>
                </motion.div>

                {/* Section 06: Rules & Configuration Audit */}
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                   {/* Rules Column */}
                   <div className="space-y-5">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 flex items-center gap-2"><ClipboardList size={14} />House Rules</span>
                      <div className="space-y-2.5">
                         {[
                           { label: 'Female Only', icon: User, active: listing.rules?.femaleOnly },
                           { label: 'Male Only', icon: User, active: listing.rules?.maleOnly },
                           { label: 'Visitors Allowed', icon: Users, active: listing.rules?.visitorsAllowed },
                           { label: 'Pets Allowed', icon: PawPrint, active: listing.rules?.petsAllowed },
                           { label: 'Smoking Allowed', icon: Cigarette, active: listing.rules?.smokingAllowed },
                           { label: 'No Curfew', icon: Clock, active: listing.rules?.noCurfew },
                         ].map((rule) => (
                           <div key={rule.label} className={cn("flex items-center justify-between p-3 rounded-xl border transition-all", rule.active ? "bg-white dark:bg-gray-900 border-amber-100 dark:border-amber-500/20 text-gray-900 dark:text-white shadow-sm" : "bg-transparent border-gray-100 dark:border-gray-800 text-gray-300 opacity-40")}>
                             <div className="flex items-center gap-3"><rule.icon size={14} className={rule.active ? "text-amber-500" : "text-gray-300"} /><span className="text-[9px] font-black uppercase tracking-widest">{rule.label}</span></div>
                             {rule.active ? <Check size={12} className="text-emerald-500" /> : <X size={12} className="text-gray-300" />}
                           </div>
                         ))}
                         {listing.rules?.customRules?.map((cr: string) => (
                            <div key={cr} className="flex items-center justify-between p-3 rounded-xl border bg-white dark:bg-gray-900 border-amber-100 dark:border-amber-500/20 text-gray-900 dark:text-white shadow-sm">
                              <div className="flex items-center gap-3"><Award size={14} className="text-amber-500" /><span className="text-[9px] font-black uppercase tracking-widest">{cr.split('|')[0]}</span></div>
                              <Check size={12} className="text-emerald-500" />
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* Features Column */}
                   <div className="space-y-5">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2"><ShieldAlert size={14} />Features & Amenities</span>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { label: '24/7 Security', icon: ShieldCheck, active: listing.features?.security24h },
                            { label: 'CCTV Cameras', icon: Eye, active: listing.features?.cctv },
                            { label: 'Fire Safety', icon: Flame, active: listing.features?.fireSafety },
                            { label: 'Near Transport', icon: Bus, active: listing.features?.nearTransport },
                            { label: 'Flood-Free', icon: Waves, active: listing.features?.floodFree },
                            { label: 'Backup Power', icon: Zap, active: listing.features?.backupPower },
                          ].map((feat) => feat.active && (
                            <div key={feat.label} className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-500/5 rounded-xl border border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                               <feat.icon size={14} />
                               <span className="text-[9px] font-black uppercase tracking-widest">{feat.label}</span>
                            </div>
                          ))}
                        </div>
                        
                        {listing.amenities_list?.length > 0 && (
                          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                             <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3">Shared Property Amenities</p>
                             <div className="flex flex-wrap gap-2">
                               {listing.amenities_list.map((a: string) => renderAmenity(a))}
                             </div>
                          </div>
                        )}
                      </div>
                   </div>
                </motion.div>

                {/* Section 07: Authorized Release Action */}
                <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="pt-10 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white">Decision</h4>
                    <div className="h-px flex-1 bg-gradient-to-r from-gray-100 via-gray-100 to-transparent dark:from-gray-800 dark:via-gray-800 mx-6"></div>
                  </div>
                  
                  {listing.status === 'pending' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button 
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 py-7 h-auto rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.25em] group/act"
                        onClick={() => handleAction('approve')}
                        disabled={isDeciding}
                      >
                        <span className="flex items-center justify-center gap-3">
                          <Check size={20} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                          Approve
                        </span>
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full rounded-[1.5rem] py-7 h-auto border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-900/30 dark:hover:bg-rose-900/10 text-[10px] font-black uppercase tracking-[0.25em] transition-all group/rev"
                        onClick={() => setShowRejectConfirm(true)}
                        disabled={isDeciding}
                      >
                        <span className="flex items-center justify-center gap-3">
                           <X size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> 
                           Reject
                        </span>
                      </Button>
                    </div>
                  ) : (
                     <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-3">
                          <ClipboardList size={16} className="text-emerald-500" />
                          Audit Status: <span className={listing.status === 'approved' || listing.status === 'active' ? 'text-emerald-500' : 'text-rose-500'}>{listing.status.toUpperCase()}</span>
                        </p>
                     </div>
                  )}
                  
                  <div className="mt-8 flex items-center justify-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800/50">
                    <Clock size={14} className="text-amber-500 animate-pulse" />
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest text-center px-4 max-w-lg">
                      By authorizing this release, you acknowledge that all legal assets have been verified and the property meets community standards.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>

      {/* High-Fidelity Media Preview Overlay */}
      <MediaPreviewOverlay
        isOpen={previewState.isOpen}
        onClose={() => setPreviewState(prev => ({ ...prev, isOpen: false }))}
        images={previewState.images}
        currentIndex={previewState.currentIndex}
        onNavigate={(index) => setPreviewState(prev => ({ ...prev, currentIndex: index }))}
        title={previewState.title}
      />
    </>
  );
}

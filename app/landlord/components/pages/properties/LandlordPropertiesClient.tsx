'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconBuilding,
  IconEdit,
  IconTrash,
  IconEye,
  IconPlus,
  IconBath,
  IconChevronDown,
  IconCheck,
  IconAlertTriangle,
  IconX,
  IconDots,
  IconSortAscending,
  IconSortDescending,
  IconCalendarEvent,
  IconHistory,
  IconCircleCheck,
  IconInbox,
  IconTag,
  IconCalendarFilled,
  IconCurrencyPeso,
  IconLayoutGrid,
  IconList,
  IconWifi,
  IconParking,
  IconSwimming,
  IconBarbell,
  IconAirConditioning,
  IconWashMachine,
  IconWoman,
  IconMan,
  IconFriends,
  IconPaw,
  IconSmoking,
  IconSmokingNo,
  IconShieldCheck,
  IconDeviceCctv,
  IconFlame,
  IconBus,
  IconBook,
  IconSeeding,
  IconCertificate,
  IconMapPin,
  IconUsers,
  IconBed,
  IconDimensions,
  IconReceipt2,
  IconSearchOff
} from '@tabler/icons-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/utils/helper';
import Button from '@/components/common/Button';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import LoadingAnimation from '@/components/common/LoadingAnimation';
import { 
  generateTablePDF 
} from '@/utils/pdfGenerator';
import GenerateReportButton from '@/components/common/GenerateReportButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  roomCount: number;
  bathroomCount: number;
  imageSrc: string;
  createdAt: Date;
  region?: string;
  country?: string;
  amenities?: {
    wifi: boolean;
    parking: boolean;
    pool: boolean;
    gym: boolean;
    airConditioning: boolean;
    laundry: boolean;
  } | null;
  rules?: {
    femaleOnly: boolean;
    maleOnly: boolean;
    visitorsAllowed: boolean;
    petsAllowed: boolean;
    smokingAllowed: boolean;
  } | null;
  features?: {
    security24h: boolean;
    cctv: boolean;
    fireSafety: boolean;
    nearTransport: boolean;
    studyFriendly: boolean;
    quietEnvironment: boolean;
    flexibleLease: boolean;
  } | null;
  categories?: {
    category: {
      name: string;
      label: string;
    };
  }[];
  rooms?: {
    id: string;
    name: string;
    price: number;
    capacity: number;
    availableSlots: number;
    roomType: string;
    bedType: string;
    size: number | null;
    reservationFee: number;
    amenities?: {
      amenityType: {
        name: string;
      };
    }[];
    images?: {
      url: string;
    }[];
  }[];
  images?: {
    url: string;
  }[];
  user?: {
    businessName: string | null;
    phoneNumber: string | null;
    email: string | null;
  } | null;
}

// Component to handle the detailed property view modal
// This fixes the 'container ref not hydrated' error by only initializing 
// scroll hooks when the modal is actually mounted.
const PropertyDetailsModal = ({ 
  property, 
  onClose, 
  statusColors, 
  formatStatus 
}: { 
  property: Property; 
  onClose: () => void; 
  statusColors: Record<string, string>;
  formatStatus: (status: string) => string;
}) => {
  const modalScrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: modalScrollRef });
  const [isLoading, setIsLoading] = useState(true);

  // Simulation delay for branded loading effect
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Body scroll lock effect
  useEffect(() => {
    // Save current inline overflow
    const originalStyle = document.body.style.overflow;
    // Lock scroll
    document.body.style.overflow = 'hidden';
    
    // Recovery on unmount
    return () => {
      document.body.style.overflow = originalStyle || '';
    };
  }, []);

  // Header animations
  const headerHeight = useTransform(scrollY, [0, 80], [256, 110]);
  const headerContentOpacity = useTransform(scrollY, [0, 60], [1, 0]);
  const compactHeaderOpacity = useTransform(scrollY, [60, 80], [0, 1]);
  const titleScale = useTransform(scrollY, [0, 80], [1, 0.75]);
  const titleY = useTransform(scrollY, [0, 80], [0, -10]);
  const bannerBlur = useTransform(scrollY, [0, 80], ['blur(0px)', 'blur(8px)']);
  const closeButtonBg = useTransform(scrollY, [0, 80], ['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.1)']);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 40 }}
        ref={modalScrollRef}
        className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] border border-white/20 dark:border-gray-800 max-w-4xl w-full shadow-2xl overflow-y-auto flex flex-col max-h-[90vh] custom-scrollbar"
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center py-40 bg-black/30 backdrop-blur-sm"
            >
              <LoadingAnimation text="Synchronizing property details..." size="large" />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col h-full"
            >
              {/* Header / Banner - Now Sticky to capture scroll gestures directly */}
              <motion.div 
                style={{ height: headerHeight }}
                className="sticky top-0 w-full flex-shrink-0 z-30 group"
              >
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  {property.imageSrc ? (
                    <motion.img 
                      style={{ filter: bannerBlur }}
                      src={property.imageSrc} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      alt="" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                      <IconBuilding size={64} className="text-gray-300 dark:text-gray-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
                
                {/* Full Header Content */}
                <motion.div 
                  style={{ opacity: headerContentOpacity }}
                  className="absolute bottom-6 left-8 right-8 pointer-events-none"
                >
                  <div className={cn(
                    "inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border backdrop-blur-md",
                    statusColors[property.status]?.replace('bg-', 'bg-').replace('/10', '/80') || "bg-gray-500/80 text-white border-white/20"
                  )}>
                    {formatStatus(property.status)}
                  </div>
                </motion.div>

                {/* Compact/Sticky Header Branding */}
                <motion.div 
                  style={{ opacity: compactHeaderOpacity }}
                  className="absolute inset-0 bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl border-b border-white/10 flex items-center px-10 pointer-events-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-xl">
                       <img src={property.imageSrc} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div>
                       <p className="text-[8px] font-black uppercase tracking-widest text-primary mb-0.5">Quick View</p>
                       <p className="text-sm font-black text-white">{property.title}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Title (Shared between states) */}
                <motion.div 
                  style={{ 
                    scale: titleScale,
                    y: titleY
                  }}
                  className="absolute bottom-6 left-8 right-8 z-30 pointer-events-none"
                >
                  <h3 className="text-3xl md:text-plus font-black text-white leading-tight drop-shadow-xl inline-block origin-left">
                    {property.title}
                  </h3>
                  <motion.div 
                    style={{ opacity: headerContentOpacity }}
                    className="flex flex-wrap items-center gap-4 mt-2 text-white/80 font-bold text-sm"
                  >
                    <div className="flex items-center gap-1.5">
                      <IconMapPin size={16} className="text-primary-foreground" />
                      <span>{property.region}, {property.country}</span>
                    </div>
                    {property.user?.businessName && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/10">
                        <IconBuilding size={14} className="text-blue-400" />
                        <span className="text-xs uppercase tracking-widest">{property.user.businessName}</span>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
                
                <motion.button
                  onClick={onClose}
                  style={{ backgroundColor: closeButtonBg }}
                  className="absolute top-6 right-6 p-2.5 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-all border border-white/20 z-50 shadow-xl"
                >
                  <IconX size={20} />
                </motion.button>
              </motion.div>

              {/* Content Section - Simplified flow hierarchy */}
              <div 
                className="p-8 md:p-10 z-10 font-bold"
              >
                {/* Image Gallery Preview (if multiple) */}
                {(property.images?.length ?? 0) > 1 && (
                  <div className="mb-10">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                       <IconLayoutGrid size={14} />
                       Property Gallery
                    </h4>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
                      {property.images?.map((img, i) => (
                        <div key={i} className="relative w-40 h-28 flex-shrink-0 rounded-2xl overflow-hidden border-2 border-white dark:border-gray-800 shadow-lg">
                          <img src={img.url} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt="" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  {/* Left Column: Info */}
                  <div className="lg:col-span-7 space-y-10">
                    {/* Description */}
                    <section>
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                        <div className="w-4 h-0.5 bg-primary rounded-full" />
                        About this property
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base font-medium">
                        {property.description || "No description provided for this property."}
                      </p>
                    </section>

                    {/* Quick Stats Grid */}
                    <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: 'Monthly', value: `₱${property.price.toLocaleString()}`, icon: IconCurrencyPeso, color: 'text-primary' },
                        { label: 'Rooms', value: property.roomCount, icon: IconBuilding, color: 'text-blue-500' },
                        { label: 'Baths', value: property.bathroomCount, icon: IconBath, color: 'text-purple-500' },
                        { label: 'Category', value: property.categories?.[0]?.category.label || 'N/A', icon: IconTag, color: 'text-orange-500' },
                      ].map((item, i) => (
                        <div key={i} className="bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 hover:scale-[1.02] transition-transform">
                          <div className={cn("w-10 h-10 rounded-2xl bg-white dark:bg-gray-700 flex items-center justify-center mb-3 shadow-sm border border-gray-100 dark:border-gray-600", item.color)}>
                            <item.icon size={18} />
                          </div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{item.label}</p>
                          <p className="text-sm font-black text-gray-900 dark:text-white truncate">{item.value}</p>
                        </div>
                      ))}
                    </section>

                    {/* Room Inventory */}
                    <section>
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                          <div className="w-4 h-0.5 bg-primary rounded-full" />
                          Room Inventory
                        </h4>
                        <span className="text-[10px] font-black bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-gray-500 uppercase tracking-widest">
                          {property.rooms?.length || 0} Units
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {property.rooms?.map((room) => (
                          <div key={room.id} className="group flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 hover:border-primary/30 transition-all shadow-sm hover:shadow-md">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 relative">
                              {room.images?.[0]?.url ? (
                                <img src={room.images?.[0].url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={room.name} />
                              ) : (
                                <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-300"><IconBed size={24} /></div>
                              )}
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-4 mb-2">
                                <h5 className="font-black text-gray-900 dark:text-white text-sm truncate uppercase tracking-wide">{room.name}</h5>
                                <span className="text-primary font-black text-sm">₱{room.price.toLocaleString()}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 mb-3">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                  <IconUsers size={12} className="text-blue-500" />
                                  <span>Cap: {room.capacity}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                  <IconCheck size={12} className="text-green-500" />
                                  <span>Avail: {room.availableSlots}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                  <IconBed size={12} className="text-purple-500" />
                                  <span>{room.bedType} Bed</span>
                                </div>
                                {room.size && (
                                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                    <IconDimensions size={12} className="text-orange-500" />
                                    <span>{room.size} sqm</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1 text-[10px] font-bold text-teal-500 uppercase tracking-widest bg-teal-50 dark:bg-teal-500/10 px-2 py-0.5 rounded-lg border border-teal-100 dark:border-teal-500/20">
                                  {room.roomType}
                                </div>
                              </div>

                              {room.reservationFee > 0 && (
                                <div className="flex items-center gap-1.5 mb-3 text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider bg-amber-50 dark:bg-amber-500/5 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-500/20 w-fit">
                                  <IconReceipt2 size={12} />
                                  Reservation Fee: ₱{room.reservationFee.toLocaleString()}
                                </div>
                              )}

                              {/* Room Amenities */}
                              {(room.amenities?.length ?? 0) > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {room.amenities?.map((a, i) => (
                                    <span key={i} className="text-[8px] font-bold uppercase tracking-tighter text-gray-400 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-700">
                                      {a.amenityType.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* Right Column: Amenities, Rules, Features */}
                  <div className="lg:col-span-5 space-y-10">
                    {/* Rules Section */}
                    <section className="bg-gray-50/80 dark:bg-gray-800/80 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800/50">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
                        <IconCertificate size={14} />
                        Property Rules
                      </h4>
                      <div className="space-y-4">
                        {[
                          { key: 'femaleOnly', label: 'Female Only', icon: IconWoman, active: property.rules?.femaleOnly },
                          { key: 'maleOnly', label: 'Male Only', icon: IconMan, active: property.rules?.maleOnly },
                          { key: 'visitorsAllowed', label: 'Visitors Allowed', icon: IconFriends, active: property.rules?.visitorsAllowed },
                          { key: 'petsAllowed', label: 'Pets Allowed', icon: IconPaw, active: property.rules?.petsAllowed },
                          { key: 'smokingAllowed', label: 'Smoking Allowed', icon: IconSmoking, active: property.rules?.smokingAllowed },
                        ].map((rule) => (
                          <div key={rule.key} className={cn(
                            "flex items-center justify-between p-3.5 rounded-2xl border transition-all",
                            rule.active 
                              ? "bg-white dark:bg-gray-900 border-primary/20 text-gray-900 dark:text-white shadow-sm" 
                              : "bg-transparent border-gray-200/50 dark:border-gray-700/50 text-gray-400 opacity-50"
                          )}>
                            <div className="flex items-center gap-3">
                              <rule.icon size={16} className={rule.active ? "text-primary" : "text-gray-400"} />
                              <span className="text-xs font-black uppercase tracking-widest">{rule.label}</span>
                            </div>
                            {rule.active ? (
                              <IconCheck size={14} className="text-green-500" />
                            ) : (
                              <IconX size={14} className="text-gray-300" />
                            )}
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Features Section */}
                    <section className="bg-gray-50/80 dark:bg-gray-800/80 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800/50">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
                        <IconShieldCheck size={14} />
                        Security & Accessibility
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { label: '24/7 Security', icon: IconShieldCheck, active: property.features?.security24h },
                          { label: 'CCTV Surveillance', icon: IconDeviceCctv, active: property.features?.cctv },
                          { label: 'Fire Safety', icon: IconFlame, active: property.features?.fireSafety },
                          { label: 'Transport Near', icon: IconBus, active: property.features?.nearTransport },
                          { label: 'Study Friendly', icon: IconBook, active: property.features?.studyFriendly },
                          { label: 'Quiet Environment', icon: IconSeeding, active: property.features?.quietEnvironment },
                          { label: 'Flexible Lease', icon: IconCalendarFilled, active: property.features?.flexibleLease },
                        ].filter(f => f.active).map((feat, i) => (
                          <div key={i} className="flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 px-3 py-2 rounded-xl border border-blue-100 dark:border-blue-500/20 shadow-sm animate-in fade-in slide-in-from-right-1">
                            <feat.icon size={12} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{feat.label}</span>
                          </div>
                        ))}
                        {![
                          property.features?.security24h,
                          property.features?.cctv,
                          property.features?.fireSafety,
                          property.features?.nearTransport,
                          property.features?.studyFriendly,
                          property.features?.quietEnvironment,
                          property.features?.flexibleLease
                        ].some(Boolean) && (
                          <p className="text-[10px] font-bold text-gray-400 italic uppercase">No extra features listed</p>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              </div>

              {/* Enhanced Footer */}
              <div className="flex-shrink-0 px-6 py-5 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Last Updated</span>
                  <span className="text-[10px] font-black text-gray-600 dark:text-gray-300">{new Date(property.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <Link href={`/landlord/properties/${property.id}/edit`} className="w-full sm:w-auto flex-1 md:flex-none">
                    <Button className="rounded-2xl w-full py-3 px-6 shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group/edit whitespace-nowrap">
                      <IconEdit size={14} className="group-hover/edit:rotate-12 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Full Property Editor</span>
                    </Button>
                  </Link>
                  <Button 
                    outline 
                    onClick={onClose} 
                    className="rounded-2xl w-full sm:w-auto py-3 px-8 flex items-center justify-center border-gray-200 dark:border-gray-700"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Dismiss</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

interface LandlordPropertiesClientProps {
  properties: {
    listings: Property[];
    nextCursor: string | null;
  };
}

export default function LandlordPropertiesClient({ properties }: LandlordPropertiesClientProps) {
  const router = useRouter();
  const [listings, setListings] = useState(properties.listings);
  const [nextCursor, setNextCursor] = useState(properties.nextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sync state with props when the page refreshes
  useEffect(() => {
    setListings(properties.listings);
    setNextCursor(properties.nextCursor);
  }, [properties]);

  const sortedListings = useMemo(() => {
    return [...listings].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'status':
          return a.status.localeCompare(b.status);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [listings, sortBy]);

  const sortOptions = useMemo(() => [
    { value: 'newest', label: 'Newest', icon: IconHistory },
    { value: 'oldest', label: 'Oldest', icon: IconCalendarEvent },
    { value: 'price_asc', label: 'Price Low', icon: IconSortAscending },
    { value: 'price_desc', label: 'Price High', icon: IconSortDescending },
    { value: 'status', label: 'Status', icon: IconCircleCheck },
  ], []);

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/10 text-green-600 border-green-500/20',
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
    flagged: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  };

  const formatStatus = useCallback((status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedProperty) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/landlord/properties?id=${selectedProperty.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setListings(prev => prev.filter(p => p.id !== selectedProperty.id));
        setDeleteModalOpen(false);
        router.refresh();
        toast.success(`Property "${selectedProperty.title}" has been deleted.`);
      } else {
        toast.error('Failed to delete property. Please try again.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred while deleting the property.');
    } finally {
      setIsDeleting(false);
    }
  }, [selectedProperty, router]);

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const response = await fetch(`/api/landlord/properties?cursor=${nextCursor}`);
      const data = await response.json();

      if (data.success && data.data) {
        setListings((prev) => [...prev, ...data.data.listings]);
        setNextCursor(data.data.nextCursor);
      }
    } catch (error) {
      console.error('Error loading more properties:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, isLoadingMore]);

  const handleGenerateReport = async () => {
    const columns = ['Title', 'Price (PHP)', 'Status', 'Rooms', 'Baths', 'Date Added'];
    const data = sortedListings.map(p => [
      p.title,
      p.price.toLocaleString(),
      p.status.toUpperCase(),
      p.roomCount.toString(),
      p.bathroomCount.toString(),
      new Date(p.createdAt).toLocaleDateString()
    ]);

    await generateTablePDF(
      'Properties_Report',
      columns,
      data,
      {
        title: 'Property Portfolio Report',
        subtitle: `A comprehensive list of your current property listings (${sortedListings.length} total)`,
        author: 'Landlord Dashboard'
      }
    );
  };

  return (
    <div className="space-y-8 p-1">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && selectedProperty && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 max-w-sm w-full shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-orange-500" />

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-6 text-red-500 animate-pulse">
                  <IconAlertTriangle size={32} />
                </div>

                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Delete Property?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                  Are you sure you want to remove <span className="font-bold text-gray-900 dark:text-white">"{selectedProperty.title}"</span>? This action is permanent.
                </p>

                <div className="flex flex-col w-full gap-2.5">
                  <Button
                    variant="danger"
                    isLoading={isDeleting}
                    onClick={handleConfirmDelete}
                    className="rounded-lg py-3 shadow-lg shadow-red-500/10 text-sm"
                  >
                    Confirm Deletion
                  </Button>
                  <Button
                    outline
                    onClick={() => setDeleteModalOpen(false)}
                    className="rounded-lg py-3 border-gray-200 dark:border-gray-700 text-sm"
                  >
                    Keep Property
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Property Modal */}
      <AnimatePresence>
        {viewModalOpen && selectedProperty && (
          <PropertyDetailsModal 
            property={selectedProperty}
            onClose={() => setViewModalOpen(false)}
            statusColors={statusColors}
            formatStatus={formatStatus}
          />
        )}
      </AnimatePresence>

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 shadow-sm"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-primary">
              <IconBuilding size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                Properties
              </h1>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                Manage your rental portfolio
              </p>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full lg:w-auto mt-4 lg:mt-0">
            <div className="flex flex-wrap items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
              {[
                { value: 'newest', label: 'Newest', icon: IconCalendarEvent },
                { value: 'oldest', label: 'Oldest', icon: IconHistory },
                { value: 'price_desc', label: 'High Price', icon: IconSortDescending },
                { value: 'price_asc', label: 'Low Price', icon: IconSortAscending },
                { value: 'status', label: 'Status', icon: IconCircleCheck },
              ].map((option) => {
                const Icon = option.icon;
                const isSelected = sortBy === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300",
                      isSelected
                        ? "bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]"
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm"
                    )}
                  >
                    <Icon size={14} className={cn("transition-transform duration-300", isSelected && "rotate-3")} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  viewMode === 'grid'
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                )}
                title="Grid View"
              >
                <IconLayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  viewMode === 'list'
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                )}
                title="List View"
              >
                <IconList size={18} />
              </button>
            </div>

            <GenerateReportButton 
              onGeneratePDF={handleGenerateReport} 

            />

            <Link href="/landlord/properties/create" className="w-full sm:w-auto">
              <Button className="rounded-xl w-full px-5 py-3 shadow-xl shadow-primary/20 group bg-primary text-white">
                <span className="flex items-center gap-2">
                  <IconPlus size={11} className="group-hover:rotate-90 transition-transform duration-300" />
                  <span className="text-xs uppercase tracking-widest font-black">Add Property</span>
                </span>
              </Button>
            </Link>
          </div>
        </div>
        {/* Abstract background elements */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-400/10 rounded-full blur-xl" />
      </motion.div>

      {/* Properties List */}
      {listings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-2xl mb-6 text-gray-300">
            <IconBuilding size={32} />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No properties listed yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto text-sm leading-relaxed font-medium">
            Your rental portfolio is currently empty. Start growing your business by listing your first property today.
          </p>
          <Link href="/landlord/properties/create">
            <Button className="rounded-xl px-6 py-3 shadow-lg shadow-primary/20">
              <IconPlus className="mr-2" size={12} />
              <span className="text-xs uppercase tracking-widest font-black">Add Property</span>
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "flex flex-col gap-4"
        )}>
          {sortedListings.map((property, idx) => (
            viewMode === 'grid' ? (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none hover:shadow-2xl transition-all duration-500"
              >
                {/* Property Image */}
                <div className="relative h-52 overflow-hidden">
                  {property.imageSrc ? (
                    <img
                      src={property.imageSrc}
                      alt={property.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <IconBuilding size={32} className="text-gray-300" />
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <div className={cn(
                      "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg border border-white/50 dark:border-gray-800 flex items-center gap-1.5",
                      statusColors[property.status].split(' ')[1]
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse capitalize", statusColors[property.status].split(' ')[0].replace('bg-', 'bg-').replace('/10', ''))} />
                      {formatStatus(property.status)}
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-6">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="min-w-0">
                      <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors leading-tight mb-1 truncate">
                        {property.title}
                      </h3>
                      <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">{property.roomCount} Rooms • {property.bathroomCount} Baths</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mb-6">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">₱{property.price.toLocaleString()}</span>
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">/ Mo</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-3">
                    <Link href={`/landlord/properties/${property.id}/edit`} className="flex-1">
                      <Button className="rounded-xl w-full py-2.5 text-[10px] font-black uppercase tracking-widest shadow-md shadow-primary/10 group/btn">
                        <span className="flex items-center justify-center gap-2">
                          <IconEdit className="group-hover/btn:rotate-12 transition-transform duration-300" size={11} />
                          Edit
                        </span>
                      </Button>
                    </Link>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/40 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 group/dots">
                          <IconDots size={12} className="text-gray-400 group-hover/dots:text-primary transition-colors" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-48 p-1.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl shadow-gray-200/50 dark:shadow-black/40"
                      >
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            className="flex items-center gap-3 px-3 py-2.5 text-[12px] font-bold text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10 transition-colors"
                            onClick={() => {
                              setSelectedProperty(property);
                              setViewModalOpen(true);
                            }}
                          >
                            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                              <IconEye size={11} className="text-blue-500" />
                            </div>
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator className="my-1 bg-gray-100 dark:bg-gray-700" />
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            className="flex items-center gap-3 px-3 py-2.5 text-[12px] font-bold text-red-500 rounded-lg cursor-pointer hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            onClick={() => {
                              setSelectedProperty(property);
                              setDeleteModalOpen(true);
                            }}
                          >
                            <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                              <IconTrash size={11} className="text-red-500" />
                            </div>
                            Delete Property
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* List View Mode */
              <motion.div
                key={property.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-primary/20 p-4 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Property Image */}
                  <div className="relative w-full sm:w-32 h-40 sm:h-32 rounded-xl overflow-hidden flex-shrink-0">
                    {property.imageSrc ? (
                      <img
                        src={property.imageSrc}
                        alt={property.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <IconBuilding size={20} className="text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Property Content */}
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <div className="flex items-center justify-between sm:justify-start gap-3 mb-2">
                      <h3 className="text-xl font-black text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                        {property.title}
                      </h3>
                      <div className={cn(
                        "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                        statusColors[property.status]
                      )}>
                        {formatStatus(property.status)}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-gray-500 dark:text-gray-400 mb-2">
                       <span className="text-xs font-bold flex items-center gap-1.5">
                         <IconBuilding size={14} className="text-primary" />
                         {property.roomCount} Rooms
                       </span>
                       <span className="text-xs font-bold flex items-center gap-1.5">
                         <IconBath size={14} className="text-blue-500" />
                         {property.bathroomCount} Baths
                       </span>
                       <span className="text-xs font-bold flex items-center gap-1.5">
                         <IconCalendarFilled size={14} className="text-orange-500" />
                         {new Date(property.createdAt).toLocaleDateString()}
                       </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-gray-900 dark:text-white">₱{property.price.toLocaleString()}</span>
                      <span className="text-[10px] items-center font-bold uppercase tracking-widest text-gray-400">/ month</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 sm:pl-6 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800">
                    <Link href={`/landlord/properties/${property.id}/edit`} className="flex-1 sm:flex-none">
                      <button className="w-full sm:w-auto p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center">
                        <IconEdit size={16} />
                        <span className="sm:hidden ml-2 text-[10px] font-black uppercase tracking-widest">Edit</span>
                      </button>
                    </Link>
                    <button 
                      onClick={() => {
                        setSelectedProperty(property);
                        setViewModalOpen(true);
                      }}
                      className="flex-1 sm:flex-none p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all flex items-center justify-center"
                    >
                      <IconEye size={16} />
                      <span className="sm:hidden ml-2 text-[10px] font-black uppercase tracking-widest">View</span>
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedProperty(property);
                        setDeleteModalOpen(true);
                      }}
                      className="flex-1 sm:flex-none p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex items-center justify-center"
                    >
                      <IconTrash size={16} />
                      <span className="sm:hidden ml-2 text-[10px] font-black uppercase tracking-widest">Delete</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          ))}
        </div>
      )}

      {/* Pagination / Load More */}
      {nextCursor && (
        <div className="flex justify-center pt-8">
          <Button 
            outline 
            className="rounded-xl px-10 py-4 group transition-all hover:bg-primary hover:text-white"
            onClick={handleLoadMore}
            isLoading={isLoadingMore}
          >
            <span className="flex items-center gap-2 uppercase font-black tracking-[0.15em] text-[10px]">
              {isLoadingMore ? 'Fetching properties...' : 'Load More Properties'}
              <IconChevronDown className={cn("group-hover:translate-y-0.5 transition-transform", isLoadingMore && "animate-bounce")} size={10} />
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}

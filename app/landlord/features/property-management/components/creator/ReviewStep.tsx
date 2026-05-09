import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  BadgeCheck, 
  Info,
  ChevronLeft,
  ExternalLink,
  Wifi,
  Wind,
  Utensils,
  Shirt,
  Car,
  Dumbbell,
  Tv,
  Waves,
  BookOpen,
  Landmark,
  Droplets,
  Zap,
  Sparkles,
  Tag,
  Users,
  Dog,
  Shield,
  Camera,
  Flame,
  Bus,
  Book,
  Calendar,
  HelpCircle,
  Gem,
  CheckCircle2,
  Lock,
  Focus,
  Images,
  FileCheck
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '@/components/common/Button';
import { cn } from '@/utils/helper';
import MediaPreviewOverlay from '@/components/common/MediaPreviewOverlay';
import SafeImage from '@/components/common/SafeImage';

interface ReviewStepProps {
  watch?: any;
  control?: any;
  onBack: (e?: any) => void;
}

const ReviewSection = ({ title, icon: Icon, children, colorClass, stepNumber }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-[#0B1221] rounded-[2.5rem] border border-gray-100 dark:border-gray-800/50 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 h-full flex flex-col group"
  >
    <div className="px-10 py-6 border-b border-gray-50 dark:border-gray-800/50 flex items-center justify-between bg-gray-50/20 dark:bg-gray-900/10">
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-2xl bg-white dark:bg-[#161F32] border border-gray-100 dark:border-gray-700 shadow-sm group-hover:scale-110 transition-transform duration-500", colorClass)}>
          <Icon size={20} />
        </div>
        <div>
          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-400 mb-0.5 block">Section {stepNumber}</span>
          <h4 className="text-[13px] font-black uppercase tracking-[0.1em] text-gray-900 dark:text-white">{title}</h4>
        </div>
      </div>
      <div className="flex items-center gap-2">
         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
         <CheckCircle2 size={18} className="text-emerald-500/40" />
      </div>
    </div>
    <div className="p-10 flex-1">
      {children}
    </div>
  </motion.div>
);

const AMENITY_ICONS: Record<string, any> = {
  'WiFi': Wifi,
  'Air Conditioning': Wind,
  'Kitchen': Utensils,
  'Laundry': Shirt,
  'Parking': Car,
  'Security': ShieldCheck,
  'Gym': Dumbbell,
  'TV': Tv,
  'Pool': Waves,
  'Study Area': BookOpen,
  'Balcony': Landmark,
  'Water': Droplets,
  'Electricity': Zap,
  'Cleaning': Sparkles,
};

const ReviewField = ({ label, value, darkValue }: { label: string; value: any; darkValue?: boolean }) => {
  const decodeValue = (val: any) => {
    if (typeof val !== 'string') return val;
    if (typeof document === 'undefined') return val;
    
    let decoded = val;
    const parser = new DOMParser();
    for (let i = 0; i < 5; i++) {
      const dom = parser.parseFromString(decoded, 'text/html');
      const newDecoded = dom.documentElement.textContent || decoded;
      if (newDecoded === decoded) break;
      decoded = newDecoded;
    }
    return decoded;
  };

  const cleanValue = decodeValue(value);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 ml-1">{label}</span>
      <div className={cn(
        "px-5 py-4 rounded-2xl bg-gray-50/50 dark:bg-[#161F32]/50 border border-gray-100 dark:border-gray-800/50 text-[13px] font-bold min-h-[54px] flex flex-col justify-center items-start leading-relaxed break-words whitespace-pre-wrap transition-all hover:border-primary/20",
        darkValue ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
      )}>
        {cleanValue || <span className="opacity-30 italic font-normal text-xs uppercase tracking-widest">Awaiting Input</span>}
      </div>
    </div>
  );
};

const ReviewStep: React.FC<ReviewStepProps> = ({ watch, control, onBack }) => {
  const rooms = watch('propertyConfig.rooms') || [];
  const propertyImages = watch('propertyImages.property') || [];
  const roomImages = watch('propertyImages.rooms') || {};
  const docs = watch('documents') || {};
  const amenities = watch('propertyConfig.amenities') || [];
  const customRules = watch('propertyConfig.rules') || [];
  const customFeatures = watch('propertyConfig.features') || [];

  const [previewData, setPreviewData] = useState<{ isOpen: boolean; images: string[]; index: number; title: string }>({
    isOpen: false,
    images: [],
    index: 0,
    title: ''
  });

  const handlePreview = (images: string[], index: number, title: string) => {
    setPreviewData({ isOpen: true, images, index, title });
  };

  const renderAmenity = (ca: string) => {
    const [label, iconName] = ca.includes('|') ? ca.split('|') : [ca, 'Tag'];
    const Icon = AMENITY_ICONS[label] || (LucideIcons as any)[iconName] || Tag;
    return (
      <span key={ca} className="px-4 py-2 rounded-[1rem] bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100/50 dark:border-blue-500/10 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2.5 transition-all hover:bg-blue-100 dark:hover:bg-blue-500/10 shadow-sm">
        <Icon size={14} className="opacity-70" />
        {label}
      </span>
    );
  };

  const renderCustomTag = (ct: string, colorClass: string, fallbackIcon: any) => {
    const [label, iconName] = ct.includes('|') ? ct.split('|') : [ct, ''];
    const Icon = (LucideIcons as any)[iconName] || fallbackIcon;
    return (
      <span key={ct} className={cn("px-4 py-2 rounded-[1rem] border text-[10px] font-black uppercase tracking-widest flex items-center gap-2.5 transition-all shadow-sm", colorClass)}>
        <Icon size={12} /> {label}
      </span>
    );
  };

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto">
      <div className="text-center mb-16 relative">
        <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-6"
        >
          <Gem size={14} /> Final Verification
        </motion.div>
        <h3 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-3">Application Review</h3>
        <p className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.4em] opacity-50">Please audit all data points carefully before legal submission</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-10 rounded-[3rem] bg-gray-50 dark:bg-[#161F32] border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden mb-12"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-emerald-500/20 to-primary/20" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner">
            <Info size={32} />
          </div>
          <div>
            <h5 className="text-[13px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white mb-1">Final Data Check</h5>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight leading-relaxed max-w-lg">By proceeding, you confirm all data entries are legally accurate. Discrepancies may lead to immediate application rejection.</p>
          </div>
        </div>
        <Button outline type="button" onClick={onBack} className="flex items-center justify-center rounded-2xl px-12 py-4 uppercase text-[11px] font-black tracking-[0.3em] gap-3 bg-white dark:bg-[#0B1221] shrink-0 w-full md:w-auto h-fit hover:border-primary transition-all shadow-lg hover:shadow-xl active:scale-95">
          <ChevronLeft size={16} /> Edit Application
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Row 1: Identity & Essentials */}
        <ReviewSection stepNumber="01" title="Business Identity" icon={Building2} colorClass="text-emerald-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <ReviewField label="Registered Business Name" value={watch('businessInfo.businessName')} darkValue />
            <ReviewField label="Market Experience" value={watch('businessInfo.yearsExperience')?.replace(/-/g, ' ')} />
            <div className="sm:col-span-2">
              <ReviewField label="Property Type" value={watch('businessInfo.businessType')?.replace(/-/g, ' ')} />
            </div>
            <div className="sm:col-span-2">
              <ReviewField label="Your Business Story" value={watch('businessInfo.businessDescription')} />
            </div>
          </div>
        </ReviewSection>

        <ReviewSection stepNumber="02" title="Property Essentials" icon={BadgeCheck} colorClass="text-primary">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="sm:col-span-2">
              <ReviewField label="Public Listing Name" value={watch('propertyInfo.propertyName')} darkValue />
            </div>
            <ReviewField 
              label="Main Category" 
              value={
                Array.isArray(watch('propertyInfo.category')) 
                  ? (watch('propertyInfo.category') || []).join(' • ') 
                  : watch('propertyInfo.category') || 'None'
              } 
            />
            <ReviewField label="Floor Pricing" value={`₱${watch('propertyInfo.price') || '0'}`} />
            <div className="sm:col-span-2">
              <ReviewField label="Public Property Description" value={watch('propertyInfo.description')} />
            </div>
          </div>
        </ReviewSection>

        {/* Row 2: Location & Capacity */}
        <ReviewSection stepNumber="03" title="Mapping Details" icon={MapPin} colorClass="text-orange-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="sm:col-span-2">
              <ReviewField label="Physical Street Address" value={watch('location.address')} />
            </div>
            <ReviewField label="City / Municipality" value={watch('location.city')} />
            <ReviewField label="Province" value={watch('location.province')} />
            <div className="sm:col-span-2">
              <ReviewField label="Postal Zip Code" value={watch('location.zipCode')} />
            </div>
          </div>
        </ReviewSection>

        <ReviewSection stepNumber="04" title="Listing Capacity" icon={ShieldCheck} colorClass="text-purple-500">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <ReviewField label="Total Rooms" value={`${watch('propertyConfig.totalRooms') || 0} Units`} />
            <ReviewField label="Bathrooms" value={`${watch('propertyConfig.bathroomCount') || 0} Baths`} />
            <ReviewField label="Reservation" value={`₱${watch('propertyInfo.price') || '0'}`} />
          </div>
          <div className="mt-10">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 ml-1">Universal Amenities</span>
             <div className="flex flex-wrap gap-3 mt-4">
                {Array.isArray(amenities) && amenities.length > 0 ? (
                  amenities.map((a: string) => renderAmenity(a))
                ) : <span className="text-[10px] italic text-gray-400 uppercase tracking-widest">Standard Amenities Only</span>}
             </div>
          </div>
        </ReviewSection>

        {/* Row 3: Rules & Security */}
        <ReviewSection stepNumber="05" title="Rules & Preferences" icon={Users} colorClass="text-rose-500">
           <div className="flex flex-wrap gap-3">
              {watch('propertyConfig.female-only') && <span className="px-4 py-2.5 rounded-[1.2rem] bg-rose-50/50 dark:bg-rose-500/5 border border-rose-100/50 dark:border-rose-500/10 text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest flex items-center gap-2.5 shadow-sm"><ShieldCheck size={14} /> Female-only</span>}
              {watch('propertyConfig.male-only') && <span className="px-4 py-2.5 rounded-[1.2rem] bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100/50 dark:border-blue-500/10 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2.5 shadow-sm"><ShieldCheck size={14} /> Male-only</span>}
              {watch('propertyConfig.visitors-allowed') && <span className="px-4 py-2.5 rounded-[1.2rem] bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2.5 shadow-sm"><Users size={14} /> Visitors Allowed</span>}
              {watch('propertyConfig.pets-allowed') && <span className="px-4 py-2.5 rounded-[1.2rem] bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100/50 dark:border-amber-500/10 text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-2.5 shadow-sm"><Dog size={14} /> Pets Allowed</span>}
              {watch('propertyConfig.smoking-allowed') && <span className="px-4 py-2.5 rounded-[1.2rem] bg-gray-50/50 dark:bg-gray-500/5 border border-gray-100/50 dark:border-gray-500/10 text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2.5 shadow-sm"><Wind size={14} /> Smoking Allowed</span>}
              {watch('propertyConfig.no-curfew') && <span className="px-4 py-2.5 rounded-[1.2rem] bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/10 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2.5 shadow-sm"><Calendar size={14} /> No Curfew Enforced</span>}
              {Array.isArray(customRules) && customRules.map((r: string) => renderCustomTag(r, "bg-rose-50/50 dark:bg-rose-500/5 border-rose-100/50 dark:border-rose-500/10 text-rose-600 dark:text-rose-400", ShieldCheck))}
           </div>
        </ReviewSection>

        <ReviewSection stepNumber="06" title="Security & Features" icon={Shield} colorClass="text-emerald-500">
           <div className="flex flex-wrap gap-3">
              {watch('propertyConfig.security24h') && <span className="px-4 py-2.5 rounded-[1.2rem] bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/10 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2.5 shadow-sm"><Shield size={14} /> 24/7 Security</span>}
              {watch('propertyConfig.cctv') && <span className="px-4 py-2.5 rounded-[1.2rem] bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/10 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2.5 shadow-sm"><Camera size={14} /> CCTV Cameras</span>}
              {watch('propertyConfig.fireSafety') && <span className="px-4 py-2.5 rounded-[1.2rem] bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/10 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2.5 shadow-sm"><Flame size={14} /> Fire Safety</span>}
              {watch('propertyConfig.floodFree') && <span className="px-4 py-2.5 rounded-[1.2rem] bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/10 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2.5 shadow-sm"><Waves size={14} /> Flood-Free Area</span>}
              {watch('propertyConfig.backupPower') && <span className="px-4 py-2.5 rounded-[1.2rem] bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/10 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2.5 shadow-sm"><Zap size={14} /> Backup Power</span>}
              {watch('propertyConfig.nearTransport') && <span className="px-4 py-2.5 rounded-[1.2rem] bg-sky-50/50 dark:bg-sky-500/5 border border-sky-100/50 dark:border-sky-500/10 text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest flex items-center gap-2.5 shadow-sm"><Bus size={14} /> Near Transport</span>}
              {Array.isArray(customFeatures) && customFeatures.map((f: string) => renderCustomTag(f, "bg-amber-50/50 dark:bg-amber-500/5 border-amber-100/50 dark:border-amber-500/10 text-amber-600 dark:text-amber-400", Sparkles))}
           </div>
        </ReviewSection>
      </div>

      {/* Full Width Sections */}
      <div className="space-y-12">
        {/* Step 7: Room Inventory */}
        <ReviewSection stepNumber="07" title="Room Details & Layout" icon={BookOpen} colorClass="text-blue-500">
          <div className="space-y-8">
            <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-50 dark:border-gray-800/50">
               <div className="flex flex-col">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-1">Room Summary</p>
                  <p className="text-[13px] font-black text-gray-900 dark:text-white uppercase tracking-wider">{rooms.length} Units Registered</p>
               </div>
               <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                     {[...Array(Math.min(4, rooms.length))].map((_, i) => (
                       <div key={i} className="w-8 h-8 rounded-xl bg-primary/10 border-2 border-white dark:border-[#0B1221] flex items-center justify-center text-[10px] font-black text-primary shadow-lg">
                          {i + 1}
                       </div>
                     ))}
                  </div>
                  {rooms.length > 4 && <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">+{rooms.length - 4} units</span>}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar p-1">
              {rooms.length > 0 ? rooms.map((room: any, index: number) => (
                <motion.div 
                  key={index}
                  whileHover={{ y: -5 }}
                  className="relative p-6 rounded-[2rem] bg-gray-50/30 dark:bg-[#161F32]/30 border border-gray-100 dark:border-gray-800/50 flex flex-col gap-4 group hover:border-primary/40 transition-all duration-500 hover:shadow-[0_15px_40px_rgba(0,0,0,0.05)] overflow-hidden"
                >
                  {/* Card Background Accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-all" />
                  
                  <div className="flex items-center justify-between relative z-10">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1C263D] border border-gray-100 dark:border-gray-700 flex items-center justify-center text-sm font-black text-gray-400 group-hover:text-primary transition-all duration-500 shadow-sm group-hover:shadow-md">
                          {index + 1}
                        </div>
                        <div>
                          <h5 className="text-[11px] font-black uppercase tracking-[0.1em] text-gray-900 dark:text-white group-hover:text-primary transition-colors">{room.roomType || 'Standard'} Unit</h5>
                          <div className="flex items-center gap-2 mt-0.5">
                             <Users size={10} className="text-gray-400" />
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Cap: {room.capacity || (room.bedCount * (room.bedType?.includes('Bunk') ? 2 : 1))} PAX</p>
                          </div>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black mb-1">
                           ₱{room.price}
                        </div>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Monthly Rate</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-5 border-t border-gray-50 dark:border-gray-800/40 relative z-10">
                     <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                           <Focus size={10} className="text-primary/50" />
                           <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Unit Setup</span>
                        </div>
                        <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 truncate">{room.bedCount}x {room.bedType}</span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                           <Utensils size={10} className="text-primary/50" />
                           <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Bathroom</span>
                        </div>
                        <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 truncate">{room.bathroomArrangement?.replace(/_/g, ' ') || 'Shared'}</span>
                     </div>
                  </div>

                  {room.amenities?.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2 relative z-10">
                      {room.amenities.slice(0, 5).map((a: string) => (
                        <span key={a} className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-[#1C263D]/80 border border-gray-100 dark:border-gray-700 text-[8px] font-black text-gray-500 uppercase tracking-tighter shadow-sm">
                          {a.includes('|') ? a.split('|')[0] : a}
                        </span>
                      ))}
                      {room.amenities.length > 5 && <span className="text-[8px] font-black text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">+{room.amenities.length - 5}</span>}
                    </div>
                  ) : (
                    <div className="mt-2 py-2 px-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-dashed border-gray-200 dark:border-gray-700 text-[8px] font-black text-gray-400 uppercase tracking-widest text-center">
                       Basic Features Only
                    </div>
                  )}
                </motion.div>
              )) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center bg-gray-50/20 dark:bg-[#161F32]/20 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800/50">
                   <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center mb-6">
                      <Info className="text-gray-300 dark:text-gray-600" size={32} />
                   </div>
                   <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">No Units Found in Configuration</p>
                </div>
              )}
            </div>
          </div>
        </ReviewSection>

        {/* Step 8: Media and Docs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Combined Asset Highlights */}
            <div className="lg:col-span-2">
              <ReviewSection stepNumber="08" title="Photo Review" icon={Images} colorClass="text-teal-500">
                <div className="space-y-12">
                  <div className="flex flex-col gap-8">
                    <div className="flex items-center justify-between px-1">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 mb-1">Property Visual Assets</span>
                          <span className="text-[13px] font-black text-gray-900 dark:text-white uppercase tracking-wider">
                            {Object.values(propertyImages || {}).flat().length} Official Files
                          </span>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(propertyImages || {}).map(([category, urls]: [string, any]) => {
                        if (!urls || urls.length === 0) return null;
                        return (
                          <div key={category} className="p-6 rounded-[2.5rem] bg-gray-50/30 dark:bg-[#161F32]/30 border border-gray-100 dark:border-gray-800/50 flex flex-col gap-4">
                            <div className="flex items-center justify-between px-2">
                               <span className="text-[10px] font-black uppercase tracking-widest text-primary">{category}</span>
                               <span className="text-[9px] font-bold text-gray-400 uppercase">{urls.length} Photos</span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                               {urls.map((img: string, idx: number) => (
                                 <div 
                                   key={idx} 
                                   className="w-16 h-16 rounded-2xl border-2 border-white dark:border-[#1C263D] shadow-sm cursor-pointer transition-all overflow-hidden"
                                   onClick={() => handlePreview(urls, idx, `Property: ${category}`)}
                                 >
                                   <SafeImage src={img} alt={`${category} ${idx + 1}`} />
                                 </div>
                               ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {Object.values(propertyImages || {}).flat().length === 0 && (
                      <div className="px-8 py-10 rounded-[3rem] bg-gray-50/20 dark:bg-gray-800/10 border-2 border-dashed border-gray-100 dark:border-gray-800 flex items-center justify-center">
                         <span className="text-xs italic text-gray-400 uppercase tracking-[0.2em]">No Property Assets Found</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between px-1">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 mb-1">Unit-Specific Assets</span>
                          <span className="text-[13px] font-black text-gray-900 dark:text-white uppercase tracking-wider">{Object.values(roomImages).flat().length} Registered Images</span>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {rooms.map((room: any, idx: number) => {
                         const images = roomImages[idx] || [];
                         if (images.length === 0) return null;
                         return (
                           <div key={idx} className="p-8 rounded-[2.5rem] bg-gray-50/30 dark:bg-[#161F32]/30 border border-gray-100 dark:border-gray-800/50 flex flex-col gap-5 hover:border-primary/20 transition-all group/room">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#1C263D] border border-gray-100 dark:border-gray-700 flex items-center justify-center text-[11px] font-black text-gray-400 group-hover/room:text-primary transition-colors">
                                       {idx + 1}
                                    </div>
                                    <span className="text-[11px] font-black uppercase text-gray-900 dark:text-white tracking-[0.1em]">{room.roomType || 'Standard'} Unit</span>
                                 </div>
                                 <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest">{images.length} Photos</span>
                              </div>
                              <div className="flex flex-wrap gap-4">
                                 {images.map((img: string, imgIdx: number) => (
                                   <div 
                                     key={imgIdx} 
                                     className="w-20 h-20 rounded-2xl border-4 border-white dark:border-[#1C263D] shadow-md cursor-pointer transition-all duration-500 overflow-hidden"
                                     onClick={() => handlePreview(images, imgIdx, `Unit ${idx + 1}: ${room.roomType || 'Standard'}`)}
                                   >
                                     <SafeImage src={img} alt={`Room ${idx + 1} Image ${imgIdx + 1}`} />
                                   </div>
                                 ))}
                              </div>
                           </div>
                         );
                       })}
                    </div>
                    {Object.values(roomImages).flat().length === 0 && (
                      <div className="px-8 py-10 rounded-[3rem] bg-gray-50/20 dark:bg-gray-800/10 border-2 border-dashed border-gray-100 dark:border-gray-800 flex items-center justify-center">
                         <span className="text-xs italic text-gray-400 uppercase tracking-[0.2em]">No Unit Assets Found</span>
                      </div>
                    )}
                  </div>
                </div>
              </ReviewSection>
            </div>

            {/* Bottom: Legal Docs Stack */}
            <div className="lg:col-span-2">
              <ReviewSection stepNumber="09" title="Legal Documents" icon={FileCheck} colorClass="text-emerald-500">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                  {Object.entries(docs).filter(([_, url]) => !!url).length > 0 ? (
                    Object.entries(docs).filter(([_, url]) => !!url).map(([key, url]: [string, any], idx: number) => (
                      <motion.div 
                         key={key} 
                         whileHover={{ y: -10 }}
                         className="flex flex-col items-center gap-4 group/doc"
                      >
                        <div 
                          onClick={() => handlePreview([url], 0, key.replace(/([A-Z])/g, ' $1'))}
                          className="w-full aspect-square rounded-3xl border-4 border-white dark:border-[#1C263D] shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 bg-white dark:bg-[#1C263D] flex items-center justify-center group relative"
                        >
                          <SafeImage 
                            src={url} 
                            alt={key} 
                          />
                          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/doc:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[2px]">
                             <Focus size={32} />
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 text-center tracking-[0.1em] px-2 leading-relaxed">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full w-full flex flex-col items-center justify-center gap-4 py-20">
                       <Lock size={40} className="text-gray-200 dark:text-gray-800" />
                       <span className="text-xs italic text-gray-400 uppercase tracking-[0.2em]">No Documents Found</span>
                    </div>
                  )}
                </div>
              </ReviewSection>
            </div>
        </div>
      </div>


      {/* Media Preview Overlay */}
      <MediaPreviewOverlay
        isOpen={previewData.isOpen}
        onClose={() => setPreviewData(prev => ({ ...prev, isOpen: false }))}
        images={previewData.images}
        currentIndex={previewData.index}
        onNavigate={(newIdx) => setPreviewData(prev => ({ ...prev, index: newIdx }))}
        title={previewData.title}
      />
    </div>
  );
};

export default ReviewStep;

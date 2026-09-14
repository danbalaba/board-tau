import React, { useState, useMemo } from 'react';
import { 
  User, 
  Building2, 
  ShieldCheck, 
  BadgeCheck, 
  Info,
  ChevronLeft,
  Camera,
  FileText,
  Eye,
  Pencil,
  MapPin,
  Phone,
  Mail,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../common/Button';
import { cn, formatPhoneNumber, formatPropertyType } from '@/utils/helper';
import MediaPreviewOverlay from '@/components/common/MediaPreviewOverlay';
import SafeImage from '../../common/SafeImage';

import dynamic from 'next/dynamic';
import { TAU_COORDINATES } from "@/utils/constants";

const Map = dynamic(() => import("@/components/common/Map"), { ssr: false });

interface ReviewStepProps {
  watch: any;
  onBack: (e?: any) => void;
  onGoToStep?: (desktopStep: number, mobileStepNum: number) => void;
  capturedSelfie: string | null;
  capturedID: string | null;
  facadeFile: File | null;
  permitFile: File | null;
  utilityBillFile?: File | null;
  fireSafetyFile: File | null;
}

const SECTION_TABS = [
  { id: 'PERSONAL', label: 'Personal Info', icon: User },
  { id: 'PROPERTY', label: 'Property Details', icon: Building2 },
  { id: 'LOCATION', label: 'Location & Map', icon: MapPin },
  { id: 'IDENTITY', label: 'Face & ID', icon: Camera },
  { id: 'PERMITS', label: 'Photos & Permits', icon: ShieldCheck }
];

const ReviewSection = ({ title, icon: Icon, children, colorClass, onEdit }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-slate-800/90 rounded-3xl border border-gray-100 dark:border-slate-700/80 overflow-hidden shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between p-5 sm:p-7 space-y-6 w-full"
  >
    <div>
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-700/80 mb-5 gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className={cn("p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-700/60 border border-slate-200/60 dark:border-slate-600/50 shrink-0", colorClass)}>
            <Icon size={18} />
          </div>
          <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-primary dark:text-[#4fa89a]">{title}</h4>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/80 hover:bg-primary hover:text-white dark:hover:bg-primary text-slate-600 dark:text-slate-200 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer border border-slate-200 dark:border-slate-600 shadow-xs active:scale-95"
            >
              <Pencil size={12} />
              <span>Edit</span>
            </button>
          )}
          <div className="p-1 rounded-full bg-primary/10 text-primary dark:text-[#4fa89a]">
            <BadgeCheck size={18} />
          </div>
        </div>
      </div>
      <div className="space-y-5">
        {children}
      </div>
    </div>
  </motion.div>
);

const ReviewField = ({ 
  label, 
  value, 
  icon: FieldIcon, 
  required = true,
  onEdit,
  placeholder = "No details provided" 
}: { 
  label: string; 
  value: any; 
  icon?: any; 
  required?: boolean;
  onEdit?: () => void;
  placeholder?: string;
}) => (
  <div className="flex flex-col gap-1.5 min-w-0 w-full group">
    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1 transition-colors flex items-center justify-between">
      <span>
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
    </label>
    <div 
      onClick={onEdit}
      className={cn(
        "relative w-full rounded-2xl bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700/80 shadow-xs px-4 py-3.5 flex items-center min-h-[52px] transition-all",
        onEdit && "cursor-pointer hover:border-primary/60 dark:hover:border-primary/60 hover:shadow-md active:scale-[0.998]"
      )}
    >
      {FieldIcon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors flex items-center justify-center pointer-events-none">
          <FieldIcon size={18} />
        </div>
      )}
      <div className={cn(
        "w-full text-xs sm:text-sm font-extrabold truncate",
        FieldIcon ? "pl-8" : "pl-0"
      )}>
        {value ? (
          <span className="truncate block text-slate-900 dark:text-slate-100">{value}</span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500 italic font-medium">{placeholder}</span>
        )}
      </div>
    </div>
  </div>
);

const ReviewStep: React.FC<ReviewStepProps> = ({ 
  watch, 
  onBack, 
  onGoToStep,
  capturedSelfie, 
  capturedID, 
  facadeFile,
  permitFile,
  utilityBillFile,
  fireSafetyFile
}) => {
  const [preview, setPreview] = useState<{ url: string; title: string } | null>(null);
  const [activeTab, setActiveTab] = useState<string>('PERSONAL');
  
  const businessInfo = watch('businessInfo');
  const contactInfo = watch('contactInfo');
  const propertyEvidence = watch('propertyEvidence');

  const facadePreviewUrl = useMemo(() => {
    if (!facadeFile) return null;
    return URL.createObjectURL(facadeFile);
  }, [facadeFile]);

  const openPreview = (file: File | string | null, title: string) => {
    if (!file) return;
    const url = typeof file === 'string' ? file : URL.createObjectURL(file);
    setPreview({ url, title });
  };

  const showSection = (tabId: string) => activeTab === tabId;

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-6 sm:pb-12 max-w-7xl mx-auto px-0 sm:px-2">
      
      {/* Desktop Header */}
      <div className="text-center mb-4 sm:mb-6 hidden md:block">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-[#4fa89a] border border-primary/20 text-xs font-black uppercase tracking-wider mb-2">
          <CheckCircle2 size={14} /> Final Step Before Admin Review
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1 font-[family-name:var(--font-outfit)]">Review Your Application</h3>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest opacity-80">Double-check all entered information before submitting to BoardTAU Admin</p>
      </div>

      {/* Category Section Pills Navigation Bar */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border-b border-slate-200 dark:border-slate-800 px-1 sm:px-0">
        {SECTION_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer shrink-0 select-none",
                isActive 
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800/80 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Icon size={13} className={isActive ? "text-white" : "shrink-0"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Cards Container: Always renders 1 clean section card to keep modal compact & non-stretching */}
      <div className="grid grid-cols-1 w-full max-w-3xl mx-auto transition-all duration-300">
        
        {/* Personal Information */}
        {showSection('PERSONAL') && (
          <ReviewSection 
            title="Personal Information" 
            icon={User} 
            colorClass="text-blue-500 dark:text-blue-400"
            onEdit={() => onGoToStep?.(1, 1)}
          >
            <div className="space-y-5">
              <ReviewField 
                label="Full Legal Name" 
                value={contactInfo?.fullName} 
                icon={User} 
                onEdit={() => onGoToStep?.(1, 1)}
                placeholder="e.g. Juan De La Cruz"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                <ReviewField 
                  label="Primary Contact No." 
                  value={formatPhoneNumber(contactInfo?.phoneNumber)} 
                  icon={Phone} 
                  onEdit={() => onGoToStep?.(1, 1)}
                  placeholder="(+63) 9XX-XXXXXXX"
                />
                <ReviewField 
                  label="Official Email" 
                  value={contactInfo?.email} 
                  icon={Mail} 
                  onEdit={() => onGoToStep?.(1, 1)}
                  placeholder="your@email.com"
                />
              </div>
              <ReviewField 
                label="Property Relationship / Role" 
                value={
                  contactInfo?.ownershipRole === 'OWNER' ? 'Property Owner (Title Holder)' :
                  contactInfo?.ownershipRole === 'CO_OWNER_FAMILY' ? 'Co-Owner / Family Representative' :
                  contactInfo?.ownershipRole === 'AUTHORIZED_CARETAKER' ? 'Authorized Manager / Caretaker' :
                  contactInfo?.ownershipRole === 'SUBLESSOR' ? 'Master Tenant / Sub-lessor' :
                  contactInfo?.ownershipRole
                } 
                onEdit={() => onGoToStep?.(1, 1)}
                placeholder="Select role..."
              />
            </div>
          </ReviewSection>
        )}

        {/* Property Details */}
        {showSection('PROPERTY') && (
          <ReviewSection 
            title="Property Details" 
            icon={Building2} 
            colorClass="text-primary dark:text-[#4fa89a]"
            onEdit={() => onGoToStep?.(2, 6)}
          >
            <div className="space-y-5">
              <ReviewField 
                label="Business / Establishment Name" 
                value={businessInfo?.businessName} 
                icon={Building2} 
                onEdit={() => onGoToStep?.(2, 6)}
                placeholder="e.g. De La Cruz Student Boarding"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                <ReviewField 
                  label="Property Type" 
                  value={formatPropertyType(businessInfo?.businessType)} 
                  onEdit={() => onGoToStep?.(2, 7)}
                  placeholder="Select property type..."
                />
                <ReviewField 
                  label="Experience Level" 
                  value={
                    businessInfo?.yearsExperience === 'less-than-1' ? 'First-Time Landlord (< 1 year)' :
                    businessInfo?.yearsExperience === '1-3-years' ? 'Experienced (1 - 3 years)' :
                    businessInfo?.yearsExperience === '3-5-years' ? 'Established (3 - 5 years)' :
                    businessInfo?.yearsExperience === '5-plus-years' ? 'Veteran Landlord (5+ years)' :
                    businessInfo?.yearsExperience
                  } 
                  onEdit={() => onGoToStep?.(2, 8)}
                  placeholder="Select experience level..."
                />
              </div>
            </div>
          </ReviewSection>
        )}

        {/* Location & Map Preview */}
        {showSection('LOCATION') && (
          <ReviewSection 
            title="Property Location & Map Pin" 
            icon={MapPin} 
            colorClass="text-emerald-500 dark:text-emerald-400"
            onEdit={() => onGoToStep?.(3, 9)}
          >
            <div className="space-y-5">
              <ReviewField 
                label="Full Property Address" 
                value={propertyEvidence?.address} 
                icon={MapPin} 
                onEdit={() => onGoToStep?.(3, 9)}
                placeholder="No address selected..."
              />

              <div className="flex flex-col gap-1.5 min-w-0 w-full">
                <div className="flex items-center justify-between ml-1">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">
                    Pinned Coordinates Preview <span className="text-red-500">*</span>
                  </label>
                  {propertyEvidence?.latlng && (
                    <span className="text-[10px] font-bold text-primary dark:text-[#4fa89a] uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-md">
                      {propertyEvidence.latlng[0]?.toFixed(4)}, {propertyEvidence.latlng[1]?.toFixed(4)}
                    </span>
                  )}
                </div>

                <div className="h-60 sm:h-72 w-full rounded-2xl overflow-hidden border-2 border-gray-100 dark:border-slate-700/80 shadow-xs relative bg-slate-100 dark:bg-slate-900">
                  <Map 
                    center={propertyEvidence?.latlng || TAU_COORDINATES} 
                    readonly={true}
                    allowPinDrop={false}
                    title={businessInfo?.businessName || "Property Location"}
                    imageSrc={facadePreviewUrl || undefined}
                  />
                </div>
              </div>
            </div>
          </ReviewSection>
        )}

        {/* Face & ID Verification */}
        {showSection('IDENTITY') && (
          <ReviewSection 
            title="Face & ID Verification" 
            icon={Camera} 
            colorClass="text-purple-500 dark:text-purple-400"
            onEdit={() => onGoToStep?.(6, 14)}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
              {/* Selfie Field Box */}
              <div className="flex flex-col gap-1.5 h-full">
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">
                  Selfie Photo Verification <span className="text-red-500">*</span>
                </label>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700/80 shadow-xs flex-1 flex flex-col items-center justify-between text-center min-h-[175px]">
                  <div className="flex-1 flex items-center justify-center w-full">
                    <div 
                      onClick={() => openPreview(capturedSelfie, "Selfie Photo")}
                      className="w-20 h-20 sm:w-22 sm:h-22 rounded-full border-4 border-primary/30 overflow-hidden shadow-md cursor-pointer group relative bg-slate-200 dark:bg-slate-900 transition-transform active:scale-95 my-1"
                    >
                      {capturedSelfie ? (
                        <>
                          <SafeImage src={capturedSelfie} alt="Selfie Photo" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye className="text-white" size={20} />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={28} /></div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-primary dark:text-[#4fa89a]">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Verified Selfie</span>
                  </div>
                </div>
              </div>

              {/* Government ID Field Box */}
              <div className="flex flex-col gap-1.5 h-full">
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">
                  Government Issued ID <span className="text-red-500">*</span>
                </label>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700/80 shadow-xs flex-1 flex flex-col items-center justify-between text-center min-h-[175px]">
                  <div className="flex-1 flex items-center justify-center w-full">
                    <div 
                      onClick={() => openPreview(capturedID, "Government ID")}
                      className="w-full max-w-[190px] aspect-[1.586/1] rounded-xl border-4 border-primary/30 overflow-hidden shadow-md bg-slate-100 dark:bg-slate-900 cursor-pointer group relative transition-transform active:scale-95 my-1"
                    >
                      {capturedID ? (
                        <>
                          <SafeImage src={capturedID} alt="Government ID" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye className="text-white" size={22} />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400"><FileText size={28} /></div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-primary dark:text-[#4fa89a]">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">ID Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </ReviewSection>
        )}

        {/* Photos & Permits */}
        {showSection('PERMITS') && (
          <ReviewSection 
            title="Photos & Permits" 
            icon={ShieldCheck} 
            colorClass="text-amber-500 dark:text-amber-400"
            onEdit={() => onGoToStep?.(3, 10)}
          >
            <div className="space-y-5">
              {/* Facade Photo Input Representation */}
              <div className="flex flex-col gap-1.5">
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">
                  Building Front View Photo <span className="text-red-500">*</span>
                </label>
                <div 
                  onClick={() => openPreview(facadeFile, "Building Front View Photo")}
                  className="w-full h-28 sm:h-32 rounded-2xl border-2 border-gray-100 dark:border-slate-700/80 overflow-hidden cursor-pointer group relative bg-slate-100 dark:bg-slate-800 transition-all hover:border-primary"
                >
                  {facadeFile && facadePreviewUrl ? (
                    <>
                      <SafeImage src={facadePreviewUrl} alt="Front View Photo" />
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
                    Primary Verification Document <span className="text-red-500">*</span>
                  </label>
                  <div 
                    onClick={() => openPreview(utilityBillFile || permitFile, utilityBillFile ? "Utility Bill (Electric/Water)" : "Business Permit")}
                    className={cn(
                      "w-full rounded-2xl border-2 px-4 py-3.5 flex items-center justify-between transition-all group",
                      (utilityBillFile || permitFile) 
                        ? "bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700/80 cursor-pointer hover:border-primary" 
                        : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("p-2.5 rounded-xl shrink-0", (utilityBillFile || permitFile) ? "bg-primary/10 text-primary dark:text-[#4fa89a]" : "bg-slate-200 dark:bg-slate-700 text-slate-400")}>
                        <BadgeCheck size={18} />
                      </div>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                        {utilityBillFile ? "Utility Bill (Electric / Water)" : "Mayor's Business Permit"}
                      </span>
                    </div>
                    {(utilityBillFile || permitFile) && (
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
                    onClick={() => openPreview(fireSafetyFile, "Fire Safety Inspection Certificate")}
                    className={cn(
                      "w-full rounded-2xl border-2 px-4 py-3.5 flex items-center justify-between transition-all group",
                      fireSafetyFile 
                        ? "bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700/80 cursor-pointer hover:border-primary" 
                        : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("p-2.5 rounded-xl shrink-0", fireSafetyFile ? "bg-primary/10 text-primary dark:text-[#4fa89a]" : "bg-slate-200 dark:bg-slate-700 text-slate-400")}>
                        <BadgeCheck size={18} />
                      </div>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                        Fire Safety Inspection Certificate
                      </span>
                    </div>
                    {fireSafetyFile && (
                      <div className="flex items-center gap-1 text-[10px] font-black text-primary dark:text-[#4fa89a] uppercase tracking-widest bg-primary/10 dark:bg-primary/20 px-3 py-1.5 rounded-xl border border-primary/20 shrink-0">
                        <Eye size={12} /> View
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ReviewSection>
        )}
      </div>

      {/* Host Community Agreement & Data Protection Banner */}
      <div className="-mx-1 sm:mx-0 mt-4 sm:mt-8 p-4 sm:p-6 rounded-3xl bg-amber-50/90 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 border border-amber-500/20">
            <Info size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <h5 className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-amber-900 dark:text-amber-300">Host Community Agreement</h5>
            <p className="text-[10px] sm:text-xs font-bold text-amber-800/80 dark:text-amber-400/80 uppercase tracking-tight leading-relaxed">
              Your details are processed securely according to BoardTAU Privacy Policies.
            </p>
          </div>
        </div>
        
        <Button 
          outline 
          type="button" 
          onClick={onBack} 
          className="flex items-center justify-center rounded-2xl px-5 py-2.5 uppercase text-[10px] sm:text-xs font-black tracking-wider gap-2 bg-white dark:bg-slate-900 shrink-0 w-full md:w-auto hover:border-amber-400 transition-all"
        >
          <ChevronLeft size={14} /> Back to Previous Step
        </Button>
      </div>

      {/* Preview Overlay */}
      <MediaPreviewOverlay
        isOpen={!!preview}
        onClose={() => setPreview(null)}
        images={preview ? [preview.url] : []}
        currentIndex={0}
        title={preview?.title || "Document Preview"}
        isDocument={Boolean(preview?.title?.toLowerCase().includes('document') || preview?.title?.toLowerCase().includes('permit') || preview?.title?.toLowerCase().includes('cert'))}
      />
    </div>
  );
};

export default ReviewStep;



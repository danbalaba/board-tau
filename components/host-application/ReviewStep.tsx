import React from 'react';
import { 
  User, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  BadgeCheck, 
  Info,
  ChevronLeft,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import { cn } from '@/utils/helper';

interface ReviewStepProps {
  watch: any;
  onBack: () => void;
}

const ReviewSection = ({ title, icon: Icon, children, colorClass }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800/40 rounded-[2rem] border border-gray-100 dark:border-gray-700/50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
  >
    <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between bg-gray-50/30 dark:bg-gray-900/20">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm", colorClass)}>
          <Icon size={18} />
        </div>
        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white">{title}</h4>
      </div>
      <BadgeCheck size={16} className="text-emerald-500 opacity-50" />
    </div>
    <div className="p-8">
      {children}
    </div>
  </motion.div>
);

const ReviewField = ({ label, value, darkValue }: { label: string; value: any; darkValue?: boolean }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">{label}</span>
    <div className={cn(
      "px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-gray-900/40 border border-gray-50 dark:border-gray-800/50 text-sm font-bold min-h-[46px] flex items-center",
      darkValue ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
    )}>
      {value || <span className="opacity-30 italic font-normal">No data provided</span>}
    </div>
  </div>
);

const ReviewStep: React.FC<ReviewStepProps> = ({ watch, onBack }) => {
  const rooms = watch('propertyConfig.rooms') || [];
  const propertyImages = watch('propertyImages.property') || [];
  const docs = watch('documents') || {};

  const getDocStatus = (docUrl: string, label: string) => {
    return docUrl ? (
      <button 
        type="button" 
        onClick={() => window.open(docUrl, '_blank')}
        className="text-emerald-600 dark:text-emerald-500 font-bold hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
        title={`View ${label}`}
      >
        Uploaded <ExternalLink size={12} className="opacity-80" />
      </button>
    ) : (
      <span className="text-rose-500 font-bold opacity-60">Missing</span>
    );
  };

  const renderImages = () => {
    if (propertyImages.length === 0) {
      return <span className="text-xs italic text-gray-400">0 Images</span>;
    }
    return (
      <div className="flex gap-2 overflow-x-auto w-full custom-scrollbar pb-1">
        {propertyImages.map((img: string, idx: number) => (
          <img 
            key={idx} 
            src={img} 
            alt={`Property Upload ${idx + 1}`} 
            onClick={() => window.open(img, '_blank')}
            className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 hover:scale-105 transition-all shrink-0"
            title="Click to view full image"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-10">
        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-wider mb-2">Review Your Application</h3>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest opacity-60">Final verification before submission</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Step 1: Identity */}
        <ReviewSection title="Personal Information" icon={User} colorClass="text-blue-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ReviewField label="Full Legal Name" value={watch('contactInfo.fullName')} darkValue />
            <ReviewField label="Primary Phone" value={watch('contactInfo.phoneNumber')} />
            <div className="sm:col-span-2">
              <ReviewField label="Email Address" value={watch('contactInfo.email')} />
            </div>
            <div className="sm:col-span-2">
              <ReviewField label="Emergency Contact" value={`${watch('contactInfo.emergencyContact.name')} (${watch('contactInfo.emergencyContact.relationship')}) - ${watch('contactInfo.emergencyContact.phoneNumber')}`} />
            </div>
          </div>
        </ReviewSection>

        {/* Step 2: Branding */}
        <ReviewSection title="Business Assets" icon={Building2} colorClass="text-emerald-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ReviewField label="Business Entity" value={watch('businessInfo.businessName')} darkValue />
            <ReviewField label="Property Name" value={watch('propertyInfo.propertyName')} darkValue />
            <div className="sm:col-span-2">
              <ReviewField label="Classification" value={watch('businessInfo.businessType')} />
            </div>
            <div className="sm:col-span-2">
              <ReviewField label="Active Categories" value={(watch('propertyInfo.category') || []).join(' • ') || 'None'} />
            </div>
          </div>
        </ReviewSection>

        {/* Step 3: Location */}
        <ReviewSection title="Mapping Details" icon={MapPin} colorClass="text-orange-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <ReviewField label="Exact Address" value={watch('location.address')} />
            </div>
            <ReviewField label="City / Municipality" value={watch('location.city')} />
            <ReviewField label="Province" value={watch('location.province')} />
          </div>
        </ReviewSection>

        {/* Step 4: Config */}
        <ReviewSection title="Property Specs" icon={ShieldCheck} colorClass="text-purple-500">
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ReviewField label="Total units" value={watch('propertyConfig.totalRooms')} />
            <ReviewField label="Bathrooms" value={watch('propertyConfig.bathroomCount')} />
            <ReviewField label="Starting Price" value={`₱${watch('propertyInfo.price') || '0'}`} />
          </div>
          <div className="mt-8 space-y-6">
            <div>
               <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Listing Amenities</span>
               <div className="flex flex-wrap gap-2 mt-2">
                  {(watch('propertyConfig.amenities') || []).length > 0 ? (
                    (watch('propertyConfig.amenities') || []).map((a: string) => (
                      <span key={a} className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-[10px] font-black text-blue-600 uppercase tracking-widest">{a}</span>
                    ))
                  ) : <span className="text-[10px] italic text-gray-400">None selected</span>}
               </div>
            </div>
            <div>
               <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Rules & Access</span>
               <div className="flex flex-wrap gap-2 mt-2">
                  {watch('propertyConfig.femaleOnly') && <span className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-[10px] font-black text-rose-600 uppercase tracking-widest">Female Only</span>}
                  {watch('propertyConfig.maleOnly') && <span className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-[10px] font-black text-blue-600 uppercase tracking-widest">Male Only</span>}
                  {watch('propertyConfig.visitorsAllowed') && <span className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-[10px] font-black text-indigo-600 uppercase tracking-widest">Visitors Allowed</span>}
                  {watch('propertyConfig.petsAllowed') && <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-[10px] font-black text-amber-600 uppercase tracking-widest">Pets Allowed</span>}
                  {(!watch('propertyConfig.femaleOnly') && !watch('propertyConfig.maleOnly') && !watch('propertyConfig.visitorsAllowed') && !watch('propertyConfig.petsAllowed')) && <span className="text-[10px] italic text-gray-400">No specific rules set</span>}
               </div>
            </div>
          </div>
        </ReviewSection>

        {/* Step 5: Room Config Summary */}
        <ReviewSection title="Unit Inventory" icon={Building2} colorClass="text-indigo-500">
          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
            {rooms.length > 0 ? rooms.map((room: any, idx: number) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/50 rounded-2xl gap-4">
                <div>
                  <h5 className="text-[12px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest">Unit {idx + 1}: {room.roomType.replace('-', ' ')}</h5>
                  <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">{room.capacity} Bed(s) | {room.bathroomArrangement.replace('_', ' ')}</p>
                </div>
                <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 font-black text-[12px] rounded-xl border border-emerald-100 dark:border-emerald-500/20 whitespace-nowrap">
                  ₱{room.price || '0'} / mo
                </div>
              </div>
            )) : <p className="text-xs text-gray-400 font-bold italic">No active units defined.</p>}
          </div>
        </ReviewSection>

        {/* Step 6: Media and Docs */}
        <ReviewSection title="Media & Compliance" icon={BadgeCheck} colorClass="text-teal-500">
          <div className="grid grid-cols-1 gap-8">
            {/* Property Photos */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">
                Property Photos ({propertyImages.length})
              </span>
              <div className="px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-gray-900/40 border border-gray-50 dark:border-gray-800/50 min-h-[46px] flex items-center">
                {renderImages()}
              </div>
            </div>

            {/* Compliance Docs */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">
                Compliance Documents
              </span>
              <div className="px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-gray-900/40 border border-gray-50 dark:border-gray-800/50 min-h-[46px] flex items-center">
                <div className="flex gap-2 overflow-x-auto w-full custom-scrollbar pb-1">
                  {Object.entries(docs).filter(([_, url]) => !!url).length > 0 ? (
                    Object.entries(docs).filter(([_, url]) => !!url).map(([key, url]: [string, any], idx: number) => (
                      <div key={key} className="flex flex-col items-center gap-1 shrink-0">
                        <img 
                          src={url} 
                          alt={key} 
                          onClick={() => window.open(url, '_blank')}
                          className="w-10 h-10 sm:w-16 sm:h-16 object-cover rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 hover:scale-105 transition-all"
                          title={`Click to view ${key.replace(/([A-Z])/g, ' $1')}`}
                        />
                        <span className="text-[7px] font-black uppercase text-gray-400 truncate w-10 sm:w-16 text-center">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs italic text-gray-400">No documents uploaded</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ReviewSection>

      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 p-8 rounded-[2.5rem] bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Info size={24} />
          </div>
          <div>
            <h5 className="text-[11px] font-black uppercase tracking-widest text-gray-900 dark:text-white">Validation Notice</h5>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Please ensure all details are legally accurate to avoid application rejection.</p>
          </div>
        </div>
        <Button outline type="button" onClick={onBack} className="flex items-center justify-center rounded-2xl px-10 py-3 uppercase text-[10px] font-black tracking-widest gap-2 bg-white dark:bg-gray-800 shrink-0 w-full md:w-auto h-fit">
          <ChevronLeft size={14} /> Back to Edit
        </Button>
      </motion.div>
    </div>
  );
};

export default ReviewStep;

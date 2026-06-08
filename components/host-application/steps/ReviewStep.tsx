import React, { useState } from 'react';
import { 
  User, 
  Building2, 
  ShieldCheck, 
  BadgeCheck, 
  Info,
  ChevronLeft,
  Camera,
  FileText,
  X,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../common/Button';
import { cn } from '@/utils/helper';
import Modal from '../../modals/Modal';
import SafeImage from '../../common/SafeImage';

interface ReviewStepProps {
  watch: any;
  onBack: (e?: any) => void;
  capturedSelfie: string | null;
  capturedID: string | null;
  facadeFile: File | null;
  permitFile: File | null;
  fireSafetyFile: File | null;
}

const ReviewSection = ({ title, icon: Icon, children, colorClass }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800/40 rounded-[2rem] border border-gray-100 dark:border-gray-700/50 overflow-hidden shadow-sm h-full"
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
      {value || <span className="opacity-30 italic font-normal text-xs">No data provided</span>}
    </div>
  </div>
);

const ReviewStep: React.FC<ReviewStepProps> = ({ 
  watch, 
  onBack, 
  capturedSelfie, 
  capturedID, 
  facadeFile,
  permitFile,
  fireSafetyFile
}) => {
  const [preview, setPreview] = useState<{ url: string; title: string } | null>(null);
  
  const businessInfo = watch('businessInfo');
  const contactInfo = watch('contactInfo');
  const propertyEvidence = watch('propertyEvidence');

  const openPreview = (file: File | string | null, title: string) => {
    if (!file) return;
    const url = typeof file === 'string' ? file : URL.createObjectURL(file);
    setPreview({ url, title });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="text-center mb-10">
        <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Final Review</h3>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest opacity-60">Verification Summary</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Info */}
        <ReviewSection title="Landlord Profile" icon={User} colorClass="text-blue-500">
          <div className="grid grid-cols-1 gap-6">
            <ReviewField label="Full Legal Name" value={contactInfo?.fullName} darkValue />
            <div className="grid grid-cols-2 gap-4">
               <ReviewField label="Phone Number" value={contactInfo?.phoneNumber} />
               <ReviewField label="Email Address" value={contactInfo?.email} />
            </div>
            <ReviewField label="Experience Description" value={businessInfo?.businessDescription} />
          </div>
        </ReviewSection>

        {/* Business Info */}
        <ReviewSection title="Business Identity" icon={Building2} colorClass="text-emerald-500">
          <div className="grid grid-cols-1 gap-6">
            <ReviewField label="Business Name" value={businessInfo?.businessName} darkValue />
            <ReviewField label="Property Type" value={businessInfo?.businessType?.replace(/-/g, ' ').toUpperCase()} />
            <ReviewField label="Establishment Address" value={propertyEvidence?.address} />
          </div>
        </ReviewSection>

        {/* Biometric Verification */}
        <ReviewSection title="Biometric Security" icon={Camera} colorClass="text-primary">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Liveness Selfie</span>
              <div 
                onClick={() => openPreview(capturedSelfie, "Liveness Selfie")}
                className="w-24 h-24 rounded-full border-4 border-primary/20 overflow-hidden shadow-lg cursor-pointer group relative"
              >
                {capturedSelfie ? (
                  <>
                    <SafeImage src={capturedSelfie} alt="Liveness Selfie" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="text-white" size={20} />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300"><User size={32} /></div>
                )}
              </div>
              <div className="mt-3 flex items-center gap-1 text-emerald-500">
                <ShieldCheck size={12} />
                <span className="text-[8px] font-black uppercase tracking-widest">Blink Verified</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Identity Document</span>
              <div 
                onClick={() => openPreview(capturedID, "Identity Document")}
                className="w-full aspect-[1.586/1] rounded-xl border-4 border-primary/20 overflow-hidden shadow-lg bg-gray-50 cursor-pointer group relative"
              >
                {capturedID ? (
                  <>
                    <SafeImage src={capturedID} alt="Identity Document" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="text-white" size={24} />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300"><FileText size={32} /></div>
                )}
              </div>
              <div className="mt-3 flex items-center gap-1 text-emerald-500">
                <ShieldCheck size={12} />
                <span className="text-[8px] font-black uppercase tracking-widest">Document Scanned</span>
              </div>
            </div>
          </div>
        </ReviewSection>

        {/* Legal Evidence & Facade */}
        <ReviewSection title="Compliance & Assets" icon={ShieldCheck} colorClass="text-rose-500">
          <div className="space-y-6">
             {/* Facade Preview */}
             <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Property Facade</span>
                <div 
                  onClick={() => openPreview(facadeFile, "Property Facade")}
                  className="w-full h-28 rounded-2xl border-2 border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer group relative"
                >
                  {facadeFile ? (
                    <>
                      <SafeImage src={URL.createObjectURL(facadeFile)} alt="Property Facade" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest">
                           <Eye size={16} /> Preview Facade
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300"><Building2 size={24} /></div>
                  )}
                </div>
             </div>

             <div className="grid grid-cols-1 gap-3">
                <div 
                  onClick={() => openPreview(permitFile, "Business Permit")}
                  className={cn(
                    "p-4 rounded-2xl border transition-all flex items-center justify-between group",
                    permitFile 
                      ? "bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10 cursor-pointer hover:bg-emerald-100/50 dark:hover:bg-emerald-500/10" 
                      : "bg-gray-50 border-gray-100 opacity-50"
                  )}
                >
                   <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", permitFile ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-400")}>
                        <BadgeCheck size={14} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-emerald-400">Business Permit</span>
                   </div>
                   {permitFile && (
                     <div className="flex items-center gap-2 text-[8px] font-black text-emerald-600 uppercase tracking-widest bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
                        <Eye size={10} /> View Document
                     </div>
                   )}
                </div>

                <div 
                  onClick={() => openPreview(fireSafetyFile, "Fire Safety Certificate")}
                  className={cn(
                    "p-4 rounded-2xl border transition-all flex items-center justify-between group",
                    fireSafetyFile 
                      ? "bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10 cursor-pointer hover:bg-emerald-100/50 dark:hover:bg-emerald-500/10" 
                      : "bg-gray-50 border-gray-100 opacity-50"
                  )}
                >
                   <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", fireSafetyFile ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-400")}>
                        <BadgeCheck size={14} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-emerald-400">Fire Safety Cert.</span>
                   </div>
                   {fireSafetyFile && (
                     <div className="flex items-center gap-2 text-[8px] font-black text-emerald-600 uppercase tracking-widest bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
                        <Eye size={10} /> View Document
                     </div>
                   )}
                </div>
             </div>
          </div>
        </ReviewSection>
      </div>

      <div className="mt-12 p-8 rounded-[2.5rem] bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Info size={24} />
          </div>
          <div>
            <h5 className="text-[11px] font-black uppercase tracking-widest text-amber-900 dark:text-amber-400">Compliance Acknowledgment</h5>
            <p className="text-xs font-bold text-amber-700/60 uppercase tracking-tighter">Your verification data will be stored securely and used only for platform vetting.</p>
          </div>
        </div>
        <Button outline type="button" onClick={onBack} className="flex items-center justify-center rounded-2xl px-10 py-3 uppercase text-[10px] font-black tracking-widest gap-2 bg-white dark:bg-gray-800 shrink-0 w-full md:w-auto h-fit">
          <ChevronLeft size={14} /> Adjust Details
        </Button>
      </div>

      {/* Preview Modal */}
      <Modal 
        isOpen={!!preview} 
        onClose={() => setPreview(null)}
        width="lg"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
             <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">{preview?.title}</h4>
             <button onClick={() => setPreview(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                <X size={20} />
             </button>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-50 bg-black/5 flex items-center justify-center">
            {preview && <SafeImage src={preview.url} alt="Preview" priority={true} />}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReviewStep;

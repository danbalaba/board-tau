import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Info, Lightbulb, User, ChevronLeft, CreditCard, Camera, IdCard, Check, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";
import SafeImage from "@/components/common/SafeImage";

interface PrepareStepProps {
  isShowingIDList: boolean;
  setIsShowingIDList: (val: boolean) => void;
  selectedIDTab: "primary" | "secondary";
  setSelectedIDTab: (val: "primary" | "secondary") => void;
  hasReadGuidelines: boolean;
  setHasReadGuidelines: (val: boolean) => void;
}

const PrepareStep: React.FC<PrepareStepProps> = ({
  isShowingIDList, setIsShowingIDList,
  selectedIDTab, setSelectedIDTab,
  hasReadGuidelines, setHasReadGuidelines
}) => {
  return (
    <div className="relative overflow-hidden min-h-[400px]">
      <AnimatePresence mode="wait">
        {!isShowingIDList ? (
          <motion.div 
            key="guidelines"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            {/* Step Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <ShieldCheck size={18} />
                  </div>
                  Step 4: Identity Verification Guidelines
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Follow these quick tips to complete your KYC verification smoothly in under 1 minute.
                </p>
              </div>
              <span className="hidden sm:inline-flex text-[11px] font-medium text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full items-center gap-1.5 shrink-0">
                <Sparkles size={12} /> Live AI Scanner
              </span>
            </div>

            {/* Preparation Alert Box */}
            <div className="bg-primary/5 dark:bg-primary/10 p-3.5 rounded-2xl border border-primary/20 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping shrink-0" />
              <p className="text-xs font-extrabold text-primary dark:text-primary-light">
                Please prepare a physical valid government ID & ensure your webcam or mobile camera is clear.
              </p>
            </div>

            {/* 6 Guidelines Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { icon: <ShieldCheck size={18} />, title: "Valid Physical ID", desc: "Original document required (No photocopies or screen pictures).", link: true },
                { icon: <Camera size={18} />, title: "Working Camera", desc: "Ensure your desktop webcam or smartphone camera is enabled." },
                { icon: <IdCard size={18} />, title: "Full Unobstructed View", desc: "Keep all 4 corners of your ID card visible in frame." },
                { icon: <CheckCircle2 size={18} />, title: "Uncovered Face", desc: "Remove hats, heavy glasses, or masks for liveness scan." },
                { icon: <AlertCircle size={18} />, title: "Readable Text", desc: "Ensure name, ID number, and face photo are clear." },
                { icon: <Lightbulb size={18} />, title: "Good Lighting", desc: "Stand in a well-lit environment to avoid camera glare." },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 bg-white dark:bg-gray-900/60 ${
                    hasReadGuidelines
                      ? 'border-primary/30 bg-primary/5 dark:bg-primary/10 shadow-sm'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 transition-colors ${
                      hasReadGuidelines ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                    }`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-xs text-gray-900 dark:text-gray-100">{item.title}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{item.desc}</p>
                      {item.link && (
                        <button 
                          type="button"
                          onClick={() => setIsShowingIDList(true)}
                          className="text-[11px] font-bold text-primary mt-1 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Info size={12} /> Accepted IDs List
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Read & Ready Action CTA */}
            <div className="flex flex-col items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button 
                type="button"
                onClick={() => setHasReadGuidelines(!hasReadGuidelines)}
                className={`w-full max-w-sm py-4 rounded-2xl flex items-center justify-center gap-2.5 font-black text-xs uppercase tracking-widest transition-all transform active:scale-95 cursor-pointer select-none ${
                  hasReadGuidelines 
                    ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-hover ring-4 ring-primary/20 scale-[1.01]' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary dark:hover:text-primary-light shadow-xs'
                }`}
              >
                {hasReadGuidelines ? (
                  <><Check size={16} strokeWidth={3} /> GUIDELINES CONFIRMED — READY!</>
                ) : (
                  <><ShieldCheck size={18} /> I HAVE PREPARED MY ID & CAMERA</>
                )}
              </button>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium italic text-center max-w-xs">
                By clicking, you confirm that your original physical ID document is ready for real-time capture.
              </p>
            </div>
          </motion.div>
        ) : (
          /* ID List Tab Sub-View */
          <motion.div 
            key="idList"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => setIsShowingIDList(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                >
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-gray-100">List of Accepted IDs</h3>
                  <p className="text-[11px] text-gray-400">Select tab to view valid primary or secondary IDs</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsShowingIDList(false)} 
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} className="rotate-180" />
              </button>
            </div>

            {/* Segmented Tab Bar */}
            <div className="flex p-1 bg-gray-100 dark:bg-gray-800/80 rounded-2xl">
              <button 
                type="button"
                onClick={() => setSelectedIDTab("primary")}
                className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  selectedIDTab === 'primary' 
                    ? 'bg-white dark:bg-gray-900 text-primary shadow-xs' 
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Primary Government IDs (6)
              </button>
              <button 
                type="button"
                onClick={() => setSelectedIDTab("secondary")}
                className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  selectedIDTab === 'secondary' 
                    ? 'bg-white dark:bg-gray-900 text-primary shadow-xs' 
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Secondary & Student IDs (9)
              </button>
            </div>

            {/* ID Catalog Grid */}
            <div className="max-h-[350px] overflow-y-auto pr-1.5 custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={selectedIDTab}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="grid grid-cols-3 gap-3"
                >
                  {selectedIDTab === 'primary' ? (
                    <>
                      {[
                        { name: "Driver's License", src: "/images/id-license.png" },
                        { name: "SSS / UMID ID", src: "/images/id-sss.png" },
                        { name: "Passport", src: "/images/id-passport.png" },
                        { name: "National ID", src: "/images/id-national-id.png" },
                        { name: "PRC ID", src: "/images/id-prc.png" },
                        { name: "Voter's ID", src: "/images/id-voters.png" },
                      ].map((id) => (
                        <div 
                          key={id.name} 
                          className="group p-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 hover:border-primary transition-all shadow-xs flex flex-col items-center justify-between"
                        >
                          <div className="w-full aspect-[1.58/1] rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-950 relative border border-gray-200/50 dark:border-gray-800/50 flex items-center justify-center p-0.5 shadow-inner">
                            <SafeImage src={id.src} alt={id.name} className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-tight text-gray-800 dark:text-gray-200 text-center truncate w-full mt-2">
                            {id.name}
                          </p>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {[
                        { name: "Student ID (COR)", icon: <User size={18} />, color: "bg-blue-600 shadow-blue-200", src: "/images/id-secondary-studentID.png" },
                        { name: "Staff ID", icon: <User size={18} />, color: "bg-indigo-600 shadow-indigo-200", src: "/images/id-secondary-staffID.png" },
                        { name: "Faculty ID", icon: <User size={18} />, color: "bg-primary shadow-primary/20 text-white", src: "/images/id-secondary-facultyID.png" },
                        { name: "Pag-IBIG ID", icon: <Info size={18} />, color: "bg-gradient-to-br from-blue-500/10 to-blue-600/20 text-blue-600", src: "/images/id-secondary-pag-ibig.png" },
                        { name: "Police Clearance", icon: <ShieldCheck size={18} />, color: "bg-blue-50 text-blue-600", src: "/images/id-secondary-police-clearance.png" },
                        { name: "NBI Clearance", icon: <Info size={18} />, color: "bg-green-50 text-green-600", src: "/images/id-secondary-nbi-clearance.png" },
                        { name: "PhilHealth ID", icon: <Info size={18} />, color: "bg-primary/10 text-primary", src: "/images/id-secondary-philhealth.png" },
                        { name: "Postal ID", icon: <CreditCard size={18} />, color: "bg-rose-50 text-rose-600", src: "/images/id-secondary-postal-id.png" },
                        { name: "TIN ID", icon: <CreditCard size={18} />, color: "bg-orange-50 text-orange-600", src: "/images/id-secondary-tin-id.png" },
                      ].map((id) => (
                        <div 
                          key={id.name} 
                          className="group p-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 hover:border-primary transition-all shadow-xs flex flex-col items-center justify-between"
                        >
                          <div className="w-full aspect-[1.58/1] rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-950 relative border border-gray-200/50 dark:border-gray-800/50 flex items-center justify-center p-0.5 shadow-inner">
                            {id.src ? (
                              <SafeImage src={id.src} alt={id.name} className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                              <div className={`w-full h-full ${id.color} rounded-lg flex flex-col items-center justify-center text-white p-2 gap-0.5 group-hover:scale-105 transition-transform duration-300`}>
                                {id.icon}
                                <span className="text-[7px] font-black uppercase tracking-tighter opacity-70">Official Doc</span>
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-tight text-gray-800 dark:text-gray-200 text-center truncate w-full mt-2">
                            {id.name}
                          </p>
                        </div>
                      ))}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-3.5 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl">
              <p className="text-[11px] text-primary font-bold flex items-center gap-2">
                <ShieldCheck size={16} />
                Only clear, original documents will be accepted for verification.
              </p>
            </div>

            <div className="flex justify-center pt-1">
              <button 
                type="button"
                onClick={() => {
                  setIsShowingIDList(false);
                  setHasReadGuidelines(true);
                }}
                className="w-full py-3.5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check size={14} strokeWidth={3} /> Understood, Return to Guidelines
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PrepareStep;


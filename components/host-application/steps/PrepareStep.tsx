"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Camera, 
  CreditCard, 
  X, 
  Check, 
  AlertCircle, 
  Lightbulb, 
  UserCircle,
  FileText,
  Lock,
  Info,
  ChevronLeft,
  User
} from "lucide-react";
import SafeImage from "@/components/common/SafeImage";
import { cn } from "@/utils/helper";

interface PrepareStepProps {
  hasReadGuidelines: boolean;
  setHasReadGuidelines: (val: boolean) => void;
  hideHeader?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

const PrepareStep: React.FC<PrepareStepProps> = ({
  hasReadGuidelines,
  setHasReadGuidelines,
  hideHeader = false,
  hasError = false,
  errorMessage,
}) => {
  const [isShowingIDList, setIsShowingIDList] = useState(false);
  const [selectedIDTab, setSelectedIDTab] = useState<"primary" | "secondary">("primary");

  return (
    <div className="relative overflow-hidden w-full">
      <AnimatePresence mode="wait">
        {!isShowingIDList ? (
          <motion.div 
            key="guidelines"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="space-y-5 text-left"
          >
            {/* Header Section (Shown when hideHeader is false) */}
            {!hideHeader && (
              <div className="space-y-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-primary/10 text-primary dark:bg-primary/20 shrink-0">
                    <ShieldCheck size={20} />
                  </span>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                    Identity Verification Prep
                  </h3>
                </div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider opacity-80">
                  We'll verify your identity with these details. Make sure your ID card is valid and readable.
                </p>
              </div>
            )}

            {/* Pulsating Camera Prep Alert Banner */}
            <div className="bg-primary/10 dark:bg-primary/20 p-3.5 rounded-2xl border border-primary/20 shadow-xs">
              <div className="text-xs font-black uppercase tracking-wider text-primary dark:text-[#4fa89a] flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping shrink-0" />
                <span>Please prepare a valid ID and ensure your webcam or camera is enabled.</span>
              </div>
            </div>

            {/* 6 Guidelines Cards Grid (Desktop 3 columns, Mobile 1 column) */}
            <div className={cn(
              "grid gap-3.5", 
              hideHeader ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
            )}>
              {[
                { 
                  icon: <ShieldCheck size={20} className={hasReadGuidelines ? "text-white" : "text-primary dark:text-[#4fa89a]"} />, 
                  title: "Have your valid ID ready", 
                  desc: "Confirm your identity as the authorized landlord representative.", 
                  link: true 
                },
                { 
                  icon: <Camera size={20} className={hasReadGuidelines ? "text-white" : "text-blue-500 dark:text-blue-400"} />, 
                  title: "Check your camera", 
                  desc: "Ensure your laptop, desktop, or phone has a working webcam." 
                },
                { 
                  icon: <CreditCard size={20} className={hasReadGuidelines ? "text-white" : "text-purple-500 dark:text-purple-400"} />, 
                  title: "Use physical ID", 
                  desc: "Capture the original physical ID card. Avoid digital screens or copies." 
                },
                { 
                  icon: <Check size={20} className={hasReadGuidelines ? "text-white" : "text-emerald-500 dark:text-emerald-400"} />, 
                  title: "Keep your face clear", 
                  desc: "Ensure face features are not obstructed during liveness check (no hats or masks)." 
                },
                { 
                  icon: <Info size={20} className={hasReadGuidelines ? "text-white" : "text-amber-500 dark:text-amber-400"} />, 
                  title: "Show details clearly", 
                  desc: "Your ID card must be fully visible and readable without reflection or glare." 
                },
                { 
                  icon: <Lightbulb size={20} className={hasReadGuidelines ? "text-white" : "text-amber-500 dark:text-amber-400"} />, 
                  title: "Find good lighting", 
                  desc: "Stay in a well-lit room with a plain background, avoiding window backlighting." 
                },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "p-4 rounded-2xl sm:rounded-3xl border transition-all duration-300 bg-white dark:bg-slate-800/90 shadow-xs hover:shadow-md flex flex-col justify-between group",
                    hasReadGuidelines 
                      ? "border-primary/30 bg-primary/5 dark:bg-primary/10" 
                      : "border-slate-200/80 dark:border-slate-700/60"
                  )}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={cn(
                      "p-2.5 rounded-xl shrink-0 transition-all group-hover:scale-105",
                      hasReadGuidelines 
                        ? "bg-primary text-white shadow-sm" 
                        : "bg-slate-100 dark:bg-slate-900/80"
                    )}>
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider leading-snug">
                        {item.title}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                      {item.link && (
                        <button 
                          type="button"
                          onClick={() => setIsShowingIDList(true)}
                          className="text-[11px] font-black uppercase tracking-wider text-primary dark:text-[#4fa89a] mt-2 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Info size={12} /> List of accepted IDs →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Note & Action Toggle Button Section */}
            <div className="flex flex-col items-center gap-3 pt-3 border-t border-slate-200/80 dark:border-slate-800">
              <button 
                type="button"
                onClick={() => setHasReadGuidelines(!hasReadGuidelines)}
                className={cn(
                  "w-full max-w-md py-4 px-6 rounded-2xl sm:rounded-3xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all transform active:scale-95 shadow-xl cursor-pointer select-none",
                  hasReadGuidelines 
                    ? "bg-primary hover:bg-primary-hover text-white shadow-primary/30 ring-2 ring-primary/20 scale-[1.01]" 
                    : hasError
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/30 animate-shake"
                    : "bg-slate-100 hover:bg-primary/10 text-slate-700 hover:text-primary dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 shadow-sm"
                )}
              >
                {hasReadGuidelines ? (
                  <><Check size={16} className="stroke-[3]" /> I AM READY TO PROCEED</>
                ) : (
                  <><ShieldCheck size={18} /> I UNDERSTAND & I'M READY</>
                )}
              </button>

              {hasError && !hasReadGuidelines && (
                <p className="text-red-500 font-extrabold text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  <span>{errorMessage || "You must agree to the guidelines before proceeding"}</span>
                </p>
              )}

              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center max-w-sm">
                By clicking, you acknowledge that you have your documents ready and environment prepared.
              </p>
            </div>

            {/* Security Footer */}
            <div className="flex items-center justify-center gap-1.5 text-slate-400 dark:text-slate-500 pt-1">
              <Lock size={12} className="shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-widest">Biometric Data is Encrypted & Strictly Private</span>
            </div>
          </motion.div>
        ) : (
          /* Sub-View: List of Accepted IDs Modal Grid */
          <motion.div 
            key="idList"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-5 text-left"
          >
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setIsShowingIDList(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-300 cursor-pointer"
                  title="Back to guidelines"
                >
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">List of Valid IDs</h3>
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acceptable Government and Institutional IDs</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsShowingIDList(false)} 
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                 <X size={20} />
              </button>
            </div>

            {/* Tab Pill Selector: Primary IDs vs Secondary IDs */}
            <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl max-w-sm mx-auto gap-1 border border-slate-200/80 dark:border-slate-700/60">
              <button 
                type="button"
                onClick={() => setSelectedIDTab("primary")}
                className={cn(
                  "flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer",
                  selectedIDTab === 'primary' 
                    ? "bg-primary text-white shadow-md" 
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                Primary IDs
              </button>
              <button 
                type="button"
                onClick={() => setSelectedIDTab("secondary")}
                className={cn(
                  "flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer",
                  selectedIDTab === 'secondary' 
                    ? "bg-primary text-white shadow-md" 
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                Secondary IDs
              </button>
            </div>

            {/* Grid of IDs */}
            <div>
              <AnimatePresence mode="wait">
                <motion.div 
                  key={selectedIDTab}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-3"
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
                        <div key={id.name} className="group p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-slate-800/80 hover:border-primary transition-all shadow-xs flex flex-col items-center gap-2.5 text-center">
                          <div className="w-full aspect-[1.586/1] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-inner flex items-center justify-center">
                             <SafeImage src={id.src} alt={id.name} />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 leading-tight">{id.name}</p>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {[
                        { name: "Student ID (COR)", icon: <User size={20} />, color: "bg-blue-600 shadow-blue-200", src: "/images/id-secondary-studentID.png" },
                        { name: "Staff ID", icon: <User size={20} />, color: "bg-indigo-600 shadow-indigo-200", src: "/images/id-secondary-staffID.png" },
                        { name: "Faculty ID", icon: <User size={20} />, color: "bg-emerald-600 shadow-emerald-200", src: "/images/id-secondary-facultyID.png" },
                        { name: "Pag-IBIG ID", icon: <Info size={20} />, color: "bg-[#2f7d6d]", src: "/images/id-secondary-pag-ibig.png" },
                        { name: "Police Clearance", icon: <ShieldCheck size={20} />, color: "bg-blue-50 text-blue-600", src: "/images/id-secondary-police-clearance.png" },
                        { name: "NBI Clearance", icon: <Info size={20} />, color: "bg-green-50 text-green-600", src: "/images/id-secondary-nbi-clearance.png" },
                        { name: "PhilHealth ID", icon: <Info size={20} />, color: "bg-teal-50 text-teal-600", src: "/images/id-secondary-philhealth.png" },
                        { name: "Postal ID", icon: <CreditCard size={20} />, color: "bg-rose-50 text-rose-600", src: "/images/id-secondary-postal-id.png" },
                        { name: "TIN ID", icon: <CreditCard size={20} />, color: "bg-orange-50 text-orange-600", src: "/images/id-secondary-tin-id.png" },
                      ].map((id) => (
                        <div key={id.name} className="group p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-slate-800/80 hover:border-primary transition-all shadow-xs flex flex-col items-center gap-2.5 text-center">
                          <div className="w-full aspect-[1.586/1] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-inner flex items-center justify-center">
                             {id.src ? (
                               <SafeImage src={id.src} alt={id.name} />
                             ) : (
                               <div className={`w-full h-full ${id.color} flex flex-col items-center justify-center text-white p-3 gap-1 group-hover:scale-105 transition-transform duration-300`}>
                                 {id.icon}
                                 <span className="text-[8px] font-black uppercase tracking-wider opacity-80">Official Doc</span>
                               </div>
                             )}
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 leading-tight">{id.name}</p>
                        </div>
                      ))}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-3 bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-2xl text-left">
              <p className="text-[11px] text-primary dark:text-[#4fa89a] font-bold flex items-center gap-2 uppercase tracking-wider">
                <ShieldCheck size={14} className="shrink-0" />
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
                 className="w-full max-w-sm py-3.5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/25 hover:bg-primary-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
               >
                <Check size={14} className="stroke-[3]" /> Understood, let's continue
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PrepareStep;


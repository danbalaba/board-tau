"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Camera, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb, 
  UserCircle,
  FileText,
  Info
} from "lucide-react";

interface PrepareStepProps {
  hasReadGuidelines: boolean;
  setHasReadGuidelines: (val: boolean) => void;
}

const PrepareStep: React.FC<PrepareStepProps> = ({
  hasReadGuidelines,
  setHasReadGuidelines,
}) => {
  const guidelines = [
    {
      icon: <Lightbulb className="text-amber-500" size={20} />,
      title: "Proper Lighting",
      desc: "Ensure you are in a well-lit room. Avoid backlighting from windows or bright lamps.",
    },
    {
      icon: <UserCircle className="text-blue-500" size={20} />,
      title: "Clear Visibility",
      desc: "Remove glasses (if they reflect), hats, or masks. Your full face must be visible.",
    },
    {
      icon: <FileText className="text-emerald-500" size={20} />,
      title: "Valid ID Ready",
      desc: "Have your original Government ID ready. Photocopies or screen photos will be rejected.",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="text-primary w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Identity Verification</h2>
        <p className="text-sm text-gray-500 font-bold uppercase tracking-tight max-w-sm mx-auto opacity-70">
          We use biometric liveness detection to ensure a safe and secure community for students.
        </p>
      </div>

      {/* Guidelines Grid */}
      <div className="grid grid-cols-1 gap-4">
        {guidelines.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-start gap-4 p-5 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
          >
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl shrink-0">
              {item.icon}
            </div>
            <div>
              <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-1">{item.title}</h4>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Important Notice */}
      <div className="p-5 bg-amber-50 dark:bg-amber-900/20 rounded-3xl border border-amber-100 dark:border-amber-800/50 flex gap-4">
        <div className="p-2 bg-amber-500/10 rounded-xl h-fit text-amber-600"><AlertCircle size={20} /></div>
        <p className="text-xs font-bold text-amber-800 dark:text-amber-400 leading-relaxed italic">
          Note: This process involves a "Blink Test" to verify you are a real person. Please blink naturally when prompted during the selfie capture.
        </p>
      </div>

      {/* Acknowledgment */}
      <button 
        onClick={() => setHasReadGuidelines(!hasReadGuidelines)}
        className={`w-full p-5 rounded-3xl border-2 transition-all flex items-center justify-between group ${
          hasReadGuidelines 
            ? "border-primary bg-primary/5 text-primary" 
            : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-400 hover:border-primary/20"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            hasReadGuidelines ? "border-primary bg-primary" : "border-gray-200"
          }`}>
            {hasReadGuidelines && <CheckCircle size={14} className="text-white" />}
          </div>
          <span className="text-sm font-black uppercase tracking-widest">I understand and am ready</span>
        </div>
        <Camera size={20} className={hasReadGuidelines ? "text-primary" : "text-gray-300"} />
      </button>

      {/* Data Privacy Note */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <Info size={12} className="text-gray-400" />
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data is encrypted & private</p>
      </div>
    </div>
  );
};

export default PrepareStep;

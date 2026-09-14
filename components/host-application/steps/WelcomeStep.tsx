import React from 'react';
import Button from '../../common/Button';
import { Home, FileText, ShieldCheck, TrendingUp, ChevronRight, Sparkles, UserCheck, MapPin, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  const benefits = [
    {
      icon: <FileText className="w-5 h-5 text-primary" />,
      title: "Easy Verification",
      description: "Simple multi-step clearance form in minutes",
      bgColor: "bg-primary/10 dark:bg-primary/15",
      borderColor: "border-primary/20"
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-indigo-500" />,
      title: "Verified Host Status",
      description: "Earn official TAU accreditation badge",
      bgColor: "bg-indigo-500/10 dark:bg-indigo-500/15",
      borderColor: "border-indigo-500/20"
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-amber-500" />,
      title: "Student Reach",
      description: "Connect directly with thousands of student boarders",
      bgColor: "bg-amber-500/10 dark:bg-amber-500/15",
      borderColor: "border-amber-500/20"
    }
  ];

  const processSteps = [
    { num: "1", title: "Identity & Business", desc: "Contact details & establishment type", icon: UserCheck },
    { num: "2", title: "Location & Facade", desc: "Map pin & entrance photo", icon: MapPin },
    { num: "3", title: "Permit & Safety", desc: "Mayor's permit / bill & fire safety", icon: Award },
    { num: "4", title: "AI Biometrics", desc: "Selfie liveness & ID card scan", icon: ShieldCheck },
  ];

  return (
    <div className="flex flex-col items-center justify-between space-y-6 py-2 w-full max-w-3xl mx-auto">
      {/* Hero Section */}
      <motion.div
        className="text-center space-y-3"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-primary/20 shadow-lg shadow-primary/10 group">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Home className="w-6 h-6" />
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight font-[family-name:var(--font-outfit)] leading-tight">
          Welcome to <span className="text-primary dark:text-[#4fa89a]">BoardTAU Landlords</span>
        </h2>
        
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
          Transform your boarding house or property into a verified student housing partner on BoardTAU.
        </p>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-black text-primary dark:text-[#4fa89a] uppercase tracking-widest">
            JOIN THOUSANDS OF SUCCESSFUL LANDLORDS
          </span>
        </div>
      </motion.div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 w-full">
        {benefits.map((b, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`p-4 rounded-2xl border ${b.borderColor} ${b.bgColor} transition-all duration-200 hover:scale-[1.02] flex flex-col gap-2`}
          >
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
              {b.icon}
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-tight">
                {b.title}
              </h3>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-snug mt-0.5">
                {b.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Compact Application Roadmap */}
      <motion.div
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="bg-gray-50/80 dark:bg-slate-800/40 rounded-2xl p-4 border border-gray-200/60 dark:border-slate-700/60">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200/50 dark:border-slate-700/50">
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={12} className="text-primary" />
              Verfication Journey Overview
            </span>
            <span className="text-[10px] font-bold text-primary dark:text-[#4fa89a]">4 Quick Milestones</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {processSteps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-gray-100 dark:border-slate-800 shadow-sm">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary dark:text-[#4fa89a] flex items-center justify-center text-[10px] font-black shrink-0">
                    {step.num}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-[11px] text-gray-900 dark:text-white truncate">
                      {step.title}
                    </h4>
                    <p className="text-[10px] text-gray-400 truncate">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Action CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="pt-2 w-full flex justify-center"
      >
        <Button
          onClick={onNext}
          className="w-full sm:w-auto px-10 py-4 bg-primary hover:bg-primary-hover active:scale-[0.98] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/25 transition-all flex items-center justify-center gap-2 group"
        >
          <span>Start My Application</span>
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </div>
  );
};

export default WelcomeStep;

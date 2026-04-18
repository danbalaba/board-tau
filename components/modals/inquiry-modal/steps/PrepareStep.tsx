import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Info, Lightbulb, User, ChevronLeft, CreditCard } from "lucide-react";
import { FaCamera, FaIdCard, FaTimes, FaCheck } from "react-icons/fa";

interface PrepareStepProps {
  isShowingIDList: boolean;
  setIsShowingIDList: (val: boolean) => void;
  selectedIDTab: "primary" | "secondary";
  setSelectedIDTab: (val: "primary" | "secondary") => void;
}

const PrepareStep: React.FC<PrepareStepProps> = ({
  isShowingIDList, setIsShowingIDList,
  selectedIDTab, setSelectedIDTab
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
            className="space-y-6"
          >
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Identity Verification
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We'll verify your identity with these details. Make sure they match the information on your ID.
              </p>
            </div>

            <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
              <div className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Please prepare a valid ID and make sure your camera is turned on.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {[
                { icon: <ShieldCheck size={20} />, title: "Have your valid ID ready", desc: "Confirm your identity as the authorized representative.", link: true },
                { icon: <FaCamera size={18} />, title: "Check your camera", desc: "Ensure your laptop or desktop has a working webcam." },
                { icon: <FaIdCard size={18} />, title: "Use your physical ID", desc: "Capture the original document. Avoid digital screens." },
                { icon: <FaCheck size={18} />, title: "Keep your face clear", desc: "Ensure features are not obstructed during liveness check." },
                { icon: <Info size={18} />, title: "Show details clearly", desc: "Your ID must be fully visible and readable. No redacting." },
                { icon: <Lightbulb size={20} />, title: "Find good lighting", desc: "Stay in a well-lit area with a plain background." },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{item.title}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                      {item.link && (
                        <button 
                          type="button"
                          onClick={() => setIsShowingIDList(true)}
                          className="text-[10px] font-bold text-primary mt-1 hover:underline flex items-center gap-1"
                        >
                          <Info size={10} /> List of accepted IDs
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 mt-6 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[10px] text-gray-500 italic">
                Note: Identity verification is part of our Know Your Customer (KYC) process. You won't be able to proceed until this step is completed.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="idList"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setIsShowingIDList(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <ChevronLeft />
                </button>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">List of valid IDs</h3>
              </div>
              <button onClick={() => setIsShowingIDList(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                 <FaTimes />
              </button>
            </div>

            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
              <button 
                type="button"
                onClick={() => setSelectedIDTab("primary")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${selectedIDTab === 'primary' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Primary IDs
              </button>
              <button 
                type="button"
                onClick={() => setSelectedIDTab("secondary")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${selectedIDTab === 'secondary' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Secondary IDs
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={selectedIDTab}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-2 lg:grid-cols-3 gap-3"
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
                        <div key={id.name} className="group p-2.5 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-primary transition-all shadow-sm flex flex-col items-center gap-3 text-center">
                          <div className="w-full aspect-[1.6/1] rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 shadow-inner">
                             <img src={id.src} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={id.name} />
                          </div>
                          <p className="text-[9px] font-black uppercase tracking-tighter text-gray-700 dark:text-gray-300 leading-tight">{id.name}</p>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {[
                        { name: "Student ID (COR)", icon: <User size={20} />, color: "bg-blue-600 shadow-blue-200", src: "/images/id-secondary-studentID.png" },
                        { name: "Staff ID", icon: <User size={20} />, color: "bg-indigo-600 shadow-indigo-200", src: "/images/id-secondary-staffID.png" },
                        { name: "Faculty ID", icon: <User size={20} />, color: "bg-emerald-600 shadow-emerald-200", src: "/images/id-secondary-facultyID.png" },
                        { name: "Pag-IBIG ID", icon: <Info size={20} />, color: "bg-gradient-to-br from-blue-500/10 to-blue-600/20 text-blue-600", src: "/images/id-secondary-pag-ibig.png" },
                        { name: "Police Clearance", icon: <ShieldCheck size={20} />, color: "bg-blue-50 text-blue-600", src: "/images/id-secondary-police-clearance.png" },
                        { name: "NBI Clearance", icon: <Info size={20} />, color: "bg-green-50 text-green-600", src: "/images/id-secondary-nbi-clearance.png" },
                        { name: "PhilHealth ID", icon: <Info size={20} />, color: "bg-teal-50 text-teal-600", src: "/images/id-secondary-philhealth.png" },
                        { name: "Postal ID", icon: <CreditCard size={20} />, color: "bg-rose-50 text-rose-600", src: "/images/id-secondary-postal-id.png" },
                        { name: "TIN ID", icon: <CreditCard size={20} />, color: "bg-orange-50 text-orange-600", src: "/images/id-secondary-tin-id.png" },
                      ].map((id) => (
                        <div key={id.name} className="group p-2.5 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-primary transition-all shadow-sm flex flex-col items-center gap-3 text-center">
                          <div className="w-full aspect-[1.6/1] rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 shadow-inner flex items-center justify-center">
                             {id.src ? (
                               <img src={id.src} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={id.name} />
                             ) : (
                               <div className={`w-full h-full ${id.color} flex flex-col items-center justify-center text-white p-3 gap-1 group-hover:scale-110 transition-transform duration-500`}>
                                 {id.icon}
                                 <span className="text-[7px] font-black uppercase tracking-tighter opacity-70">Official Doc</span>
                               </div>
                             )}
                          </div>
                          <p className="text-[9px] font-black uppercase tracking-tighter text-gray-700 dark:text-gray-300 leading-tight">{id.name}</p>
                        </div>
                      ))}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-4 bg-primary/5 dark:bg-primary/10 border border-primary/10 rounded-2xl">
              <p className="text-[10px] text-primary font-bold flex items-center gap-2">
                <ShieldCheck size={14} />
                Only clear, original documents will be accepted for verification.
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <button 
                 type="button"
                 onClick={() => setIsShowingIDList(false)}
                 className="text-xs font-bold text-gray-500 hover:text-primary transition-colors underline underline-offset-4"
               >
                Understood, let's continue
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PrepareStep;

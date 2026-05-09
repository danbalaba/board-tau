"use client";

import React from "react";
import { FileText, Upload, CheckCircle, X, ShieldCheck, Info } from "lucide-react";

interface LegalDocumentsStepProps {
  permitFile: File | null;
  setPermitFile: (file: File | null) => void;
  fireSafetyFile: File | null;
  setFireSafetyFile: (file: File | null) => void;
}

const LegalDocumentsStep: React.FC<LegalDocumentsStepProps> = ({
  permitFile,
  setPermitFile,
  fireSafetyFile,
  setFireSafetyFile,
}) => {
  const documents = [
    {
      id: "permit",
      title: "Business Permit",
      desc: "Latest Mayor's Permit or Business Registration (SEC/DTI)",
      file: permitFile,
      set: setPermitFile,
      icon: <FileText size={24} />
    },
    {
      id: "fire",
      title: "Fire Safety Certificate",
      desc: "Valid Fire Safety Inspection Certificate from BFP",
      file: fireSafetyFile,
      set: setFireSafetyFile,
      icon: <ShieldCheck size={24} />
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1">Legal Compliance</h3>
        <p className="text-sm text-gray-500 font-bold uppercase tracking-tight opacity-70">Upload required business operation documents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                {doc.icon}
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">{doc.title}</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight mt-1">{doc.desc}</p>
              </div>
            </div>

            <div 
              onClick={() => {
                if (doc.file) {
                  window.open(URL.createObjectURL(doc.file), '_blank');
                } else {
                  document.getElementById(`${doc.id}-upload`)?.click();
                }
              }}
              className={`flex-1 min-h-[200px] rounded-[1.5rem] border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 cursor-pointer ${
                doc.file 
                  ? "border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10" 
                  : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 hover:border-primary/40"
              }`}
            >
              {doc.file ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                    <CheckCircle className="text-white" size={32} />
                  </div>
                  <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1 truncate max-w-[150px]">
                    {doc.file.name}
                  </p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      doc.set(null);
                    }}
                    className="mt-4 text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] hover:underline"
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="text-gray-300 mx-auto mb-4" size={40} />
                  <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">Select Document</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">PDF or Image (Max 10MB)</p>
                </div>
              )}
              <input 
                id={`${doc.id}-upload`} 
                type="file" 
                hidden 
                accept="image/*,.pdf" 
                onChange={e => doc.set(e.target.files?.[0] || null)} 
              />
            </div>
          </div>
        ))}
      </div>

      <div className="p-5 bg-primary/5 rounded-3xl border border-primary/10 flex gap-4">
        <div className="p-2 bg-primary/20 rounded-xl h-fit text-primary"><Info size={16} /></div>
        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 leading-relaxed uppercase tracking-widest italic">
          Safety First: The Fire Safety Inspection Certificate is mandatory for all student accommodations to ensure the safety of our boarders.
        </p>
      </div>
    </div>
  );
};

export default LegalDocumentsStep;

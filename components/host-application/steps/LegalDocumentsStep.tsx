import React from "react";
import { FileText, Upload, CheckCircle, X, ShieldCheck, Info, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { validateImageUpload } from "../HostApplicationUtils";
import MediaPreviewOverlay from "@/components/common/MediaPreviewOverlay";
import { cn } from "@/utils/helper";

interface LegalDocumentsStepProps {
  permitFile: File | null;
  setPermitFile: (file: File | null) => void;
  utilityBillFile?: File | null;
  setUtilityBillFile?: (file: File | null) => void;
  fireSafetyFile: File | null;
  setFireSafetyFile: (file: File | null) => void;
  mode?: 'primary' | 'fire' | 'all';
  errors?: any;
  onDocChoiceChange?: (choice: 'permit' | 'utility') => void;
  docChoice?: 'permit' | 'utility';
}

const LegalDocumentsStep: React.FC<LegalDocumentsStepProps> = ({
  permitFile,
  setPermitFile,
  utilityBillFile = null,
  setUtilityBillFile,
  fireSafetyFile,
  setFireSafetyFile,
  mode = 'all',
  errors,
  onDocChoiceChange,
  docChoice: docChoiceProp,
}) => {
  const [docChoice, setDocChoiceState] = React.useState<'permit' | 'utility'>(
    docChoiceProp || (utilityBillFile && !permitFile ? 'utility' : 'permit')
  );
  const docChoiceRef = React.useRef(docChoice);

  React.useEffect(() => {
    if (docChoiceProp && docChoiceProp !== docChoice) {
      setDocChoiceState(docChoiceProp);
      docChoiceRef.current = docChoiceProp;
    }
  }, [docChoiceProp]);

  const setDocChoice = (choice: 'permit' | 'utility') => {
    docChoiceRef.current = choice;
    setDocChoiceState(choice);
    onDocChoiceChange?.(choice);
  };

  React.useEffect(() => {
    docChoiceRef.current = docChoice;
  }, [docChoice]);

  const [previewDoc, setPreviewDoc] = React.useState<{ url: string; title: string } | null>(null);

  const handleDocFileChange = (file: File | null, setFile: (f: File | null) => void) => {
    if (!file) return;

    const valResult = validateImageUpload(file, {
      maxSizeMB: 10,
      allowedTypes: ['image/*', '.pdf']
    });

    if (valResult !== true) {
      toast.error(valResult);
      return;
    }

    setFile(file);
    toast.success('Document uploaded successfully!');
  };

  const documents = [
    {
      id: "primary",
      title: docChoice === 'permit' ? "Mayor's / Business Permit" : "Utility Bill (Electric / Water)",
      desc: docChoice === 'permit' 
        ? "Valid Mayor's or Business Permit from Camiling / LGU" 
        : "Electric (TARELCO II) or Water Bill under Landlord's name",
      file: docChoice === 'permit' ? permitFile : utilityBillFile,
      set: (f: File | null) => {
        const activeChoice = docChoiceRef.current;
        if (activeChoice === 'permit') {
          setPermitFile(f);
        } else {
          if (setUtilityBillFile) setUtilityBillFile(f);
        }
      },
      icon: <FileText size={24} />
    },
    {
      id: "fire",
      title: "Fire Safety Certificate",
      desc: "Valid Fire Safety Inspection Certificate (FSIC) from BFP",
      file: fireSafetyFile,
      set: setFireSafetyFile,
      icon: <ShieldCheck size={24} />
    }
  ];

  const filteredDocuments = documents.filter((doc) => {
    if (mode === 'primary') return doc.id === 'primary';
    if (mode === 'fire') return doc.id === 'fire';
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {mode === 'all' && (
        <div className="text-center">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1">Legal Compliance</h3>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-tight opacity-70 mb-4">Upload required business operation or property control documents</p>
        </div>
      )}

      {/* Flexible Primary Proof Selector (Shown only when primary doc card is active) */}
      {mode !== 'fire' && (
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 mx-auto gap-1">
            <button
              type="button"
              onClick={() => setDocChoice('permit')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${
                docChoice === 'permit' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span>Mayor's / Business Permit</span>
              {permitFile && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Mayor's Permit Uploaded" />}
            </button>
            <button
              type="button"
              onClick={() => setDocChoice('utility')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${
                docChoice === 'utility' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span>Utility Bill (Electric/Water)</span>
              {utilityBillFile && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Utility Bill Uploaded" />}
            </button>
          </div>
        </div>
      )}

      <div className={cn("grid gap-8", filteredDocuments.length === 1 ? "grid-cols-1 max-w-xl mx-auto" : "grid-cols-1 md:grid-cols-2")}>
        {filteredDocuments.map((doc) => {
          const hasError = doc.id === 'primary' 
            ? !!errors?.verification?.businessPermitUrl 
            : !!errors?.verification?.fireSafetyUrl;
          const errorMessage = doc.id === 'primary' 
            ? errors?.verification?.businessPermitUrl?.message 
            : errors?.verification?.fireSafetyUrl?.message;

          return (
            <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  {doc.icon}
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">{doc.title}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight mt-1">{doc.desc}</p>
                </div>
              </div>

              <div 
                onClick={() => {
                  if (doc.file) {
                    const url = URL.createObjectURL(doc.file);
                    setPreviewDoc({ url, title: doc.title });
                  } else {
                    document.getElementById(`${doc.id}-upload`)?.click();
                  }
                }}
                className={cn(
                  "flex-1 min-h-[200px] rounded-[1.5rem] border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 cursor-pointer",
                  doc.file 
                    ? "border-primary bg-primary/10 hover:bg-primary/15 shadow-md" 
                    : hasError
                    ? "border-red-400 dark:border-red-500/50 bg-red-50/10 hover:border-red-500 animate-shake"
                    : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 hover:border-primary/40"
                )}
              >
              {doc.file ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                    <CheckCircle className="text-white" size={32} />
                  </div>
                  <p className="text-xs font-black text-primary dark:text-[#4fa89a] uppercase tracking-widest mb-1 truncate max-w-[150px]">
                    {doc.file.name}
                  </p>
                  <p className="text-[9px] font-black text-primary uppercase tracking-widest opacity-80 mt-1">
                    Click to Preview Document
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
                  <Upload className="text-gray-300 mx-auto mb-3" size={36} />
                  <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider mb-2">Select Document</p>
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-tight">1 File Max</span>
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-tight">PDF, JPG, PNG, WEBP</span>
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-tight">Max 10MB</span>
                  </div>
                </div>
              )}
              <input 
                id={`${doc.id}-upload`} 
                type="file" 
                hidden 
                accept="image/jpeg,image/png,image/webp,.pdf" 
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  handleDocFileChange(file, doc.set);
                  e.target.value = '';
                }} 
              />
            </div>

              {hasError && (
                <div className="flex items-center gap-1.5 text-red-500 font-extrabold text-xs pt-3 px-1 text-left">
                  <AlertCircle size={14} className="shrink-0 text-red-500" />
                  <span className="uppercase tracking-wide text-[11px]">
                    {errorMessage || "Document upload is required"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-5 bg-primary/5 rounded-3xl border border-primary/10 flex gap-4">
        <div className="p-2 bg-primary/20 rounded-xl h-fit text-primary"><Info size={16} /></div>
        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 leading-relaxed uppercase tracking-widest italic">
          {mode === 'all'
            ? "Property & Safety Compliance: Upload either your Mayor's / Business Permit or Electric (TARELCO II) Utility Bill, along with your BFP Fire Safety Certificate to verify your rental establishment near TAU."
            : mode === 'fire' 
            ? "Safety First: The Fire Safety Inspection Certificate (FSIC) from BFP is mandatory for all student accommodations to ensure boarder safety."
            : docChoice === 'utility'
            ? "Property Proof: An Electric (TARELCO II) bill, Water bill, or Tax Declaration under your name verifies your property control."
            : "Business Permit: A valid Mayor's or Business Permit verifies your rental establishment as a legitimate accommodation near TAU."
          }
        </p>
      </div>

      {/* Media Preview Overlay */}
      <MediaPreviewOverlay
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        images={previewDoc ? [previewDoc.url] : []}
        currentIndex={0}
        title={previewDoc?.title || "Legal Document"}
        isDocument={true}
      />
    </div>
  );
};

export default LegalDocumentsStep;

import React from "react";
import { FileText, Upload, CheckCircle, X, ShieldCheck, Info, AlertCircle, Eye, Maximize2, Trash2, Camera, Check } from "lucide-react";
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

const checkIsPdf = (file: File | string | null): boolean => {
  if (!file) return false;
  if (typeof file === 'string') {
    const lower = file.toLowerCase();
    return lower.endsWith('.pdf') || lower.includes('.pdf?') || lower.includes('/pdf') || lower.startsWith('data:application/pdf');
  }
  if (file.type && file.type.toLowerCase().includes('pdf')) return true;
  if (file.name && file.name.toLowerCase().endsWith('.pdf')) return true;
  return false;
};

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

  // Memoized Object URLs for image/document preview
  const permitPreview = React.useMemo(() => {
    if (!permitFile) return null;
    const isPdf = checkIsPdf(permitFile);
    if (typeof permitFile === 'string') {
      return { url: permitFile, isPdf, name: 'Business Permit' };
    }
    try {
      return { url: URL.createObjectURL(permitFile), isPdf, name: permitFile.name };
    } catch {
      return { url: null, isPdf, name: permitFile.name };
    }
  }, [permitFile]);

  const utilityBillPreview = React.useMemo(() => {
    if (!utilityBillFile) return null;
    const isPdf = checkIsPdf(utilityBillFile);
    if (typeof utilityBillFile === 'string') {
      return { url: utilityBillFile, isPdf, name: 'Utility Bill' };
    }
    try {
      return { url: URL.createObjectURL(utilityBillFile), isPdf, name: utilityBillFile.name };
    } catch {
      return { url: null, isPdf, name: utilityBillFile.name };
    }
  }, [utilityBillFile]);

  const fireSafetyPreview = React.useMemo(() => {
    if (!fireSafetyFile) return null;
    const isPdf = checkIsPdf(fireSafetyFile);
    if (typeof fireSafetyFile === 'string') {
      return { url: fireSafetyFile, isPdf, name: 'Fire Safety Certificate' };
    }
    try {
      return { url: URL.createObjectURL(fireSafetyFile), isPdf, name: fireSafetyFile.name };
    } catch {
      return { url: null, isPdf, name: fireSafetyFile.name };
    }
  }, [fireSafetyFile]);

  // Clean up Object URLs on unmount
  React.useEffect(() => {
    return () => {
      if (permitPreview?.url && permitPreview.url.startsWith('blob:')) URL.revokeObjectURL(permitPreview.url);
      if (utilityBillPreview?.url && utilityBillPreview.url.startsWith('blob:')) URL.revokeObjectURL(utilityBillPreview.url);
      if (fireSafetyPreview?.url && fireSafetyPreview.url.startsWith('blob:')) URL.revokeObjectURL(fireSafetyPreview.url);
    };
  }, [permitPreview, utilityBillPreview, fireSafetyPreview]);

  const handleDocFileChange = (file: File | null, setFile: (f: File | null) => void) => {
    if (!file) return;

    if (file.size === 0) {
      toast.error('The selected document file is empty or corrupted. Please select a valid file.');
      return;
    }

    const valResult = validateImageUpload(file, {
      maxSizeMB: 10,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', '.pdf']
    });

    if (valResult !== true) {
      toast.error(valResult);
      return;
    }

    setFile(file);
    toast.success('Document uploaded successfully!');
  };

  const primaryFile = docChoice === 'permit' ? permitFile : utilityBillFile;
  const primaryPreview = docChoice === 'permit' ? permitPreview : utilityBillPreview;

  const documents = [
    {
      id: "primary",
      title: docChoice === 'permit' ? "Mayor's / Business Permit" : "Utility Bill (Electric / Water)",
      desc: docChoice === 'permit' 
        ? "Valid Mayor's or Business Permit from Camiling / LGU" 
        : "Electric (TARELCO II) or Water Bill under Landlord's name",
      file: primaryFile,
      preview: primaryPreview,
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
      preview: fireSafetyPreview,
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
              {permitFile && <span className="w-2 h-2 rounded-full bg-primary-light animate-pulse" title="Mayor's Permit Uploaded" />}
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
              {utilityBillFile && <span className="w-2 h-2 rounded-full bg-primary-light animate-pulse" title="Utility Bill Uploaded" />}
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

          const previewData = doc.preview;

          return (
            <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 sm:p-8 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-full">
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
                  if (!doc.file) {
                    document.getElementById(`${doc.id}-upload`)?.click();
                  }
                }}
                className={cn(
                  "flex-1 min-h-[220px] sm:min-h-[240px] rounded-[1.8rem] transition-all flex flex-col items-center justify-center relative overflow-hidden",
                  doc.file 
                    ? "border border-primary/30 bg-gray-100 dark:bg-gray-900 shadow-md p-0 cursor-default" 
                    : hasError
                    ? "border-2 border-dashed border-red-400 dark:border-red-500/50 bg-red-50/10 hover:border-red-500 animate-shake p-6 cursor-pointer"
                    : "border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-primary/40 p-6 cursor-pointer"
                )}
              >
              {doc.file && previewData ? (
                previewData.isPdf ? (
                  /* PDF Document Card Preview (Theme-Aware Light/Dark) */
                  <div className="relative w-full h-full min-h-[220px] sm:min-h-[240px] rounded-[1.8rem] bg-slate-50 dark:bg-slate-900/90 p-6 flex flex-col items-center justify-between shadow-inner overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 via-transparent to-black/5 dark:to-black/30 pointer-events-none" />
                    
                    {/* Top Status & Zoom Bar */}
                    <div className="relative z-20 w-full flex items-center justify-between">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                        <Check size={12} strokeWidth={3} />
                        <span>PDF Document</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (previewData.url) window.open(previewData.url, '_blank', 'noopener,noreferrer');
                        }}
                        className="p-2 bg-white/90 dark:bg-gray-800/90 hover:bg-primary hover:text-white text-gray-700 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-700 transition-all shadow-sm cursor-pointer hover:scale-105"
                        title="Open PDF in new tab"
                      >
                        <Eye size={15} />
                      </button>
                    </div>

                    {/* Center Icon & Filename */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (previewData.url) window.open(previewData.url, '_blank', 'noopener,noreferrer');
                      }}
                      className="relative z-20 flex flex-col items-center text-center my-auto cursor-pointer"
                    >
                      <div className="w-14 h-14 bg-red-100 dark:bg-red-950/40 text-red-500 dark:text-red-400 rounded-2xl flex items-center justify-center mb-3 shadow-md border border-red-200 dark:border-red-900/40 group-hover:scale-110 transition-transform">
                        <FileText size={30} />
                      </div>
                      <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider truncate max-w-[200px] mb-1">
                        {previewData.name}
                      </p>
                      <span className="text-[9px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest bg-red-100/80 dark:bg-red-950/60 px-2.5 py-0.5 rounded-md border border-red-200 dark:border-red-900/40">
                        Ready for Verification
                      </span>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="relative z-20 w-full pt-3 flex items-center justify-between gap-2 border-t border-gray-200 dark:border-gray-700/60">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (previewData.url) window.open(previewData.url, '_blank', 'noopener,noreferrer');
                        }}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-primary hover:text-white text-gray-700 dark:text-gray-200 rounded-xl text-[10px] font-black uppercase tracking-wider border border-gray-200 dark:border-gray-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <Eye size={13} />
                        <span>View PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          doc.set(null);
                        }}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-[10px] font-black uppercase tracking-wider border border-red-200 dark:border-red-800/50 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Visual Image Thumbnail Preview (JPG, PNG, WEBP) */
                  <div className="relative w-full h-full min-h-[220px] sm:min-h-[240px] rounded-[1.8rem] overflow-hidden group shadow-md bg-gray-100 dark:bg-gray-900">
                    {/* Visual Image */}
                    {previewData.url ? (
                      <img
                        src={previewData.url}
                        alt={doc.title}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (previewData.url) setPreviewDoc({ url: previewData.url, title: doc.title });
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                        <FileText className="text-gray-400" size={40} />
                      </div>
                    )}

                    {/* Permanent Subtle Gradient for Bottom Text Contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-gray-950/20 pointer-events-none" />

                    {/* Top Status & Zoom Bar */}
                    <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary text-white text-[9px] font-black uppercase tracking-wider shadow-md">
                        <Check size={12} strokeWidth={3} />
                        <span>Uploaded & Verified</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (previewData.url) setPreviewDoc({ url: previewData.url, title: doc.title });
                        }}
                        className="p-2 bg-white/90 dark:bg-gray-800/90 hover:bg-primary hover:text-white text-gray-800 dark:text-gray-100 backdrop-blur-md rounded-xl border border-white/40 dark:border-gray-700 transition-all shadow-md cursor-pointer hover:scale-105"
                        title="Fullscreen Preview"
                      >
                        <Maximize2 size={15} />
                      </button>
                    </div>

                    {/* Full Seamless Hover Veil Overlay */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 p-4 bg-gray-950/50 backdrop-blur-[2px] pointer-events-none group-hover:pointer-events-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (previewData.url) setPreviewDoc({ url: previewData.url, title: doc.title });
                        }}
                        className="px-5 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-black text-[10px] uppercase tracking-widest border border-white/30 flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer pointer-events-auto"
                      >
                        <Eye size={16} />
                        <span>View Fullscreen</span>
                      </button>
                    </div>

                    {/* Bottom File Info & Remove Bar */}
                    <div className="absolute bottom-3 left-3 right-3 z-30 flex items-center justify-between gap-2 pointer-events-auto">
                      <div className="px-3 py-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-gray-800 dark:text-gray-100 text-[10px] font-black rounded-xl border border-gray-200/80 dark:border-gray-700/80 shadow-md truncate max-w-[150px] sm:max-w-[200px] flex items-center gap-1.5">
                        <FileText size={12} className="text-primary shrink-0" />
                        <span className="truncate">{previewData.name}</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          doc.set(null);
                        }}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/80 dark:hover:bg-red-900 text-red-600 dark:text-red-300 rounded-xl text-[10px] font-black uppercase tracking-wider backdrop-blur-md border border-red-200 dark:border-red-800/50 shadow-md transition-all flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Trash2 size={12} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                )
              ) : (
                /* Empty Upload Dropzone State */
                <div className="text-center">
                  <Upload className="text-gray-300 dark:text-gray-600 mx-auto mb-3" size={36} />
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
        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 leading-relaxed uppercase tracking-widest italic text-left">
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


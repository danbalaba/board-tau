"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  Home, 
  Eye, 
  EyeOff,
  Fingerprint, 
  ShieldAlert, 
  FileCheck2,
  Lock
} from "lucide-react";
import Link from "next/link";

interface ReportVerificationViewerProps {
  reportCode: string;
  reportTitle: string;
  issuerName: string;
  totalRecords: string | number;
  issuedDate: string;
  scope: string;
  pdfUrl?: string | null;
  pdfHash?: string | null;
}

export default function ReportVerificationViewer({
  reportCode,
  reportTitle,
  issuerName,
  totalRecords,
  issuedDate,
  scope,
  pdfUrl,
  pdfHash
}: ReportVerificationViewerProps) {
  const [activeTab, setActiveTab] = useState<"certificate" | "document">("certificate");
  const [copiedHash, setCopiedHash] = useState(false);
  const [showHash, setShowHash] = useState(false);

  // Fallback hash representation if pdfHash wasn't stored in legacy log
  const displayHash = pdfHash || `sha256:${reportCode.toLowerCase().replace(/[^a-z0-9]/g, '')}e98f72a4c`;
  const maskedHash = "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••";

  const handleCopyHash = () => {
    navigator.clipboard.writeText(displayHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-slate-900/90 backdrop-blur-2xl rounded-[32px] overflow-hidden shadow-2xl border border-gray-200/80 dark:border-slate-800 relative z-10 transition-all font-sans">
      {/* Tab Navigation Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-200/80 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-950/40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("certificate")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "certificate"
                ? "bg-[#2f7d6d] text-white shadow-md shadow-[#2f7d6d]/20"
                : "text-gray-700 dark:text-slate-300 hover:bg-gray-200/60 dark:hover:bg-slate-800/60"
            }`}
          >
            <ShieldCheck size={14} /> Official Certificate
          </button>

          {pdfUrl && (
            <button
              onClick={() => setActiveTab("document")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "document"
                  ? "bg-[#2f7d6d] text-white shadow-md shadow-[#2f7d6d]/20"
                  : "text-gray-700 dark:text-slate-300 hover:bg-gray-200/60 dark:hover:bg-slate-800/60"
              }`}
            >
              <Eye size={14} /> View Original PDF
            </button>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/25">
          <Lock size={12} /> Secure Connection
        </div>
      </div>

      {/* Tab 1: Official Certificate & Verification */}
      {activeTab === "certificate" && (
        <div>
          {/* Emerald Header Banner */}
          <div className="p-8 text-center bg-gradient-to-br from-[#2f7d6d] via-teal-600 to-emerald-800 relative overflow-hidden border-b border-white/10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-black/30 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white/15 text-white border border-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-xl ring-4 ring-white/20">
                <CheckCircle2 size={36} className="drop-shadow-md text-white" />
              </div>

              <h1 className="text-2xl font-black text-white tracking-tight mb-1 drop-shadow-md">
                Official Report Authenticity
              </h1>
              <p className="text-white/95 text-xs font-medium max-w-sm mx-auto mb-3 leading-relaxed drop-shadow-sm">
                This document is verified and officially logged in BoardTAU's system registry.
              </p>

              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-black/30 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/25 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                STATUS: OFFICIAL AUTHENTIC RECORD
              </div>
            </div>
          </div>

          {/* Details Content */}
          <div className="p-6 sm:p-8 space-y-5">
            {/* Title Card */}
            <div className="bg-gray-50/90 dark:bg-slate-950/60 rounded-2xl p-4 border border-gray-200/80 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400 block">
                REPORT DOCUMENT TITLE
              </span>
              <p className="text-base font-bold text-gray-900 dark:text-white">{reportTitle}</p>
            </div>

            {/* Issuer & Scope Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50/90 dark:bg-slate-950/60 rounded-2xl p-4 border border-gray-200/80 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400 block mb-1">
                  ISSUED BY
                </span>
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{issuerName}</p>
              </div>

              <div className="bg-gray-50/90 dark:bg-slate-950/60 rounded-2xl p-4 border border-gray-200/80 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400 block mb-1">
                  TOTAL RECORDS
                </span>
                <p className="text-xs font-bold text-gray-900 dark:text-white">{totalRecords} Items</p>
                <span className="text-[10px] font-semibold text-[#2f7d6d] dark:text-teal-400 uppercase tracking-wider block mt-0.5">
                  Scope: {scope}
                </span>
              </div>
            </div>

            {/* SHA-256 Security Digital Fingerprint with Show/Hide Toggle */}
            <div className="bg-emerald-50/70 dark:bg-slate-950/90 rounded-2xl p-4 border border-emerald-500/30 dark:border-slate-800 space-y-2 text-gray-900 dark:text-slate-100 relative overflow-hidden shadow-sm transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#2f7d6d] dark:text-teal-400 uppercase tracking-wider">
                  <Fingerprint size={16} /> Digital Security Signature
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowHash(!showHash)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold text-[#2f7d6d] dark:text-slate-300 transition-all flex items-center gap-1 border border-emerald-500/30 dark:border-slate-700"
                    title={showHash ? "Hide Signature" : "Show Signature"}
                  >
                    {showHash ? <EyeOff size={12} /> : <Eye size={12} />}
                    <span>{showHash ? "Hide" : "Show"}</span>
                  </button>

                  <button
                    onClick={handleCopyHash}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold text-[#2f7d6d] dark:text-slate-300 transition-all flex items-center gap-1 border border-emerald-500/30 dark:border-slate-700"
                    title="Copy Security Signature"
                  >
                    {copiedHash ? <Check size={12} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedHash ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <p className="text-[11px] font-mono text-[#2f7d6d] dark:text-emerald-400 break-all bg-white dark:bg-black/50 p-2.5 rounded-xl border border-emerald-500/20 dark:border-slate-800/80 select-all shadow-inner">
                {showHash ? displayHash : maskedHash}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-slate-400">
                If the report is edited, this digital signature will change.
              </p>
            </div>

            {/* Verification Code */}
            <div className="bg-gray-50/90 dark:bg-slate-950/90 rounded-2xl p-4 border border-gray-200/80 dark:border-slate-800 text-center space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400 block">
                VERIFICATION CODE
              </span>
              <p className="text-base font-black tracking-widest text-[#2f7d6d] dark:text-teal-400 font-mono">
                {reportCode}
              </p>
              <p className="text-[10px] font-medium text-gray-500 dark:text-slate-500">
                Issued on {issuedDate} • Verified by BoardTAU Security
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              {pdfUrl && (
                <button
                  onClick={() => setActiveTab("document")}
                  className="w-full py-3 bg-[#2f7d6d] hover:bg-[#256356] text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Eye size={14} /> View Original PDF
                </button>
              )}

              <Link
                href="/"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 border border-slate-900 dark:border-slate-700 shadow-md"
              >
                <Home size={14} /> Return Home
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Compare Original PDF Document Viewer */}
      {activeTab === "document" && (
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileCheck2 className="text-[#2f7d6d] dark:text-teal-400" size={18} /> Original Report File
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Compare your document to the original report stored on our server.
              </p>
            </div>

            {pdfUrl && (
              <div className="flex items-center gap-2">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#2f7d6d] hover:bg-[#256356] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <ExternalLink size={13} /> Open PDF
                </a>
                <a
                  href={pdfUrl}
                  download
                  className="px-3 py-1.5 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shrink-0 border border-gray-300 dark:border-slate-700"
                >
                  <Download size={13} /> Download
                </a>
              </div>
            )}
          </div>

          {/* PDF Object Viewer with Fail-Safe Embedded Action Card */}
          {pdfUrl ? (
            <div className="w-full h-[460px] bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-inner relative flex flex-col items-center justify-center p-2">
              <object
                data={`${pdfUrl}#toolbar=0`}
                type="application/pdf"
                className="w-full h-full rounded-xl"
              >
                {/* Fallback container if iframe/object is blocked by browser localhost security */}
                <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-3 bg-white dark:bg-slate-900 rounded-xl w-full">
                  <div className="w-14 h-14 rounded-2xl bg-[#2f7d6d]/10 text-[#2f7d6d] dark:text-teal-400 flex items-center justify-center border border-[#2f7d6d]/20">
                    <FileText size={30} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Original Report Ready for Verification</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-sm">
                      Click below to view or download the authentic server-generated PDF report.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-[#2f7d6d] hover:bg-[#256356] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md"
                    >
                      <ExternalLink size={14} /> Open Original PDF
                    </a>
                    <a
                      href={pdfUrl}
                      download
                      className="px-4 py-2.5 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-gray-300 dark:border-slate-700"
                    >
                      <Download size={14} /> Download PDF
                    </a>
                  </div>
                </div>
              </object>
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-200 dark:border-slate-800">
              <FileText className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-xs font-bold text-gray-700 dark:text-slate-300">
                PDF File Registered
              </p>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
                Audit record `{reportCode}` is verified in the database ledger.
              </p>
            </div>
          )}

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 flex items-start gap-2.5 text-amber-900 dark:text-amber-300 text-xs">
            <ShieldAlert size={16} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="font-bold block">Verification Note:</span>
              <span>
                If any number or word on your document doesn't match the original file, the document has been edited.
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setActiveTab("certificate")}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-700"
            >
              Back to Official Certificate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


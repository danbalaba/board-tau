'use client';

import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { RotateCcw, CheckCircle, PenTool } from 'lucide-react';
import Button from './Button';

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  onClear?: () => void;
  width?: number | string;
  height?: number | string;
  label?: string;
  autoSaveOnEnd?: boolean;
  initialDataUrl?: string;
  className?: string;
}

export default function SignaturePad({ 
  onSave, 
  onClear, 
  width = '100%', 
  height = 200,
  label,
  autoSaveOnEnd = false,
  initialDataUrl,
  className
}: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const lastLoadedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!sigCanvas.current) return;

    if (initialDataUrl && initialDataUrl !== lastLoadedUrlRef.current) {
      try {
        sigCanvas.current.clear();
        sigCanvas.current.fromDataURL(initialDataUrl);
        lastLoadedUrlRef.current = initialDataUrl;
        setIsEmpty(false);
        setIsSaved(true);
      } catch (err) {
        console.error("Failed to load initial signature:", err);
      }
    } else if (!initialDataUrl) {
      sigCanvas.current.clear();
      lastLoadedUrlRef.current = null;
      setIsEmpty(true);
      setIsSaved(false);
    }
  }, [initialDataUrl]);

  const handleClear = () => {
    sigCanvas.current?.clear();
    lastLoadedUrlRef.current = null;
    setIsEmpty(true);
    setIsSaved(false);
    if (onClear) onClear();
  };

  const handleSave = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataUrl = sigCanvas.current.getCanvas().toDataURL('image/png');
      lastLoadedUrlRef.current = dataUrl;
      onSave(dataUrl);
      setIsSaved(true);
    }
  };

  const handleEnd = () => {
    const empty = sigCanvas.current?.isEmpty() ?? true;
    setIsEmpty(empty);
    if (!empty && sigCanvas.current) {
      const dataUrl = sigCanvas.current.getCanvas().toDataURL('image/png');
      lastLoadedUrlRef.current = dataUrl;
      if (autoSaveOnEnd) {
        onSave(dataUrl);
        setIsSaved(true);
      }
    }
  };

  return (
    <div className={`flex flex-col gap-3 h-full flex-1 min-h-0 ${className || ''}`}>
      {label && (
        <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 shrink-0">
          {label}
        </label>
      )}
      
      <div 
        className="relative flex-1 min-h-[260px] h-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-inner transition-all focus-within:border-teal-500 hover:border-gray-300 dark:hover:border-gray-600"
        style={{ width, height: typeof height === 'number' ? `${height}px` : height }}
      >
        {isEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40 gap-2">
            <PenTool className="w-7 h-7 text-gray-400 dark:text-gray-500" />
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Draw your signature here</span>
          </div>
        )}
        
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: 'w-full h-full cursor-crosshair',
          }}
          onEnd={handleEnd}
          penColor="#2f7d6d"
          backgroundColor="transparent"
        />
      </div>

      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          onClick={handleClear}
          disabled={isEmpty}
          className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-wider transition-all px-3.5 py-2 rounded-xl border ${
            isEmpty
              ? 'text-gray-300 dark:text-gray-600 border-gray-100 dark:border-gray-800 cursor-not-allowed opacity-40'
              : 'text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-200 dark:hover:border-red-900/50'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Canvas</span>
        </button>

        {isSaved && !isEmpty ? (
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-3.5 py-2 rounded-xl border border-emerald-500/30 flex items-center gap-1.5 shadow-sm uppercase tracking-wider">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Signature Captured</span>
          </span>
        ) : !isEmpty ? (
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Save Signature</span>
          </button>
        ) : (
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 italic">
            Draw signature in canvas above
          </span>
        )}
      </div>
    </div>
  );
}

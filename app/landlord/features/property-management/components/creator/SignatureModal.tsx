'use client';

import React from 'react';
import Modal from '@/components/modals/Modal';
import SignaturePad from '@/components/common/SignaturePad';
import { PenTool, CheckCircle, X } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (signatureDataUrl: string) => void;
  currentSignature?: string;
}

export default function SignatureModal({
  isOpen,
  onClose,
  onConfirm,
  currentSignature
}: SignatureModalProps) {
  const [signatureUrl, setSignatureUrl] = React.useState<string>(currentSignature || '');

  React.useEffect(() => {
    setSignatureUrl(currentSignature || '');
  }, [currentSignature, isOpen]);

  const handleConfirm = () => {
    if (signatureUrl) {
      onConfirm(signatureUrl);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="lg" fullOnMobile={true}>
      <div className="p-4 sm:p-6 h-full sm:h-auto flex flex-col justify-between space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 sm:pb-4 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 bg-teal-500/10 rounded-xl text-teal-600 shrink-0">
              <PenTool className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs sm:text-sm truncate">
                Fullscreen Signature Canvas
              </h3>
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 truncate">
                Draw your official signature clearly inside the box below
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 flex-1 flex flex-col min-h-0 py-2">
          <SignaturePad
            height="100%"
            label=""
            initialDataUrl={signatureUrl}
            onSave={(dataUrl: string) => setSignatureUrl(dataUrl)}
            onClear={() => setSignatureUrl('')}
            autoSaveOnEnd={false}
            className="flex-1 min-h-0"
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!signatureUrl}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm ${
              signatureUrl
                ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
            }`}
          >
            <CheckCircle size={16} />
            <span>Confirm & Apply Signature</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

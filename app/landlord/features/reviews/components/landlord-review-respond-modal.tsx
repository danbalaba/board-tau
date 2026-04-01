'use client';

import React, { useState } from 'react';
import { IconMessage } from '@tabler/icons-react';
import Button from "@/components/common/Button";

interface LandlordReviewRespondModalProps {
  isOpen: boolean;
  reviewId: string;
  reviewTitle: string;
  onClose: () => void;
  onSuccess: (reviewId: string, response: string) => void;
}

export function LandlordReviewRespondModal({
  isOpen,
  reviewId,
  reviewTitle,
  onClose,
  onSuccess
}: LandlordReviewRespondModalProps) {
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/landlord/reviews?id=${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: responseText.trim() }),
      });

      if (res.ok) {
        onSuccess(reviewId, responseText.trim());
        onClose();
        setResponseText('');
      }
    } catch (error) {
      console.error('Error responding to review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Respond to Review</h2>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-6 line-clamp-1">For property: <span className="text-primary">{reviewTitle}</span></p>
          <form onSubmit={handleSubmitResponse} className="space-y-6">
            <div>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Write your response clearly and professionally..."
                className="w-full p-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 dark:text-white text-sm font-medium resize-none min-h-[140px] transition-all"
              />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 px-1">Your response will be visible publicly.</p>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
              <Button outline type="button" onClick={onClose} className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400">Cancel</Button>
              <Button type="submit" disabled={submitting || !responseText.trim()} className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none">
                {submitting ? <div className="flex items-center gap-2"><div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>Submitting...</div> : <span className="flex items-center gap-2"><IconMessage size={12} />Submit Response</span>}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

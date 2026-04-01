'use client';

import React from 'react';
import { useReviewDetailLogic } from './hooks/use-review-detail-logic';
import { LandlordReviewDetail } from './components/landlord-review-detail-view';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

interface LandlordReviewDetailFeatureProps {
  id: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
  approved: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
  rejected: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
};

const formatStatus = (status: string) => status.charAt(0).toUpperCase() + status.slice(1);

export default function LandlordReviewDetailFeature({ id }: LandlordReviewDetailFeatureProps) {
  const {
    review,
    loading,
    error,
    responseText,
    setResponseText,
    isSubmitting,
    handleSubmitResponse
  } = useReviewDetailLogic(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Error loading review</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">{error || 'Review not found'}</p>
            <Link href="/landlord/reviews" className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary/20">
              <FaArrowLeft size={12} /> Back to Reviews
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LandlordReviewDetail 
      review={review}
      responseText={responseText}
      setResponseText={setResponseText}
      isSubmitting={isSubmitting}
      onResponse={handleSubmitResponse}
      statusColors={statusColors}
      formatStatus={formatStatus}
    />
  );
}

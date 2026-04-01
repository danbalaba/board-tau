'use client';

import React from 'react';
import { FaStar, FaComment, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

interface Review {
  id: string;
  listing: {
    id: string;
    title: string;
    imageSrc: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  rating: number;
  comment: string | null;
  response: string | null;
  status: string;
  createdAt: Date | string;
  respondedAt: Date | string | null;
}

interface LandlordReviewDetailProps {
  review: Review;
  responseText: string;
  setResponseText: (val: string) => void;
  isSubmitting: boolean;
  onResponse: (e: React.FormEvent) => void;
  statusColors: Record<string, string>;
  formatStatus: (status: string) => string;
}

export function LandlordReviewDetail({
  review,
  responseText,
  setResponseText,
  isSubmitting,
  onResponse,
  statusColors,
  formatStatus
}: LandlordReviewDetailProps) {

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            size={16}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/landlord/reviews"
          className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 mb-6 shadow-sm"
        >
          <FaArrowLeft size={12} />
          Back to Reviews
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg">
          <div className="flex items-start gap-6 mb-8">
            <div className="relative w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0">
              {review.listing.imageSrc ? (
                <img
                  src={review.listing.imageSrc}
                  alt={review.listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                  <FaStar size={32} className="text-gray-400 dark:text-gray-500" />
                </div>
              )}
              <div className="absolute bottom-2 right-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[review.status]} shadow-lg uppercase`}>
                  {formatStatus(review.status)}
                </span>
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {review.listing.title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Review by <span className="font-semibold">{review.user.name || 'Anonymous'}</span> ({review.user.email})
              </p>
              <div className="flex items-center gap-3 mb-4">
                {renderStars(review.rating)}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {review.rating}.0 Rating
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Review on {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Review Comment
            </h2>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">
                "{review.comment || 'No comment provided'}"
              </p>
            </div>
          </div>

          {review.response ? (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Your Response
              </h2>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-3">
                  <FaComment size={14} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Responded on {new Date(review.respondedAt!).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                  {review.response}
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Respond to Review
              </h2>
              <form onSubmit={onResponse} className="space-y-4">
                <div>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Enter your response..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 text-sm resize-vertical min-h-[120px]"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || !responseText.trim()}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-2.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30 font-semibold text-sm"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <FaComment size={12} />
                    )}
                    {isSubmitting ? 'Submitting...' : 'Submit Response'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

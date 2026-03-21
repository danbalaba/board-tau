'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaStar, FaEye, FaComment, FaChevronDown } from 'react-icons/fa';

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
  createdAt: Date;
  respondedAt: Date | null;
}

interface LandlordReviewsClientProps {
  reviews: {
    reviews: Review[];
    nextCursor: string | null;
  };
}

export default function LandlordReviewsClient({ reviews }: LandlordReviewsClientProps) {
  const { reviews: reviewsList, nextCursor } = reviews;
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');

  const statusColors: Record<string, string> = {
    pending: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
    approved: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
    rejected: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            size={14}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const filteredReviews = reviewsList.filter(review => {
    const statusMatch = selectedStatus === 'all' || review.status === selectedStatus;
    const ratingMatch = selectedRating === 'all' || review.rating === parseInt(selectedRating);
    return statusMatch && ratingMatch;
  });

  const [respondModal, setRespondModal] = useState<{
    isOpen: boolean;
    reviewId: string;
    reviewTitle: string;
  }>({ isOpen: false, reviewId: '', reviewTitle: '' });
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRespond = async (reviewId: string, response: string) => {
    try {
      const res = await fetch(`/api/landlord/reviews?id=${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response }),
      });

      if (res.ok) {
        // Refresh the reviews list
        window.location.reload();
      }
    } catch (error) {
      console.error('Error responding to review:', error);
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!responseText.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/landlord/reviews?id=${respondModal.reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response: responseText.trim() }),
      });

      if (res.ok) {
        setRespondModal({ isOpen: false, reviewId: '', reviewTitle: '' });
        setResponseText('');
        // Refresh the reviews list
        window.location.reload();
      }
    } catch (error) {
      console.error('Error responding to review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl border border-blue-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Reviews
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Manage property reviews and responses
            </p>
          </div>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-2xl shadow-lg">
            <FaStar size={16} />
            <span className="font-semibold text-sm">{filteredReviews.length}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Status:
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Rating:
            </span>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 text-sm"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl mb-4">
            <FaStar size={32} className="text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            No reviews found
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your properties haven't received any reviews yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0 group-hover:scale-[1.05] transition-transform duration-300">
                    {review.listing.imageSrc ? (
                      <img
                        src={review.listing.imageSrc}
                        alt={review.listing.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                        <FaStar size={24} className="text-gray-400 dark:text-gray-500 group-hover:scale-110 transition-transform" />
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[review.status]} shadow-lg`}>
                        {formatStatus(review.status)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {review.listing.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                      Review by <span className="font-semibold">{review.user.name}</span> ({review.user.email})
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      {renderStars(review.rating)}
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {review.rating} stars
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                      {review.comment}
                    </p>
                    {review.response && (
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3 mb-2">
                        <div className="flex items-center gap-2 mb-2">
                          <FaComment size={12} className="text-blue-600 dark:text-blue-400" />
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">
                            Your Response:
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {review.response}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Responded on {new Date(review.respondedAt!).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Review on {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href={`/landlord/reviews/${review.id}`}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 group-hover:scale-[1.02]"
                >
                  <FaEye size={12} />
                  <span className="font-semibold text-xs">View Details</span>
                </Link>
                {!review.response && (
                  <button
                    onClick={() => setRespondModal({
                      isOpen: true,
                      reviewId: review.id,
                      reviewTitle: review.listing.title
                    })}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30 group-hover:scale-[1.02]"
                  >
                    <FaComment size={12} />
                    <span className="font-semibold text-xs">Respond</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {nextCursor && (
        <div className="text-center py-6">
          <button
            className="group flex items-center justify-center gap-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-gray-500/30 transform hover:-translate-y-1"
            onClick={() => console.log('Load more reviews')}
          >
            <span className="font-semibold text-sm">Load More</span>
            <FaChevronDown size={12} className="group-hover:translate-y-1 transition-transform" />
          </button>
        </div>
      )}

      {/* Respond Modal */}
      {respondModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg shadow-2xl">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Respond to Review: {respondModal.reviewTitle}
              </h2>
              
              <form onSubmit={handleSubmitResponse} className="space-y-4">
                <div>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Enter your response..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 text-sm resize-vertical min-h-[120px]"
                  />
                </div>
                
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setRespondModal({ isOpen: false, reviewId: '', reviewTitle: '' });
                      setResponseText('');
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={submitting || !responseText.trim()}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30 font-semibold text-sm"
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <FaComment size={12} />
                    )}
                    {submitting ? 'Submitting...' : 'Submit Response'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

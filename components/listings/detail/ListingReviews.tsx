"use client";

import React from "react";
import { AiOutlineStar, AiFillStar } from "react-icons/ai";
import { motion } from "framer-motion";

interface Review {
  id: string;
  rating: number;
  comment: string;
  cleanliness?: number;
  accuracy?: number;
  communication?: number;
  location?: number;
  value?: number;
  createdAt: Date;
  user: {
    name: string;
    image?: string;
  };
}

interface ListingReviewsProps {
  reviews: Review[];
  listingRating?: number;
  listingReviewCount?: number;
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <div key={i}>
          {i < Math.round(rating) ? (
            <AiFillStar className="text-yellow-400 text-sm" />
          ) : (
            <AiOutlineStar className="text-gray-300 text-sm" />
          )}
        </div>
      ))}
      <span className="ml-2 text-sm font-medium text-gray-600">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

export default function ListingReviews({
  reviews,
  listingRating = 4.8,
  listingReviewCount = 0,
}: ListingReviewsProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Reviews</h2>
        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="border-t pt-8">
      {/* Overall Rating */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-800">Reviews</h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i}>
                {i < Math.round(listingRating) ? (
                  <AiFillStar className="text-[#2F7D6D] text-lg" />
                ) : (
                  <AiOutlineStar className="text-gray-300 text-lg" />
                )}
              </div>
            ))}
          </div>
          <div>
            <span className="font-semibold text-gray-800">
              {listingRating.toFixed(1)}
            </span>
            <span className="text-gray-500 ml-2">
              ({listingReviewCount} review{listingReviewCount !== 1 ? "s" : ""})
            </span>
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-6">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="border-b pb-6"
          >
            {/* Review Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {review.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {review.user.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <StarRating rating={review.rating} />
            </div>

            {/* Review Comment */}
            <p className="text-gray-700 mb-4">{review.comment}</p>

            {/* Category Ratings */}
            {(review.cleanliness ||
              review.accuracy ||
              review.communication ||
              review.location ||
              review.value) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4 pt-4 border-t">
                {review.cleanliness && (
                  <div className="text-sm">
                    <p className="text-gray-600 mb-1">Cleanliness</p>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i}>
                          {i < review.cleanliness! ? (
                            <AiFillStar className="text-yellow-400 text-xs" />
                          ) : (
                            <AiOutlineStar className="text-gray-300 text-xs" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {review.accuracy && (
                  <div className="text-sm">
                    <p className="text-gray-600 mb-1">Accuracy</p>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i}>
                          {i < review.accuracy! ? (
                            <AiFillStar className="text-yellow-400 text-xs" />
                          ) : (
                            <AiOutlineStar className="text-gray-300 text-xs" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {review.communication && (
                  <div className="text-sm">
                    <p className="text-gray-600 mb-1">Communication</p>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i}>
                          {i < review.communication! ? (
                            <AiFillStar className="text-yellow-400 text-xs" />
                          ) : (
                            <AiOutlineStar className="text-gray-300 text-xs" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {review.location && (
                  <div className="text-sm">
                    <p className="text-gray-600 mb-1">Location</p>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i}>
                          {i < review.location! ? (
                            <AiFillStar className="text-yellow-400 text-xs" />
                          ) : (
                            <AiOutlineStar className="text-gray-300 text-xs" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {review.value && (
                  <div className="text-sm">
                    <p className="text-gray-600 mb-1">Value</p>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i}>
                          {i < review.value! ? (
                            <AiFillStar className="text-yellow-400 text-xs" />
                          ) : (
                            <AiOutlineStar className="text-gray-300 text-xs" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

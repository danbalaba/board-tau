'use client';

import React from 'react';
import { 
  IconStar, 
  IconStarFilled, 
  IconEye, 
  IconMessage 
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import Button from "@/components/common/Button";

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

interface LandlordReviewCardProps {
  review: Review;
  viewMode: 'grid' | 'list';
  statusColors: Record<string, string>;
  onRespond: (review: Review) => void;
  onViewDetails: (id: string) => void;
}

export default function LandlordReviewCard({
  review,
  viewMode,
  statusColors,
  onRespond,
  onViewDetails,
}: LandlordReviewCardProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <IconStarFilled
            key={star}
            size={14}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  if (viewMode === 'grid') {
    return (
      <div className="group relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-300 shadow-sm flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="relative w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden group-hover:shadow-md transition-all duration-300">
            {review.listing.imageSrc ? (
              <img
                src={review.listing.imageSrc}
                alt={review.listing.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <IconStar size={20} />
              </div>
            )}
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-500/20 flex items-center gap-1.5">
            <IconStarFilled size={10} className="text-amber-500" />
            <span className="text-xs font-black text-amber-600 dark:text-amber-400">{review.rating}</span>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-3 line-clamp-1 group-hover:text-primary transition-colors">
            {review.listing.title}
          </h3>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300 italic mb-4 line-clamp-3">
            {review.comment || 'No comment provided.'}
          </div>

          <div className="flex items-center gap-3 mt-auto">
            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">
              {review.user.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-[11px] font-black text-gray-900 dark:text-gray-100 truncate">{review.user.name || 'Anonymous'}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase">{new Date(review.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          {!review.response && (
            <Button
              onClick={() => onRespond(review)}
              className="w-full rounded-xl py-2.5 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
            >
              Respond Now
            </Button>
          )}
          <Button
            outline
            onClick={() => onViewDetails(review.id)}
            className="w-full rounded-xl py-2.5 text-[10px] font-black uppercase tracking-widest"
          >
            View Details
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-300 shadow-sm">
      <div className="flex flex-col md:flex-row items-start gap-6">
        <div className="relative w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden flex-shrink-0 group-hover:shadow-md transition-all duration-300">
          {review.listing.imageSrc ? (
            <img
              src={review.listing.imageSrc}
              alt={review.listing.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <IconStar size={24} />
            </div>
          )}
        </div>
        <div className="flex-1 w-full">
          <div className="flex items-start justify-between mb-1 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("px-2 py-0.5 rounded-md text-[9px] uppercase font-black tracking-widest", statusColors[review.status.toLowerCase()])}>
                  {review.status}
                </span>
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">
                {review.listing.title}
              </h3>
            </div>
            <div className="bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10 flex items-center gap-2 shadow-sm">
              {renderStars(review.rating)}
              <span className="text-xs font-black text-primary">
                {review.rating.toFixed(1)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black uppercase">
              {review.user.name?.charAt(0) || 'U'}
            </div>
            <p className="text-sm font-medium text-gray-500">
              <span className="font-bold text-gray-900 dark:text-gray-100">{review.user.name || 'Anonymous User'}</span> 
              <span className="mx-1.5 opacity-50">•</span> 
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic relative mb-4">
            <span className="absolute -top-3 left-4 text-3xl text-gray-200 dark:text-gray-700">"</span>
            <p className="relative z-10 whitespace-pre-line">{review.comment || 'No comment provided.'}</p>
          </div>

          {review.response && (
            <div className="flex flex-col mb-4">
              <div className="flex items-center gap-2 mb-2 pl-4">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-[10px] font-black uppercase">
                  L
                </div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Your Response</p>
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-auto">
                  {new Date(review.respondedAt!).toLocaleDateString()}
                </span>
              </div>
              <div className="ml-10 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-xl rounded-tl-sm p-3 text-sm text-gray-700 dark:text-gray-300">
                {review.response}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
        <Button
          outline
          onClick={() => onViewDetails(review.id)}
          className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border-gray-200 dark:border-gray-700"
        >
          <span className="flex items-center gap-2">
            <IconEye size={12} />
            View Details
          </span>
        </Button>
        
        {!review.response && (
          <div className="flex items-center gap-2 border-l border-gray-100 dark:border-gray-800 pl-3">
            <Button
              onClick={() => onRespond(review)}
              className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
            >
              <span className="flex items-center gap-2">
                <IconMessage size={12} />
                Respond
              </span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

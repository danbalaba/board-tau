import React from 'react';
import Link from 'next/link';
import { Listing } from '@prisma/client';
import HeartButton from '@/components/favorites/HeartButton';
import { Star, MapPin } from 'lucide-react';

interface CompactListingCardProps {
  data: Listing;
  hasFavorited: boolean;
  onClickOverride?: (e: React.MouseEvent) => void;
}

const CompactListingCard: React.FC<CompactListingCardProps> = ({
  data,
  hasFavorited,
  onClickOverride
}) => {
  // Use first image or fallback
  const imgSrc = (typeof data.imageSrc === 'string' && data.imageSrc.startsWith('http'))
    ? data.imageSrc
    : (Array.isArray((data as any).images) && (data as any).images[0]?.url)
      ? (data as any).images[0].url
      : 'https://res.cloudinary.com/dtg0zavxl/image/upload/v1727878437/BoardTAU/Assets/bnnwtyyvsh42iyn33d5y.jpg';

  const CardContent = (
    <div className="flex gap-4 p-3 bg-white dark:bg-slate-900 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700 shadow-sm hover:shadow-md h-[120px] overflow-hidden">
      <div className="relative w-28 h-full rounded-lg overflow-hidden shrink-0">
        <img
          src={imgSrc}
          alt={data.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-1 right-1 z-10" onClick={(e) => e.stopPropagation()}>
          <HeartButton listingId={data.id} hasFavorited={hasFavorited} />
        </div>
      </div>
      
      <div className="flex flex-col justify-between py-1 flex-1 min-w-0">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
            {data.title}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1 mt-1 truncate">
            <MapPin size={12} />
            {data.country || 'Location'}
          </p>
        </div>
        
        <div className="flex justify-between items-end mt-2">
          <p className="font-bold text-primary text-base">
            ₱{data.price.toLocaleString()}
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">/mo</span>
          </p>
          <div className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
            <Star className="fill-amber-400 text-amber-400" size={12} />
            {data.rating?.toFixed(1) || 'New'}
          </div>
        </div>
      </div>
    </div>
  );

  if (onClickOverride) {
    return (
      <div onClick={onClickOverride} className="w-full">
        {CardContent}
      </div>
    );
  }

  return (
    <Link href={`/listings/${data.id}`} prefetch={false} className="block w-full">
      {CardContent}
    </Link>
  );
};

export default CompactListingCard;

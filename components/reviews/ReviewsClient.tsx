"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Heading from "@/components/common/Heading";
import { Search, Filter, ArrowUpDown, Clock, Star, MessageSquare, Check } from "lucide-react";
import { cn } from "@/utils/helper";
import { motion } from "framer-motion";
import ModernSelect from "@/components/common/ModernSelect";
import ModernLoader from "@/components/common/ModernLoader";
import ReviewCard from "./ReviewCard";
import ReviewDetailsModal from "./ReviewDetailsModal";
import { useNotification } from "@/context/NotificationContext";
import { UserMobileFilterSheet } from "@/components/common/UserMobileFilterSheet";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/lib/pusher-client";

interface ReviewListing {
  id: string;
  title: string;
  imageSrc: string;
  region?: string;
  country?: string;
  user?: {
    name: string;
    image?: string | null;
  };
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  response: string | null;
  respondedAt: any;
  createdAt: any;
  listing: ReviewListing;
  images: string[];
  user?: {
    name: string;
    image?: string | null;
  };
}

interface ReviewsClientProps {
  initialReviews: Review[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const starOptions = [
  { value: "all", label: "All Ratings", color: "bg-gray-400" },
  { value: "5", label: "5 Stars", color: "bg-amber-500" },
  { value: "4", label: "4 Stars", color: "bg-amber-500" },
  { value: "3", label: "3 Stars", color: "bg-amber-500" },
  { value: "2", label: "2 Stars", color: "bg-amber-500" },
  { value: "1", label: "1 Star", color: "bg-amber-500" },
];

const sortOptions = [
  { value: "newest", label: "Newest First", icon: <Clock size={16} /> },
  { value: "oldest", label: "Oldest First", icon: <Clock size={16} className="opacity-50" /> },
  { value: "rating-high", label: "Highest Rated", icon: <Star size={16} /> },
  { value: "rating-low", label: "Lowest Rated", icon: <Star size={16} className="opacity-50" /> },
];

const ReviewsClient: React.FC<ReviewsClientProps> = ({ initialReviews }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [searchQuery, setSearchQuery] = useState("");
  const [starFilter, setStarFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const searchParams = useSearchParams();
  const { notifications, markAsRead } = useNotification();
  const unreadNotifications = notifications.filter(n => !n.isRead && n.type === "review");
  const [isLoading, setIsLoading] = useState(true);
  const hasAutoOpened = React.useRef(false);

  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  // Real-time Pusher listener for review updates / responses
  useEffect(() => {
    if (!userId) return;

    const channelName = `private-user-${userId}`;
    const channel = pusherClient.subscribe(channelName);

    const handleReviewUpdated = (data: any) => {
      if (!data || !data.entityId) return;

      setReviews((prev) => {
        const index = prev.findIndex((r) => r.id === data.entityId);
        if (index === -1) {
          if (data.payload && data.payload.id) {
            return [data.payload, ...prev];
          }
          return prev;
        }

        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          response: data.payload?.response || updated[index].response,
          respondedAt: data.payload?.respondedAt || updated[index].respondedAt,
          ...(data.payload || {}),
        };
        return updated;
      });

      setSelectedReview((prevSelected) => {
        if (prevSelected && prevSelected.id === data.entityId) {
          return {
            ...prevSelected,
            response: data.payload?.response || prevSelected.response,
            respondedAt: data.payload?.respondedAt || prevSelected.respondedAt,
            ...(data.payload || {}),
          };
        }
        return prevSelected;
      });
    };

    channel.bind("review-updated", handleReviewUpdated);

    return () => {
      channel.unbind("review-updated", handleReviewUpdated);
    };
  }, [userId]);

  useEffect(() => {
    // Artificial delay for that "Premium" feel
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Auto-open modal if ID is in URL
  useEffect(() => {
    const id = searchParams.get("id");
    if (id && !hasAutoOpened.current && reviews.length > 0) {
      const review = reviews.find(r => r.id === id);
      if (review) {
        setSelectedReview(review);
        hasAutoOpened.current = true;
      }
    }
  }, [searchParams, reviews]);

  const filteredReviews = useMemo(() => {
    let filtered = [...reviews];

    if (starFilter !== "all") {
      filtered = filtered.filter(r => r.rating === parseInt(starFilter));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.listing.title.toLowerCase().includes(query) ||
        (r.comment && r.comment.toLowerCase().includes(query))
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "rating-high") return b.rating - a.rating;
      if (sortBy === "rating-low") return a.rating - b.rating;
      return 0;
    });

    return filtered;
  }, [initialReviews, starFilter, searchQuery, sortBy]);

  return (
    <div className="main-container min-h-[70vh]">
      <Heading 
        title="My Reviews" 
        subtitle="Manage the feedback you've shared with landlords"
        backBtn
      />

      {/* Filters and Search - Responsive Layout */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 mb-10 flex flex-col md:flex-row items-center gap-4 bg-white/50 dark:bg-gray-800/50 p-4 rounded-2xl backdrop-blur-md border border-gray-100 dark:border-gray-700/50 shadow-sm relative z-20"
      >
        {/* Search & Mobile Filter Trigger */}
        <div className="flex items-center gap-2 w-full md:flex-[5]">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search reviews or properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-transparent rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-all text-sm"
            />
          </div>

          {/* Mobile Filter Sheet Drawer */}
          <UserMobileFilterSheet
            activeFilterCount={(starFilter !== "all" ? 1 : 0) + (sortBy !== "newest" ? 1 : 0)}
            onClearAll={() => {
              setStarFilter("all");
              setSortBy("newest");
            }}
          >
            <div className="space-y-6">
              {/* Star Rating Section */}
              <div className="space-y-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Filter size={14} className="text-primary" /> Star Rating
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {starOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStarFilter(opt.value)}
                      className={cn(
                        "px-3.5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all flex items-center justify-between cursor-pointer",
                        starFilter === opt.value
                          ? "bg-primary/10 text-primary border-primary/30 font-black shadow-xs"
                          : "bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200/60 dark:border-gray-700/60 hover:bg-gray-100"
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {starFilter === opt.value && <Check size={14} strokeWidth={3} className="text-primary shrink-0 ml-1" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Section */}
              <div className="space-y-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <ArrowUpDown size={14} className="text-primary" /> Sort Order
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSortBy(opt.value)}
                      className={cn(
                        "px-3.5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all flex items-center justify-between cursor-pointer",
                        sortBy === opt.value
                          ? "bg-primary/10 text-primary border-primary/30 font-black shadow-xs"
                          : "bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200/60 dark:border-gray-700/60 hover:bg-gray-100"
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {sortBy === opt.value && <Check size={14} strokeWidth={3} className="text-primary shrink-0 ml-1" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </UserMobileFilterSheet>
        </div>

        {/* Desktop Inline Filters */}
        <div className="hidden md:flex items-center gap-4">
          <ModernSelect
            instanceId="star-filter"
            options={starOptions}
            value={starFilter}
            onChange={(val) => setStarFilter(val as string)}
            icon={<Filter size={18} />}
            className="w-max min-w-[180px]"
          />

          <ModernSelect
            instanceId="sort-filter"
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
            icon={<ArrowUpDown size={18} />}
            className="w-max min-w-[200px]"
          />
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <ModernLoader text="Loading reviews..." mascotSrc="/assets/mascot/kerby-global-studying.png" />
        </div>
      ) : (
        <>
          {filteredReviews.length === 0 ? (
            <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-900/20 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2">No Reviews Found</h3>
              <p className="text-gray-500">Try adjusting your filters or share your first experience!</p>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredReviews.map((review) => {
                // Support both precise ID matching (new) and legacy matching (old)
                const hasNotification = unreadNotifications.some(n => 
                  n.link.includes(review.id) || (n.type === "review" && n.link === "/my-reviews")
                );
                return (
                  <motion.div key={review.id} variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }}>
                    <ReviewCard
                      review={review}
                      hasNotification={hasNotification}
                      onViewDetails={() => setSelectedReview(review)}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {selectedReview && (
            <ReviewDetailsModal
              review={selectedReview}
              isOpen={!!selectedReview}
              notification={unreadNotifications.find(n => 
                n.link.includes(selectedReview.id) || (n.type === "review" && n.link === "/my-reviews")
              )}
              onClose={() => {
                setSelectedReview(null);
              }}
              onMarkAsRead={() => {
                const notif = unreadNotifications.find(n => 
                  n.link.includes(selectedReview.id) || (n.type === "review" && n.link === "/my-reviews")
                );
                if (notif) markAsRead(notif.id, "review");
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ReviewsClient;

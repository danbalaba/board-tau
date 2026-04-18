"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Heading from "@/components/common/Heading";
import { Search, Filter, ArrowUpDown, Clock, Star, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import ModernSelect from "@/components/common/ModernSelect";
import ModernLoader from "@/components/common/ModernLoader";
import ReviewCard from "./ReviewCard";
import ReviewDetailsModal from "./ReviewDetailsModal";
import { getUnreadNotifications } from "@/services/notification";
import { Notification } from "@prisma/client";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [starFilter, setStarFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const data = await getUnreadNotifications();
      setUnreadNotifications(data);
      
      // Artificial delay for that "Premium" feel
      setTimeout(() => setIsLoading(false), 800);
    };
    fetchNotifications();
  }, []);

  const filteredReviews = useMemo(() => {
    let filtered = [...initialReviews];

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

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 mb-10 flex flex-col md:flex-row items-center gap-4 bg-white/50 dark:bg-gray-800/50 p-4 rounded-[2rem] backdrop-blur-md border border-gray-100 dark:border-gray-700/50 shadow-sm"
      >
        <div className="relative flex-[5]">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search reviews or properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-transparent rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-all"
          />
        </div>

        <ModernSelect
          instanceId="star-filter"
          options={starOptions}
          value={starFilter}
          onChange={(val) => setStarFilter(val as string)}
          icon={<Filter size={18} />}
          className="md:w-max min-w-[180px]"
        />

        <ModernSelect
          instanceId="sort-filter"
          options={sortOptions}
          value={sortBy}
          onChange={setSortBy}
          icon={<ArrowUpDown size={18} />}
          className="md:w-max min-w-[200px]"
        />
      </motion.div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <ModernLoader text="Capturing your feedback history..." />
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
                setUnreadNotifications(prev => prev.filter(n => 
                  !(n.link.includes(selectedReview.id) || (n.type === "review" && n.link === "/my-reviews"))
                ));
                setSelectedReview(null);
                router.refresh();
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ReviewsClient;

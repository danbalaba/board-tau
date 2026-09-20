import React from "react";
import Modal from "../modals/Modal";
import { X, Star, Calendar, MessageSquare, MapPin, Clock, Play, ChevronLeft, ChevronRight, ChevronDown, CheckCircle, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationItem } from "@/context/NotificationContext";
import Avatar from "@/components/common/Avatar";
import SafeImage from "@/components/common/SafeImage";
import MediaPreviewOverlay from "@/components/common/MediaPreviewOverlay";

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
  images?: Array<{ url: string }>;
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
  videos?: string[];
  user?: {
    name: string;
    image?: string | null;
  };
  reservation?: {
    room?: {
      id: string;
      name: string;
      images?: Array<{ url: string }>;
    }
  }
}

interface ReviewDetailsModalProps {
  review: Review;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead?: () => void;
  notification?: NotificationItem;
}

const cleanText = (text: string | null | undefined): string => {
  if (!text) return "";
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"');
};

const ReviewDetailsModal: React.FC<ReviewDetailsModalProps> = ({
  review,
  isOpen,
  onClose,
  onMarkAsRead,
  notification,
}) => {
  const [selectedMediaIdx, setSelectedMediaIdx] = React.useState<number | null>(null);
  const [isDetailsExpanded, setIsDetailsExpanded] = React.useState(false);
  const [currentImgIdx, setCurrentImgIdx] = React.useState(0);

  const allMediaUrls = [
    ...(review.images || []),
    ...(review.videos || [])
  ];

  // Room/Listing images for the sidebar gallery
  const featuredMedia = React.useMemo(() => {
    let imgs: string[] = [];
    if (review.reservation?.room?.images && review.reservation.room.images.length > 0) {
      imgs = review.reservation.room.images.map(i => i.url);
    } else if (review.listing?.images && review.listing.images.length > 0) {
      imgs = review.listing.images.map(i => typeof i === 'string' ? i : (i as any).url);
    } else if (review.listing?.imageSrc) {
      imgs = [review.listing.imageSrc];
    }
    return imgs.length > 0 ? imgs : ["/images/placeholder.jpg"];
  }, [review]);

  const handleNextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev + 1) % featuredMedia.length);
  };

  const handlePrevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev - 1 + featuredMedia.length) % featuredMedia.length);
  };

  React.useEffect(() => {
    if (isOpen && notification) {
      if (onMarkAsRead) {
        onMarkAsRead();
      }
    }
  }, [isOpen, notification, onMarkAsRead]);

  if (!isOpen) return null;

  const rawComment = cleanText(review.comment);
  const rawResponse = cleanText(review.response);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} width="xl" hasFixedFooter={true}>
        <div className="flex flex-col min-h-[85vh] max-h-[85vh] sm:min-h-0 sm:h-auto sm:max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900 rounded-[2.5rem]">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 shrink-0">
            <div className="flex items-center gap-3.5 ml-2 sm:ml-4">
              <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
                <Star size={20} className="fill-current" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight">
                  Review Details
                </h2>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block mt-0.5">
                  Tenant Feedback
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content Container */}
          <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden bg-slate-50/70 dark:bg-gray-950 custom-scrollbar">
            
            {/* Mobile-Only Expandable Card */}
            <div className="md:hidden p-4 bg-white dark:bg-gray-900 shrink-0">
              <div className="bg-gray-50/80 dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs overflow-hidden">
                 <button 
                  onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                  className="w-full p-3 flex items-center gap-4 text-left active:bg-gray-100 dark:active:bg-gray-700 transition-all"
                 >
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white dark:border-gray-700 shadow-xs relative group/thumb">
                       <SafeImage 
                          src={featuredMedia[currentImgIdx]} 
                          alt="Listing" 
                       />
                       {featuredMedia.length > 1 && (
                         <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                           <div className="flex gap-1">
                             <button onClick={handlePrevImg} className="p-0.5 bg-white/20 rounded-md hover:bg-white/40"><ChevronLeft size={10} /></button>
                             <button onClick={handleNextImg} className="p-0.5 bg-white/20 rounded-md hover:bg-white/40"><ChevronRight size={10} /></button>
                           </div>
                         </div>
                       )}
                    </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                         <h4 className="font-black text-sm text-gray-900 dark:text-white truncate">{review.listing.title}</h4>
                         <motion.div animate={{ rotate: isDetailsExpanded ? 180 : 0 }}>
                            <ChevronDown size={16} className="text-gray-400" />
                         </motion.div>
                      </div>
                      <div className="flex items-center gap-1.5">
                         <Star size={12} className="text-amber-400 fill-amber-400" />
                         <span className="text-xs font-black text-gray-900 dark:text-white">{review.rating.toFixed(1)}</span>
                         <span className="text-[10px] font-bold text-gray-400 ml-2 uppercase tracking-widest">Property Info</span>
                      </div>
                   </div>
                 </button>

                 <AnimatePresence>
                   {isDetailsExpanded && (
                     <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50"
                     >
                       <div className="p-4 grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Location</p>
                             <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                                <MapPin size={12} className="text-primary" /> {review.listing.region}
                             </div>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Stay Date</p>
                             <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                                <Calendar size={12} className="text-primary" /> {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                             </div>
                          </div>
                          <div className="col-span-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Status</p>
                             <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${review.response ? "bg-emerald-500" : "bg-amber-500"}`} />
                                <span className="text-xs font-bold text-gray-900 dark:text-white">{review.response ? "Landlord Replied" : "Awaiting Reply"}</span>
                             </div>
                          </div>
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:flex w-[340px] bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800/80 overflow-y-auto p-6 flex-col shrink-0">
              <div className="relative aspect-square w-full rounded-3xl overflow-hidden mb-5 shadow-sm border border-gray-100 dark:border-gray-800 group/gallery">
                 <SafeImage
                  src={featuredMedia[currentImgIdx]}
                  alt={review.listing.title}
                  priority={true}
                />
                
                {/* Navigation Arrows */}
                {featuredMedia.length > 1 && (
                  <>
                    <button 
                      onClick={handlePrevImg}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white opacity-0 group-hover/gallery:opacity-100 transition-all border border-white/20"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button 
                      onClick={handleNextImg}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white opacity-0 group-hover/gallery:opacity-100 transition-all border border-white/20"
                    >
                      <ChevronRight size={16} />
                    </button>
                    
                    {/* Counter Badge */}
                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl text-white text-[9px] font-black uppercase tracking-widest border border-white/10">
                      {currentImgIdx + 1} / {featuredMedia.length}
                    </div>
                  </>
                )}

                <div className="absolute top-3 left-3 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm border border-gray-100 dark:border-gray-800">
                  <Star size={13} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-black text-gray-900 dark:text-white leading-none">{review.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1 block">Property Name</span>
                  <h3 className="text-base font-black text-gray-900 dark:text-white leading-snug">
                    {review.listing.title}
                  </h3>
                </div>
                
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300">
                    <MapPin size={14} className="text-primary shrink-0" />
                    <span className="truncate">{review.listing.region}, {review.listing.country}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300">
                     <Calendar size={14} className="text-primary/80 shrink-0" />
                     <span>Reviewed {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                   <div className="bg-slate-50 dark:bg-gray-800/50 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Reply Status</p>
                      <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${review.response ? "bg-emerald-500" : "bg-amber-500"}`} />
                         <span className="text-xs font-bold text-gray-900 dark:text-white">{review.response ? "Landlord Replied" : "Awaiting Landlord Reply"}</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Main Content Body */}
            <div className="flex-1 md:overflow-y-auto p-6 sm:p-8 space-y-8 bg-slate-50/50 dark:bg-gray-950">
              {notification && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex gap-3 items-center"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-sm">
                    <MessageCircle size={18} />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-xs font-black text-primary uppercase tracking-wider mb-0.5">{notification.title}</h4>
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">{notification.description}</p>
                  </div>
                </motion.div>
              )}

              <div className="space-y-8">
                {/* Tenant Review Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 opacity-50">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Your Feedback</span>
                    <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Avatar 
                      src={review.user?.image} 
                      name={review.user?.name} 
                      className="w-11 h-11 rounded-2xl border-none shadow-sm shrink-0" 
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-gray-900 dark:text-white">{review.user?.name || "Tenant"}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="p-5 bg-white dark:bg-gray-900 rounded-3xl sm:rounded-tl-none border border-gray-100 dark:border-gray-800/80 text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed shadow-xs">
                        <p className="leading-relaxed font-medium">
                          "{rawComment || "No written feedback provided."}"
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Media Section */}
                {allMediaUrls.length > 0 && (
                  <section className="space-y-3 sm:ml-15">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[10px] font-black uppercase tracking-wider text-gray-400">Uploaded Photos & Videos</h5>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{allMediaUrls.length} File{allMediaUrls.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {allMediaUrls.map((url, idx) => {
                        const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');
                        return (
                          <motion.div
                            key={idx}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setSelectedMediaIdx(idx)}
                            className="aspect-square rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xs cursor-pointer relative group bg-black"
                          >
                            {!isVideo ? (
                              <SafeImage src={url} alt="Review attachment" />
                            ) : (
                              <div className="relative w-full h-full">
                                <video src={url} className="w-full h-full object-cover opacity-80" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white">
                                    <Play size={20} fill="white" />
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </motion.div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Response Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 opacity-50">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Landlord Reply</span>
                    <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                  </div>

                  {review.response ? (
                    <motion.div 
                      initial={{ scale: 0.98, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col sm:flex-row gap-4"
                    >
                      <Avatar 
                        src={review.listing.user?.image} 
                        name={review.listing.user?.name} 
                        className="w-11 h-11 rounded-2xl border-none shadow-sm ring-2 ring-primary/20 shrink-0" 
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-primary dark:text-primary-light">{review.listing.user?.name || "Landlord / Host"}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {new Date(review.respondedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="p-5 bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-3xl sm:rounded-tl-none shadow-xs text-sm font-medium text-gray-800 dark:text-gray-100 leading-relaxed">
                          <p className="leading-relaxed font-medium">
                            {rawResponse}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="p-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl flex items-center justify-center gap-4 bg-white/50 dark:bg-gray-900/50">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                         <Clock size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-gray-900 dark:text-white tracking-tight mb-0.5">Awaiting Landlord Reply</h4>
                        <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">The landlord has not replied to your review yet.</p>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:px-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end shrink-0 shadow-lg">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-3 text-xs font-black text-white bg-primary hover:bg-primary-dark rounded-2xl transition-all shadow-md shadow-primary/20 uppercase tracking-wider"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Media Fullscreen Preview Overlay */}
      <MediaPreviewOverlay 
        isOpen={selectedMediaIdx !== null}
        onClose={() => setSelectedMediaIdx(null)}
        images={allMediaUrls}
        currentIndex={selectedMediaIdx || 0}
        onNavigate={(idx) => setSelectedMediaIdx(idx)}
        title="Review Attachments"
      />
    </>
  );
};

export default ReviewDetailsModal;


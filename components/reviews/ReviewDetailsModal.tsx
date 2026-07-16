import React from "react";
import { createPortal } from "react-dom";
import Modal from "../modals/Modal";
import { X, Star, Calendar, MessageSquare, Info, Home, MapPin, Clock, Play, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationItem } from "@/context/NotificationContext";
import Avatar from "@/components/common/Avatar";
import SafeImage from "@/components/common/SafeImage";

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

const ReviewDetailsModal: React.FC<ReviewDetailsModalProps> = ({
  review,
  isOpen,
  onClose,
  onMarkAsRead,
  notification,
}) => {
  const [selectedMediaIdx, setSelectedMediaIdx] = React.useState<number | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = React.useState(false);
  const [currentImgIdx, setCurrentImgIdx] = React.useState(0);

  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  const allMedia = [
    ...(review.images || []).map(url => ({ url, type: 'image' as const })),
    ...(review.videos || []).map(url => ({ url, type: 'video' as const }))
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

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedMediaIdx === null) return;
    setSelectedMediaIdx((selectedMediaIdx + 1) % allMedia.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedMediaIdx === null) return;
    setSelectedMediaIdx((selectedMediaIdx - 1 + allMedia.length) % allMedia.length);
  };

  React.useEffect(() => {
    if (isOpen && notification) {
      if (onMarkAsRead) {
        onMarkAsRead();
      }
    }
  }, [isOpen, notification, onMarkAsRead]);

  if (!isOpen) return null;

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} width="xl" hasFixedFooter={true}>
      <div className="flex flex-col min-h-[85vh] max-h-[85vh] sm:min-h-0 sm:h-auto sm:max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900 rounded-[2rem]">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/10 shrink-0">
          <div className="flex items-center gap-3 ml-2 sm:ml-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Star size={18} className="fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider leading-none">
                Review Info
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden bg-gray-50/20 dark:bg-gray-900/20 custom-scrollbar">
          
          {/* Mobile-Only Expandable Card */}
          <div className="md:hidden p-4 bg-white dark:bg-gray-900 shrink-0">
            <div className="bg-gray-50/80 dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
               <button 
                onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                className="w-full p-3 flex items-center gap-4 text-left active:bg-gray-100 dark:active:bg-gray-700 transition-all"
               >
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white dark:border-gray-700 shadow-sm relative group/thumb">
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
                       <Star size={12} className="text-amber-500 fill-amber-500" />
                       <span className="text-xs font-black text-gray-900 dark:text-white">{review.rating.toFixed(1)}</span>
                       <span className="text-[10px] font-bold text-gray-400 ml-2 uppercase tracking-widest">Property Details</span>
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
                           <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Location</p>
                           <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-700 dark:text-gray-300">
                              <MapPin size={10} className="text-primary" /> {review.listing.region}
                           </div>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Stay Date</p>
                           <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-700 dark:text-gray-300">
                              <Calendar size={10} className="text-primary" /> {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                           </div>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                           <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Status</p>
                           <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${review.response ? "bg-emerald-500" : "bg-amber-500"}`} />
                              <span className="text-[10px] font-black uppercase text-gray-900 dark:text-white tracking-widest">{review.response ? "Resolved" : "Pending Approval"}</span>
                           </div>
                        </div>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </div>

          {/* Desktop Sidebar (Hidden on Mobile) */}
          <div className="hidden md:flex w-[360px] bg-gray-50/30 dark:bg-gray-950/10 border-r border-gray-100 dark:border-gray-800 overflow-y-auto p-8 flex-col shrink-0">
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden mb-5 shadow-lg border-2 border-white dark:border-gray-800 group/gallery">
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full text-white opacity-0 group-hover/gallery:opacity-100 transition-all border border-white/10"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button 
                    onClick={handleNextImg}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full text-white opacity-0 group-hover/gallery:opacity-100 transition-all border border-white/10"
                  >
                    <ChevronRight size={18} />
                  </button>
                  
                  {/* Counter Badge */}
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-white text-[9px] font-black uppercase tracking-widest border border-white/10">
                    {currentImgIdx + 1} / {featuredMedia.length}
                  </div>
                </>
              )}

              <div className="absolute top-3 left-3 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-2 py-1 rounded-xl flex items-center gap-1 shadow-sm border border-gray-100 dark:border-gray-700">
                <Star size={12} className="text-amber-500 fill-amber-500" />
                <span className="text-xs font-black text-gray-900 dark:text-white leading-none">{review.rating.toFixed(1)}</span>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block leading-none">Property</span>
                <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                  {review.listing.title}
                </h3>
              </div>
              
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-[11px] font-bold text-gray-500">
                  <MapPin size={12} className="text-primary/60" />
                  <div className="truncate">{review.listing.region}, {review.listing.country}</div>
                </div>
                <div className="flex items-center gap-2.5 text-[11px] font-bold text-gray-500">
                   <Calendar size={12} className="text-primary/60" />
                   <div>{new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                 <div className="bg-white dark:bg-gray-800 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Status</p>
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${review.response ? "bg-emerald-500" : "bg-amber-500"}`} />
                       <span className="text-[10px] font-black uppercase text-gray-900 dark:text-white tracking-widest">{review.response ? "Resolved" : "Pending"}</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Main Content - Review Timeline */}
          <div className="flex-1 md:overflow-y-auto p-6 sm:p-10 space-y-10 bg-white dark:bg-gray-900/50">
            {notification && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl flex gap-3 items-center"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
                  <span className="text-lg font-black">!</span>
                </div>
                <div className="flex flex-col">
                  <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none mb-1">{notification.title}</h4>
                  <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">{notification.description}</p>
                </div>
              </motion.div>
            )}

            <div className="space-y-10">
              {/* Review Section */}
              <section>
                <div className="flex items-center gap-2 mb-8 opacity-30">
                  <div className="h-px flex-1 bg-gray-400" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">Your Review</span>
                  <div className="h-px flex-1 bg-gray-400" />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-3 sm:block">
                    <Avatar 
                      src={review.user?.image} 
                      name={review.user?.name} 
                      className="w-12 h-12 rounded-xl border-none shadow-md" 
                    />
                    <div className="sm:hidden">
                       <span className="text-xs font-black text-gray-900 dark:text-white block">{review.user?.name || "Guest User"}</span>
                       <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                          {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                       </span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="text-xs font-black text-gray-900 dark:text-white">{review.user?.name || "Guest User"}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                        {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="relative p-7 bg-gray-50/80 dark:bg-gray-800/40 rounded-3xl sm:rounded-tl-none border border-gray-100 dark:border-gray-800/50 italic text-base font-medium text-gray-800 dark:text-gray-100 leading-relaxed shadow-sm">
                      <p className="relative z-10 leading-relaxed">
                        "{review.comment || "No written feedback provided."}"
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Media Section */}
              {allMedia.length > 0 && (
                <section className="sm:ml-16">
                  <div className="flex items-center justify-between mb-5">
                    <h5 className="text-[9px] font-black uppercase tracking-widest text-gray-400">Media Attachments</h5>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{allMedia.length} Items</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {allMedia.map((media, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedMediaIdx(idx)}
                        className="aspect-square rounded-[2rem] overflow-hidden border-2 border-white dark:border-gray-800 shadow-md cursor-zoom-in relative group bg-black"
                      >
                        {media.type === 'image' ? (
                          <SafeImage src={media.url} alt="Stay" />
                        ) : (
                          <div className="relative w-full h-full">
                            <video src={media.url} className="w-full h-full object-cover opacity-80" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white">
                                <Play size={20} fill="white" />
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Response Section */}
              <section>
                {review.response ? (
                  <motion.div 
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <div className="flex items-center gap-3 sm:block">
                      <Avatar 
                        src={review.listing.user?.image} 
                        name={review.listing.user?.name} 
                        className="w-12 h-12 rounded-xl border-none shadow-md ring-2 ring-emerald-500/20" 
                      />
                      <div className="sm:hidden">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">{review.listing.user?.name || "Property Owner"}</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase">
                          {new Date(review.respondedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                       <div className="hidden sm:flex items-center gap-2">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{review.listing.user?.name || "Property Owner"}</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase">
                          {new Date(review.respondedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="p-7 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 rounded-3xl sm:rounded-tl-none shadow-sm relative overflow-hidden">
                        <p className="text-sm sm:text-base font-medium leading-relaxed text-gray-800 dark:text-gray-100 relative z-10">
                          {review.response}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="sm:ml-16 p-8 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[2.5rem] flex items-center justify-center gap-5">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                       <Clock size={24} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest leading-none mb-1">Awaiting Reply</h4>
                      <p className="text-[10px] sm:text-[11px] font-bold text-gray-400">Under review by property owner.</p>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-12 py-4 text-[10px] sm:text-xs font-black text-white bg-gray-900 dark:bg-gray-800 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gray-900/10 uppercase tracking-widest"
          >
            Close
          </button>
        </div>
      </div>

    </Modal>
    
    {/* Media Fullscreen Preview */}
    {mounted && createPortal(
      <AnimatePresence>
        {selectedMediaIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black backdrop-blur-2xl"
            onClick={() => setSelectedMediaIdx(null)}
          >
            <motion.button
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              className="absolute top-8 right-8 text-white/70 hover:text-white transition-colors z-[11000] bg-white/10 p-2 rounded-full"
              onClick={() => setSelectedMediaIdx(null)}
            >
              <X size={32} strokeWidth={1.5} />
            </motion.button>

            {allMedia.length > 1 && (
              <>
                <button 
                  onClick={handlePrev}
                  className="absolute left-8 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[11000] backdrop-blur-md"
                >
                  <ChevronLeft size={32} />
                </button>
                <button 
                  onClick={handleNext}
                  className="absolute right-8 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[11000] backdrop-blur-md"
                >
                   <ChevronRight size={32} />
                </button>
              </>
            )}

            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="relative max-w-6xl w-full h-full flex items-center justify-center p-4 sm:p-12"
              onClick={(e) => e.stopPropagation()}
            >
              {allMedia[selectedMediaIdx].type === 'image' ? (
                <SafeImage
                  src={allMedia[selectedMediaIdx].url}
                  alt="Enlarged review photo"
                  priority={true}
                />
              ) : (
                 <video
                  src={allMedia[selectedMediaIdx].url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[90vh] rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  );
};

export default ReviewDetailsModal;

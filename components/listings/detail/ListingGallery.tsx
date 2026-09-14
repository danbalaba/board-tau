"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose } from "react-icons/md";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { FaFacebook, FaTwitter } from "react-icons/fa";
import { 
  LayoutGrid, Share, ChevronLeft, X, Copy, Mail, MessageCircle, Maximize2, 
  Building2, Bed, Utensils, ShowerHead, Sofa, Image as ImageIcon, Sparkles, CheckCircle2 
} from "lucide-react";
import HeartButton from "@/components/favorites/HeartButton";
import { useRouter } from "next/navigation";
import BackToTop from "@/components/common/BackToTop";
import MediaPreviewOverlay from "@/components/common/MediaPreviewOverlay";
import SafeImage from "@/components/common/SafeImage";

interface ListingImageData {
  url: string;
  caption?: string;
  order?: number;
  roomType?: string;
}

interface ListingGalleryProps {
  title: string;
  images: ListingImageData[];
  listingId: string;
  hasFavorited?: boolean;
}

interface CategorizedImages {
  [key: string]: ListingImageData[];
}

const ROOM_TYPES = ["Exterior", "Bedroom", "Kitchen", "Bathroom", "Common Area", "Other"];

const CATEGORY_ICONS: Record<string, any> = {
  Exterior: Building2,
  Bedroom: Bed,
  Kitchen: Utensils,
  Bathroom: ShowerHead,
  "Common Area": Sofa,
  Other: ImageIcon,
};

const SHARE_BUTTONS: { label: string; icon: React.ElementType; action: string }[] = [
  { label: "Copy Link", icon: Copy, action: "copy" },
  { label: "Email", icon: Mail, action: "email" },
  { label: "Messages", icon: MessageCircle, action: "messages" },
  { label: "WhatsApp", icon: MessageCircle, action: "whatsapp" },
  { label: "Facebook", icon: FaFacebook, action: "facebook" },
  { label: "Twitter / X", icon: FaTwitter, action: "twitter" },
];

const ListingGallery: React.FC<ListingGalleryProps> = ({
  title,
  images,
  listingId,
  hasFavorited,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<string>("All");
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Preview State
  const [previewData, setPreviewData] = useState<{ isOpen: boolean; index: number; images: string[]; title: string }>({
    isOpen: false,
    index: 0,
    images: [],
    title: ''
  });

  const handleOpenPreview = (imgs: string[], idx: number, categoryTitle: string) => {
    setPreviewData({
      isOpen: true,
      index: idx,
      images: imgs,
      title: categoryTitle
    });
  };

  useEffect(() => {
    if (showShareModal) {
      setShareLoading(true);
      const t = setTimeout(() => setShareLoading(false), 1200);
      return () => clearTimeout(t);
    }
  }, [showShareModal]);

  useEffect(() => {
    if (showShareModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showShareModal]);

  const handleShareAction = async (action: string) => {
    const pageUrl = window.location.href;
    switch (action) {
      case "copy":
        await navigator.clipboard.writeText(pageUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
      case "email":
        window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(pageUrl)}`);
        break;
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(`${title} — ${pageUrl}`)}`);
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`);
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(pageUrl)}`);
        break;
      case "messages":
        window.open(`sms:?body=${encodeURIComponent(`${title} — ${pageUrl}`)}`);
        break;
    }
  };

  const cleanupRef = useRef<(() => void) | null>(null);
  const scrollLockRef = React.useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const preventScroll = (e: Event) => e.preventDefault();
      node.addEventListener("wheel", preventScroll, { passive: false });
      node.addEventListener("touchmove", preventScroll, { passive: false });
      cleanupRef.current = () => {
        node.removeEventListener("wheel", preventScroll);
        node.removeEventListener("touchmove", preventScroll);
      };
    } else if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (thumbnailScrollRef.current) {
      const thumbnail = thumbnailScrollRef.current.querySelector(
        `[data-index="${currentIndex}"]`
      ) as HTMLElement;
      if (thumbnail) {
        thumbnail.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [currentIndex]);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal]);

  const sortedImages = [...images].sort((a, b) => (a.order || 0) - (b.order || 0));

  const categorizedImages = useMemo(() => {
    const categories: CategorizedImages = {};
    ROOM_TYPES.forEach((rt) => { categories[rt] = []; });
    categories["All"] = sortedImages;

    const uncategorized: ListingImageData[] = [];

    sortedImages.forEach((img) => {
      const type = (img.roomType || "").toLowerCase().trim();
      const caption = (img.caption || "").toLowerCase().trim();
      const combined = `${type} ${caption}`;

      if (type === "exterior" || combined.includes("exterior") || combined.includes("facade") || combined.includes("building") || combined.includes("outside") || combined.includes("front") || combined.includes("cover")) {
        categories["Exterior"].push(img);
      } else if (type === "bedroom" || type === "unit" || type === "room" || type === "solo" || combined.includes("bedroom") || combined.includes("bed") || combined.includes("unit") || combined.includes("room")) {
        categories["Bedroom"].push(img);
      } else if (type === "kitchen" || combined.includes("kitchen") || combined.includes("cooking") || combined.includes("sink")) {
        categories["Kitchen"].push(img);
      } else if (type === "bathroom" || type === "cr" || combined.includes("bathroom") || combined.includes("cr") || combined.includes("toilet") || combined.includes("shower")) {
        categories["Bathroom"].push(img);
      } else if (type === "common area" || type === "living room" || combined.includes("common area") || combined.includes("living room") || combined.includes("lobby") || combined.includes("lounge") || combined.includes("hallway")) {
        categories["Common Area"].push(img);
      } else if (type === "other" || combined.includes("other")) {
        categories["Other"].push(img);
      } else {
        uncategorized.push(img);
      }
    });

    if (uncategorized.length > 0) {
      if (categories["Exterior"].length === 0) {
        categories["Exterior"].push(uncategorized[0]);
        if (uncategorized.length > 1) {
          categories["Other"].push(...uncategorized.slice(1));
        }
      } else {
        categories["Other"].push(...uncategorized);
      }
    }

    return categories;
  }, [sortedImages]);

  const currentRoomImages = categorizedImages[selectedRoom] || sortedImages;

  if (!sortedImages || sortedImages.length === 0) {
    return <div className="w-full h-96 bg-gray-200 dark:bg-gray-800" />;
  }

  return (
    <>
      <MediaPreviewOverlay
        isOpen={previewData.isOpen}
        onClose={() => setPreviewData(prev => ({...prev, isOpen: false}))}
        images={previewData.images}
        currentIndex={previewData.index}
        onNavigate={(newIdx) => setPreviewData(prev => ({...prev, index: newIdx}))}
        title={previewData.title}
      />

      <div className="absolute top-4 left-4 right-4 z-40 md:hidden flex justify-between items-center pointer-events-none">

        <button
          onClick={() => router.back()}
          className="w-10 h-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full shadow-md border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center pointer-events-auto active:scale-95 transition-all outline-none"
        >
          <ChevronLeft size={20} className="text-gray-900 dark:text-gray-100 pr-0.5" />
        </button>

        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={async () => {
              if (navigator.share) {
                try {
                  await navigator.share({
                    title: title,
                    url: window.location.href
                  });
                } catch (err) {
                  if ((err as Error).name !== 'AbortError') {
                    setShowShareModal(true);
                  }
                }
              } else {
                setShowShareModal(true);
              }
            }}
            className="w-10 h-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full shadow-md border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center active:scale-95 transition-all outline-none"
          >
            <Share size={18} strokeWidth={2.5} className="text-gray-900 dark:text-gray-100" />
          </button>

          <div className="w-10 h-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full shadow-md border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center active:scale-95 transition-all relative">
            <HeartButton listingId={listingId} hasFavorited={hasFavorited || false} />
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-[1120px] mx-auto md:px-8 lg:px-12 md:pt-6 pb-2 transition-colors duration-300">
        <div className="flex gap-2 h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] md:rounded-[1.25rem] overflow-hidden relative group">

          <div
            className="w-full relative overflow-hidden md:w-1/2 h-full cursor-pointer"
            onClick={() => {
              setShowModal(true);
              setSelectedRoom("All");
              setCurrentIndex(0);
            }}
          >
             <div className="absolute inset-0 bg-transparent group-hover:bg-black/20 transition-colors z-10 duration-300 hover:!bg-transparent" />
             <SafeImage
              src={sortedImages[0].url}
              alt={sortedImages[0].caption ? `${sortedImages[0].caption} - ${title} near TAU Camiling Tarlac` : `${title} - Boarding House near TAU Camiling Tarlac`}
              priority={true}
             />
          </div>

          <div className="hidden md:grid md:w-1/2 h-full grid-cols-2 grid-rows-2 gap-2">
            {sortedImages.slice(1, 5).map((image, idx) => {
              return (
                <div
                  key={idx}
                  className="relative overflow-hidden w-full h-full cursor-pointer"
                  onClick={() => {
                     setShowModal(true);
                     setSelectedRoom("All");
                     setCurrentIndex(idx + 1);
                  }}
                >
                  <div className="absolute inset-0 bg-transparent group-hover:bg-black/20 transition-colors z-10 duration-300 hover:!bg-transparent" />
                  <SafeImage
                    src={image.url}
                    alt={image.caption ? `${image.caption} - ${title} near TAU Camiling Tarlac` : `${title} - Boarding House near TAU Camiling Tarlac (Photo ${idx + 2})`}
                  />
                </div>
              );
            })}
          </div>

          {/* Show All Photos Button */}
          <button
            onClick={() => {
              setShowModal(true);
              setSelectedRoom("All");
              setCurrentIndex(0);
            }}
            className="absolute bottom-6 right-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-2 font-bold text-sm border border-gray-900 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 z-20 active:scale-95"
          >
            <LayoutGrid size={16} className="text-gray-900 dark:text-gray-100" />
            Show all photos
          </button>
        </div>
      </div>

      {/* Airbnb Style Fullscreen Photo Tour Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ ease: "easeInOut", duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 overflow-y-auto flex flex-col hide-scrollbar overscroll-none"
            id="scroll-container"
          >
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-30 flex items-center justify-between p-4 md:px-8 border-b border-slate-200/80 dark:border-slate-800 shadow-sm">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm cursor-pointer"
              >
                <BsChevronLeft size={16} strokeWidth={1} />
                <span>Back to listing</span>
              </button>
              
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <p className="text-xs md:text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Photo Tour • {sortedImages.length} Photos
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    if (typeof navigator !== 'undefined' && (navigator as any).share) {
                      try {
                        await (navigator as any).share({
                          title: title,
                          url: window.location.href
                        });
                      } catch (err) {
                        if ((err as Error).name !== 'AbortError') {
                          setShowShareModal(true);
                        }
                      }
                    } else {
                      setShowShareModal(true);
                    }
                  }}
                  className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition text-slate-700 dark:text-slate-200 cursor-pointer"
                  title="Share"
                >
                  <Share size={16} />
                </button>
              </div>
            </div>

            <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-8 flex flex-col items-center pb-24">
               
               {/* Hero Title & Subtitle */}
               <div className="w-full mb-8 text-left space-y-1">
                 <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                   Photo Tour
                 </h1>
                 <p className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400">
                   Explore all photos of {title} organized by property section
                 </p>
               </div>

               {/* Categories Navigator Bar */}
               <div className="w-full mb-10 overflow-x-auto pb-3 pt-1 hide-scrollbar flex items-center gap-3 border-b border-slate-200/60 dark:border-slate-800">
                  {ROOM_TYPES.map(room => {
                     const roomImages = categorizedImages[room];
                     if (!roomImages || roomImages.length === 0) return null;
                     const IconComp = CATEGORY_ICONS[room] || ImageIcon;
                     
                     return (
                        <button
                           key={room}
                           type="button"
                           onClick={() => {
                              const el = document.getElementById(`section-${room}`);
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                           }}
                           className="flex items-center gap-3 p-2 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:border-primary/50 dark:hover:border-primary/50 transition-all shrink-0 group cursor-pointer shadow-sm hover:scale-[1.02]"
                        >
                           <div className="w-11 h-11 rounded-xl overflow-hidden relative shrink-0 bg-slate-200 dark:bg-slate-700">
                             <SafeImage 
                               src={roomImages[0].url} 
                               alt={room} 
                               className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                             />
                           </div>
                           <div className="flex flex-col items-start text-left">
                             <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                               <IconComp size={14} className="text-primary shrink-0" />
                               {room}
                             </span>
                             <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                               {roomImages.length} {roomImages.length === 1 ? 'photo' : 'photos'}
                             </span>
                           </div>
                        </button>
                     );
                  })}
               </div>

               {/* Category Image Sections */}
               <div className="w-full flex flex-col gap-14">
                  {ROOM_TYPES.map((room) => {
                     const roomImages = categorizedImages[room];
                     if (!roomImages || roomImages.length === 0) return null;
                     const IconComp = CATEGORY_ICONS[room] || ImageIcon;

                     return (
                        <div key={room} id={`section-${room}`} className="flex flex-col gap-6 scroll-mt-28">
                           {/* Category Section Title */}
                           <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
                             <div className="flex items-center gap-3">
                               <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                                 <IconComp size={20} />
                               </div>
                               <div>
                                 <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{room}</h2>
                                 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                   {room === 'Exterior' ? 'Building facade & property entrance' :
                                    room === 'Bedroom' ? 'Rooms & sleeping quarters' :
                                    room === 'Kitchen' ? 'Kitchen & dining area' :
                                    room === 'Bathroom' ? 'Bathroom & comfort room features' :
                                    room === 'Common Area' ? 'Shared lobby & lounge space' : 'Additional property photos'}
                                 </p>
                               </div>
                             </div>

                             <span className="px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                               {roomImages.length} {roomImages.length === 1 ? 'photo' : 'photos'}
                             </span>
                           </div>

                           {/* Responsive Grid Pattern */}
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                               {roomImages.map((img, idx) => {
                                  const isCover = idx === 0 && room === 'Exterior';
                                  return (
                                     <div 
                                        key={idx} 
                                        className={`group relative rounded-2xl md:rounded-3xl overflow-hidden border-2 border-slate-200/80 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-800 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                                          roomImages.length >= 3 && idx === 0 ? 'sm:col-span-2 lg:col-span-2 aspect-[16/10]' : 'col-span-1 aspect-[4/3]'
                                        }`}
                                        onClick={() => handleOpenPreview(roomImages.map(i => i.url), idx, `${room} Photos`)}
                                     >
                                         <SafeImage
                                            src={img.url}
                                            alt={img.caption ? `${img.caption} - ${title} (${room}) near TAU Camiling Tarlac` : `${title} ${room} - Boarding House near TAU Camiling Tarlac`}
                                            containerClassName="w-full h-full"
                                           className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] flex items-center justify-center">
                                           <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xl border border-white/20 scale-75 group-hover:scale-100 transition-transform duration-300">
                                              <Maximize2 size={22} />
                                           </div>
                                        </div>

                                        {/* Caption / Badge Overlay */}
                                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                                          {isCover ? (
                                            <span className="px-3 py-1 rounded-full bg-primary/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider shadow-lg border border-white/20">
                                              Building Cover
                                            </span>
                                          ) : img.caption ? (
                                            <span className="px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-bold truncate max-w-[80%] shadow-lg border border-white/10">
                                              {img.caption}
                                            </span>
                                          ) : <div />}
                                        </div>
                                     </div>
                                  );
                               })}
                           </div>
                        </div>
                     );
                  })}
               </div>
            </div>
            <BackToTop containerId="scroll-container" bottomClass="bottom-8 right-6 md:bottom-10 md:right-10" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            ref={scrollLockRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-gray-900 rounded-[2rem] w-full max-w-md p-8 shadow-2xl border border-gray-100 dark:border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Share this place</h2>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X size={18} className="text-gray-700 dark:text-gray-300" />
                </button>
              </div>

              {/* Share Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {shareLoading
                  ? // Skeleton loading animation
                    Array.from({ length: 6 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.08 }}
                        className="h-[60px] rounded-2xl bg-gray-100 dark:bg-gray-800"
                      />
                    ))
                  : // Actual share buttons
                    SHARE_BUTTONS.map((btn, i) => {
                      const Icon = btn.icon;
                      const isCopied = btn.action === "copy" && copied;
                      return (
                        <motion.button
                          key={btn.action}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleShareAction(btn.action)}
                          className="flex items-center gap-3 px-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-sm transition-all shadow-sm hover:shadow-md"
                        >
                          <Icon size={20} className={isCopied ? "text-emerald-500" : "text-gray-700 dark:text-gray-300"} />
                          <span>{isCopied ? "Copied!" : btn.label}</span>
                        </motion.button>
                      );
                    })
                }
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ListingGallery;

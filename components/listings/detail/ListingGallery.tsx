"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose } from "react-icons/md";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { FaFacebook, FaTwitter } from "react-icons/fa";
import { LayoutGrid, Share, ChevronLeft, X, Copy, Mail, MessageCircle, Maximize2 } from "lucide-react";
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

const ROOM_TYPES = ["Bedroom", "Kitchen", "Bathroom", "Exterior", "Common Area"];

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
        window.open(`sms:?&body=${encodeURIComponent(`${title} — ${pageUrl}`)}`);
        break;
    }
  };

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
    const categories: CategorizedImages = {
      All: sortedImages,
    };

    ROOM_TYPES.forEach((room) => {
      categories[room] = sortedImages.filter((img) => {
        const type = img.roomType?.toLowerCase();
        const search = room.toLowerCase();

        if (type === search) return true;
        if (search === 'common area' && type === 'living room') return true;
        if (search === 'living room' && type === 'common area') return true;

        return img.caption?.toLowerCase().includes(search);
      });
    });

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
            onClick={() => setShowShareModal(true)}
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
              alt={sortedImages[0].caption || title}
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
                    alt={image.caption || title}
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
            className="fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-y-auto flex flex-col hide-scrollbar overscroll-none"
            id="scroll-container"
          >
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md z-20 flex items-center justify-between p-4 md:px-6 border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors flex items-center justify-center text-gray-800 dark:text-gray-100"
              >
                <BsChevronLeft size={16} strokeWidth={1} />
              </button>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                {sortedImages.length} photos
              </p>
              <div className="w-9" />{/* spacer to keep title centered */}
            </div>

            <div className="max-w-4xl mx-auto w-full px-4 py-8 flex flex-col items-center pb-24">
               <h1 className="text-[32px] font-bold mb-10 text-gray-900 dark:text-gray-100 self-start w-full tracking-tight">Photo tour</h1>

               {/* Categories Navigator */}
               <div className="w-full mb-12 flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                  {ROOM_TYPES.map(room => {
                     const roomImages = categorizedImages[room];
                     if (!roomImages || roomImages.length === 0) return null;
                     return (
                        <div
                           key={room}
                           className="flex flex-col gap-2 min-w-[140px] max-w-[140px] cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                           onClick={() => {
                              const el = document.getElementById(`section-${room}`);
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                           }}
                        >
                           <SafeImage
                               src={roomImages[0].url}
                               alt={room}
                               containerClassName="w-full h-24 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
                               className="object-cover"
                           />
                           <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{room}</p>
                        </div>
                     )
                  })}
               </div>

               {/* Masonry-like Images Layout */}
               <div className="w-full flex flex-col gap-12">
                  {ROOM_TYPES.map((room) => {
                     const roomImages = categorizedImages[room];
                     if (!roomImages || roomImages.length === 0) return null;

                     return (
                        <div key={room} id={`section-${room}`} className="flex flex-col gap-6 scroll-mt-24">
                           <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{room}</h2>

                           {/* Responsive Masonry Layout Pattern */}
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                              {roomImages.map((img, idx) => {
                                 // Every 3rd image spans 2 columns on desktop to mimic the layout variety
                                 const isFullWidth = idx % 3 === 0;
                                 return (
                                    <div 
                                       key={idx} 
                                       className={isFullWidth ? "col-span-1 md:col-span-2 group relative cursor-pointer" : "col-span-1 group relative cursor-pointer"}
                                       onClick={() => handleOpenPreview(roomImages.map(i => i.url), idx, room)}
                                    >
                                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10 duration-300 flex items-center justify-center backdrop-blur-[1px] opacity-0 group-hover:opacity-100">
                                          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xl border border-white/20 scale-50 group-hover:scale-100 transition-transform duration-500">
                                             <Maximize2 size={24} />
                                          </div>
                                       </div>
                                       <SafeImage
                                          src={img.url}
                                          alt={img.caption || room}
                                          containerClassName="w-full aspect-[4/3] md:aspect-video rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800"
                                          className="object-cover"
                                       />
                                    </div>
                                 )
                              })}
                           </div>
                        </div>
                     )
                  })}

                  {/* Fallback if no images got categorized */}
                  {ROOM_TYPES.every(rt => !categorizedImages[rt] || categorizedImages[rt].length === 0) && (
                     <div className="flex flex-col gap-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                              {sortedImages.map((img, idx) => {
                                 const isFullWidth = idx % 3 === 0;
                                 return (
                                    <div 
                                       key={idx} 
                                       className={isFullWidth ? "col-span-1 md:col-span-2 group relative cursor-pointer" : "col-span-1 group relative cursor-pointer"}
                                       onClick={() => handleOpenPreview(sortedImages.map(i => i.url), idx, "Property Photos")}
                                    >
                                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10 duration-300 flex items-center justify-center backdrop-blur-[1px] opacity-0 group-hover:opacity-100">
                                          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xl border border-white/20 scale-50 group-hover:scale-100 transition-transform duration-500">
                                             <Maximize2 size={24} />
                                          </div>
                                       </div>
                                       <SafeImage
                                          src={img.url}
                                          alt={img.caption || "Property Photo"}
                                          containerClassName="w-full aspect-[4/3] md:aspect-video rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800"
                                          className="object-cover"
                                       />
                                    </div>
                                 )
                              })}
                           </div>
                     </div>
                  )}

                </div>
              </div>
              <BackToTop containerId="scroll-container" bottomClass="bottom-10" />
            </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
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

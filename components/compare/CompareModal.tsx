"use client";
// Force cache invalidation

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { X, CheckCircle2, MapPin, DoorOpen, Loader2, Star, ShieldCheck, FileText, Sparkles, User as UserIcon, BadgeCheck, AlertTriangle, Wifi, Car, Waves, Dumbbell, Wind, WashingMachine, Utensils, Refrigerator, Microwave, Droplets, Zap, Clock, Users, Flame, PawPrint, Camera, BookOpen, Square, Blinds, Bot, Send, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getComparedListings } from "@/app/actions/compare";
import { useCompareStore } from "@/hooks/use-compare-store";
import SafeImage from "../common/SafeImage";
import Link from "next/link";
import { formatPrice, calculateAverageRating } from "@/utils/helper";
import Avatar from "@/components/common/Avatar";
import { categories } from "@/utils/constants";
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
// @ts-ignore
import 'swiper/css';
// @ts-ignore
import 'swiper/css/navigation';
// @ts-ignore
import 'swiper/css/pagination';

const TypingIndicator = () => (
  <div className="flex gap-1.5 items-center px-1">
    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0 }} className="w-1.5 h-1.5 bg-primary/70 rounded-full" />
    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.15 }} className="w-1.5 h-1.5 bg-primary/70 rounded-full" />
    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.3 }} className="w-1.5 h-1.5 bg-primary/70 rounded-full" />
  </div>
);

const parseCustomItem = (item: string) => {
  if (!item || typeof item !== 'string') return { label: "", icon: null };
  if (item.includes("|")) {
    const [label, icon] = item.split("|");
    return { label: label.trim(), icon: icon.trim() };
  }
  return { label: item, icon: null };
};

const CustomIcon = ({ name, fallback: Fallback, className, size = 24 }: { name: string | null, fallback: any, className?: string, size?: number }) => {
  const DynamicIcon = name ? (LucideIcons as any)[name] : null;
  const IconComponent = DynamicIcon || Fallback;
  return <IconComponent className={className} size={size} />;
};

const getAmenityIcon = (amenityName: string) => {
  const { label, icon } = parseCustomItem(amenityName);
  if (icon) return <CustomIcon name={icon} fallback={CheckCircle2} size={16} className="text-primary/70 shrink-0" />;
  const name = label.toLowerCase();
  if (name.includes('wifi')) return <Wifi size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('parking')) return <Car size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('pool')) return <Waves size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('gym')) return <Dumbbell size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('air conditioning')) return <Wind size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('laundry')) return <WashingMachine size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('kitchen') || name.includes('cooking')) return <Utensils size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('refrigerator')) return <Refrigerator size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('microwave')) return <Microwave size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('water')) return <Droplets size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('electricity')) return <Zap size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('curfew')) return <Clock size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('visitors')) return <Users size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('smoke') || name.includes('fire')) return <Flame size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('cctv') || name.includes('security')) return <Camera size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('pets')) return <PawPrint size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('desk') || name.includes('study friendly')) return <BookOpen size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('balcony')) return <Square size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('closet')) return <Blinds size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('quiet')) return <Wind size={16} className="text-primary/70 shrink-0" />;
  return <CheckCircle2 size={16} className="text-primary/70 shrink-0" />;
};

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingIds: string[];
}

export default function CompareModal({ isOpen, onClose, listingIds }: CompareModalProps) {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { clearListings } = useCompareStore();

  // For mobile tabs
  const [activeTab, setActiveTab] = useState<"DATA" | "AI">("DATA");

  // Chat State
  const [messages, setMessages] = useState<{ role: "user" | "ai", content: string }[]>([
    { role: "ai", content: "Hi! I'm your BoardTAU AI Advisor. I've analyzed these listings. What would you like to know?" }
  ]);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    "Which property offers the best value for money?",
    "Compare the security and safety features.",
    "Which property has the strictest rules?"
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const chatScrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isChatLoading]);

  const handleChatSubmit = async (e?: React.FormEvent, directPrompt?: string) => {
    if (e) e.preventDefault();
    const userMsg = directPrompt || chatInput.trim();
    if (!userMsg || isChatLoading) return;

    setChatInput("");
    setSuggestedPrompts([]); // Clear chips while loading
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/ai/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listings, userMessage: userMsg })
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessages(prev => [...prev, { role: "ai", content: data.reply }]);
        if (data.suggestedPrompts && Array.isArray(data.suggestedPrompts)) {
           setSuggestedPrompts(data.suggestedPrompts);
           setShowPrompts(true);
        }
      } else {
        setMessages(prev => [...prev, { role: "ai", content: "Sorry, I encountered an error while analyzing the listings." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "ai", content: "Sorry, something went wrong on my end." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && listingIds.length > 0) {
      setIsLoading(true);
      getComparedListings(listingIds).then((data) => {
        setListings(data);
        setIsLoading(false);
      });
    }
  }, [isOpen, listingIds]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 md:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="bg-white dark:bg-slate-900 w-full max-w-[1300px] h-[95vh] md:h-[85vh] rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:px-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Compare Options
            </h2>
            <button
              onClick={onClose}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition text-slate-500"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mobile Tabs */}
          <div className="flex md:hidden border-b border-slate-200 dark:border-slate-800">
            <button 
              className={`flex-1 py-3 text-sm font-bold ${activeTab === "DATA" ? "text-primary border-b-2 border-primary" : "text-slate-500"}`}
              onClick={() => setActiveTab("DATA")}
            >
              Data Sheet
            </button>
            <button 
              className={`flex-1 py-3 text-sm font-bold ${activeTab === "AI" ? "text-primary border-b-2 border-primary" : "text-slate-500"}`}
              onClick={() => setActiveTab("AI")}
            >
              AI Advisor
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Left Side: Data Sheet */}
            <div className={`flex-1 overflow-x-auto overflow-y-auto snap-x snap-mandatory custom-scrollbar ${activeTab === "DATA" ? "block" : "hidden"} md:block p-4 md:p-6 bg-[#F8FAF9] dark:bg-[#0f1419]`}>
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-primary">
                  <Loader2 className="animate-spin w-10 h-10 mb-4" />
                  <span className="font-bold">Fetching listing data...</span>
                </div>
              ) : (
                <motion.div 
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
                  }}
                  className="flex gap-4 md:gap-6 min-w-max md:min-w-0 h-full"
                >
                  {listings.map((listing) => {
                    const price = listing.price;
                    const amenities = listing.amenities_list || [];
                    const amenitiesObj = listing.amenities || {};
                    
                    const safetyKeywords = ['cctv', 'security', 'fire safety', 'transport', 'flexible lease', 'flood', 'backup power'];
                    const ruleKeywords = ['female', 'male', 'visitor', 'pet', 'smoking', 'curfew'];

                    const baseAmenities = Array.isArray(amenities) ? amenities : [];
                    const legacyAmenities: string[] = [];
                    if (amenitiesObj) {
                      if (amenitiesObj.wifi) legacyAmenities.push("WiFi");
                      if (amenitiesObj.parking) legacyAmenities.push("Parking");
                      if (amenitiesObj.pool) legacyAmenities.push("Pool");
                      if (amenitiesObj.gym) legacyAmenities.push("Gym");
                      if (amenitiesObj.airConditioning) legacyAmenities.push("Air conditioning");
                      if (amenitiesObj.laundry) legacyAmenities.push("Laundry area");
                    }
                    const combined = [...baseAmenities, ...legacyAmenities];
                    const standardAmenities = combined.filter(a => {
                      const lower = a.toLowerCase();
                      return !safetyKeywords.some(kw => lower.includes(kw)) && !ruleKeywords.some(kw => lower.includes(kw));
                    });

                    const features = listing.features || {};
                    const rulesObject = listing.rules || {};
                    
                    const reviews = listing.reviews || [];
                    const avgRatingRaw = calculateAverageRating(reviews);
                    const avgRating = avgRatingRaw ? Number(avgRatingRaw).toFixed(1) : null;
                    const host = listing.user;
                    
                    const categoryData = Array.isArray(listing.category) 
                      ? listing.category 
                      : (typeof listing.category === 'string' ? [listing.category] : []);
                    const displayCategories = categoryData.slice(0, 2);

                    const getImageUrl = (img: any) => {
                      if (!img) return null;
                      if (typeof img === 'string') return img;
                      if (typeof img.url === 'string') return img.url;
                      if (typeof img.imageUrl === 'string') return img.imageUrl;
                      if (typeof img.getUrl === 'function') return img.getUrl();
                      if (typeof img.imageSrc === 'string') return img.imageSrc;
                      if (typeof img.src === 'string') return img.src;
                      return null;
                    };

                    let images: string[] = [];
                    if (listing.imageSrc) images.push(getImageUrl(listing.imageSrc));
                    
                    const galleryImages = listing.images || [];
                    if (galleryImages.length > 0) {
                      const gUrls = galleryImages.map(getImageUrl).filter(Boolean);
                      images = [...images, ...gUrls];
                    }
                    
                    const allImages = Array.from(new Set(images));
                    
                    return (
                      <motion.div 
                        variants={{
                          hidden: { opacity: 0, y: 50, scale: 0.95 },
                          show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 350, damping: 25 } }
                        }}
                        key={listing.id} 
                        className="snap-center min-w-[85vw] md:min-w-[320px] max-w-[380px] md:flex-1 shrink-0 flex flex-col border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[24px] shadow-sm overflow-hidden group"
                      >
                        
                        {/* Header Image Area */}
                        <div className="h-[220px] relative bg-slate-100 dark:bg-slate-800 shrink-0 group/swiper">
                           {allImages.length > 1 ? (
                             <Swiper
                               modules={[Navigation, Pagination]}
                               navigation={{
                                 prevEl: `.swiper-prev-compare-${listing.id}`,
                                 nextEl: `.swiper-next-compare-${listing.id}`,
                               }}
                               pagination={{ clickable: true }}
                               className="w-full h-full pb-0"
                             >
                               {allImages.map((imgUrl, idx) => (
                                 <SwiperSlide key={idx} className="h-full w-full">
                                   <SafeImage src={imgUrl} alt={`${listing.title} - Image ${idx + 1}`} />
                                 </SwiperSlide>
                               ))}
                               
                               {/* Custom Nav Buttons */}
                               <div 
                                 className={`swiper-prev-compare-${listing.id} absolute left-2 top-1/2 -translate-y-1/2 z-[60] w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md cursor-pointer opacity-0 group-hover/swiper:opacity-100 transition-opacity hover:scale-110`}
                               >
                                 <ChevronLeft size={18} className="text-slate-800 -ml-0.5" />
                               </div>
                               <div 
                                 className={`swiper-next-compare-${listing.id} absolute right-2 top-1/2 -translate-y-1/2 z-[60] w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md cursor-pointer opacity-0 group-hover/swiper:opacity-100 transition-opacity hover:scale-110`}
                               >
                                 <ChevronRight size={18} className="text-slate-800 -mr-0.5" />
                               </div>
                             </Swiper>
                           ) : (
                             <SafeImage src={allImages[0] || listing.imageSrc} alt={listing.title} />
                           )}
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-10"></div>
                           
                           {/* Price Badge */}
                           <div className="absolute top-4 right-4 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-2xl flex items-center gap-1 font-black text-sm">
                             <span className="text-primary">₱</span>
                             <span>{formatPrice(price)}</span>
                             <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">/mo</span>
                           </div>

                           <div className="absolute top-4 left-4 z-20 flex gap-2 flex-wrap max-w-[60%]">
                             {displayCategories.map((cat: string, idx: number) => (
                               <div key={idx} className="bg-white/90 backdrop-blur-md text-primary px-3 py-1.5 rounded-full font-bold shadow-lg flex items-center gap-1.5 text-xs border border-white/20">
                                 {cat}
                               </div>
                             ))}
                           </div>

                           {/* Bottom Image Info */}
                           <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
                             <h3 className="font-black text-white text-xl leading-tight line-clamp-2 drop-shadow-md">{listing.title}</h3>
                             <div className="flex items-center gap-1 text-sm text-slate-200 mt-1.5 font-medium">
                               <MapPin size={14} className="shrink-0 text-primary" /> <span className="truncate">{listing.region}</span>
                             </div>
                           </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 custom-scrollbar">
                          
                          {/* Rating & Host Info */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar src={host?.image} />
                              <div className="flex flex-col min-w-0">
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Hosted by</span>
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{host?.name || 'BoardTAU Host'}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end shrink-0">
                              <div className="flex items-center gap-1 font-black text-slate-800 dark:text-white text-lg">
                                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                <span>{avgRating ? avgRating : 'New'}</span>
                              </div>
                              {reviews.length > 0 ? (
                                <span className="text-xs text-slate-500 underline">{reviews.length} reviews</span>
                              ) : (
                                <span className="text-xs text-slate-500">No reviews</span>
                              )}
                            </div>
                          </div>

                          <div className="h-px w-full bg-slate-100 dark:bg-slate-800"></div>

                          {/* Quick Stats */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex flex-col gap-1">
                               <DoorOpen size={18} className="text-primary" />
                               <span className="text-xs text-slate-500 font-medium">Available Rooms</span>
                               <span className="font-black text-primary text-lg">{listing.rooms?.length || 0}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl p-3 flex flex-col gap-1">
                               <BadgeCheck size={18} className="text-blue-500" />
                               <span className="text-xs text-slate-500 font-medium">Status</span>
                               <span className="font-bold text-slate-700 dark:text-slate-300">Verified</span>
                            </div>
                          </div>

                          {/* What this place offers */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                            <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                              <Sparkles size={16} className="text-primary" /> What this place offers
                            </h4>
                            <div className="flex flex-col gap-3.5">
                              {standardAmenities.slice(0, 5).map((amenity: string, i: number) => {
                                const { label } = parseCustomItem(amenity);
                                return (
                                  <div key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    {getAmenityIcon(amenity)}
                                    <span className="line-clamp-1">{label}</span>
                                  </div>
                                );
                              })}
                              {standardAmenities.length > 5 && (
                                <span className="text-xs font-bold text-primary cursor-pointer hover:underline">+{standardAmenities.length - 5} more amenities</span>
                              )}
                              {standardAmenities.length === 0 && <span className="text-sm text-slate-400 italic">Not specified</span>}
                            </div>
                          </div>

                          {/* Safety & Reassurance */}
                          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                              <ShieldCheck size={16} className="text-primary" /> Safety & Reassurance
                            </h4>
                            <div className="flex flex-col gap-3.5">
                              {features?.cctv && (
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                  <Camera className="text-primary shrink-0" size={16} />
                                  <span className="line-clamp-1 font-bold">CCTV Monitoring</span>
                                </div>
                              )}
                              {features?.security24h && (
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                  <ShieldCheck className="text-primary shrink-0" size={16} />
                                  <span className="line-clamp-1 font-bold">On-site Security</span>
                                </div>
                              )}
                              {features?.fireSafety && (
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                  <Flame className="text-primary shrink-0" size={16} />
                                  <span className="line-clamp-1 font-bold">Fire Safety Ready</span>
                                </div>
                              )}
                              {features?.customFeatures?.map((f: string, i: number) => {
                                const { label, icon } = parseCustomItem(f);
                                return (
                                  <div key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <CustomIcon name={icon} fallback={CheckCircle2} className="text-primary shrink-0" size={16} />
                                    <span className="line-clamp-1 font-bold">{label}</span>
                                  </div>
                                );
                              })}
                              {(!features?.cctv && !features?.security24h && !features?.fireSafety && (!features?.customFeatures || features.customFeatures.length === 0)) && (
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                  <AlertTriangle size={16} className="text-amber-500/70 shrink-0" />
                                  <span>Standard security measures</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Policies & Rules */}
                          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                              <FileText size={16} className="text-purple-500" /> Policies & Rules
                            </h4>
                            <div className="grid grid-cols-1 gap-5">
                              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-primary"><Users size={16} /></div>
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</p>
                                  <p className="font-bold">{rulesObject?.femaleOnly ? "Strictly Female Only" : rulesObject?.maleOnly ? "Strictly Male Only" : "Co-living Allowed"}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-primary"><Clock size={16} /></div>
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Curfew</p>
                                  <p className="font-bold">{rulesObject?.noCurfew ? "No Curfew (24/7 Access)" : "Standard Curfew applies"}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-primary"><Users size={16} /></div>
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visitors</p>
                                  <p className="font-bold">{rulesObject?.visitorsAllowed ? "Visitors are welcome" : "No visitors allowed"}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-primary"><PawPrint size={16} /></div>
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pets</p>
                                  <p className="font-bold">{rulesObject?.petsAllowed ? "Pets are allowed" : "Strictly no pets"}</p>
                                </div>
                              </div>
                              {rulesObject?.customRules?.slice(0, 2).map((rule: string, i: number) => {
                                const { label, icon } = parseCustomItem(rule);
                                return (
                                  <div key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-primary">
                                      {icon ? <CustomIcon name={icon} fallback={CheckCircle2} size={16} /> : <div className="w-1.5 h-1.5 bg-primary rounded-full m-1" />}
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rule</p>
                                      <p className="font-bold line-clamp-1">{label}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        </div>

                        {/* Sticky Action Button */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                          <Link 
                            href={`/listings/${listing.id}`} 
                            onClick={() => {
                              onClose();
                              clearListings();
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-primary dark:bg-primary text-white py-3.5 rounded-xl font-bold text-sm hover:scale-[1.02] transition shadow-lg hover:bg-primary/90 no-underline"
                          >
                            View Details & Reserve
                          </Link>
                        </div>

                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>

            {/* Right Side: AI Chat */}
            <div className={`w-full md:w-[350px] lg:w-[400px] shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col ${activeTab === "AI" ? "block" : "hidden"} md:flex`}>
               <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                 <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                   <Sparkles size={18} className="text-primary" /> AI Advisor
                 </h3>
                 <p className="text-xs text-slate-500 mt-1">Ask me anything about these properties!</p>
               </div>
               
               <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
                 {messages.map((msg, idx) => (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     key={idx} 
                     className={`flex items-start gap-3 w-full ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                   >
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-sm mt-1 ${msg.role === "user" ? "bg-primary text-white" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"}`}>
                       {msg.role === "user" ? <UserIcon size={14} /> : <Image src="/logo.png" alt="AI" width={20} height={20} className="object-contain" />}
                     </div>
                     <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[85%] whitespace-pre-wrap ${
                       msg.role === "user" 
                         ? "bg-primary text-white rounded-tr-sm shadow-md" 
                         : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-sm shadow-sm leading-relaxed"
                     }`}>
                       {msg.role === "user" ? (
                          msg.content
                       ) : (
                          <ReactMarkdown 
                             className="prose prose-sm dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 max-w-none"
                             components={{
                               a: ({ node, ...props }) => {
                                 const isBooking = props.children?.toString().includes("BOOK:");
                                 const btnText = isBooking ? props.children?.toString().replace("BOOK:", "Proceed to ") : props.children;
                                 
                                 return (
                                   <Link 
                                     href={props.href || "#"} 
                                     onClick={() => {
                                       onClose();
                                       clearListings();
                                     }}
                                     className="block mt-2 w-full text-center bg-primary text-white py-2.5 px-4 rounded-xl font-bold text-sm hover:scale-[1.02] transition shadow-md no-underline"
                                   >
                                     {btnText}
                                   </Link>
                                 );
                               }
                             }}
                          >
                             {msg.content}
                          </ReactMarkdown>
                       )}
                     </div>
                   </motion.div>
                 ))}
                 {isChatLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 w-full">
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm mt-1 overflow-hidden">
                        <Image src="/logo.png" alt="AI" width={20} height={20} className="object-contain" />
                      </div>
                      <div className="px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 text-sm rounded-tl-sm shadow-sm flex items-center gap-2">
                        <TypingIndicator />
                      </div>
                    </motion.div>
                  )}
               </div>

               {/* Suggested Prompts (Collapsible Stack) */}
               <AnimatePresence>
                 {suggestedPrompts.length > 0 && !isChatLoading && (
                   <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0, y: 10 }}
                     className="px-4 pb-3 flex flex-col gap-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 w-full pt-2"
                   >
                     <div className="flex justify-start w-full">
                       <button 
                         onClick={() => setShowPrompts(!showPrompts)}
                         className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                       >
                         {showPrompts ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                         {showPrompts ? "Hide Suggestions" : "Show Suggestions"}
                       </button>
                     </div>

                     <AnimatePresence initial={false}>
                       {showPrompts && (
                         <motion.div
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: "auto" }}
                           exit={{ opacity: 0, height: 0 }}
                           className="flex flex-col gap-2 items-end w-full overflow-hidden"
                         >
                           {suggestedPrompts.map((prompt, i) => (
                             <motion.button 
                               key={prompt}
                               initial={{ opacity: 0, scale: 0.95, x: 20 }}
                               animate={{ opacity: 1, scale: 1, x: 0, transition: { delay: i * 0.05 } }}
                               exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                               onClick={() => handleChatSubmit(undefined, prompt)}
                               className="text-sm font-medium bg-slate-50 dark:bg-slate-800 text-primary dark:text-primary/90 px-4 py-2.5 rounded-2xl rounded-tr-sm border border-primary/20 hover:bg-primary/10 transition text-right max-w-[90%] whitespace-normal shadow-sm"
                             >
                               {prompt}
                             </motion.button>
                           ))}
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </motion.div>
                 )}
               </AnimatePresence>

               <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                 <form onSubmit={handleChatSubmit} className="relative flex items-center">
                   <input 
                     type="text" 
                     placeholder="Ask about these properties..." 
                     value={chatInput}
                     onChange={(e) => setChatInput(e.target.value)}
                     disabled={isChatLoading}
                     className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-4 pr-12 py-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-inner disabled:opacity-50"
                   />
                   <button 
                     type="submit" 
                     disabled={isChatLoading || !chatInput.trim()}
                     className="absolute right-1.5 p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                   >
                     <Send size={16} className="ml-px" />
                   </button>
                 </form>
               </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

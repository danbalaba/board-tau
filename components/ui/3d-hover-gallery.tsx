"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { InteractiveCard } from "./interactive-card";

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

export interface GalleryItem {
  id?: string | number;
  urls: string[];
  title?: string;
  subtitle?: string;
}

export interface ThreeDHoverGalleryProps {
  items?: GalleryItem[];
  itemWidth?: number;
  itemHeight?: number;
  gap?: number;
  perspective?: number;
  hoverScale?: number;
  transitionDuration?: number;
  backgroundColor?: string;
  grayscaleStrength?: number;
  brightnessLevel?: number;
  activeWidth?: number;
  rotationAngle?: number;
  zDepth?: number;
  enableKeyboardNavigation?: boolean;
  autoPlay?: boolean;
  autoPlayDelay?: number;
  className?: string;
  style?: React.CSSProperties;
  onImageClick?: (index: number, item: GalleryItem) => void;
  onImageHover?: (index: number, item: GalleryItem) => void;
  onImageFocus?: (index: number, item: GalleryItem) => void;
}

const GalleryCard = ({
  item,
  isActive,
  isFocused,
  grayscaleStrength,
  brightnessLevel,
  transitionDuration,
  backgroundColor,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onKeyDown,
  enableKeyboardNavigation
}: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slideshow effect
  useEffect(() => {
    if (!item.urls || item.urls.length <= 1) return;
    
    let interval: NodeJS.Timeout;
    const randomOffset = Math.random() * 2000;
    
    const timeout = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % item.urls.length);
        
        interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % item.urls.length);
        }, 5000); // 5 seconds interval
        
    }, randomOffset + 3000);
    
    return () => {
        clearTimeout(timeout);
        if (interval) clearInterval(interval);
    };
  }, [item.urls]);

  return (
    <div
      className="relative will-change-transform rounded-[1.5rem] shadow-xl overflow-hidden group cursor-pointer"
      style={{
        flex: isActive ? 5 : 1,
        minWidth: 0,
        height: `400px`,
        backgroundColor,
        filter: isActive || isFocused
            ? "inherit"
            : `grayscale(${grayscaleStrength}) brightness(${brightnessLevel})`,
        transform: isActive
          ? `translateZ(40px) scale(1.02)`
          : "none",
        transition: `all ${transitionDuration}s cubic-bezier(.1, .7, 0, 1)`,
        willChange: "flex, filter, transform",
        zIndex: isActive ? 100 : 1,
        margin: isActive ? "0 12px" : "0 4px",
        outline: isFocused ? "2px solid var(--primary-color)" : "none",
        outlineOffset: "2px",
      }}
      tabIndex={enableKeyboardNavigation ? 0 : -1}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      role="button"
      aria-label={item.title ? `View ${item.title}` : "View Image"}
      aria-pressed={isActive}
    >
      <AnimatePresence>
        <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
        >
            <Image
                src={item.urls && item.urls.length > 0 ? item.urls[currentIndex] : "/images/placeholder.jpg"}
                alt={item.title || "Gallery Image"}
                fill
                className="object-cover"
                draggable={false}
            />
        </motion.div>
      </AnimatePresence>

      <div
        className="absolute inset-x-0 bottom-0 p-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 bg-gradient-to-t from-black/80 to-transparent"
        style={{
          transition: `all ${transitionDuration}s cubic-bezier(.1, .7, 0, 1)`,
        }}
      >
        <div className="flex flex-col gap-1 drop-shadow-md">
          {item.title && (
            <h3 className="text-2xl font-bold text-white tracking-wide">
              {item.title}
            </h3>
          )}
          {item.subtitle && (
            <p className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
              {item.subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const ThreeDHoverGallery: React.FC<ThreeDHoverGalleryProps> = ({
  items = [],
  itemWidth = 12,
  itemHeight = 20,
  gap = 1.2,
  perspective = 50,
  hoverScale = 15,
  transitionDuration = 1.25,
  backgroundColor,
  grayscaleStrength = 1,
  brightnessLevel = 0.5,
  activeWidth = 45,
  rotationAngle = 35,
  zDepth = 10,
  enableKeyboardNavigation = true,
  autoPlay = false,
  autoPlayDelay = 3000,
  className,
  style,
  onImageClick,
  onImageHover,
  onImageFocus,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Modal State
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [modalIndex, setModalIndex] = useState(0);

  useEffect(() => {
    if (autoPlay && items.length > 0) {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      
      autoPlayRef.current = setInterval(() => {
        setActiveIndex((prev) => prev === null ? 0 : (prev + 1) % items.length);
      }, autoPlayDelay);

      return () => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      };
    }
    if (!autoPlay && autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, [autoPlay, autoPlayDelay, items.length]);

  const handleImageClick = (index: number, item: GalleryItem) => {
    if (activeIndex === index) {
      // If it's already active (expanded), open the full modal
      setSelectedItem(item);
      setModalIndex(0);
    } else {
      setActiveIndex(index);
    }
    onImageClick?.(index, item);
  };

  const handleImageHover = (index: number, item: GalleryItem) => {
    if (!autoPlay) setActiveIndex(index);
    onImageHover?.(index, item);
  };

  const handleImageLeave = () => {
    if (!autoPlay) setActiveIndex(null);
  };

  const handleImageFocus = (index: number, item: GalleryItem) => {
    setFocusedIndex(index);
    onImageFocus?.(index, item);
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (!enableKeyboardNavigation) return;

    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        handleImageClick(index, items[index]);
        break;
      case "ArrowLeft":
        event.preventDefault();
        const prevIndex = index > 0 ? index - 1 : items.length - 1;
        (containerRef.current?.children[prevIndex] as HTMLElement)?.focus();
        break;
      case "ArrowRight":
        event.preventDefault();
        const nextIndex = index < items.length - 1 ? index + 1 : 0;
        (containerRef.current?.children[nextIndex] as HTMLElement)?.focus();
        break;
    }
  };

  const nextModalImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedItem && selectedItem.urls) {
        setModalIndex((prev) => (prev + 1) % selectedItem.urls.length);
    }
  };

  const prevModalImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedItem && selectedItem.urls) {
        setModalIndex((prev) => (prev - 1 + selectedItem.urls.length) % selectedItem.urls.length);
    }
  };

  return (
    <>
      <div
        className={cn(
          "flex items-center justify-center min-h-[400px] w-full overflow-hidden bg-transparent",
          className
        )}
        style={backgroundColor ? { backgroundColor, ...style } : style}
      >
        <div
          ref={containerRef}
          className="flex justify-center items-center w-full px-2 py-4"
          style={{ perspective: `1000px` }}
        >
          {items.map((item, index) => (
            <GalleryCard
              key={index}
              item={item}
              isActive={activeIndex === index}
              isFocused={focusedIndex === index}
              grayscaleStrength={grayscaleStrength}
              brightnessLevel={brightnessLevel}
              transitionDuration={transitionDuration}
              backgroundColor={backgroundColor}
              enableKeyboardNavigation={enableKeyboardNavigation}
              onClick={() => handleImageClick(index, item)}
              onMouseEnter={() => handleImageHover(index, item)}
              onMouseLeave={handleImageLeave}
              onFocus={() => handleImageFocus(index, item)}
              onBlur={() => setFocusedIndex(null)}
              onKeyDown={(e: any) => handleKeyDown(e, index)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedItem && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-10"
                onClick={() => setSelectedItem(null)}
            >
                <button 
                    className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(null);
                    }}
                >
                    <X size={24} />
                </button>
                
                <InteractiveCard
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    containerClassName="w-full max-w-5xl aspect-video"
                    className="relative w-full h-full"
                    borderRadius="1.5rem"
                    onClick={(e: any) => e.stopPropagation()}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={modalIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={selectedItem.urls && selectedItem.urls.length > 0 ? selectedItem.urls[modalIndex] : "/images/placeholder.jpg"}
                                alt={selectedItem.title || "Preview"}
                                fill
                                className="object-cover"
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Carousel Navigation Arrows */}
                    {selectedItem.urls && selectedItem.urls.length > 1 && (
                        <>
                            <button 
                                onClick={prevModalImage}
                                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full transition-all hover:scale-110 active:scale-95 z-50"
                            >
                                <ChevronLeft size={32} />
                            </button>
                            <button 
                                onClick={nextModalImage}
                                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full transition-all hover:scale-110 active:scale-95 z-50"
                            >
                                <ChevronRight size={32} />
                            </button>

                            {/* Dot Indicators */}
                            <div className="absolute bottom-32 left-0 right-0 flex justify-center gap-2 z-50">
                                {selectedItem.urls.map((_: any, idx: number) => (
                                    <div 
                                        key={idx} 
                                        className={cn(
                                            "h-2 rounded-full transition-all duration-300", 
                                            idx === modalIndex ? "bg-white w-6" : "bg-white/50 w-2"
                                        )}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-tr from-black/95 via-black/50 to-transparent z-30 pointer-events-none rounded-[1.5rem]" />
                    
                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 z-40 pointer-events-none flex flex-col justify-end">
                        <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-3 tracking-tight drop-shadow-2xl">
                            {selectedItem.title}
                        </h3>
                        {selectedItem.subtitle && (
                            <p className="text-[#2f7d6d] font-bold tracking-[0.2em] text-sm md:text-base uppercase drop-shadow-md bg-white/90 px-4 py-1.5 w-max rounded-md">
                                {selectedItem.subtitle}
                            </p>
                        )}
                    </div>
                </InteractiveCard>
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ThreeDHoverGallery;

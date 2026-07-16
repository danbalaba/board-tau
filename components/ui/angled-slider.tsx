"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

export interface AngledSliderProps {
    items: {
        id: string | number;
        urls: string[];
        alt?: string;
        title?: string;
        subtitle?: string;
    }[];
    containerHeight?: string;
    cardWidth?: string;
    gap?: string;
    angle?: number;
    hoverScale?: number;
    className?: string;
}

const cardVariants: Variants = {
    offHover: (angle: number) => ({
        rotateY: angle,
        transformPerspective: 1200,
        z: 60,
        opacity: 0.9,
        scale: 1,
        zIndex: 30,
        transition: {
            type: "spring",
            mass: 3,
            stiffness: 400,
            damping: 50
        }
    }),
    onHover: (hoverScale: number) => ({
        rotateY: 0,
        transformPerspective: 1200,
        z: 120,
        opacity: 1,
        scale: hoverScale,
        zIndex: 50,
        transition: {
            type: "spring",
            mass: 3,
            stiffness: 400,
            damping: 50
        }
    })
};

const AngledCard = ({
    item,
    angle,
    hoverScale,
    cardWidth,
    onClick
}: {
    item: any;
    angle: number;
    hoverScale: number;
    cardWidth: string;
    onClick: () => void;
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-slideshow effect
    useEffect(() => {
        if (!item.urls || item.urls.length <= 1) return;
        
        let interval: NodeJS.Timeout;
        const randomOffset = Math.random() * 2000; // 0 to 2 seconds random offset
        
        const timeout = setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % item.urls.length);
            
            interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % item.urls.length);
            }, 5000); // Crossfade every 5 seconds
            
        }, randomOffset + 3000);
        
        return () => {
            clearTimeout(timeout);
            if (interval) clearInterval(interval);
        };
    }, [item.urls]);

    return (
        <motion.div
            className="relative flex-shrink-0 group overflow-visible cursor-grab active:cursor-grabbing"
            style={{
                width: cardWidth,
                height: "100%",
                transformStyle: "preserve-3d",
            }}
            custom={isHovered ? hoverScale : angle}
            variants={cardVariants}
            initial="offHover"
            animate={isHovered ? "onHover" : "offHover"}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            {/* The Image Card */}
            <div className="relative h-full w-full overflow-hidden bg-muted min-h-[300px] shadow-2xl rounded-[1.5rem] pointer-events-none">
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
                            alt={item.alt || item.title || "Slider Image"}
                            fill
                            className="object-cover transition-transform duration-[5s] group-hover:scale-105"
                            draggable={false}
                        />
                    </motion.div>
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    {item.title && (
                        <h3 className="text-xl font-bold drop-shadow-md">{item.title}</h3>
                    )}
                    {item.subtitle && (
                        <p className="text-sm font-semibold text-gray-200 uppercase tracking-wider drop-shadow-md">
                            {item.subtitle}
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export const AngledSlider = ({
    items,
    containerHeight = "400px",
    cardWidth = "280px",
    gap = "20px",
    angle = 20,
    hoverScale = 1.05,
    className,
}: AngledSliderProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [modalIndex, setModalIndex] = useState(0);

    const openModal = (item: any) => {
        setSelectedItem(item);
        setModalIndex(0);
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

    if (!items || items.length === 0) return null;

    return (
        <>
            <div
                className={cn(
                    "relative w-full overflow-x-clip overflow-y-visible bg-transparent py-8",
                    className
                )}
                style={{
                    height: containerHeight,
                    perspective: "1000px", // Essential for 3D effect
                }}
                ref={containerRef}
            >
                <motion.div
                    className="flex items-center h-full w-max px-[10vw]"
                    style={{ gap, transformStyle: "preserve-3d" }}
                    drag="x"
                    dragConstraints={containerRef}
                    dragElastic={0.1}
                >
                    {items.map((item, index) => (
                        <AngledCard
                            key={`${item.id}-${index}`}
                            item={item}
                            angle={angle}
                            hoverScale={hoverScale}
                            cardWidth={cardWidth}
                            onClick={() => openModal(item)}
                        />
                    ))}
                </motion.div>
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
                        
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg aspect-[3/4] md:aspect-square rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10"
                            onClick={(e) => e.stopPropagation()}
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
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full transition-all hover:scale-110 active:scale-95"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button 
                                        onClick={nextModalImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full transition-all hover:scale-110 active:scale-95"
                                    >
                                        <ChevronRight size={24} />
                                    </button>

                                    {/* Dot Indicators */}
                                    <div className="absolute bottom-28 left-0 right-0 flex justify-center gap-1.5">
                                        {selectedItem.urls.map((_: any, idx: number) => (
                                            <div 
                                                key={idx} 
                                                className={cn(
                                                    "w-1.5 h-1.5 rounded-full transition-all duration-300", 
                                                    idx === modalIndex ? "bg-white w-4" : "bg-white/50"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-tr from-black/95 via-black/50 to-transparent pointer-events-none" />
                            
                            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 z-40 pointer-events-none flex flex-col justify-end">
                                <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-xl">
                                    {selectedItem.title}
                                </h3>
                                {selectedItem.subtitle && (
                                    <p className="text-[#2f7d6d] font-bold tracking-[0.15em] text-sm uppercase drop-shadow-md bg-white/90 px-3 py-1 w-max rounded-md">
                                        {selectedItem.subtitle}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AngledSlider;

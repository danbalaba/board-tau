'use client'
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ListingCard from '../listings/ListingCard';
import { Listing } from "@prisma/client";

interface ThreeDListingCarouselProps {
    listings: Listing[];
    currentUser?: any;
    itemCount?: 3 | 5;
    autoplay?: boolean;
    delay?: number;
    pauseOnHover?: boolean;
    className?: string;
}

const EMBEDDED_CSS = `
.cascade-slider_container {
    position: relative;
    max-width: 1200px;
    margin: 0 auto;
    z-index: 20; 
    user-select: none;
    -webkit-user-select: none; 
    touch-action: pan-y;
    height: 400px; /* Default height for mobile screens < 414px */
}

.cascade-slider_slides {
    position: relative;
    height: 100%; 
}

.cascade-slider_item {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateY(-50%) translateX(-50%) scale(0.3); 
    transition: all 0.8s cubic-bezier(0.25, 1, 0.5, 1); 
    opacity: 0;
    z-index: 1; 
    cursor: grab; 
}
.cascade-slider_item.now {
    cursor: default;
}
.cascade-slider_item:active {
    cursor: grabbing;
}

/* Slide Positioning Classes */
.cascade-slider_item.next {
    left: 50%;
    transform: translateY(-50%) translateX(-110%) scale(0.7);
    opacity: 1;
    z-index: 4; 
}
.cascade-slider_item.prev {
    left: 50%;
    transform: translateY(-50%) translateX(10%) scale(0.7);
    opacity: 1;
    z-index: 4; 
}
.cascade-slider_item.now {
    top: 50%;
    left: 50%;
    transform: translateY(-50%) translateX(-50%) scale(1);
    opacity: 1;
    z-index: 5; 
}

.cascade-slider_arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 50%;
    cursor: pointer;
    z-index: 10; 
    transform: translate(0, -50%);
    width: 40px; 
    height: 40px; 
    transition: all 0.3s ease;
}

@media screen and (max-width: 575px) {
    .cascade-slider_arrow-left { left: 5px; }
    .cascade-slider_arrow-right { right: 5px; }
}
@media screen and (min-width: 576px) {
    .cascade-slider_arrow-left { left: 0%; }
    .cascade-slider_arrow-right { right: 0%; }
}

/* Card Wrapper Sizes */
.listing-card-wrapper {
    width: 260px;
    height: auto; 
    display: block;
    transition: filter 1s ease;
    /* Prevent interaction with non-centered cards */
    pointer-events: none;
}
.cascade-slider_item.now .listing-card-wrapper {
    pointer-events: auto;
}

.cascade-slider_item:not(.now) .listing-card-wrapper {
    filter: blur(2px) brightness(0.7);
}

@media screen and (min-width: 414px) {
    .cascade-slider_container { height: 420px; }
    .listing-card-wrapper { width: 300px; }
}
@media screen and (min-width: 576px) {
    .cascade-slider_container { height: 460px; }
    .listing-card-wrapper { width: 320px; }
}
@media screen and (min-width: 768px) {
    .cascade-slider_item.next { transform: translateY(-50%) translateX(-120%) scale(0.7); }
    .cascade-slider_item.prev { transform: translateY(-50%) translateX(20%) scale(0.7); }
    .listing-card-wrapper { width: 340px; }
}
@media screen and (min-width: 991px) {
    .cascade-slider_item.next { transform: translateY(-50%) translateX(-110%) scale(0.65); z-index: 4; }
    .cascade-slider_item.prev { transform: translateY(-50%) translateX(10%) scale(0.65); z-index: 4; }
    .cascade-slider_item.next2 { transform: translateY(-50%) translateX(-150%) scale(0.4); z-index: 1; }
    .cascade-slider_item.prev2 { transform: translateY(-50%) translateX(50%) scale(0.4); z-index: 2; }
    .listing-card-wrapper { width: 360px; }
    .cascade-slider_container { height: 480px; }
}
@media screen and (min-width: 1100px) {
    .cascade-slider_item.next { transform: translateY(-50%) translateX(-120%) scale(0.65); }
    .cascade-slider_item.prev { transform: translateY(-50%) translateX(20%) scale(0.65); }
    .cascade-slider_item.next2 { transform: translateY(-50%) translateX(-170%) scale(0.4); }
    .cascade-slider_item.prev2 { transform: translateY(-50%) translateX(70%) scale(0.4); }
    .listing-card-wrapper { width: 380px; }
}
`;

const getSlideClasses = (index: number, activeIndex: number, total: number, visibleCount: 3 | 5): string => {
    const diff = index - activeIndex;
    if (diff === 0) return 'now';
    if (diff === 1 || diff === -total + 1) return 'next';
    if (visibleCount === 5 && (diff === 2 || diff === -total + 2)) return 'next2';
    if (diff === -1 || diff === total - 1) return 'prev';
    if (visibleCount === 5 && (diff === -2 || diff === total - 2)) return 'prev2';
    return '';
};

export const ThreeDListingCarousel: React.FC<ThreeDListingCarouselProps> = ({
    listings,
    currentUser,
    itemCount = 5,
    autoplay = false,
    delay = 5,
    pauseOnHover = true,
    className = '',
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const autoplayIntervalRef = useRef<number | null>(null);
    const total = listings.length;

    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const swipeThreshold = 50;

    const navigate = useCallback((direction: 'next' | 'prev') => {
        setActiveIndex(current => {
            if (direction === 'next') {
                return (current + 1) % total;
            } else {
                return (current - 1 + total) % total;
            }
        });
    }, [total]);

    const startAutoplay = useCallback(() => {
        if (autoplay && total > 1) {
            if (autoplayIntervalRef.current) {
                clearInterval(autoplayIntervalRef.current);
            }
            autoplayIntervalRef.current = window.setInterval(() => {
                navigate('next');
            }, delay * 1000);
        }
    }, [autoplay, delay, navigate, total]);

    const stopAutoplay = useCallback(() => {
        if (autoplayIntervalRef.current) {
            clearInterval(autoplayIntervalRef.current);
            autoplayIntervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        startAutoplay();
        return () => { stopAutoplay(); };
    }, [startAutoplay, stopAutoplay]);

    const handleMouseEnter = () => {
        if (autoplay && pauseOnHover) stopAutoplay();
    };

    const handleExit = (e: React.MouseEvent) => {
        if (autoplay && pauseOnHover) startAutoplay();
        if (isDragging) handleEnd(e.clientX);
    };

    const handleStart = (clientX: number) => {
        setIsDragging(true);
        setStartX(clientX);
        stopAutoplay();
    };

    const handleEnd = (clientX: number) => {
        if (!isDragging) return;
        const distance = clientX - startX;
        if (Math.abs(distance) > swipeThreshold) {
            if (distance < 0) navigate('next');
            else navigate('prev');
        }
        setIsDragging(false);
        setStartX(0);
    };

    const onMouseDown = (e: React.MouseEvent) => handleStart(e.clientX);
    const onMouseUp = (e: React.MouseEvent) => {
        handleEnd(e.clientX);
        startAutoplay();
    };

    const onTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientX);
    const onTouchEnd = (e: React.TouchEvent) => {
        handleEnd(e.changedTouches[0].clientX);
        startAutoplay();
    };

    if (total === 0) return null;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: EMBEDDED_CSS }} />
            <div
                className={`cascade-slider_container ${className} w-full`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleExit}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                <div className="cascade-slider_slides">
                    {listings.map((listing: any, index) => {
                        const hasFavorited = currentUser?.favoriteIds?.includes(listing.id) || false;
                        return (
                            <div
                                key={listing.id}
                                className={`cascade-slider_item ${getSlideClasses(index, activeIndex, total, itemCount)}`}
                                data-slide-number={index}
                                onClick={(e) => {
                                    // If clicking a side item, navigate to it instead of following the card link
                                    const diff = index - activeIndex;
                                    if (diff !== 0) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (diff > 0 || (diff < -1 && total > 2)) navigate('next');
                                        else navigate('prev');
                                    }
                                }}
                            >
                                <div className="listing-card-wrapper" onPointerDown={(e) => e.stopPropagation()}>
                                   <ListingCard 
                                      data={listing} 
                                      hasFavorited={hasFavorited}
                                      aiHighlight={listing.aiHighlight}
                                   />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {total > 1 && (
                    <>
                        <span
                            className="cascade-slider_arrow cascade-slider_arrow-left rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-md text-gray-800 dark:text-white p-2 hover:bg-white/90 dark:hover:bg-gray-700/90 shadow-xl border border-gray-100/50 dark:border-gray-700/50 transition-colors duration-300"
                            onClick={(e) => { e.stopPropagation(); navigate('prev'); }}
                        >
                            <ArrowLeftCircle size={24} />
                        </span>
                        <span
                            className="cascade-slider_arrow cascade-slider_arrow-right rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-md text-gray-800 dark:text-white p-2 hover:bg-white/90 dark:hover:bg-gray-700/90 shadow-xl border border-gray-100/50 dark:border-gray-700/50 transition-colors duration-300"
                            onClick={(e) => { e.stopPropagation(); navigate('next'); }}
                        >
                            <ArrowRightCircle size={24} />
                        </span>
                    </>
                )}
            </div>
        </>
    );
};

export default ThreeDListingCarousel;

"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaRedo, FaBars } from "react-icons/fa";
import dynamic from "next/dynamic";
import { useMediaQuery } from "@/hooks/use-media-query";

const InteractiveMap = dynamic(() => import("./InteractiveMap"), { ssr: false });
import SidebarListView from "./SidebarListView";
import SidebarDetailView from "./SidebarDetailView";
import MapFiltersOverlay from "./MapFiltersOverlay";
import LandmarkCard from "./LandmarkCard";
import ListingPinCard from "./ListingPinCard";
import Image from "next/image";

import { Listing } from "@prisma/client";
import MapActionSidebar, { SidebarViewType } from "./MapActionSidebar";
import SavedListView from "./SavedListView";
import RecentsListView from "./RecentsListView";
import AuthModal from "../modals/AuthModal";
import Modal from "../modals/Modal";
import { useSession } from "next-auth/react";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import { useRecentStore } from "@/hooks/use-recent-store";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  listings: Listing[];
  onSearchArea?: (bounds: L.LatLngBounds) => void;
}

export default function MapModal({ isOpen, onClose, listings, onSearchArea }: MapModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { isOpen: isMobile } = useMediaQuery();
  
  // selectedListing is now proper React state — NOT derived from URL.
  // This prevents stale URL params from pre-populating the directions panel on next open.
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [selectedLandmark, setSelectedLandmark] = useState<any>(null);
  const [showLandmarkCard, setShowLandmarkCard] = useState(false);
  const [showListingCard, setShowListingCard] = useState(false);
  const [showSearchAreaBtn, setShowSearchAreaBtn] = useState(false);
  const [currentBounds, setCurrentBounds] = useState<any>(null);
  const [activeView, setActiveView] = useState<SidebarViewType>("none");
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Directions state
  const [showDirections, setShowDirections] = useState(false);
  const [directionsPhase, setDirectionsPhase] = useState<"start" | "destination" | null>(null);
  const [routeDestination, setRouteDestination] = useState<[number, number] | null>(null);

  const { data: session, status } = useSession();
  const { error } = useResponsiveToast();
  const { addRecentListing } = useRecentStore();

  // Compute number of listings within ~1km of the selected landmark
  const nearbyCount = selectedLandmark
    ? listings.filter((l: any) => {
        if (!l.latitude || !l.longitude) return false;
        const R = 6371000;
        const dLat = ((l.latitude - selectedLandmark.coords[0]) * Math.PI) / 180;
        const dLon = ((l.longitude - selectedLandmark.coords[1]) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos((selectedLandmark.coords[0] * Math.PI) / 180) * Math.cos((l.latitude * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) <= 1000;
      }).length
    : 0;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    const rootNode = document.documentElement;

    if (!isOpen) return;

    // Lock logic identical to Modal.tsx
    const scrollTop = window.pageYOffset || rootNode.scrollTop || body.scrollTop;
    body.style.overflow = 'hidden';
    body.style.paddingRight = '17px'; 
    body.style.top = `-${scrollTop}px`;
    body.classList.add("fixed", "w-full");

    return () => {
      // Restore logic identical to Modal.tsx
      const top = parseFloat(body.style.top) * -1;
      body.style.overflow = '';
      body.style.paddingRight = '';
      body.style.top = '';
      body.classList.remove("fixed", "w-full");
      if (top) {
        window.scrollTo(0, top);
      }
    };
  }, [isOpen]);


  // When directions panel opens → enter Phase 1 (start). When closed → reset everything.
  useEffect(() => {
    if (showDirections) {
      setDirectionsPhase("start");
      setRouteDestination(null);
    } else {
      setDirectionsPhase(null);
      setRouteDestination(null);
    }
  }, [showDirections]);

  // Reset ALL map state when modal closes, and clean any stale ?listingId from the URL.
  useEffect(() => {
    if (!isOpen) {
      setSelectedListing(null);
      setSelectedLandmark(null);
      setShowLandmarkCard(false);
      setShowListingCard(false);
      setShowDirections(false);
      setDirectionsPhase(null);
      setRouteDestination(null);
      setShowSearchAreaBtn(false);
      setActiveView("none");

      // Clean up ONLY the listingId popup state, preserve the user's search filters
      const params = new URLSearchParams(searchParams.toString());
      let hasChanges = false;
      
      const paramsToRemove = ["listingId"];
      paramsToRemove.forEach(key => {
        if (params.has(key)) {
          params.delete(key);
          hasChanges = true;
        }
      });

      if (hasChanges) {
        // Commented out to prevent Next.js router from triggering a scroll jump 
        // which causes the Search Bar to morph during the exit animation.
        // router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }
  }, [isOpen]);

  // Automatically hide popups (ListingPinCard / LandmarkCard) if they are dragged out of bounds
  useEffect(() => {
    if (currentBounds && typeof currentBounds.getNorthEast === 'function') {
      const ne = currentBounds.getNorthEast();
      const sw = currentBounds.getSouthWest();
      const isInside = (lat: number, lng: number) => {
        return lat <= ne.lat && lat >= sw.lat && lng <= ne.lng && lng >= sw.lng;
      };

      if (showListingCard && selectedListing && selectedListing.latitude && selectedListing.longitude) {
        if (!isInside(selectedListing.latitude, selectedListing.longitude)) {
          setShowListingCard(false);
        }
      }

      if (showLandmarkCard && selectedLandmark && selectedLandmark.coords) {
        if (!isInside(selectedLandmark.coords[0], selectedLandmark.coords[1])) {
          setShowLandmarkCard(false);
        }
      }
    }
  }, [currentBounds, showListingCard, showLandmarkCard, selectedListing, selectedLandmark]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="map-modal-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/40 dark:bg-black/60 backdrop-blur-md flex flex-col md:flex-row overflow-hidden md:p-6 lg:p-12"
        >
          {/* Close Button (Absolute) */}
          <button
            onClick={onClose}
            className="absolute top-4 md:top-8 right-4 md:right-8 z-[110] h-12 w-12 flex items-center justify-center bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <FaTimes size={20} />
          </button>

          <div className="w-full h-full flex flex-col md:flex-row relative md:rounded-2xl overflow-hidden shadow-2xl border-0 md:border md:border-white/10">
            <MapActionSidebar 
              activeView={activeView} 
              setActiveView={(view) => {
                setActiveView(view);
                if (view !== "none") setSelectedListing(null);
              }}
              onMenuClick={() => {
                setActiveView(activeView === "list" ? "none" : "list");
                setSelectedListing(null);
              }}
              onSavedClick={() => {
                if (status !== "authenticated") {
                  error({
                    title: "Please log in",
                    description: "You must be logged in to view or save favorites."
                  });
                  setShowAuthModal(true);
                } else {
                  setActiveView(activeView === "saved" ? "none" : "saved");
                  setSelectedListing(null);
                }
              }}
            />

            {/* Secondary Sidebar Content (Slide-out or Bottom Sheet) */}
            <AnimatePresence>
              {activeView !== "none" && (
                <motion.div
                  key="sidebar-panel"
                  initial={isMobile ? { y: "100%", opacity: 0 } : { x: "-100%", opacity: 0 }}
                  animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
                  exit={isMobile ? { y: "100%", opacity: 0 } : { x: "-100%", opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  drag={isMobile ? "y" : false}
                  dragConstraints={{ top: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, { offset, velocity }) => {
                    if (isMobile && (offset.y > 100 || velocity.y > 300)) {
                      setActiveView("none");
                    }
                  }}
                  className={`
                    w-full flex flex-col z-[105] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-2xl bg-white dark:bg-gray-900 border-border 
                    ${isMobile 
                      ? 'fixed bottom-[65px] left-0 right-0 h-[80vh] rounded-t-3xl border-t' 
                      : 'absolute md:left-[72px] left-0 top-0 h-[calc(100%-65px)] md:h-full md:w-[400px] md:border-r pb-safe md:pb-0'}
                  `}
                >
                  {/* Mobile Drag Handle Indicator */}
                  {isMobile && (
                    <div className="w-full flex flex-col items-center pt-3 pb-3 bg-white dark:bg-gray-900 rounded-t-3xl shrink-0 cursor-grab active:cursor-grabbing border-b border-gray-100 dark:border-gray-800 relative">
                      <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-3" />
                      
                      <div className="w-full flex justify-center items-center px-4 relative h-8">
                        <span className="font-bold text-gray-800 dark:text-white capitalize text-base tracking-wide">
                          {activeView === "list" ? "Explore" : activeView}
                        </span>
                        
                        <button 
                          onClick={() => setActiveView("none")} 
                          className="absolute right-4 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                        >
                          <FaTimes size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Inner Close button for secondary panel on desktop fallback */}
                  {!isMobile && (
                    <div className="md:hidden w-full flex justify-between items-center py-3 px-4 border-b border-border shadow-sm bg-white dark:bg-gray-900">
                      <span className="font-bold text-gray-800 dark:text-white capitalize">
                        {activeView}
                      </span>
                      <button onClick={() => setActiveView("none")} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200">
                        <FaTimes />
                      </button>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto">
                    {selectedListing ? (
                      <SidebarDetailView 
                        listing={selectedListing} 
                        onBack={() => setSelectedListing(null)} 
                      />
                    ) : activeView === "list" ? (
                      <SidebarListView 
                        selectedLandmark={selectedLandmark}
                        onListingSelect={(listing) => {
                          setSelectedListing(listing);
                          addRecentListing(listing);
                        }}
                        listings={listings}
                      />
                    ) : activeView === "saved" ? (
                      <SavedListView
                        onListingSelect={(listing) => {
                          setSelectedListing(listing);
                          addRecentListing(listing);
                        }}
                        listings={listings}
                      />
                    ) : activeView === "recents" ? (
                      <RecentsListView
                        onListingSelect={(listing) => {
                          setSelectedListing(listing);
                          addRecentListing(listing);
                        }}
                        listings={listings}
                      />
                    ) : null}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Map Area */}
            <div className="flex-1 h-full relative bg-gray-100 dark:bg-gray-900 mb-[65px] md:mb-0">
              {/* Floating Search & Filters Overlay */}
              <MapFiltersOverlay 
                selectedListing={selectedListing as any}
                selectedLandmark={selectedLandmark}
                showDirections={showDirections}
                setShowDirections={(val) => {
                  setShowDirections(val);
                  if (val) {
                    // When turning ON directions, clear selectedListing so Phase 1 is clean
                    setSelectedListing(null);
                    setSelectedLandmark(null);
                  }
                }}
                directionsPhase={directionsPhase}
                onGetDirections={(start, end) => {
                  setRouteDestination(end);
                  setDirectionsPhase(null); // Done — show all markers again
                }}
              />

              {/* "Search this area" Button */}
              <AnimatePresence>
                {showSearchAreaBtn && onSearchArea && !showDirections && (
                  <motion.button
                    key="search-area-btn"
                    initial={{ y: -50, opacity: 0, x: "-50%" }}
                    animate={{ y: 20, opacity: 1, x: "-50%" }}
                    exit={{ y: -50, opacity: 0, x: "-50%" }}
                    onClick={() => {
                      onSearchArea(currentBounds);
                      setShowSearchAreaBtn(false);
                    }}
                    className="absolute top-20 left-1/2 z-[200] bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-5 py-2.5 rounded-full shadow-lg font-semibold text-sm flex items-center gap-2 border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform"
                  >
                    <FaRedo className="text-primary" />
                    Search this area
                  </motion.button>
                )}
              </AnimatePresence>

              <InteractiveMap 
                listings={listings}
                selectedListingId={selectedListing?.id || null}
                activeLandmarkForRadius={activeView === "list" ? selectedLandmark : null}
                onListingClick={(id) => {
                  const found = listings.find(l => l.id === id);
                  if (found) {
                    setSelectedListing(found);
                    addRecentListing(found);

                    if (directionsPhase === "start") {
                      // Advance to Phase 2: pick destination landmark
                      setDirectionsPhase("destination");
                    } else if (!showDirections) {
                      setShowListingCard(true);
                      setShowLandmarkCard(false);
                    }
                  }
                }}
                onLandmarkClick={(landmark) => {
                  if (directionsPhase === "destination") {
                    // Phase 2 complete: use this landmark as the destination
                    const destLng = landmark.coords[1];
                    const destLat = landmark.coords[0];
                    setRouteDestination([destLng, destLat]);
                    setSelectedLandmark(landmark);
                    setDirectionsPhase(null); // Done — restore all markers
                    return;
                  }
                  if (showDirections) return;
                  setSelectedLandmark(landmark);
                  setShowLandmarkCard(true);
                  setShowListingCard(false);
                }}
                onMapMoveEnd={(bounds) => {
                  setCurrentBounds(bounds);
                  setShowSearchAreaBtn(true);
                }}
                onMapInteraction={() => {
                  if (showListingCard) setShowListingCard(false);
                  if (showLandmarkCard) setShowLandmarkCard(false);
                }}
                routeDestination={routeDestination}
                directionsPhase={directionsPhase}
              />


              {/* Listing Pin Card Popup */}
              <ListingPinCard
                listing={showListingCard ? selectedListing : null}
                onClose={() => setShowListingCard(false)}
                onViewDetails={() => {
                  setActiveView("list");
                  setShowListingCard(false);
                }}
              />
              {/* Landmark Card Popup */}
              <LandmarkCard
                landmark={showLandmarkCard ? selectedLandmark : null}
                nearbyCount={nearbyCount}
                onClose={() => setShowLandmarkCard(false)}
                onShowListings={() => {
                  setActiveView("list");
                  setShowLandmarkCard(false);
                }}
              />

            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>
      
      <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} width="sm" noPadding>
        <AuthModal name="Login" onCloseModal={() => setShowAuthModal(false)} />
      </Modal>
    </>
  );
}

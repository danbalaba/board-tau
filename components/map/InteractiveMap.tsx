import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "next-themes";
import { TAU_COORDINATES } from "@/utils/constants";
import { colleges } from "@/data/colleges";
import { Listing } from "@prisma/client";

import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

if (typeof window !== "undefined") {
  require("leaflet.markercluster");
}

const LANDMARKS = colleges
  .filter(c => c.value !== "any")
  .map(c => ({
    id: c.value,
    name: c.label,
    coords: c.latlng as L.LatLngTuple,
    logo: c.logo,
  }));

interface InteractiveMapProps {
  onListingClick: (id: string) => void;
  onLandmarkClick: (landmark: any) => void;
  listings: Listing[];
  selectedListingId?: string | null;
  routeDestination?: [number, number] | null;
  directionsPhase?: "start" | "destination" | null;
  onMapMoveEnd?: (bounds: L.LatLngBounds) => void;
  onMapInteraction?: () => void;
}

// Helper to generate the exact HTML string for a listing icon
const createListingIcon = (listing: any, isSelected: boolean) => {
  const imgSrc = (typeof listing.imageSrc === 'string' && listing.imageSrc.startsWith('http'))
    ? listing.imageSrc
    : (Array.isArray(listing.images) && listing.images[0]?.url)
      ? listing.images[0].url
      : 'https://res.cloudinary.com/dtg0zavxl/image/upload/v1727878437/BoardTAU/Assets/bnnwtyyvsh42iyn33d5y.jpg';

  const pinSize = isSelected ? 56 : 44;
  const borderColor = isSelected ? '#f59e0b' : '#2f7d6d';
  const ringStyle = isSelected
    ? 'box-shadow:0 0 0 3px #f59e0b,0 8px_24px rgba(245,158,11,0.4);'
    : 'box-shadow:0 4px 16px rgba(0,0,0,0.18);';

  return L.divIcon({
    className: `custom-price-marker ${isSelected ? 'active-pin' : ''}`,
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <div style="
          width:${pinSize}px;
          height:${pinSize}px;
          border-radius:50%;
          border:3px solid ${borderColor};
          overflow:hidden;
          background:#f3f4f6;
          ${ringStyle}
          transition:transform 0.2s ease,box-shadow 0.2s ease;
          cursor:pointer;
        ">
          <img src="${imgSrc}" alt="${listing.title}" style="width:100%;height:100%;object-fit:cover;" />
        </div>
        <div class="listing-tooltip" style="
          position:absolute;
          left:${pinSize + 10}px;
          top:50%;
          transform:translateY(-50%) translateX(4px);
          opacity:0;
          transition:opacity 0.2s ease,transform 0.2s ease;
          pointer-events:none;
          white-space:nowrap;
          background:rgba(255,255,255,0.97);
          backdrop-filter:blur(16px);
          -webkit-backdrop-filter:blur(16px);
          padding:6px 12px 6px 10px;
          border-radius:8px;
          font-size:11px;
          font-weight:700;
          font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;
          letter-spacing:0.01em;
          color:#111827;
          box-shadow:0 4px 16px rgba(0,0,0,0.10),0 0 0 1px rgba(47,125,109,0.15);
          border-left:3px solid ${borderColor};
          max-width:180px;
          overflow:hidden;
          text-overflow:ellipsis;
        ">${listing.title}</div>
      </div>
    `,
    iconSize: [pinSize, pinSize],
    iconAnchor: [pinSize / 2, pinSize / 2]
  });
};

export default function InteractiveMap({ onListingClick, onLandmarkClick, listings, selectedListingId, routeDestination, directionsPhase, onMapMoveEnd, onMapInteraction }: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<any>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const routingLineRef = useRef<L.Polyline | null>(null);
  const routingBadgeRef = useRef<L.Marker | null>(null);
  const landmarkMarkersRef = useRef<L.Marker[]>([]);
  
  // Permanent tracking refs for dynamic icon swapping
  const listingMarkersRef = useRef<Record<string, L.Marker>>({});
  const prevSelectedIdRef = useRef<string | null>(null);
  
  const { resolvedTheme } = useTheme();
  
  // Track manual drags to trigger "Search this area"
  const isUserDragging = useRef(false);

  // Store callbacks in stable refs so they never force the map to remount
  const onLandmarkClickRef = useRef(onLandmarkClick);
  const onMapMoveEndRef = useRef(onMapMoveEnd);
  const onListingClickRef = useRef(onListingClick);
  const onMapInteractionRef = useRef(onMapInteraction);
  const directionsPhaseRef = useRef(directionsPhase);
  
  useEffect(() => { onLandmarkClickRef.current = onLandmarkClick; }, [onLandmarkClick]);
  useEffect(() => { onMapMoveEndRef.current = onMapMoveEnd; }, [onMapMoveEnd]);
  useEffect(() => { onListingClickRef.current = onListingClick; }, [onListingClick]);
  useEffect(() => { onMapInteractionRef.current = onMapInteraction; }, [onMapInteraction]);
  useEffect(() => { directionsPhaseRef.current = directionsPhase; }, [directionsPhase]);

  useEffect(() => {
    if (!containerRef.current) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const controlPos = isMobile ? 'bottomleft' : 'bottomright';

    const map = L.map(containerRef.current, {
      zoomControl: false,
      preferCanvas: true, // Boosts performance when rendering many layers
      wheelPxPerZoomLevel: 120, // Smoother zooming
    }).setView(TAU_COORDINATES, 15);
    
    L.control.zoom({ position: controlPos }).addTo(map);

    const tileOptions = {
      maxZoom: 20,
      keepBuffer: 8,           // Drastically reduces white flashing by keeping surrounding tiles in memory
      updateWhenIdle: false,   // Force map to fetch tiles DURING dragging instead of waiting to stop
      updateWhenZooming: false // Smoother zooming transitions
    };

    const lightLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", tileOptions);
    const darkLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", tileOptions);
    const satelliteLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { ...tileOptions, maxZoom: 19 });

    if (resolvedTheme === "dark") darkLayer.addTo(map);
    else lightLayer.addTo(map);

    L.control.layers({
      "Modern Light": lightLayer,
      "Modern Dark": darkLayer,
      "Satellite View": satelliteLayer
    }, undefined, { position: controlPos }).addTo(map);

    // Modern Glassmorphism Landmark markers
    landmarkMarkersRef.current = []; // Clear array before populating to avoid StrictMode duplicates and map poisoning
    LANDMARKS.forEach((landmark) => {
      const landmarkIcon = L.divIcon({
        className: "custom-landmark-marker group",
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <!-- Soft pulsing halo -->
            <div class="absolute w-12 h-12 rounded-full animate-pulse-slow pointer-events-none" style="background-color: rgba(47,125,109,0.15);"></div>
            <div class="absolute w-8 h-8 rounded-full animate-ping pointer-events-none" style="background-color: rgba(47,125,109,0.35);"></div>
            
            <!-- Premium Glassmorphism Pin -->
            <div class="relative z-10 w-14 h-14 rounded-full bg-white shadow-[0_8px_20px_rgba(0,0,0,0.18)] flex items-center justify-center transition-transform group-hover:scale-110 group-hover:shadow-[0_8px_28px_rgba(47,125,109,0.45)]" style="border: 3px solid var(--primary-color);">
              ${landmark.logo
                ? `<img src="${landmark.logo}" alt="${landmark.name}" style="width:38px;height:38px;object-fit:contain;border-radius:50%;" />`
                : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`
              }
            </div>
            
            <!-- Floating Tooltip Label -->
            <div style="
              position: absolute;
              left: 66px;
              top: 50%;
              transform: translateY(-50%) translateX(4px);
              opacity: 0;
              transition: opacity 0.2s ease, transform 0.2s ease;
              pointer-events: none;
              white-space: nowrap;
              background: rgba(255,255,255,0.97);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              padding: 7px 14px 7px 12px;
              border-radius: 10px;
              font-size: 12px;
              font-weight: 700;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              letter-spacing: 0.015em;
              color: #111827;
              box-shadow: 0 4px 24px rgba(0,0,0,0.10), 0 0 0 1.5px rgba(47,125,109,0.18);
              display: flex;
              align-items: center;
              gap: 8px;
              border-left: 3.5px solid var(--primary-color);
            " class="landmark-tooltip">
              <span style="width:6px;height:6px;border-radius:50%;background:var(--primary-color);flex-shrink:0;display:inline-block;"></span>
              ${landmark.name}
            </div>
          </div>
        `,
        iconSize: [56, 56],
        iconAnchor: [28, 28]
      });

      const marker = L.marker(landmark.coords, { icon: landmarkIcon }).addTo(map);
      marker.on("click", () => {
        if (radiusCircleRef.current) map.removeLayer(radiusCircleRef.current);
        
        // Use setView with animate: false to completely bypass Leaflet's CSS animation loop.
        // This guarantees zero _leaflet_pos crashes when React re-renders simultaneously.
        if (directionsPhaseRef.current !== "destination") {
          map.setView(landmark.coords, 15, { animate: false });
        }
        
        onLandmarkClickRef.current(landmark);
      });
      landmarkMarkersRef.current.push(marker);
    });

    // Handle map movement for "Search this area"
    map.on('dragstart', () => { 
      isUserDragging.current = true; 
      if (onMapInteractionRef.current) onMapInteractionRef.current();
    });
    
    // Handle map clicks to dismiss popups
    map.on('click', () => {
      if (onMapInteractionRef.current) onMapInteractionRef.current();
    });

    // Handle manual zoom/pinch to dismiss popups
    const handleWheel = () => { if (onMapInteractionRef.current) onMapInteractionRef.current(); };
    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length > 1 && onMapInteractionRef.current) onMapInteractionRef.current();
    };
    const container = map.getContainer();
    container.addEventListener('wheel', handleWheel, { passive: true });
    container.addEventListener('touchstart', handleTouch, { passive: true });

    map.on('moveend', () => {
      if (isUserDragging.current && onMapMoveEndRef.current) {
        onMapMoveEndRef.current(map.getBounds());
      }
      isUserDragging.current = false;
    });

    clusterGroupRef.current = (L as any).markerClusterGroup({
      chunkedLoading: false, // Disable chunked loading to prevent race conditions with React state updates
      maxClusterRadius: 40,
      zoomToBoundsOnClick: false, // We will handle this manually to prevent excessive zooming
      iconCreateFunction: function (cluster: any) {
        return L.divIcon({
          html: `<div class="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-[0_0_20px_rgba(47,125,109,0.6)] border-2 border-white dark:border-gray-800 transition-transform hover:scale-110">${cluster.getChildCount()}</div>`,
          className: 'custom-cluster-marker',
          iconSize: L.point(40, 40)
        });
      }
    });

    clusterGroupRef.current.on('clusterclick', (a: any) => {
      const bounds = a.layer.getBounds();
      const map = mapRef.current;
      if (!map) return;
      
      // If the cluster bounds are extremely tight or identical (e.g. markers at the exact same building)
      if (bounds.getNorthWest().equals(bounds.getSouthEast())) {
        a.layer.spiderfy(); // Spiderfy instantly without aggressively zooming
      } else {
        // Zoom into the cluster, but cap the maximum zoom to 16 to prevent excessive close-ups
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      }
    });

    map.addLayer(clusterGroupRef.current);
    mapRef.current = map;

    return () => {
      // Fully clean up to prevent _leaflet_pos errors on remount
      if (clusterGroupRef.current) {
        clusterGroupRef.current.clearLayers();
        clusterGroupRef.current = null;
      }
      if (radiusCircleRef.current) {
        radiusCircleRef.current = null;
      }
      landmarkMarkersRef.current = []; // Clear array to prevent StrictMode duplicates
      
      const container = map.getContainer();
      if (container) {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('touchstart', handleTouch);
      }

      if (routingLineRef.current) {
        routingLineRef.current = null;
      }
      if (routingBadgeRef.current) {
        routingBadgeRef.current = null;
      }
      if (mapRef.current) {
        try {
          mapRef.current.off();
          mapRef.current.remove();
        } catch (error) {
          console.error("Leaflet cleanup error:", error);
        }
        mapRef.current = null;
      }
      if (containerRef.current) {
        (containerRef.current as any)._leaflet_id = null;
        containerRef.current.innerHTML = '';
      }
    };
  // Only rebuild the map when the theme changes — never on callback changes
  }, [resolvedTheme]);

  // Keep track of a temporary marker to show the starting point during Phase 2
  const tempSelectedMarkerRef = useRef<L.Marker | null>(null);

  // Toggle landmark/listing marker visibility based on directionsPhase
  useEffect(() => {
    const map = mapRef.current;
    const clusterGroup = clusterGroupRef.current;
    if (!map) return;

    if (directionsPhase === "start") {
      // Phase 1: Show listings only, hide landmarks
      landmarkMarkersRef.current.forEach(m => { if (map.hasLayer(m)) map.removeLayer(m); });
      if (clusterGroup && !map.hasLayer(clusterGroup)) map.addLayer(clusterGroup);
      
      // Cleanup temp marker
      if (tempSelectedMarkerRef.current) {
        map.removeLayer(tempSelectedMarkerRef.current);
        tempSelectedMarkerRef.current = null;
      }
    } else if (directionsPhase === "destination") {
      // Phase 2: Hide listings, show landmarks
      if (clusterGroup && map.hasLayer(clusterGroup)) map.removeLayer(clusterGroup);
      landmarkMarkersRef.current.forEach(m => { if (!map.hasLayer(m)) m.addTo(map); });
      
      // Create a temporary marker to keep the selected starting point visible
      if (selectedListingId && !tempSelectedMarkerRef.current) {
        const selectedListing = listings.find(l => l.id === selectedListingId);
        if (selectedListing) {
          const icon = createListingIcon(selectedListing, true);
          const marker = L.marker([(selectedListing as any).latitude, (selectedListing as any).longitude], { icon }).addTo(map);
          marker.setZIndexOffset(1000);
          tempSelectedMarkerRef.current = marker;
        }
      }
    } else {
      // No directions mode: show everything
      if (clusterGroup && !map.hasLayer(clusterGroup)) map.addLayer(clusterGroup);
      landmarkMarkersRef.current.forEach(m => { if (!map.hasLayer(m)) m.addTo(map); });
      
      // Cleanup temp marker
      if (tempSelectedMarkerRef.current) {
        map.removeLayer(tempSelectedMarkerRef.current);
        tempSelectedMarkerRef.current = null;
      }
    }
  }, [directionsPhase, selectedListingId, listings]);

  // ----------------------------------------------------------------------
  // EFFECT A: Initial Marker Creation (Depends ONLY on listings)
  // ----------------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    const clusterGroup = clusterGroupRef.current;
    if (!map || !clusterGroup || !map.getContainer()) return;

    clusterGroup.clearLayers();
    listingMarkersRef.current = {};

    const markers: L.Marker[] = [];

    listings.forEach(listing => {
      if (!(listing as any).latitude || !(listing as any).longitude) return;

      const unselectedIcon = createListingIcon(listing, false);
      const marker = L.marker([(listing as any).latitude, (listing as any).longitude], { icon: unselectedIcon });
      
      marker.on("click", () => {
        onListingClickRef.current(listing.id);
        // Do not use setView here, it disrupts the MarkerCluster's spiderfy logic.
        // We just let MarkerCluster handle the zoom if needed, or do nothing.
      });

      listingMarkersRef.current[listing.id] = marker;
      markers.push(marker);
    });

    clusterGroup.addLayers(markers);

  }, [listings]);

  // ----------------------------------------------------------------------
  // EFFECT B: Dynamic Styling (Depends on selectedListingId)
  // ----------------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getContainer()) return;

    // 1. Un-style the previously selected marker
    if (prevSelectedIdRef.current && listingMarkersRef.current[prevSelectedIdRef.current]) {
      const prevMarker = listingMarkersRef.current[prevSelectedIdRef.current];
      const prevListing = listings.find(l => l.id === prevSelectedIdRef.current);
      if (prevListing) {
        prevMarker.setIcon(createListingIcon(prevListing, false));
        prevMarker.setZIndexOffset(0);
      }
    }

    // 2. Style the newly selected marker
    if (selectedListingId && listingMarkersRef.current[selectedListingId]) {
      const newMarker = listingMarkersRef.current[selectedListingId];
      const newListing = listings.find(l => l.id === selectedListingId);
      if (newListing) {
        newMarker.setIcon(createListingIcon(newListing, true));
        newMarker.setZIndexOffset(1000); // Bring to front
        // Only pan if we are very far away, otherwise let spiderfy do its thing
        // NEVER pan if we are anywhere in the directions flow to preserve map context
        if (!directionsPhaseRef.current) {
          map.setView(
            [(newListing as any).latitude, (newListing as any).longitude], 
            map.getZoom() < 16 ? 16 : map.getZoom(), 
            { animate: false }
          );
        }
      }
    }

    // Update tracking ref
    prevSelectedIdRef.current = selectedListingId || null;

  }, [selectedListingId, listings]);

  // ----------------------------------------------------------------------
  // EFFECT C: Routing (Depends on routeDestination and selectedListingId)
  // ----------------------------------------------------------------------
  useEffect(() => {
    let isActive = true;
    const map = mapRef.current;
    if (!map) return;

    if (routingLineRef.current) map.removeLayer(routingLineRef.current);
    if (routingBadgeRef.current) map.removeLayer(routingBadgeRef.current);

    const activeListing = selectedListingId ? listings.find(l => l.id === selectedListingId) : null;

    if (activeListing && routeDestination) {
      const destLat = routeDestination[1];
      const destLng = routeDestination[0];
      const listingLat = (activeListing as any).latitude;
      const listingLng = (activeListing as any).longitude;
      
      const dist = map.distance([listingLat, listingLng], [destLat, destLng]);
      
      const fetchRoute = async () => {
        try {
          // OSRM expects lng,lat format for coordinates.
          const startCoord = `${listingLng},${listingLat}`;
          const endCoord = `${destLng},${destLat}`;
          const osrmUrl = `/api/routing?start=${startCoord}&end=${endCoord}`;
          const res = await fetch(osrmUrl);
          const data = await res.json();
          
          if (!isActive) return;

          if (routingLineRef.current) map.removeLayer(routingLineRef.current);
          if (routingBadgeRef.current) map.removeLayer(routingBadgeRef.current);

          if (data.routes && data.routes.length > 0) {
            const routeGeometry = data.routes[0].geometry;
            const latLngs = routeGeometry.coordinates.map((coord: number[]) => [coord[1], coord[0]] as L.LatLngTuple);
            
            routingLineRef.current = L.polyline(latLngs, {
              color: '#3b82f6',
              weight: 5,
              opacity: 0.8,
              className: 'animated-route'
            }).addTo(map);
            
            const midIndex = Math.floor(latLngs.length / 2);
            const midPoint = latLngs[midIndex] as L.LatLngTuple;
            
            const distMeters = data.routes[0].distance;
            const distText = distMeters >= 1000 ? `${(distMeters / 1000).toFixed(1)} km` : `${Math.round(distMeters)} m`;
            const walkMins = Math.ceil(data.routes[0].duration / 60);

            const badgeIcon = L.divIcon({
              className: 'walking-badge',
              html: `
                <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 dark:border-white/10 flex items-center gap-2 pointer-events-auto">
                  <div class="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-footprints"><path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/><path d="M16 17h4"/><path d="M4 13h4"/></svg>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-xs font-bold text-slate-800 dark:text-white leading-tight">${walkMins} min</span>
                    <span class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">${distText}</span>
                  </div>
                </div>
              `,
              iconSize: [110, 44],
              iconAnchor: [55, 22]
            });
            
            routingBadgeRef.current = L.marker(midPoint, { icon: badgeIcon }).addTo(map);

            // Frame the route perfectly between the top directions widget and bottom listing card
            if (routingLineRef.current) {
              map.fitBounds(routingLineRef.current.getBounds(), {
                paddingTopLeft: [50, 150],
                paddingBottomRight: [50, 320],
                animate: true,
                duration: 0.5
              });
            }
          }
        } catch (e) {
          console.error("Routing fetch failed:", e);
          if (!isActive) return;

          // Fallback to straight dashed line
          routingLineRef.current = L.polyline([[listingLat, listingLng], [destLat, destLng]], {
            color: '#3b82f6',
            weight: 4,
            dashArray: '10, 10',
            opacity: 0.7,
            className: 'animated-route'
          }).addTo(map);

          const midPoint = [
            (listingLat + destLat) / 2,
            (listingLng + destLng) / 2
          ] as L.LatLngTuple;

          const walkingMins = Math.max(1, Math.round((dist / 1000) * 12));
          const distText = dist >= 1000 ? `${(dist / 1000).toFixed(1)} km` : `${Math.round(dist)} m`;

          const badgeIcon = L.divIcon({
            className: 'walking-badge',
            html: `
                <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 dark:border-white/10 flex items-center gap-2 pointer-events-auto">
                  <div class="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-footprints"><path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/><path d="M16 17h4"/><path d="M4 13h4"/></svg>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-xs font-bold text-slate-800 dark:text-white leading-tight">~${walkingMins} min</span>
                    <span class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">${distText}</span>
                  </div>
                </div>
            `,
            iconSize: [110, 44],
            iconAnchor: [55, 22]
          });

          routingBadgeRef.current = L.marker(midPoint, { icon: badgeIcon }).addTo(map);

          if (routingLineRef.current) {
            map.fitBounds(routingLineRef.current.getBounds(), {
              paddingTopLeft: [50, 150],
              paddingBottomRight: [50, 320],
              animate: true,
              duration: 0.5
            });
          }
        }
      };
      
      fetchRoute();
    }

    return () => { isActive = false; };
  }, [routeDestination, selectedListingId, listings]);

  return (
    <>
      <div ref={containerRef} className="w-full h-full relative z-0" />
      <style dangerouslySetInnerHTML={{__html: `
        .animated-route { stroke-dashoffset: 100; animation: dash 2s linear infinite; }
        @keyframes dash { to { stroke-dashoffset: 0; } }
        .animate-pulse-slow { animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse-slow { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.4); opacity: 0.2; } }
        .custom-landmark-marker:hover .landmark-tooltip {
          opacity: 1 !important;
          transform: translateY(-50%) translateX(0px) !important;
        }
        .custom-price-marker:hover .listing-tooltip {
          opacity: 1 !important;
          transform: translateY(-50%) translateX(0px) !important;
        }
        .custom-price-marker:hover > div > div:first-child {
          transform: scale(1.08);
        }
      `}} />
    </>
  );
}

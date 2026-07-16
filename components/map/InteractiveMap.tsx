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
  onMapMoveEnd?: (bounds: L.LatLngBounds) => void; // For "Search this area"
}

export default function InteractiveMap({ onListingClick, onLandmarkClick, listings, selectedListingId, onMapMoveEnd }: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<any>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const routingLineRef = useRef<L.Polyline | null>(null);
  const routingBadgeRef = useRef<L.Marker | null>(null);
  const { resolvedTheme } = useTheme();
  
  // Track manual drags to trigger "Search this area"
  const isUserDragging = useRef(false);

  // Store callbacks in stable refs so they never force the map to remount
  const onLandmarkClickRef = useRef(onLandmarkClick);
  const onMapMoveEndRef = useRef(onMapMoveEnd);
  const onListingClickRef = useRef(onListingClick);
  useEffect(() => { onLandmarkClickRef.current = onLandmarkClick; }, [onLandmarkClick]);
  useEffect(() => { onMapMoveEndRef.current = onMapMoveEnd; }, [onMapMoveEnd]);
  useEffect(() => { onListingClickRef.current = onListingClick; }, [onListingClick]);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
    }).setView(TAU_COORDINATES, 15);
    
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const lightLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", { maxZoom: 20 });
    const darkLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { maxZoom: 20 });
    const satelliteLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19 });

    if (resolvedTheme === "dark") darkLayer.addTo(map);
    else lightLayer.addTo(map);

    L.control.layers({
      "Modern Light": lightLayer,
      "Modern Dark": darkLayer,
      "Satellite View": satelliteLayer
    }, undefined, { position: 'bottomright' }).addTo(map);

    // Modern Glassmorphism Landmark markers
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
        radiusCircleRef.current = L.circle(landmark.coords, { color: '#2F7D6D', fillColor: '#2F7D6D', fillOpacity: 0.15, radius: 1000 }).addTo(map);
        map.flyTo(landmark.coords, 15, { duration: 0.8 });
        onLandmarkClickRef.current(landmark);
      });
    });

    // Handle map movement for "Search this area"
    map.on('dragstart', () => { isUserDragging.current = true; });
    map.on('moveend', () => {
      if (isUserDragging.current && onMapMoveEndRef.current) {
        onMapMoveEndRef.current(map.getBounds());
      }
      isUserDragging.current = false;
    });

    clusterGroupRef.current = (L as any).markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 40,
      iconCreateFunction: function (cluster: any) {
        return L.divIcon({
          html: `<div class="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-[0_0_20px_rgba(47,125,109,0.6)] border-2 border-white dark:border-gray-800 transition-transform hover:scale-110">${cluster.getChildCount()}</div>`,
          className: 'custom-cluster-marker',
          iconSize: L.point(40, 40)
        });
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

  // Re-render listing markers whenever listings or selectedListingId change
  useEffect(() => {
    const map = mapRef.current;
    const clusterGroup = clusterGroupRef.current;
    if (!map || !clusterGroup || !map.getContainer()) return;

    clusterGroup.clearLayers();
    if (routingLineRef.current) map.removeLayer(routingLineRef.current);
    if (routingBadgeRef.current) map.removeLayer(routingBadgeRef.current);

    const markers: L.Marker[] = [];
    let selectedMarker: L.Marker | null = null;
    let selectedListing: any = null;

    listings.forEach(listing => {
      if (!(listing as any).latitude || !(listing as any).longitude) return;

      const formattedPrice = listing.price.toLocaleString();
      const isSelected = listing.id === selectedListingId;

      // Pick best available image
      const imgSrc = (typeof listing.imageSrc === 'string' && listing.imageSrc.startsWith('http'))
        ? listing.imageSrc
        : (Array.isArray((listing as any).images) && (listing as any).images[0]?.url)
          ? (listing as any).images[0].url
          : 'https://res.cloudinary.com/dtg0zavxl/image/upload/v1727878437/BoardTAU/Assets/bnnwtyyvsh42iyn33d5y.jpg';

      const pinSize = isSelected ? 56 : 44;
      const borderColor = isSelected ? '#f59e0b' : '#2f7d6d';
      const ringStyle = isSelected
        ? 'box-shadow:0 0 0 3px #f59e0b,0 8px_24px rgba(245,158,11,0.4);'
        : 'box-shadow:0 4px 16px rgba(0,0,0,0.18);';

      const priceIcon = L.divIcon({
        className: `custom-price-marker ${isSelected ? 'active-pin' : ''}`,
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;">
            <!-- Circular image pin -->
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
            <!-- Hover tooltip -->
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
      
      const marker = L.marker([(listing as any).latitude, (listing as any).longitude], { icon: priceIcon, zIndexOffset: isSelected ? 1000 : 0 });
      marker.on("click", () => {
        onListingClickRef.current(listing.id);
        map.flyTo([(listing as any).latitude, (listing as any).longitude], 16, { duration: 0.5 });
      });
      
      markers.push(marker);

      if (isSelected) {
        selectedMarker = marker;
        selectedListing = listing;
      }
    });

    clusterGroup.addLayers(markers);

    if (selectedMarker && selectedListing) {
      clusterGroup.zoomToShowLayer(selectedMarker);

      // Smart Walking Distance Routing (Calculate nearest college)
      let nearestCollege: any = null;
      let minDistance = Infinity;

      LANDMARKS.forEach(college => {
        const dist = map.distance([selectedListing.latitude, selectedListing.longitude], college.coords);
        if (dist < minDistance) { minDistance = dist; nearestCollege = college; }
      });

      if (nearestCollege && minDistance < 5000) { // Only draw if within 5km
        // Draw dashed line
        routingLineRef.current = L.polyline([[selectedListing.latitude, selectedListing.longitude], nearestCollege.coords], {
          color: '#3b82f6', // Blue route
          weight: 4,
          dashArray: '10, 10',
          opacity: 0.7,
          className: 'animated-route'
        }).addTo(map);

        // Add floating badge in the middle
        const midPoint = [
          (selectedListing.latitude + nearestCollege.coords[0]) / 2,
          (selectedListing.longitude + nearestCollege.coords[1]) / 2
        ] as L.LatLngTuple;

        const walkingMins = Math.max(1, Math.round((minDistance / 1000) * 12)); // Approx 12 mins per km

        const badgeIcon = L.divIcon({
          className: 'walking-badge',
          html: `<div class="bg-blue-500 text-white px-2 py-1 rounded-md text-[10px] font-bold shadow-md whitespace-nowrap">🚶‍♂️ ${walkingMins} min walk</div>`,
          iconSize: [80, 20],
          iconAnchor: [40, 10]
        });

        routingBadgeRef.current = L.marker(midPoint, { icon: badgeIcon }).addTo(map);
      }
    }

  }, [listings, selectedListingId, onListingClick]);

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

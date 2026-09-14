"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TAU_COORDINATES } from "@/utils/constants";
import { LocateFixed } from "lucide-react";
import { useTheme } from "next-themes";

// Tarlac Agricultural University (TAU) coordinates as default
const DEFAULT_CENTER: L.LatLngTuple = TAU_COORDINATES;

const LEAFLET_ICONS = "https://unpkg.com/leaflet@1.9.4/dist/images";
const defaultIcon = new L.Icon({
  iconUrl: `${LEAFLET_ICONS}/marker-icon.png`,
  iconRetinaUrl: `${LEAFLET_ICONS}/marker-icon-2x.png`,
  shadowUrl: `${LEAFLET_ICONS}/marker-shadow.png`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapProps {
  center?: number[];
  onLocationSelect?: (lat: number, lng: number) => void;
  onClick?: (lat: number, lng: number) => void;
  readonly?: boolean;
  scrollWheelZoom?: boolean;
  allowPinDrop?: boolean;
  landmarks?: { id: string; name: string; coords: [number, number]; logo?: string }[];
  activeLandmarkId?: string;
  onLandmarkClick?: (landmark: any) => void;
  radiusKm?: number;
  title?: string;
  imageSrc?: string;
}

const Map: React.FC<MapProps> = ({ 
  center, 
  onLocationSelect, 
  onClick, 
  readonly = false, 
  scrollWheelZoom = false,
  allowPinDrop = true,
  landmarks = [],
  activeLandmarkId,
  onLandmarkClick,
  radiusKm,
  title,
  imageSrc
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const radiusLayerRef = useRef<L.Circle | null>(null);
  const landmarksLayerRef = useRef<L.LayerGroup | null>(null);
  const isMapInitialized = useRef(false);
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";
  const badgeBg = isDark ? "#0f172a" : "#ffffff";
  const badgeTextColor = isDark ? "#ffffff" : "#0f172a";
  const badgeBorderColor = isDark ? "#2f7d6d" : "rgba(47,125,109,0.4)";
  const badgeShadow = isDark 
    ? "0 4px 14px rgba(0,0,0,0.4)" 
    : "0 4px 14px rgba(0,0,0,0.12), 0 0 0 1px rgba(47,125,109,0.15)";

  const getMarkerIcon = (propertyTitle?: string, photoSrc?: string) => {
    const titleText = propertyTitle || "Property Location";
    const activeLogo = photoSrc;

    const logoHtml = activeLogo
      ? `<img src="${activeLogo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

    return L.divIcon({
      className: "custom-landlord-pin-marker",
      html: `
        <div style="position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;pointer-events:auto;transform:translate(-50%, -50%);">
          <div style="width:42px;height:42px;border-radius:50%;background:${activeLogo ? '#ffffff' : '#2f7d6d'};border:3px solid ${activeLogo ? '#2f7d6d' : '#ffffff'};box-shadow:0 8px 24px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;color:#ffffff;overflow:hidden;flex-shrink:0;">
            ${logoHtml}
          </div>
          <div style="background:${badgeBg};color:${badgeTextColor};padding:4px 10px;border-radius:10px;font-size:10.5px;font-weight:800;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;letter-spacing:0.02em;text-transform:uppercase;white-space:nowrap;margin-top:4px;box-shadow:${badgeShadow};border:1.5px solid ${badgeBorderColor};display:flex;align-items:center;gap:5px;">
            <span style="width:6px;height:6px;border-radius:50%;background:#2f7d6d;display:inline-block;flex-shrink:0;"></span>
            ${titleText}
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  };

  // Keep refs for callbacks & props so they can be accessed inside event listeners without rebuilding map
  const onLandmarkClickRef = useRef(onLandmarkClick);
  const titleRef = useRef(title);
  const imageSrcRef = useRef(imageSrc);
  useEffect(() => { onLandmarkClickRef.current = onLandmarkClick; }, [onLandmarkClick]);
  useEffect(() => { titleRef.current = title; }, [title]);
  useEffect(() => { imageSrcRef.current = imageSrc; }, [imageSrc]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Safety check: if container already has _leaflet_id or mapRef is active, clean it up before re-creating
    if ((containerRef.current as any)._leaflet_id || mapRef.current) {
      if (mapRef.current) {
        try {
          mapRef.current.off();
          mapRef.current.remove();
        } catch (e) {
          // ignore
        }
        mapRef.current = null;
      }
      (containerRef.current as any)._leaflet_id = null;
      containerRef.current.innerHTML = "";
    }

    try {
      const hasValidPin = Boolean(center && center.length === 2 && center[0] !== 0 && center[1] !== 0);
      const initialCenter: L.LatLngTuple = hasValidPin ? (center as L.LatLngTuple) : DEFAULT_CENTER;

      const map = L.map(containerRef.current, {
        scrollWheelZoom: scrollWheelZoom,
        attributionControl: false,
      }).setView(initialCenter, 16);

      const isDark = resolvedTheme === "dark";
      const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        className: isDark ? "dark-map-tiles" : "",
      }).addTo(map);

      const currentIcon = getMarkerIcon(titleRef.current, imageSrcRef.current);

      // Add click event listener for location selection and auto-fill (Only if not readonly)
      if (!readonly) {
        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          
          if (allowPinDrop) {
            const dynamicIcon = getMarkerIcon(titleRef.current, imageSrcRef.current);
            if (markerRef.current && map.hasLayer(markerRef.current)) {
              markerRef.current.setLatLng(e.latlng);
              markerRef.current.setIcon(dynamicIcon);
            } else {
              if (markerRef.current) {
                try { markerRef.current.remove(); } catch (err) {}
              }
              markerRef.current = L.marker(e.latlng, { icon: dynamicIcon, zIndexOffset: 1000 }).addTo(map);
            }
          }
          
          if (onLocationSelect) {
            onLocationSelect(lat, lng);
          }
          if (onClick) {
            onClick(lat, lng);
          }
        });
      }

      // Initialize marker on map load
      if (markerRef.current) {
        try { markerRef.current.remove(); } catch (e) {}
        markerRef.current = null;
      }
      markerRef.current = L.marker(initialCenter, { icon: currentIcon, zIndexOffset: 1000 }).addTo(map);

      // Landmarks Layer Group
      landmarksLayerRef.current = L.layerGroup().addTo(map);

      mapRef.current = map;
      isMapInitialized.current = true;

      // Invalidate size and re-align map view after layout animation pass
      const invalidateTimer = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
          mapRef.current.setView(initialCenter, 16);
        }
      }, 120);

      const resizeObserver = new ResizeObserver(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(containerRef.current);

      return () => {
        clearTimeout(invalidateTimer);
        resizeObserver.disconnect();
      };

    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (radiusLayerRef.current) {
        radiusLayerRef.current.remove();
        radiusLayerRef.current = null;
      }
      if (landmarksLayerRef.current) {
        landmarksLayerRef.current.clearLayers();
        landmarksLayerRef.current = null;
      }
      if (markerRef.current) {
        try { markerRef.current.remove(); } catch (e) {}
        markerRef.current = null;
      }
      if (mapRef.current) {
        try {
          mapRef.current.off();
          mapRef.current.remove();
        } catch (error) {
          console.error('Error removing map:', error);
        }
        mapRef.current = null;
        isMapInitialized.current = false;
      }
      if (containerRef.current) {
        (containerRef.current as any)._leaflet_id = null;
        containerRef.current.innerHTML = '';
      }
    };
  }, [resolvedTheme]);

  // Update marker position & map view smoothly when center coordinates change
  const targetLat = (center && center[0] && center[0] !== 0) ? center[0] : DEFAULT_CENTER[0];
  const targetLng = (center && center[1] && center[1] !== 0) ? center[1] : DEFAULT_CENTER[1];
  const safeTitle = title ?? '';
  const safeImageSrc = imageSrc ?? '';

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapInitialized.current || !map.getContainer()) return;

    try {
      const latlng: L.LatLngTuple = [targetLat, targetLng];
      if (typeof map.invalidateSize === 'function') {
        map.invalidateSize();
      }

      const currentIcon = getMarkerIcon(safeTitle, safeImageSrc);

      if (markerRef.current && map.hasLayer(markerRef.current)) {
        markerRef.current.setLatLng(latlng);
        markerRef.current.setIcon(currentIcon);
      } else {
        if (markerRef.current) {
          try { markerRef.current.remove(); } catch (e) {}
        }
        markerRef.current = L.marker(latlng, { icon: currentIcon, zIndexOffset: 1000 }).addTo(map);
      }

      map.setView(latlng, map.getZoom() < 16 ? 16 : map.getZoom(), { animate: true });
    } catch (mapError) {
      console.error('Map update error:', mapError);
    }
  }, [targetLat, targetLng, safeTitle, safeImageSrc]);


  // Update Radius Circle
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapInitialized.current) return;

    // Remove existing circle if present
    if (radiusLayerRef.current) {
      radiusLayerRef.current.remove();
      radiusLayerRef.current = null;
    }

    if (radiusKm && radiusKm > 0) {
      const latlng = (center && center.length === 2 && center[0] !== null && center[1] !== null)
        ? (center as L.LatLngExpression)
        : DEFAULT_CENTER;

      const circle = L.circle(latlng, {
        radius: radiusKm * 1000,
        color: '#2F7D6D',
        fillColor: '#2F7D6D',
        fillOpacity: 0.15,
        weight: 2.5,
        dashArray: '6, 6'
      }).addTo(map);

      radiusLayerRef.current = circle;

      // Automatically fit map view to the radius circle bounds
      try {
        map.fitBounds(circle.getBounds(), { padding: [20, 20], maxZoom: 15 });
      } catch (e) {
        console.error("Error fitting radius bounds:", e);
      }
    }
  }, [radiusKm, center]);

  // Update landmarks
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapInitialized.current || !landmarksLayerRef.current) return;

    const layerGroup = landmarksLayerRef.current;
    layerGroup.clearLayers();

    if (landmarks && landmarks.length > 0) {
      landmarks.forEach((landmark) => {
        const isActive = activeLandmarkId === landmark.id;
        
        const landmarkIcon = L.divIcon({
          className: "custom-landmark-marker group",
          html: `
            <div class="relative flex items-center justify-center cursor-pointer group">
              ${isActive ? `
                <div class="absolute w-12 h-12 rounded-full animate-pulse pointer-events-none" style="background-color: rgba(13,148,136,0.25);"></div>
                <div class="absolute w-8 h-8 rounded-full animate-ping pointer-events-none" style="background-color: rgba(13,148,136,0.45);"></div>
              ` : ''}
              <div class="relative z-10 ${isActive ? 'w-12 h-12' : 'w-9 h-9'} rounded-full bg-white shadow-[0_6px_16px_rgba(0,0,0,0.18)] flex items-center justify-center transition-all duration-300 group-hover:scale-110" style="border: ${isActive ? '3px' : '2px'} solid #0D9488;">
                ${landmark.logo
                  ? `<img src="${landmark.logo}" alt="${landmark.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
                  : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D9488" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`
                }
              </div>
              <div style="position:absolute;bottom:100%;left:50%;transform:translateX(-50%) translateY(-4px);opacity:0;transition:all 0.2s ease;pointer-events:none;white-space:nowrap;padding:5px 10px;border-radius:8px;font-size:11px;font-weight:700;font-family:'Inter',sans-serif;z-index:50;" class="landmark-tooltip">
                ${landmark.name}
              </div>
            </div>
          `,
          iconSize: isActive ? [48, 48] : [36, 36],
          iconAnchor: isActive ? [24, 24] : [18, 18]
        });

        const marker = L.marker(landmark.coords, { icon: landmarkIcon, zIndexOffset: isActive ? 1000 : 0 }).addTo(layerGroup);
        marker.on("click", () => {
          if (onLandmarkClickRef.current) {
            onLandmarkClickRef.current(landmark);
          }
        });
      });
    }
  }, [landmarks, activeLandmarkId]);

  const handleRecenter = () => {
    if (mapRef.current) {
      const latlng = (center && center.length === 2 && center[0] !== null && center[1] !== null) 
        ? (center as L.LatLngExpression) 
        : DEFAULT_CENTER;
      const zoom = center ? 15 : 15;
      mapRef.current.setView(latlng, zoom, { animate: true });
    }
  };

  return (
    <div className="relative h-full w-full rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-md group">
      <div ref={containerRef} className="h-full w-full z-0" />
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleRecenter();
        }}
        className="absolute bottom-3 right-3 z-[1000] p-2.5 rounded-xl bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-800 shadow-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
        title="Recenter Map to Campus Center"
      >
        <LocateFixed size={18} />
      </button>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-landmark-marker:hover .landmark-tooltip {
          opacity: 1 !important;
          transform: translateX(-50%) translateY(-10px) !important;
        }
        .landmark-tooltip {
          background: rgba(255, 255, 255, 0.95) !important;
          color: #0f172a !important;
          border: 1px solid rgba(226, 232, 240, 0.9) !important;
          border-left: 3.5px solid #0D9488 !important;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
        }
        .dark .landmark-tooltip {
          background: rgba(15, 23, 42, 0.95) !important;
          color: #f8fafc !important;
          border: 1px solid rgba(30, 41, 59, 0.9) !important;
          border-left: 3.5px solid #0D9488 !important;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4) !important;
        }
        .dark-map-tiles {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7) !important;
        }
        .custom-landlord-pin-marker {
          background: transparent !important;
          border: none !important;
          overflow: visible !important;
        }
      `}} />
    </div>
  );
};

export default Map;

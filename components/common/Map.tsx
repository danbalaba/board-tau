"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TAU_COORDINATES } from "@/utils/constants";
import { LocateFixed } from "lucide-react";

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
  radiusKm
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const radiusLayerRef = useRef<L.Circle | null>(null);
  const landmarksLayerRef = useRef<L.LayerGroup | null>(null);
  const isMapInitialized = useRef(false);

  // Keep refs for callbacks so they can be accessed inside event listeners without rebuilding map
  const onLandmarkClickRef = useRef(onLandmarkClick);
  useEffect(() => { onLandmarkClickRef.current = onLandmarkClick; }, [onLandmarkClick]);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      const map = L.map(containerRef.current, {
        scrollWheelZoom: scrollWheelZoom,
        attributionControl: false,
      }).setView(DEFAULT_CENTER, 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      }).addTo(map);

      // Add click event listener for location selection and auto-fill (Only if not readonly)
      if (!readonly) {
        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          
          if (allowPinDrop) {
            // Update marker position
            if (markerRef.current) {
              markerRef.current.setLatLng(e.latlng);
            } else {
              markerRef.current = L.marker(e.latlng, { icon: defaultIcon }).addTo(map);
            }
          }
          
          // Call both callbacks
          if (onLocationSelect) {
            onLocationSelect(lat, lng);
          }
          if (onClick) {
            onClick(lat, lng);
          }
        });
      }

      // Initialize marker (if allowPinDrop is true, or if we have an explicit center)
      if (!markerRef.current && (allowPinDrop || center)) {
        const initialLatLng = (center && center.length === 2) ? center as L.LatLngTuple : DEFAULT_CENTER;
        markerRef.current = L.marker(initialLatLng, { icon: defaultIcon }).addTo(map);
      }

      // Landmarks Layer Group
      landmarksLayerRef.current = L.layerGroup().addTo(map);

      mapRef.current = map;
      isMapInitialized.current = true;

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
      if (mapRef.current) {
        try {
          mapRef.current.off();
          mapRef.current.remove();
        } catch (error) {
          console.error('Error removing map:', error);
        }
        mapRef.current = null;
        isMapInitialized.current = false;
        markerRef.current = null;
      }
      if (containerRef.current) {
        (containerRef.current as any)._leaflet_id = null;
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  // Update marker when center prop changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapInitialized.current || !map.getContainer()) return;

    try {
      const latlng = (center && center.length === 2 && center[0] !== null && center[1] !== null) 
        ? (center as L.LatLngExpression) 
        : DEFAULT_CENTER;
      const zoom = center ? 14 : 12;

      map.setView(latlng, zoom);

      if (center && center.length >= 2 && allowPinDrop) {
        if (markerRef.current) {
          markerRef.current.setLatLng(latlng);
        } else {
          markerRef.current = L.marker(latlng, { icon: defaultIcon }).addTo(map);
        }
      }
    } catch (mapError) {
      console.error('Map error:', mapError);
    }
  }, [center, allowPinDrop]);

  // Update Radius Circle
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapInitialized.current) return;

    // Remove existing circle if present
    if (radiusLayerRef.current) {
      radiusLayerRef.current.remove();
      radiusLayerRef.current = null;
    }

    if (radiusKm && center && center.length === 2 && center[0] !== null && center[1] !== null) {
      const latlng = center as L.LatLngExpression;
      radiusLayerRef.current = L.circle(latlng, {
        radius: radiusKm * 1000,
        color: '#2F7D6D',
        fillColor: '#2F7D6D',
        fillOpacity: 0.1,
        weight: 2,
        dashArray: '5, 5'
      }).addTo(map);
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
                <div class="absolute w-12 h-12 rounded-full animate-pulse pointer-events-none" style="background-color: rgba(47,125,109,0.2);"></div>
                <div class="absolute w-8 h-8 rounded-full animate-ping pointer-events-none" style="background-color: rgba(47,125,109,0.4);"></div>
              ` : ''}
              <div class="relative z-10 ${isActive ? 'w-14 h-14' : 'w-10 h-10'} rounded-full bg-white shadow-[0_8px_20px_rgba(0,0,0,0.18)] flex items-center justify-center transition-all duration-300 group-hover:scale-110" style="border: ${isActive ? '3px' : '2px'} solid var(--primary-color);">
                ${landmark.logo
                  ? `<img src="${landmark.logo}" alt="${landmark.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
                  : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`
                }
              </div>
            </div>
          `,
          iconSize: isActive ? [56, 56] : [40, 40],
          iconAnchor: isActive ? [28, 28] : [20, 20]
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
      const zoom = center ? 14 : 12;
      mapRef.current.setView(latlng, zoom, { animate: true });
    }
  };

  return (
    <div className="relative h-full w-full group">
      <div ref={containerRef} className="h-full w-full rounded-lg z-0" />
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleRecenter();
        }}
        className="absolute top-4 right-4 z-[1000] bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-primary transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 hover:scale-105 active:scale-95"
        title="Recenter to pin"
      >
        <LocateFixed size={20} className="text-primary" />
      </button>
    </div>
  );
};

export default Map;

"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TAU_COORDINATES } from "@/utils/constants";

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
  onDoubleClick?: (lat: number, lng: number) => void;
}

const Map: React.FC<MapProps> = ({ center, onLocationSelect, onDoubleClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const isMapInitialized = useRef(false);

  useEffect(() => {
    if (!containerRef.current || isMapInitialized.current) return;

    try {
      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
      }).setView(DEFAULT_CENTER, 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add click event listener for location selection
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (onLocationSelect) {
          onLocationSelect(lat, lng);
        }
      });

      // Add double-click event listener
      map.on('dblclick', (e) => {
        const { lat, lng } = e.latlng;
        if (onDoubleClick) {
          onDoubleClick(lat, lng);
        }
      });

      mapRef.current = map;
      isMapInitialized.current = true;
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (mapRef.current && mapRef.current.getContainer()) {
        try {
          mapRef.current.remove();
        } catch (error) {
          console.error('Error removing map:', error);
        }
        mapRef.current = null;
        isMapInitialized.current = false;
        markerRef.current = null;
      }
    };
  }, [onLocationSelect, onDoubleClick]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapInitialized.current || !map.getContainer()) return;

    try {
      const latlng = (center as L.LatLngExpression) || DEFAULT_CENTER;
      const zoom = center ? 14 : 12;

      // Update map view
      map.setView(latlng, zoom);

      // Update marker
      if (center && center.length >= 2) {
        try {
          // If marker exists, update position
          if (markerRef.current) {
            markerRef.current.setLatLng(latlng);
          } else {
            // If marker doesn't exist, create new one
            markerRef.current = L.marker(latlng, { icon: defaultIcon }).addTo(map);
          }
        } catch (error) {
          console.error('Error updating marker:', error);
          // If there's an error, try to recreate the marker
          if (markerRef.current) {
            try {
              map.removeLayer(markerRef.current);
            } catch (removeError) {
              console.error('Error removing marker:', removeError);
            }
            markerRef.current = null;
          }
          markerRef.current = L.marker(latlng, { icon: defaultIcon }).addTo(map);
        }
      }
    } catch (mapError) {
      console.error('Map error:', mapError);
      // If map has an error, try to reset it
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        isMapInitialized.current = false;
        markerRef.current = null;
      }
    }
  }, [center]);

  return <div ref={containerRef} className="h-full rounded-lg" />;
};

export default Map;

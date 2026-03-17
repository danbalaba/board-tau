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
  onClick?: (lat: number, lng: number) => void;
}

const Map: React.FC<MapProps> = ({ center, onLocationSelect, onClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const isMapInitialized = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
      }).setView(DEFAULT_CENTER, 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add click event listener for location selection and auto-fill
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        
        // Update marker position
        if (markerRef.current) {
          markerRef.current.setLatLng(e.latlng);
        } else {
          markerRef.current = L.marker(e.latlng, { icon: defaultIcon }).addTo(map);
        }
        
        // Call both callbacks
        if (onLocationSelect) {
          onLocationSelect(lat, lng);
        }
        if (onClick) {
          onClick(lat, lng);
        }
      });

      // Initialize marker
      if (!markerRef.current) {
        const initialLatLng = (center && center.length === 2) ? center as L.LatLngTuple : DEFAULT_CENTER;
        markerRef.current = L.marker(initialLatLng, { icon: defaultIcon }).addTo(map);
      }

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
  }, []);

  // Update marker when center prop changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapInitialized.current || !map.getContainer()) return;

    try {
      const latlng = (center as L.LatLngExpression) || DEFAULT_CENTER;
      const zoom = center ? 14 : 12;

      map.setView(latlng, zoom);

      if (center && center.length >= 2) {
        if (markerRef.current) {
          markerRef.current.setLatLng(latlng);
        } else {
          markerRef.current = L.marker(latlng, { icon: defaultIcon }).addTo(map);
        }
      }
    } catch (mapError) {
      console.error('Map error:', mapError);
    }
  }, [center]);

  return <div ref={containerRef} className="h-full rounded-lg" />;
};

export default Map;

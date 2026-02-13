"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TAU_COORDINATES } from "@/utils/constants";

const DEFAULT_CENTER = TAU_COORDINATES as L.LatLngTuple;

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
}

const Map: React.FC<MapProps> = ({ center }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
      scrollWheelZoom: false,
    }).setView(DEFAULT_CENTER, 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const latlng = (center as L.LatLngExpression) || DEFAULT_CENTER;
    const zoom = center ? 14 : 12;

    map.setView(latlng, zoom);

    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    if (center && center.length >= 2) {
      markerRef.current = L.marker(center as L.LatLngTuple, { icon: defaultIcon }).addTo(map);
    }
  }, [center]);

  return <div ref={containerRef} className="h-full rounded-lg" />;
};

export default Map;

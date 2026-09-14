import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed } from "lucide-react";
import { useTheme } from "next-themes";

interface PresetItem {
  code: string;
  name: string;
  lat: string;
  lng: string;
  logoUrl?: string;
}

interface LandmarkMapPickerProps {
  latitude: number | string;
  longitude: number | string;
  onSelectLocation: (lat: number, lng: number) => void;
  presets?: PresetItem[];
  logoUrl?: string;
}

export default function LandmarkMapPicker({
  latitude,
  longitude,
  onSelectLocation,
  presets = [],
  logoUrl,
}: LandmarkMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const selectedMarkerRef = useRef<L.Marker | null>(null);
  const onSelectRef = useRef(onSelectLocation);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    onSelectRef.current = onSelectLocation;
  }, [onSelectLocation]);

  const numLat = parseFloat(latitude?.toString() || "15.6352");
  const numLng = parseFloat(longitude?.toString() || "120.4154");

  // Create Pin Icon for Selected Point
  const createPinIcon = (currentLogo?: string) => {
    const activeLogo = currentLogo || logoUrl;
    if (activeLogo) {
      return L.divIcon({
        className: "selected-location-pin-logo",
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;">
            <div style="width:44px;height:44px;border-radius:50%;background:#ffffff;border:3px solid #f59e0b;box-shadow:0 8px 20px rgba(245,158,11,0.4);display:flex;align-items:center;justify-content:center;overflow:hidden;padding:3px;transition:all 0.3s ease;">
              <img src="${activeLogo}" style="width:100%;height:100%;object-fit:contain;border-radius:50%;" />
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });
    }

    return L.divIcon({
      className: "selected-location-pin",
      html: `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;">
          <div style="width:38px;height:38px;border-radius:50%;background:#f59e0b;border:3px solid #fff;box-shadow:0 6px 16px rgba(245,158,11,0.4);display:flex;align-items:center;justify-content:center;color:#fff;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Leaflet map instance
    const initialLat = isNaN(numLat) ? 15.6352 : numLat;
    const initialLng = isNaN(numLng) ? 120.4154 : numLng;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      preferCanvas: true,
    }).setView([initialLat, initialLng], 16);

    const isDark = resolvedTheme === "dark";
    const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      className: isDark ? "dark-map-tiles" : "",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const tooltipBg = isDark ? "#0f172a" : "#ffffff";
    const tooltipText = isDark ? "#ffffff" : "#0f172a";
    const tooltipBorder = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";

    // Render static presets pins matching InteractiveMap.tsx glass pin design
    presets.forEach((preset) => {
      const pLat = parseFloat(preset.lat);
      const pLng = parseFloat(preset.lng);
      if (!isNaN(pLat) && !isNaN(pLng)) {
        const hasLogo = Boolean(preset.logoUrl);
        const presetIcon = L.divIcon({
          className: "preset-landmark-pin group",
          html: `
            <div style="position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;">
              <div style="position:relative;z-index:10;width:36px;height:36px;border-radius:50%;background:#ffffff;box-shadow:0 6px 16px rgba(0,0,0,0.18);display:flex;align-items:center;justify-content:center;border:2.5px solid #f59e0b;overflow:hidden;transition:transform 0.2s ease;" class="hover:scale-110">
                ${hasLogo 
                  ? `<img src="${preset.logoUrl}" alt="${preset.code}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />` 
                  : `<span style="font-size:10px;font-weight:900;color:#f59e0b;font-family:sans-serif;">${preset.code}</span>`
                }
              </div>
              <div style="
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%) translateY(-4px);
                opacity: 0;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                pointer-events: none;
                white-space: nowrap;
                background: ${tooltipBg};
                color: ${tooltipText};
                padding: 5px 10px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 700;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                letter-spacing: 0.01em;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
                border-left: 3px solid #f59e0b;
                border-top: 1px solid ${tooltipBorder};
                border-right: 1px solid ${tooltipBorder};
                border-bottom: 1px solid ${tooltipBorder};
                z-index: 50;
              " class="preset-tooltip">
                ${preset.name || preset.code}
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const pMarker = L.marker([pLat, pLng], { icon: presetIcon }).addTo(map);
        pMarker.on("click", () => {
          onSelectRef.current(pLat, pLng);
        });
      }
    });

    // Initial marker if lat/lng available
    if (!isNaN(initialLat) && !isNaN(initialLng)) {
      const marker = L.marker([initialLat, initialLng], {
        icon: createPinIcon(logoUrl),
        draggable: true,
      }).addTo(map);

      marker.on("dragend", (e: any) => {
        const pos = e.target.getLatLng();
        onSelectRef.current(pos.lat, pos.lng);
      });

      selectedMarkerRef.current = marker;
    }

    // Map Click Listener
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng], {
          icon: createPinIcon(logoUrl),
          draggable: true,
        }).addTo(map);

        marker.on("dragend", (ev: any) => {
          const pos = ev.target.getLatLng();
          onSelectRef.current(pos.lat, pos.lng);
        });

        selectedMarkerRef.current = marker;
      }

      onSelectRef.current(lat, lng);
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (containerRef.current) {
        (containerRef.current as any)._leaflet_id = null;
      }
    };
  }, [resolvedTheme]);

  // Update selected marker position when lat/lng change externally (e.g. preset click)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!isNaN(numLat) && !isNaN(numLng)) {
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.setLatLng([numLat, numLng]);
        selectedMarkerRef.current.setIcon(createPinIcon(logoUrl));
      }
      map.setView([numLat, numLng], map.getZoom() < 16 ? 16 : map.getZoom(), { animate: true });
    }
  }, [numLat, numLng, logoUrl]);

  const handleRecenter = () => {
    if (mapRef.current) {
      const targetLat = isNaN(numLat) ? 15.6352 : numLat;
      const targetLng = isNaN(numLng) ? 120.4154 : numLng;
      mapRef.current.setView([targetLat, targetLng], 16, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-[260px] rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-md group">
      <div ref={containerRef} className="w-full h-full z-0" onWheel={(e) => e.stopPropagation()} />

      {/* Theme-Adaptive Floating Instructions Banner */}
      <div className="absolute top-3 left-14 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-[11px] font-bold shadow-lg pointer-events-none flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
        <span>Click anywhere on map or drag pin to select GPS coordinates</span>
      </div>

      {/* Recenter Map Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleRecenter();
        }}
        className="absolute bottom-3 right-3 z-[1000] p-2.5 rounded-xl bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-800 shadow-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
        title="Recenter Map to Selected Location"
      >
        <LocateFixed size={18} />
      </button>

      <style dangerouslySetInnerHTML={{__html: `
        .preset-landmark-pin:hover .preset-tooltip {
          opacity: 1 !important;
          transform: translateX(-50%) translateY(-10px) !important;
        }
        .dark-map-tiles {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7) !important;
        }
      `}} />
    </div>
  );
}

import {
  FaWifi,
  FaUtensils,
  FaTint,
  FaLock,
  FaMotorcycle,
  FaTv,
  FaStore
} from "react-icons/fa";
import { IconType } from "react-icons";

/** BoardTAU Step 6 — Listing-level amenities (secondary filters). */
export const amenities: { label: string; value: string; icon: IconType; description?: string }[] = [
  { label: "WiFi", value: "WiFi", icon: FaWifi, description: "Fast, reliable internet access provided for tenants." },
  { label: "Laundry Area", value: "Laundry Area", icon: FaTint, description: "Designated space with facilities for washing clothes." },
  { label: "Motorcycle Parking", value: "Parking", icon: FaMotorcycle, description: "Safe, secure parking space exclusively for motorcycles or bicycles." },
  { label: "Gated Compound", value: "Gated / Secure", icon: FaLock, description: "Property is enclosed by a gate or fence for enhanced security." },
  { label: "Water Dispenser", value: "Water Dispenser", icon: FaTint, description: "Shared drinking water dispenser available for tenants." },
  { label: "Kitchen Access", value: "Kitchen Access", icon: FaUtensils, description: "Shared kitchen area where tenants can cook their meals." },
  { label: "Common TV", value: "Common TV", icon: FaTv, description: "Shared television area for entertainment and socializing." },
  { label: "Sari-Sari Store", value: "Store Nearby", icon: FaStore, description: "A small convenience store located within or right next to the property." },
];

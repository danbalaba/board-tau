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
export const amenities: { label: string; value: string; icon: IconType }[] = [
  { label: "WiFi", value: "WiFi", icon: FaWifi },
  { label: "Laundry Area", value: "Laundry Area", icon: FaTint },
  { label: "Motorcycle Parking", value: "Parking", icon: FaMotorcycle },
  { label: "Gated Compound", value: "Gated / Secure", icon: FaLock },
  { label: "Water Dispenser", value: "Water Dispenser", icon: FaTint },
  { label: "Kitchen Access", value: "Kitchen Access", icon: FaUtensils },
  { label: "Common TV", value: "Common TV", icon: FaTv },
  { label: "Sari-Sari Store", value: "Store Nearby", icon: FaStore },
];

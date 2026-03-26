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
  { label: "WiFi / Internet", value: "WiFi", icon: FaWifi },
  { label: "Laundry Area / Sampayan", value: "Laundry Area", icon: FaTint },
  { label: "Motorcycle / Bicycle Parking", value: "Parking", icon: FaMotorcycle },
  { label: "Gated / Secure Compound", value: "Gated / Secure", icon: FaLock },
  { label: "Water Dispenser (Free Drinking Water)", value: "Water Dispenser", icon: FaTint },
  { label: "Kitchen / Cooking Allowed", value: "Kitchen Access", icon: FaUtensils },
  { label: "Common TV / Lounge Area", value: "Common TV", icon: FaTv },
  { label: "Sari-Sari Store / Canteen Nearby", value: "Store Nearby", icon: FaStore },
];

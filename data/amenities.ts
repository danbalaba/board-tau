import {
  FaWifi,
  FaUtensils,
  FaTint,
  FaBook,
  FaLock,
  FaParking,
  FaClock,
} from "react-icons/fa";
import { IconType } from "react-icons";

/** BoardTAU Step 6 — Listing-level amenities (secondary filters). */
export const amenities: { label: string; value: string; icon: IconType }[] = [
  { label: "WiFi / Internet", value: "WiFi / Internet", icon: FaWifi },
  { label: "Laundry Area / Washer", value: "Laundry Area / Washer", icon: FaTint },
  { label: "Parking / Garage", value: "Parking / Garage", icon: FaParking },
  { label: "Gated / Secure", value: "Gated / Secure", icon: FaLock },
  { label: "Study Room / Common Area", value: "Study Room / Common Area", icon: FaBook },
  { label: "Kitchen / Shared Kitchen", value: "Kitchen / Shared Kitchen", icon: FaUtensils },
  { label: "Elevator / Accessible", value: "Elevator / Accessible", icon: FaLock },
  { label: "Gym / Pool / Recreation", value: "Gym / Pool / Recreation", icon: FaBook },
];

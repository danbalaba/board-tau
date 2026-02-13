import {
  FaWifi,
  FaBath,
  FaRestroom,
  FaUtensils,
  FaTint,
  FaThermometerHalf,
  FaBook,
  FaLock,
  FaParking,
  FaClock,
} from "react-icons/fa";
import { IconType } from "react-icons";

/** BoardTAU Step 4 — essential amenities (multi-select). */
export const amenities: { label: string; value: string; icon: IconType }[] = [
  { label: "WiFi", value: "WiFi", icon: FaWifi },
  { label: "Own CR", value: "Own CR", icon: FaBath },
  { label: "Shared CR", value: "Shared CR", icon: FaRestroom },
  { label: "Kitchen Access", value: "Kitchen Access", icon: FaUtensils },
  { label: "Laundry Area", value: "Laundry Area", icon: FaTint },
  { label: "Air Conditioning", value: "Air Conditioning", icon: FaThermometerHalf },
  { label: "Study Area / Quiet Room", value: "Study Area / Quiet Room", icon: FaBook },
  { label: "Gated / Secure", value: "Gated / Secure", icon: FaLock },
  { label: "Parking", value: "Parking", icon: FaParking },
  { label: "Curfew Enforced", value: "Curfew Enforced", icon: FaClock },
];

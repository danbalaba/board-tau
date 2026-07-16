import { IconType } from "react-icons";
import {
  MdSecurity,
  MdOutlineVideocam,
  MdDirectionsBus,
  MdSchool,
} from "react-icons/md";

export const advancedFilters: { label: string; value: string; icon: IconType; description?: string }[] = [
  { label: "24/7 Security", value: "security24h", icon: MdSecurity, description: "Property has round-the-clock security personnel." },
  { label: "CCTV Cameras", value: "cctv", icon: MdOutlineVideocam, description: "Common areas are monitored by CCTV cameras." },
  { label: "Near Transport", value: "nearTransport", icon: MdDirectionsBus, description: "Easily accessible public transportation nearby." },
  { label: "Fire Safety", value: "fireSafety", icon: MdSecurity, description: "Equipped with fire extinguishers or alarms." },
  { label: "Flood-Free Area", value: "floodFree", icon: MdSecurity, description: "Located in an area not prone to flooding." },
  { label: "Backup Power", value: "backupPower", icon: MdSecurity, description: "Property has a generator or backup power supply." },
];

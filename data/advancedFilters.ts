import { IconType } from "react-icons";
import {
  MdSecurity,
  MdOutlineVideocam,
  MdDirectionsBus,
  MdSchool,
} from "react-icons/md";

export const advancedFilters: { label: string; value: string; icon: IconType }[] = [
  { label: "24/7 Security", value: "security24h", icon: MdSecurity },
  { label: "CCTV Cameras", value: "cctv", icon: MdOutlineVideocam },
  { label: "Near Transport", value: "nearTransport", icon: MdDirectionsBus },
  { label: "Fire Safety", value: "fireSafety", icon: MdSecurity },
  { label: "Flood-Free Area", value: "floodFree", icon: MdSecurity },
  { label: "Backup Power", value: "backupPower", icon: MdSecurity },
];

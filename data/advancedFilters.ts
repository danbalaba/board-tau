import { IconType } from "react-icons";
import {
  MdSecurity,
  MdOutlineVideocam,
  MdDirectionsBus,
  MdSchool,
} from "react-icons/md";

export const advancedFilters: { label: string; value: string; icon: IconType }[] = [
  { label: "24/7 Security / Landlord on premises", value: "security24h", icon: MdSecurity },
  { label: "CCTV / Surveillance Cameras", value: "cctv", icon: MdOutlineVideocam },
  { label: "Near Transport / Tricycle Terminal", value: "nearTransport", icon: MdDirectionsBus },
  { label: "Quiet / Study Environment", value: "studyFriendly", icon: MdSchool },
];

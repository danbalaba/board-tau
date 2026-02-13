import { IconType } from "react-icons";
import {
  MdSecurity,
  MdOutlineVideocam,
  MdOutlineLocalFireDepartment,
  MdDirectionsBus,
  MdSchool,
  MdHearing,
  MdOutlineEditCalendar,
} from "react-icons/md";

export const advancedFilters: { label: string; value: string; icon: IconType }[] = [
  { label: "24/7 security", value: "24-7-security", icon: MdSecurity },
  { label: "CCTV", value: "cctv", icon: MdOutlineVideocam },
  { label: "Fire safety equipment", value: "fire-safety", icon: MdOutlineLocalFireDepartment },
  { label: "Near public transport", value: "near-public-transport", icon: MdDirectionsBus },
  { label: "Study-friendly environment", value: "study-friendly", icon: MdSchool },
  { label: "Quiet / noise-controlled", value: "quiet-environment", icon: MdHearing },
  { label: "Flexible lease terms", value: "flexible-lease", icon: MdOutlineEditCalendar },
];

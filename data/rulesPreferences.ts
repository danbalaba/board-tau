import { IconType } from "react-icons";
import { MdOutlineFemale, MdOutlineMale, MdOutlinePeople, MdOutlinePets, MdSmokingRooms, MdAccessTime } from "react-icons/md";

export const rulesPreferences: { label: string; value: string; icon: IconType }[] = [
  { label: "Female-only", value: "female-only", icon: MdOutlineFemale },
  { label: "Male-only", value: "male-only", icon: MdOutlineMale },
  { label: "Visitors Allowed", value: "visitors-allowed", icon: MdOutlinePeople },
  { label: "Pets Allowed", value: "pets-allowed", icon: MdOutlinePets },
  { label: "Smoking Allowed", value: "smoking-allowed", icon: MdSmokingRooms },
  { label: "No Curfew Enforced", value: "no-curfew", icon: MdAccessTime },
];

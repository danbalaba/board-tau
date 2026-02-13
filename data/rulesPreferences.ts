import { IconType } from "react-icons";
import { MdOutlineFemale, MdOutlineMale, MdOutlinePeople, MdOutlinePets, MdSmokingRooms } from "react-icons/md";

export const rulesPreferences: { label: string; value: string; icon: IconType }[] = [
  { label: "Female-only", value: "female-only", icon: MdOutlineFemale },
  { label: "Male-only", value: "male-only", icon: MdOutlineMale },
  { label: "Visitors allowed", value: "visitors-allowed", icon: MdOutlinePeople },
  { label: "Pets allowed", value: "pets-allowed", icon: MdOutlinePets },
  { label: "Smoking allowed", value: "smoking-allowed", icon: MdSmokingRooms },
];

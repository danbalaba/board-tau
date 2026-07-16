import { IconType } from "react-icons";
import { MdOutlineFemale, MdOutlineMale, MdOutlinePeople, MdOutlinePets, MdSmokingRooms, MdAccessTime } from "react-icons/md";

export const rulesPreferences: { label: string; value: string; icon: IconType; description?: string }[] = [
  { label: "Female-only", value: "female-only", icon: MdOutlineFemale, description: "Exclusive to female tenants." },
  { label: "Male-only", value: "male-only", icon: MdOutlineMale, description: "Exclusive to male tenants." },
  { label: "Visitors Allowed", value: "visitors-allowed", icon: MdOutlinePeople, description: "Tenants are permitted to bring outside guests into the property." },
  { label: "Pets Allowed", value: "pets-allowed", icon: MdOutlinePets, description: "Animals of any kind are allowed in the boarding house." },
  { label: "Smoking Allowed", value: "smoking-allowed", icon: MdSmokingRooms, description: "Smoking and vaping are permitted on the premises." },
  { label: "No Curfew Enforced", value: "no-curfew", icon: MdAccessTime, description: "The property does not lock the main gate at night." },
];

import { TAU_COORDINATES } from "@/utils/constants";

export type CollegeOption = {
  value: string;
  label: string;
  latlng: [number, number];
};

/** TAU colleges — each with specific coordinates for map centering & distance filtering. */
export const colleges: CollegeOption[] = [
  { value: "any", label: "Any / Not sure", latlng: [15.63518934952113, 120.41534319307087] },
  { value: "business", label: "College of Business and Management", latlng: [15.634774341020552, 120.41528626800934] },
  { value: "agriculture", label: "College of Agriculture and Forestry", latlng: [15.635649073095486, 120.41702286280831] },
  { value: "arts-sciences", label: "College of Arts and Sciences", latlng: [15.638503448247318, 120.41833579832978] },
  { value: "engineering", label: "College of Engineering and Technology", latlng: [15.638672012492403, 120.41936420944664] },
  { value: "education", label: "College of Education", latlng: [15.639791700860322, 120.42096190207734] },
  { value: "veterinary-medicine", label: "College of Veterinary Medicine", latlng: [15.634976705901163, 120.41620260960734] },
];

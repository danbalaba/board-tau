import type { CountrySelectValue } from "@/components/inputs/CountrySelect";

/** Philippines places for BoardTAU — searchable in location filter (e.g. Tarlac, TAU). */

export const philippinesPlaces: CountrySelectValue[] = [
  {
    value: "tarlac-agricultural-university",
    label: "Tarlac Agricultural University",
    flag: "🇵🇭",
    region: "Camiling, Tarlac",
    latlng: [15.6439615, 120.4122269],
  },
  {
    value: "tarlac",
    label: "Tarlac",
    flag: "🇵🇭",
    region: "Tarlac Province",
    latlng: [15.48694, 120.59],
  },
  {
    value: "camiling",
    label: "Camiling",
    flag: "🇵🇭",
    region: "Tarlac",
    latlng: [15.6867, 120.4131],
  },
];

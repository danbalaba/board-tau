export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  roomCount: number;
  bathroomCount: number;
  imageSrc: string;
  createdAt: Date;
  region?: string;
  country?: string;
  amenities?: {
    wifi: boolean;
    parking: boolean;
    pool: boolean;
    gym: boolean;
    airConditioning: boolean;
    laundry: boolean;
  } | null;
  rules?: {
    femaleOnly: boolean;
    maleOnly: boolean;
    visitorsAllowed: boolean;
    petsAllowed: boolean;
    smokingAllowed: boolean;
  } | null;
  features?: {
    security24h: boolean;
    cctv: boolean;
    fireSafety: boolean;
    nearTransport: boolean;
    studyFriendly: boolean;
    quietEnvironment: boolean;
    flexibleLease: boolean;
  } | null;
  categories?: {
    category: {
      name: string;
      label: string;
    };
  }[];
  rooms?: {
    id: string;
    name: string;
    price: number;
    capacity: number;
    availableSlots: number;
    roomType: string;
    bedType: string;
    size: number | null;
    reservationFee: number;
    amenities?: {
      amenityType: {
        name: string;
      };
    }[];
    images?: {
      url: string;
    }[];
  }[];
  images?: {
    url: string;
  }[];
  user?: {
    businessName: string | null;
    phoneNumber: string | null;
    email: string | null;
  } | null;
}

"use client";
import React, { useState, useMemo, useEffect, useTransition } from "react";
import { User } from "next-auth";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import posthog from "posthog-js";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { BorderBeam } from "@/components/ui/border-beam";

import Avatar from "@/components/common/Avatar";
import { AiOutlineCheck } from "react-icons/ai";
import { MdClose } from "react-icons/md";
import {
  DoorOpen, Bath, BedDouble, Bed, ShieldCheck, MapPin, CheckCircle2, X, Wifi, Car, Waves,
  Dumbbell, Wind, WashingMachine, Utensils, Refrigerator, Microwave, Droplets, Zap, Clock,
  Users, Flame, PawPrint, Camera, BookOpen, Square, Blinds, Lightbulb, Bell, Ban, Brush, Info,
  HelpCircle, Sparkles, Star, Heart, Share, Trash2, Edit, Save, Plus, ArrowRight, ArrowLeft,
  Search, Shield, Key, Lock, Fingerprint, Activity, Smartphone, ListChecks, Coffee, Building2, FileText
} from "lucide-react";
import * as LucideIcons from 'lucide-react';
import Modal from "@/components/modals/Modal";
import ListingReviews from "./ListingReviews";
import { ListingRecommendations } from "./ListingRecommendations";
import AvailableRoomsSection from "./AvailableRoomsSection";
import ListingCategory from "./ListingCategory";
import AmenitiesModal from "./modals/AmenitiesModal";
import RulesModal from "./modals/RulesModal";
import SafetyModal from "./modals/SafetyModal";
import { getCachedSubGroups, getSyncSubGroups } from "@/lib/landlordTaxonomyCache";
import SafeImage from "@/components/common/SafeImage";
import ThreeDHoverGallery from "@/components/ui/3d-hover-gallery";
import AngledSlider from "@/components/ui/angled-slider";
import { useDynamicAttributes } from "../../../hooks/useDynamicAttributes";

import MapLoadingState from "@/components/common/MapLoadingState";

const Map = dynamic(() => import("@/components/common/Map"), {
  ssr: false,
  loading: () => <MapLoadingState label="Listing Location Map" height="h-full min-h-[380px]" />
});

interface ListingImageData {
  url: string;
  caption?: string;
  order?: number;
}

interface ListingDetailsClientProps {
  id: string;
  price: number;
  reservations?: {
    startDate: Date;
    endDate: Date;
  }[];
  user: (User & { id: string }) | undefined;
  title: string;
  owner: {
    id: string;
    image: string | null;
    name: string | null;
  };
  categories?: { label: string; description?: string; value: string; icon?: string }[] | null;
  description: string;
  roomCount: number;
  bathroomCount: number;
  latlng: number[];
  amenities: string[] | {
    wifi?: boolean;
    parking?: boolean;
    pool?: boolean;
    gym?: boolean;
    airConditioning?: boolean;
    laundry?: boolean;
  } | null;
  bedType?: string | null;
  rating?: number;
  reviewCount?: number;
  images?: ListingImageData[];
  reviews?: any[];
  rooms: any[];
  rules?: {
    femaleOnly: boolean;
    maleOnly: boolean;
    visitorsAllowed: boolean;
    petsAllowed: boolean;
    smokingAllowed: boolean;
    noCurfew: boolean;
    customRules: string[];
  } | null;
  features?: {
    security24h: boolean;
    cctv: boolean;
    fireSafety: boolean;
    nearTransport: boolean;
    studyFriendly: boolean;
    quietEnvironment: boolean;
    flexibleLease: boolean;
    floodFree: boolean;
    backupPower: boolean;
    customFeatures: string[];
  } | null;
  region?: string | null;
  country?: string | null;
  leaseContract?: any;
}

const EXPANDED_AMENITIES = [
  "WiFi",
  "Dedicated workspace",
  "Air conditioning",
  "Shared kitchen",
  "Refrigerator",
  "Microwave",
  "Laundry area",
  "Parking",
  "Water supply (24/7)",
  "Electricity included",
  "Curfew policy",
  "Visitors allowed",
  "Cooking allowed",
  "Pets allowed",
  "CCTV",
  "Security guard",
  "Study desk",
  "Closet",
  "Balcony",
  "Smoke alarm",
  "Fire extinguisher",
];

const ListingDetailsClient: React.FC<ListingDetailsClientProps> = ({
  id,
  price,
  reservations = [],
  user,
  title,
  owner,
  categories: listingCategories,
  description,
  roomCount,
  bathroomCount,
  latlng,
  amenities,
  bedType,
  rating,
  reviewCount = 0,
  images = [],
  reviews = [],
  rooms,
  region,
  country,
  rules,
  features,
  leaseContract,
}) => {
  const { attributes, resolveAmenityName } = useDynamicAttributes();
  const [dbSubGroups, setDbSubGroups] = useState<any[]>(() => getSyncSubGroups() || []);

  const [amenitiesModalConfig, setAmenitiesModalConfig] = useState<{
    isOpen: boolean;
    initialCategory: 'ALL' | 'AMENITIES' | 'RULES' | 'SECURITY' | 'ROOMS';
  }>({
    isOpen: false,
    initialCategory: 'ALL'
  });

  useEffect(() => {
    getCachedSubGroups().then(sgs => { if (sgs) setDbSubGroups(sgs); });
  }, []);

  // Dynamic Subgroup Categorization of Shared Amenities
  const groupedAmenitiesBySubGroup = useMemo(() => {
    const rawAmenities: string[] = Array.isArray(amenities) ? amenities : [];

    const RULE_SUBGROUPS = new Set(['GENDER_POLICY', 'CURFEW', 'VISITOR_POLICY', 'PET_POLICY', 'SMOKING_POLICY', 'ALCOHOL_POLICY', 'SMOKE_ALCOHOL', 'HOUSE_RULES', 'POLICY']);
    const SECURITY_SUBGROUPS = new Set(['SECURITY', 'DISASTER_SAFETY', 'DISASTER_PREP', 'SAFETY', 'FIRE_SAFETY']);

    const subGroupMap: Record<string, { key: string; label: string; items: { id: string; name: string; icon?: string }[] }> = {};

    rawAmenities.forEach(attrId => {
      if (!attrId) return;
      const cleanAttrId = typeof attrId === 'string' && attrId.includes('|') ? attrId.split('|')[0] : attrId;
      const name = resolveAmenityName(cleanAttrId);
      if (!name || /^[a-f0-9]{24}$/i.test(name)) return;

      const matchedAttr = attributes.find((a: any) =>
        a.id === cleanAttrId ||
        a.name === cleanAttrId ||
        a.name?.toLowerCase() === String(cleanAttrId)?.toLowerCase() ||
        a.value === cleanAttrId ||
        a._id === cleanAttrId ||
        a.code === cleanAttrId ||
        (typeof cleanAttrId === 'string' && cleanAttrId.startsWith(a.id + '|'))
      );

      const type = matchedAttr?.type;
      const subGroupKey = matchedAttr?.subGroupKey || matchedAttr?.subGroup || 'OTHER';
      const lowerName = name.toLowerCase();

      const isSecurity = type === 'FEATURE' || SECURITY_SUBGROUPS.has(subGroupKey) ||
        (lowerName.includes('smoke detector') || lowerName.includes('fire extinguisher') || lowerName.includes('first aid') || lowerName.includes('emergency hallway') || lowerName.includes('flood-free') || lowerName.includes('security') || lowerName.includes('cctv') || lowerName.includes('keycard') || lowerName.includes('biometric'));

      const isRule = !isSecurity && (type === 'RULE' || RULE_SUBGROUPS.has(subGroupKey) ||
        lowerName.includes('curfew') || lowerName.includes('guest') || lowerName.includes('visitor') ||
        lowerName.includes('pet policy') || (lowerName.includes('smoke') && !lowerName.includes('detector')) || lowerName.includes('alcohol') ||
        lowerName.includes('gender') || lowerName.includes('male & female') || lowerName.includes('female only') || lowerName.includes('male only'));

      if (isSecurity || isRule) return;

      const matchedSubGroup = dbSubGroups.find(sg => sg.key === subGroupKey);
      const label = matchedSubGroup?.tabLabel || matchedSubGroup?.title || matchedAttr?.category || 'Shared Features';

      if (!subGroupMap[subGroupKey]) {
        subGroupMap[subGroupKey] = { key: subGroupKey, label, items: [] };
      }
      if (!subGroupMap[subGroupKey].items.some(item => item.name === name)) {
        subGroupMap[subGroupKey].items.push({ id: String(cleanAttrId), name, icon: matchedAttr?.icon || '' });
      }
    });

    return Object.values(subGroupMap);
  }, [amenities, attributes, dbSubGroups, resolveAmenityName]);

  const totalAmenityCount = useMemo(() => {
    return groupedAmenitiesBySubGroup.reduce((sum, g) => sum + g.items.length, 0);
  }, [groupedAmenitiesBySubGroup]);

  // Dynamic Icon Resolver for Preview Sections
  const renderDynamicIcon = (iconName?: any, titleName?: string, themeColor: 'blue' | 'purple' | 'amber' = 'blue') => {
    let IconComp: any = null;

    if (typeof iconName === 'string' && iconName && (LucideIcons as any)[iconName]) {
      IconComp = (LucideIcons as any)[iconName];
    } else if (iconName && typeof iconName !== 'string') {
      IconComp = iconName;
    }

    if (!IconComp && titleName) {
      const lower = titleName.toLowerCase();
      // Rules fallback
      if (lower.includes('visitor') || lower.includes('guest')) IconComp = Users;
      else if (lower.includes('female') || lower.includes('male') || lower.includes('gender') || lower.includes('co-living')) IconComp = Users;
      else if (lower.includes('curfew') || lower.includes('gate') || lower.includes('24/7') || lower.includes('night')) IconComp = Clock;
      else if (lower.includes('pet')) IconComp = PawPrint;
      else if (lower.includes('smoke') || lower.includes('vape')) IconComp = Flame;
      else if (lower.includes('alcohol') || lower.includes('drink') || lower.includes('wine')) IconComp = Ban;
      // Safety fallback
      else if (lower.includes('cctv') || lower.includes('camera')) IconComp = Camera;
      else if (lower.includes('guard') || lower.includes('security')) IconComp = Shield;
      else if (lower.includes('rfid') || lower.includes('keycard')) IconComp = LucideIcons.CreditCard;
      else if (lower.includes('lock') || lower.includes('door')) IconComp = LucideIcons.KeyRound;
      else if (lower.includes('biometric') || lower.includes('fingerprint')) IconComp = LucideIcons.Fingerprint;
      else if (lower.includes('flood')) IconComp = ShieldCheck;
      else if (lower.includes('fire') || lower.includes('extinguisher')) IconComp = Flame;
      else if (lower.includes('smoke detector') || lower.includes('alarm')) IconComp = LucideIcons.AlertCircle;
      else if (lower.includes('light') || lower.includes('hallway') || lower.includes('sun')) IconComp = LucideIcons.Sun;
      else if (lower.includes('first aid') || lower.includes('medical') || lower.includes('cross')) IconComp = LucideIcons.Cross;
      // Amenities fallback
      else if (lower.includes('wifi') || lower.includes('internet')) IconComp = Wifi;
      else if (lower.includes('parking') || lower.includes('car')) IconComp = Car;
      else if (lower.includes('laundry') || lower.includes('washing')) IconComp = WashingMachine;
      else if (lower.includes('cook') || lower.includes('stove') || lower.includes('eatery') || lower.includes('dining')) IconComp = Utensils;
      else if (lower.includes('refrigerator') || lower.includes('fridge')) IconComp = Refrigerator;
      else if (lower.includes('microwave')) IconComp = Microwave;
      else if (lower.includes('generator') || lower.includes('power')) IconComp = Zap;
      else if (lower.includes('water') || lower.includes('pump') || lower.includes('tank')) IconComp = Droplets;
      else if (lower.includes('study') || lower.includes('desk')) IconComp = BookOpen;
      else if (lower.includes('lounge') || lower.includes('sofa')) IconComp = LucideIcons.Sofa;
      else if (lower.includes('store')) IconComp = LucideIcons.Store;
    }

    if (!IconComp) {
      if (themeColor === 'purple') IconComp = Shield;
      else if (themeColor === 'amber') IconComp = ShieldCheck;
      else IconComp = CheckCircle2;
    }

    const colorClasses = {
      blue: 'text-blue-600 dark:text-blue-400',
      purple: 'text-purple-600 dark:text-purple-400',
      amber: 'text-amber-600 dark:text-amber-400',
    }[themeColor];

    return <IconComp size={18} className={`${colorClasses} shrink-0`} />;
  };

  // Dynamic Resolution of Safety Features for preview and SafetyModal
  const resolvedFeatures = useMemo(() => {
    const rawFeatures: any[] = [
      ...(Array.isArray(features?.customFeatures) ? features.customFeatures : []),
      ...(Array.isArray(amenities) ? amenities : []),
    ];

    const SECURITY_SUBGROUPS = new Set(['SECURITY', 'DISASTER_SAFETY', 'DISASTER_PREP', 'SAFETY', 'FIRE_SAFETY']);
    const list: { name: string; icon: string; subGroupKey?: string; description?: string }[] = [];
    const addedNames = new Set<string>();

    const addFeature = (rawItem: any) => {
      let cleanName = '';
      let iconName = '';
      let subGroupKey = '';

      if (typeof rawItem === 'object' && rawItem !== null) {
        cleanName = rawItem.name || rawItem.attribute?.name || rawItem.title || '';
        iconName = rawItem.icon || rawItem.attribute?.icon || '';
        subGroupKey = rawItem.subGroupKey || '';
      } else if (typeof rawItem === 'string') {
        if (rawItem.includes('|')) {
          const parts = rawItem.split('|');
          cleanName = parts[0].trim();
          iconName = parts[1]?.trim() || '';
        } else {
          cleanName = rawItem.trim();
        }
      }

      if (cleanName.includes('|')) {
        const parts = cleanName.split('|');
        cleanName = parts[0].trim();
        if (!iconName && parts[1]?.trim()) iconName = parts[1].trim();
      }

      if (!cleanName || addedNames.has(cleanName.toLowerCase())) return;

      const lower = cleanName.toLowerCase();
      const isSecurity = SECURITY_SUBGROUPS.has(subGroupKey) ||
        (lower.includes('smoke detector') || lower.includes('fire extinguisher') || lower.includes('first aid') || lower.includes('emergency hallway') || lower.includes('flood-free') || lower.includes('security') || lower.includes('cctv') || lower.includes('keycard') || lower.includes('biometric') || lower.includes('guard'));

      if (isSecurity) {
        addedNames.add(lower);

        // Fallback description from taxonomy
        let description = '';
        if (lower.includes('cctv')) description = "Surveillance cameras installed on property common areas.";
        else if (lower.includes('guard')) description = "Uniformed guard on duty.";
        else if (lower.includes('rfid') && lower.includes('gate')) description = "Electronic RFID card or key fob entry at main gate.";
        else if (lower.includes('rfid') && lower.includes('door')) description = "Electronic RFID smart keycard lock on main unit/bedroom door.";
        else if (lower.includes('biometric') || lower.includes('fingerprint')) description = "Fingerprint scanner entry at main entrance or lobby door.";
        else if (lower.includes('flood')) description = "Located on high ground not prone to typhoon flooding.";
        else if (lower.includes('fire extinguisher')) description = "Accessible fire extinguishers.";
        else if (lower.includes('emergency hallway') || lower.includes('hallway light')) description = "Battery backup lights for blackouts.";
        else if (lower.includes('smoke detector')) description = "In-room or hallway smoke alarms.";
        else if (lower.includes('first aid')) description = "Emergency medical supplies on site.";

        list.push({
          name: cleanName,
          icon: iconName,
          subGroupKey: subGroupKey || (lower.includes('cctv') || lower.includes('guard') || lower.includes('rfid') || lower.includes('keycard') || lower.includes('lock') || lower.includes('biometric') ? 'SECURITY' : 'DISASTER_PREP'),
          description
        });
      }
    };

    rawFeatures.forEach(attrId => {
      if (!attrId) return;
      const cleanAttrId = typeof attrId === 'string' && attrId.includes('|') ? attrId.split('|')[0] : attrId;
      const resolvedName = resolveAmenityName(cleanAttrId);

      const matchedAttr = attributes.find((a: any) => a.id === cleanAttrId || a.name === cleanAttrId || a.value === cleanAttrId || a.code === cleanAttrId);

      if (matchedAttr) {
        addFeature({
          name: matchedAttr.name || resolvedName,
          icon: matchedAttr.icon,
          subGroupKey: matchedAttr.subGroupKey || matchedAttr.subGroup
        });
      } else if (typeof attrId === 'string') {
        addFeature(attrId);
      }
    });

    if (features?.security24h && !addedNames.has('24/7 security guard')) {
      addFeature({ name: '24/7 Security Guard', icon: 'Shield', subGroupKey: 'SECURITY' });
    }
    if (features?.cctv && !addedNames.has('cctv cameras')) {
      addFeature({ name: 'CCTV Cameras', icon: 'Camera', subGroupKey: 'SECURITY' });
    }
    if (features?.fireSafety && !addedNames.has('fire safety extinguishers')) {
      addFeature({ name: 'Fire Safety Extinguishers', icon: 'Flame', subGroupKey: 'DISASTER_PREP' });
    }

    return list;
  }, [features, amenities, attributes, resolveAmenityName]);

  // Flat list of top 6 general amenities for compact page preview
  const previewAmenities = useMemo(() => {
    const items: { id: string; name: string; icon?: string }[] = [];
    groupedAmenitiesBySubGroup.forEach(group => {
      group.items.forEach(item => {
        if (!items.some(i => i.name.toLowerCase() === item.name.toLowerCase())) {
          items.push({ id: item.id, name: item.name, icon: item.icon });
        }
      });
    });
    return items.slice(0, 6);
  }, [groupedAmenitiesBySubGroup]);

  // Active house rules explicitly set for this listing
  const activeHouseRules = useMemo(() => {
    const active: { icon: any; title: string; subtitle?: string }[] = [];

    const addRule = (item: { icon?: any; title: string; subtitle?: string }) => {
      let cleanTitle = item.title;
      let iconName = item.icon;

      if (typeof item.title === 'string' && item.title.includes('|')) {
        const parts = item.title.split('|');
        cleanTitle = parts[0].trim();
        if (parts[1]?.trim()) {
          iconName = parts[1].trim();
        }
      } else {
        cleanTitle = item.title.trim();
      }

      let subtitle = item.subtitle;
      const lower = cleanTitle.toLowerCase();
      if (!subtitle) {
        if (lower.includes('female-only') || lower.includes('female only')) subtitle = "Strictly for female tenants only.";
        else if (lower.includes('male-only') || lower.includes('male only')) subtitle = "Strictly for male tenants only.";
        else if (lower.includes('male & female') || lower.includes('co-living')) subtitle = "Male and female tenants permitted.";
        else if (lower.includes('24/7') || lower.includes('no curfew')) subtitle = "Tenants can enter and leave at any hour.";
        else if (lower.includes('curfew')) subtitle = "Gate closed at specified evening hours.";
        else if (lower.includes('male guests restricted')) subtitle = "Male guests restricted from female bedrooms.";
        else if (lower.includes('visitors allowed')) subtitle = "Guest access permitted on premises.";
        else if (lower.includes('no visitors')) subtitle = "Outside visitors not permitted.";
        else if (lower.includes('pets allowed')) subtitle = "Pet-friendly property environment.";
        else if (lower.includes('no pets allowed')) subtitle = "Strictly no pets permitted.";
        else if (lower.includes('no smoking') || lower.includes('non-smoking')) subtitle = "Strict non-smoking property.";
        else if (lower.includes('smoking allowed')) subtitle = "Designated smoking area provided.";
        else if (lower.includes('no alcohol')) subtitle = "Alcoholic beverages prohibited on grounds.";
      }

      const exists = active.some(a => a.title.toLowerCase() === cleanTitle.toLowerCase());
      if (!exists && cleanTitle) {
        active.push({ icon: iconName, title: cleanTitle, subtitle });
      }
    };

    if (rules?.femaleOnly) {
      addRule({ icon: "UserX", title: "Female Only Policy", subtitle: "Strictly for female tenants only" });
    } else if (rules?.maleOnly) {
      addRule({ icon: "UserX", title: "Male Only Policy", subtitle: "Strictly for male tenants only" });
    } else if (rules?.femaleOnly === false && rules?.maleOnly === false) {
      addRule({ icon: "Users", title: "Co-living Allowed", subtitle: "Male and female tenants permitted" });
    }

    if (rules?.noCurfew) {
      addRule({ icon: "Clock", title: "24/7 Gate Access (No Curfew)", subtitle: "Tenants can enter and leave at any hour" });
    } else if (rules?.noCurfew === false) {
      addRule({ icon: "Lock", title: "Curfew Policy Enforced", subtitle: "Gate closed at specified evening hours" });
    }

    if (rules?.visitorsAllowed) {
      addRule({ icon: "Users", title: "Visitors Allowed", subtitle: "Guest access permitted on premises" });
    } else if (rules?.visitorsAllowed === false) {
      addRule({ icon: "Ban", title: "No Visitors Allowed", subtitle: "Outside visitors not permitted" });
    }

    if (rules?.petsAllowed) {
      addRule({ icon: "PawPrint", title: "Pets Allowed", subtitle: "Pet-friendly property environment" });
    } else if (rules?.petsAllowed === false) {
      addRule({ icon: "Ban", title: "No Pets Allowed", subtitle: "Strictly no pets permitted" });
    }

    if (rules?.smokingAllowed) {
      addRule({ icon: "Flame", title: "Smoking Allowed", subtitle: "Designated smoking area provided" });
    } else if (rules?.smokingAllowed === false) {
      addRule({ icon: "Ban", title: "No Smoking Allowed", subtitle: "Strict non-smoking property" });
    }

    const custom = Array.isArray(rules?.customRules) ? rules.customRules : [];
    custom.forEach((ruleStr: string) => {
      if (ruleStr && typeof ruleStr === 'string') {
        addRule({ title: ruleStr });
      }
    });

    return active;
  }, [rules]);

  const availableUnitsCount = useMemo(() => {
    if (!rooms || !Array.isArray(rooms) || rooms.length === 0) return 0;
    const avail = rooms.filter((r: any) => {
      const s = String(r.status || "").toUpperCase();
      const slots = typeof r.availableSlots === 'number' ? r.availableSlots : 1;
      return (s === "" || s === "AVAILABLE" || s === "VACANT" || s === "ACTIVE") && slots > 0;
    });
    return avail.length > 0 ? avail.length : rooms.length;
  }, [rooms]);
  const [isLoading, startTransition] = useTransition();
  const router = useRouter();
  const { success, error } = useResponsiveToast();
  const [activeStay, setActiveStay] = useState<{ endDate: string; status: string; listing: { title: string } } | null>(null);
  const lastInquiryToastTime = React.useRef<number>(0);

  // Fetch active stay for Flexible Mode overlap checks
  useEffect(() => {
    const fetchActiveStay = async () => {
      if (!user) return;
      try {
        const response = await fetch("/api/reservations/active-stay");
        if (response.ok) {
          const data = await response.json();
          setActiveStay(data);
        }
      } catch (err) {
        console.error("Failed to fetch active stay:", err);
      }
    };
    fetchActiveStay();
  }, [user]);

  // Modal states
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showBedroomPreview, setShowBedroomPreview] = useState(false);

  const galleryItems = useMemo(() => {
    if (!rooms || rooms.length === 0) return [];
    return rooms
      .filter(room => room.images && room.images.length > 0)
      .slice(0, 5)
      .map(room => ({
        id: room.id,
        urls: room.images.map((img: any) => img.url),
        title: room.name,
        subtitle: `${room.capacity} Bed${room.capacity > 1 ? 's' : ''} • ${room.roomType === 'SOLO' ? 'Private Room' : 'Shared Space'}`
      }));
  }, [rooms]);

  const sliderItems = useMemo(() => {
    if (!rooms || rooms.length === 0) return [];
    return rooms
      .filter(room => room.images && room.images.length > 0)
      .slice(0, 5)
      .map(room => ({
        id: room.id,
        urls: room.images.map((img: any) => img.url),
        title: room.name,
        subtitle: `${room.capacity} Bed${room.capacity > 1 ? 's' : ''} • ${room.roomType === 'SOLO' ? 'Private Room' : 'Shared Space'}`
      }));
  }, [rooms]);

  // Helper for explicit amenity icons
  const getAmenityIcon = (amenityName: string) => {
    const { label, icon } = parseCustomItem(amenityName);

    // If it has a custom icon from the landlord creation
    if (icon) {
      return <CustomIcon name={icon} fallback={CheckCircle2} size={20} className="text-primary flex-shrink-0" />;
    }

    const name = label.toLowerCase();
    if (name.includes('wifi')) return <Wifi size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('parking')) return <Car size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('pool')) return <Waves size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('gym')) return <Dumbbell size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('air conditioning')) return <Wind size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('laundry')) return <WashingMachine size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('kitchen') || name.includes('cooking')) return <Utensils size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('refrigerator')) return <Refrigerator size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('microwave')) return <Microwave size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('water')) return <Droplets size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('electricity')) return <Zap size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('curfew')) return <Clock size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('visitors')) return <Users size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('smoke') || name.includes('fire')) return <Flame size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('cctv') || name.includes('security')) return <Camera size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('pets')) return <PawPrint size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('desk') || name.includes('study friendly')) return <BookOpen size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('balcony')) return <Square size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('closet')) return <Blinds size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('quiet')) return <Wind size={20} className="text-primary flex-shrink-0" />;
    return <CheckCircle2 size={20} className="text-primary flex-shrink-0" />;
  };

  const isAnyModalOpen = Boolean(
    showDescriptionModal || showAmenitiesModal || showRulesModal || showSafetyModal || showBedroomPreview
  );

  // Lock body scroll when target modals are open
  useEffect(() => {
    const body = document.body;
    const rootNode = document.documentElement;

    const restoreScroll = () => {
      const top = parseFloat(body.style.top) * -1;
      body.style.overflow = '';
      body.style.paddingRight = '';
      body.style.top = '';
      body.classList.remove("fixed", "w-full");
      if (top) {
        window.scrollTo(0, top);
      }
    };

    if (isAnyModalOpen) {
      const scrollTop = window.pageYOffset || rootNode.scrollTop || body.scrollTop;
      body.style.overflow = 'hidden';
      body.style.paddingRight = '17px';
      body.style.top = `-${scrollTop}px`;
      body.classList.add("fixed", "w-full");
    } else {
      restoreScroll();
    }

    return () => {
      if (isAnyModalOpen) {
        restoreScroll();
      }
    };
  }, [isAnyModalOpen]);

  const parseCustomItem = (item: string) => {
    if (!item || typeof item !== 'string') return { label: "", icon: null };
    if (item.includes("|")) {
      const [label, icon] = item.split("|");
      return { label: label.trim(), icon: icon.trim() };
    }
    return { label: item, icon: null };
  };

  const CustomIcon = ({ name, fallback: Fallback, className, size = 24 }: { name: string | null, fallback: any, className?: string, size?: number }) => {
    // Try to find the icon in the Lucide library dynamically
    const DynamicIcon = name ? (LucideIcons as any)[name] : null;
    const IconComponent = DynamicIcon || Fallback;
    return <IconComponent className={className} size={size} />;
  };

  const handleInquiry = async (formData: any) => {
    if (!user) {
      const now = Date.now();
      if (now - lastInquiryToastTime.current > 5000) {
        error("Please log in to send an inquiry.");
        lastInquiryToastTime.current = now;
      }
      return;
    }

    try {
      const inquiryData = {
        ...formData,
        listingId: id,
        userId: user.id,
      };

      // Create inquiry instead of reservation
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inquiryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        throw new Error(errorData.error || errorData.message || "Failed to create inquiry");
      }

      posthog.capture("inquiry_submitted", {
        listing_id: id,
        listing_title: title,
        room_id: formData.roomId,
        move_in_date: formData.moveInDate,
        occupants_count: formData.occupantsCount,
      });
      success("Inquiry sent! Waiting for landlord approval.");
    } catch (err: any) {
      console.error('Inquiry request error:', err);
      posthog.captureException(err as Error);
      error(err?.message || 'Failed to send inquiry');
      throw err; // Ensure InquiryModal catches the failure!
    }
  };

  // Smart image selection for "Where you'll sleep"
  const getImageUrl = (img: any) => {
    if (!img) return null;
    if (typeof img === 'string') return img;
    if (typeof img.url === 'string') return img.url;
    if (typeof img.imageUrl === 'string') return img.imageUrl;
    if (typeof img.getUrl === 'function') return img.getUrl();
    if (typeof img.imageSrc === 'string') return img.imageSrc;
    if (typeof img.src === 'string') return img.src;
    return null;
  };

  const bedroomImage = useMemo(() => {
    // 1. Try to find an image explicitly tagged as bedroom or similar
    const specificBedroom = images?.find((img: any) => {
      const category = (img.roomType || img.category || img.caption || "").toLowerCase();
      return category.includes('bedroom') ||
        category.includes('bed') ||
        category.includes('room') ||
        category.includes('interior');
    });
    if (specificBedroom) return getImageUrl(specificBedroom);

    // 2. Try to get the first image from the first room
    if (rooms?.[0]?.images?.[0]) return getImageUrl(rooms[0].images[0]);
    if (rooms?.[0]?.imageSrc) return getImageUrl(rooms[0].imageSrc);

    // 3. Fallback to the first listing image
    if (images?.[0]) return getImageUrl(images[0]);

    return null;
  }, [images, rooms]);

  // Smart bed info summary
  const getBedInfo = () => {
    if (rooms.length === 0) return bedType || "Bed arrangement not specified";

    // Get unique bed types from available rooms
    const bedTypes = Array.from(new Set(rooms.map(r => r.bedType).filter(Boolean)));
    if (bedTypes.length === 1) {
      const count = rooms[0].bedCount || 1;
      return `${bedTypes[0]}${count > 1 ? ` x ${count}` : ""} setup`;
    }
    if (bedTypes.length > 1) return "Multiple bed configurations";
    return bedType || "Standard bed setup";
  };

  const bedInfo = getBedInfo();

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 py-4">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 flex flex-col gap-12">

          {/* Host Info */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between py-4 px-5 bg-gray-50 dark:bg-gray-800/40 rounded-[2rem] border border-gray-100 dark:border-gray-700/50 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <Avatar src={owner?.image} className="w-12 h-12 shadow-sm" />
              <div>
                <p className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight">Hosted by {owner?.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck size={12} className="text-primary" />
                  <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Verified Host</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Available Rooms Section */}
          <motion.section
            id="available-rooms"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <AvailableRoomsSection
              rooms={rooms}
              listingId={id}
              landlordId={owner.id}
              listingName={title}
              onSubmit={handleInquiry}
              isLoading={isLoading}
              user={user}
              activeStay={activeStay}
              leaseContract={leaseContract}
            />
          </motion.section>

          {/* Room Details Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">Property Overview</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100/80 dark:border-indigo-900/30 shadow-sm flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <DoorOpen size={24} />
                </div>
                <p className="text-xl font-black text-gray-900 dark:text-white">{rooms.length || roomCount}</p>
                <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center">Total Rooms</p>
              </div>
              <div className="p-5 bg-teal-50/50 dark:bg-teal-950/20 rounded-2xl border border-teal-100/80 dark:border-teal-900/30 shadow-sm flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow">
                <div className="p-2.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
                  <Bath size={24} />
                </div>
                <p className="text-xl font-black text-gray-900 dark:text-white">{bathroomCount}</p>
                <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center">Bathrooms</p>
              </div>
              <button
                onClick={() => document.getElementById('available-rooms')?.scrollIntoView({ behavior: 'smooth' })}
                className="p-5 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/20 dark:border-primary/30 shadow-sm flex flex-col items-center justify-center gap-2 hover:shadow-md hover:border-primary transition-all group cursor-pointer"
              >
                <div className="p-2.5 bg-primary/10 text-primary dark:text-primary-light rounded-xl group-hover:scale-110 transition-transform">
                  <CheckCircle2 size={24} />
                </div>
                <p className="text-xl font-black text-gray-900 dark:text-white">{availableUnitsCount}</p>
                <p className="text-[10px] font-black text-primary dark:text-primary-light uppercase tracking-widest text-center">Available Units</p>
              </button>
            </div>
          </motion.section>

          {/* Where You'll Sleep */}
          {galleryItems.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">Where you&apos;ll sleep</h2>
              <div className="w-full">
                {/* Desktop View */}
                <div className="hidden md:block">
                  <ThreeDHoverGallery
                    items={galleryItems}
                    itemWidth={15}
                    itemHeight={25}
                    gap={1.5}
                  />
                </div>

                {/* Mobile View */}
                <div className="block md:hidden">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-[#2f7d6d]/10 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-[#2f7d6d]/20">
                      <ArrowRight size={14} className="text-[#2f7d6d]" />
                      <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-[#2f7d6d]">Swipe to explore</span>
                    </div>
                  </div>
                  <AngledSlider
                    items={sliderItems}
                    containerHeight="350px"
                    cardWidth="220px"
                    gap="16px"
                  />
                </div>
              </div>
            </motion.section>
          )}

          {/* Category & Description */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-12"
          >
            {listingCategories && listingCategories.length > 0 && (
              <div className="flex flex-col">
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">Listing Categories</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {listingCategories.map((cat, idx) => {
                    const CategoryIcon = cat.icon && (LucideIcons as any)[cat.icon] ? (LucideIcons as any)[cat.icon] : LucideIcons.Tag;
                    return (
                      <ListingCategory
                        key={idx}
                        icon={CategoryIcon}
                        label={cat.label}
                        description={cat.description || ""}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-primary/5 dark:bg-primary/10 p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border border-primary/20 space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5 sm:gap-3">
                  <div className="p-2 sm:p-2.5 bg-primary text-white rounded-xl sm:rounded-2xl shadow-lg shadow-primary/20 shrink-0">
                    <FileText size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="leading-tight">About this place</span>
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed sm:leading-loose line-clamp-4 font-medium">
                {description}
              </p>
              <button
                onClick={() => setShowDescriptionModal(true)}
                className="px-4 sm:px-6 py-3 sm:py-3.5 w-full md:w-auto bg-white dark:bg-gray-800 border border-primary/20 dark:border-primary/30 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black uppercase tracking-widest text-primary dark:text-primary-light hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText size={16} className="text-primary" />
                <span>Read Full Details</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.section>

          {/* 1. Shared Property Amenities */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-blue-500/5 dark:bg-blue-500/10 p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border border-blue-500/20 space-y-4 sm:space-y-6"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5 sm:gap-3">
                <div className="p-2 sm:p-2.5 bg-blue-600 text-white rounded-xl sm:rounded-2xl shadow-lg shadow-blue-600/20 shrink-0">
                  <Sparkles size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="leading-tight">Shared Property Amenities</span>
              </h2>
              {totalAmenityCount > 0 && (
                <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-[10px] sm:text-xs uppercase tracking-wider border border-blue-500/20 shrink-0">
                  {totalAmenityCount} Amenities
                </span>
              )}
            </div>

            {previewAmenities.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3.5">
                {previewAmenities.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 sm:gap-3.5 p-3 sm:p-4 bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl border border-blue-500/10 shadow-sm hover:border-blue-500/30 transition-all min-w-0">
                    <div className="p-2 sm:p-2.5 bg-blue-500/10 rounded-lg sm:rounded-xl shrink-0">
                      {renderDynamicIcon(item.icon, item.name, "blue")}
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-gray-900 dark:text-white truncate">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/60 dark:bg-gray-900/40 border border-dashed border-blue-200 dark:border-blue-800/40 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-2.5 sm:space-y-3">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Sparkles size={24} className="sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">No Shared Amenities Listed</h3>
                <p className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 max-w-sm">
                  The landlord has not added specific shared property amenities for this listing yet.
                </p>
              </div>
            )}

            {totalAmenityCount > 0 && (
              <button
                onClick={() => setShowAmenitiesModal(true)}
                className="px-4 sm:px-6 py-3 sm:py-3.5 w-full md:w-auto bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800/50 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black uppercase tracking-widest text-blue-700 dark:text-blue-400 hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles size={16} className="text-blue-500" />
                <span>Show all {totalAmenityCount} amenities</span>
                <ArrowRight size={14} />
              </button>
            )}
          </motion.section>

          {/* 2. House Rules & Policies */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-purple-500/5 dark:bg-purple-500/10 p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border border-purple-500/20 space-y-4 sm:space-y-6"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5 sm:gap-3">
                <div className="p-2 sm:p-2.5 bg-purple-600 text-white rounded-xl sm:rounded-2xl shadow-lg shadow-purple-600/20 shrink-0">
                  <Shield size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="leading-tight">House Rules & Policies</span>
              </h2>
              {activeHouseRules.length > 0 && (
                <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black text-[10px] sm:text-xs uppercase tracking-wider border border-purple-500/20 shrink-0">
                  {activeHouseRules.length} Guidelines
                </span>
              )}
            </div>

            {activeHouseRules.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
                {activeHouseRules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 sm:gap-3.5 p-3 sm:p-4 bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl border border-purple-500/10 shadow-sm hover:border-purple-500/30 transition-all min-w-0">
                    <div className="p-2 sm:p-2.5 bg-purple-500/10 rounded-lg sm:rounded-xl shrink-0 mt-0.5">
                      {renderDynamicIcon(rule.icon, rule.title, "purple")}
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-bold text-[11px] sm:text-xs text-gray-900 dark:text-white leading-tight">{rule.title}</h5>
                      {rule.subtitle && (
                        <p className="text-[9px] sm:text-[10px] font-medium text-gray-400 mt-0.5 leading-snug line-clamp-2">{rule.subtitle}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/60 dark:bg-gray-900/40 border border-dashed border-purple-200 dark:border-purple-800/40 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-2.5 sm:space-y-3">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Shield size={24} className="sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">No Custom House Rules</h3>
                <p className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 max-w-sm">
                  Standard property guidelines and respectful co-living practices apply for this boarder residence.
                </p>
              </div>
            )}

            {activeHouseRules.length > 0 && (
              <button
                onClick={() => setShowRulesModal(true)}
                className="px-4 sm:px-6 py-3 sm:py-3.5 w-full md:w-auto bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800/50 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black uppercase tracking-widest text-purple-700 dark:text-purple-400 hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Shield size={16} className="text-purple-500" />
                <span>Show all {activeHouseRules.length} house rules & policies</span>
                <ArrowRight size={14} />
              </button>
            )}
          </motion.section>

          {/* 3. Security & Safety */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-amber-500/5 dark:bg-amber-500/10 p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border border-amber-500/20 space-y-4 sm:space-y-6"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5 sm:gap-3">
                <div className="p-2 sm:p-2.5 bg-amber-500 text-white rounded-xl sm:rounded-2xl shadow-lg shadow-amber-500/20 shrink-0">
                  <ShieldCheck size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="leading-tight">Security & Safety Measures</span>
              </h2>
              {resolvedFeatures.length > 0 && (
                <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-[10px] sm:text-xs uppercase tracking-wider border border-amber-500/20 shrink-0">
                  {resolvedFeatures.length} Measures
                </span>
              )}
            </div>

            {resolvedFeatures.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
                {resolvedFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 sm:gap-3.5 p-3 sm:p-4 bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl border border-amber-500/10 shadow-sm hover:border-amber-500/30 transition-all min-w-0">
                    <div className="p-2 sm:p-2.5 bg-amber-500/10 rounded-lg sm:rounded-xl shrink-0 mt-0.5">
                      {renderDynamicIcon(feat.icon, feat.name, "amber")}
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-bold text-[11px] sm:text-xs text-gray-900 dark:text-white leading-tight">{feat.name}</h5>
                      {feat.description && (
                        <p className="text-[9px] sm:text-[10px] font-medium text-gray-400 mt-0.5 leading-snug line-clamp-2">{feat.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/60 dark:bg-gray-900/40 border border-dashed border-amber-200 dark:border-amber-800/40 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-2.5 sm:space-y-3">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <ShieldCheck size={24} className="sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">No Custom Safety Features Listed</h3>
                <p className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 max-w-sm">
                  Standard safety and emergency measures apply for this property.
                </p>
              </div>
            )}

            {resolvedFeatures.length > 0 && (
              <button
                onClick={() => setShowSafetyModal(true)}
                className="px-4 sm:px-6 py-3 sm:py-3.5 w-full md:w-auto bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-800/50 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Star size={16} className="text-amber-500" />
                <span>View all {resolvedFeatures.length} security & safety features</span>
                <ArrowRight size={14} />
              </button>
            )}
          </motion.section>

          {/* Reviews Section */}
          <motion.section
            id="reviews-section"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <ListingReviews
              reviews={reviews}
              listingRating={rating}
              listingReviewCount={reviewCount}
              ownerName={owner?.name || "Property Owner"}
              currentUser={user}
              listing={{
                title,
                imageSrc: images?.[0]?.url || "",
                region: region || "",
                country: country || ""
              }}
            />
          </motion.section>

          {/* Map */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="pb-6"
          >
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">Location</h2>
            <div className="rounded-3xl overflow-hidden h-96 shadow-lg border border-gray-100 dark:border-gray-700 relative z-0">
              <Map
                center={latlng}
                readonly={true}
                allowPinDrop={false}
                scrollWheelZoom={true}
                landmarks={[
                  {
                    id: id || "listing-location",
                    name: title,
                    coords: [latlng[0], latlng[1]],
                    logo: images?.[0]?.url || "https://res.cloudinary.com/dtg0zavxl/image/upload/v1727878437/BoardTAU/Assets/bnnwtyyvsh42iyn33d5y.jpg",
                  }
                ]}
                activeLandmarkId={id || "listing-location"}
              />
              {/* Modern Floating Property Location Card */}
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-3.5 shadow-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3.5 z-[1000]">
                <div className="relative w-12 h-12 rounded-full border-2 border-primary overflow-hidden shrink-0 shadow-md">
                  <img
                    src={images?.[0]?.url || "https://res.cloudinary.com/dtg0zavxl/image/upload/v1727878437/BoardTAU/Assets/bnnwtyyvsh42iyn33d5y.jpg"}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-primary rounded-full border-2 border-white dark:border-slate-900" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[200px]" title={title}>
                      {title}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary dark:text-primary-light font-black text-[9px] uppercase tracking-wider shrink-0 border border-primary/20">
                      You're Here
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
                    Exact area masked for privacy. Precise location revealed after booking.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* AI Recommendations */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="pb-6"
          >
            <ListingRecommendations listingId={id} currentUser={user} />
          </motion.section>
        </div>

        {/* Floating Inquiry Card - Right Side */}
        <div className="lg:col-span-1 hidden lg:block">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="sticky top-32 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[2rem] border border-gray-100 dark:border-gray-800 p-8 shadow-2xl relative overflow-hidden group"
          >
            <BorderBeam
              size={70}
              duration={4}
              delay={0}
              colorFrom="#2f7d6d"
              colorTo="#2f7d6d"
              reverse={false}
              initialOffset={0}
              borderThickness={4}
              opacity={1}
              glowIntensity={6}
              beamBorderRadius={60}
              pauseOnHover={false}
              speedMultiplier={1.5}
            />
            <div className="mb-8 relative z-10">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Starting From</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">₱{price.toLocaleString()}</span>
                <span className="text-sm font-bold text-gray-500">/ month</span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-100 dark:border-gray-700 relative z-10">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed mb-4">
                Explore the <button
                  onClick={() => document.getElementById('available-rooms')?.scrollIntoView({ behavior: 'smooth' })}
                  className="font-bold text-gray-900 dark:text-white hover:text-primary underline decoration-primary/30 underline-offset-4 transition-colors"
                >
                  Available Rooms
                </button> section on the left to select a specific unit, view its capacity, and send a reservation inquiry to the landlord.
              </p>
              <button
                onClick={() => document.getElementById('available-rooms')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full py-3.5 px-6 bg-primary hover:bg-primary/90 text-white rounded-xl font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Explore Available Rooms</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest relative z-10">
              <ShieldCheck size={14} />
              Secure Booking via BoardTAU
            </div>
          </motion.div>
        </div>

        {/* Description Modal */}
        <Modal isOpen={showDescriptionModal} onClose={() => setShowDescriptionModal(false)} width="lg" fullOnMobile>
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 h-full sm:h-[620px] max-h-none sm:max-h-[85vh] min-h-0 sm:min-h-[450px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 sm:pb-4 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="p-2 sm:p-2.5 bg-primary/10 rounded-xl text-primary dark:text-primary-light shrink-0">
                  <FileText size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs sm:text-sm">
                    About This Listing
                  </h3>
                  <p className="text-[10px] sm:text-xs font-bold text-gray-400">
                    Full Property Description
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDescriptionModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Description Scroll Content */}
            <div className="overflow-y-auto flex-1 no-scrollbar space-y-4 py-1 pr-1 scroll-smooth">
              <div className="bg-slate-50/50 dark:bg-slate-800/30 p-4 sm:p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed sm:leading-loose whitespace-pre-wrap font-medium">
                  {description}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end shrink-0">
              <button
                onClick={() => setShowDescriptionModal(false)}
                className="px-6 py-2 sm:py-2.5 w-full sm:w-auto bg-primary hover:bg-primary/90 text-white rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>

        {/* Bedroom Fullscreen Preview Modal */}
        <AnimatePresence>
          {showBedroomPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
              onClick={() => setShowBedroomPreview(false)}
            >
              <button
                onClick={() => setShowBedroomPreview(false)}
                className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-[70]"
              >
                <X size={24} className="text-white" />
              </button>
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="max-w-6xl w-full max-h-[90vh] flex flex-col items-center relative z-[75]"
                onClick={(e) => e.stopPropagation()}
              >
                <SafeImage
                  src={bedroomImage}
                  alt="Bedroom Full Preview"
                  containerClassName="w-full h-[60vh] md:h-[75vh] rounded-3xl"
                  className="object-contain"
                />
                <p className="text-white/60 text-sm font-black mt-6 uppercase tracking-widest">
                  {bedInfo || "Standard Unit Preview"}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Sticky Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 p-4 pb-8 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-gray-900 dark:text-white">₱{price.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase">/ mo</span>
          </div>
          <button
            onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-[10px] font-bold text-primary underline underline-offset-2 text-left"
          >
            {rating?.toFixed(1)} ★ ({reviewCount} reviews)
          </button>
        </div>

        <button
          onClick={() => document.getElementById('available-rooms')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-8 h-12 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
        >
          Choose Room
        </button>
      </div>

      {/* Dedicated Modals for Amenities, Rules, and Security */}
      <AmenitiesModal
        isOpen={showAmenitiesModal}
        onClose={() => setShowAmenitiesModal(false)}
        groupedSubGroups={groupedAmenitiesBySubGroup}
      />
      <RulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        rulesObj={rules || {}}
        customRules={rules?.customRules || []}
      />
      <SafetyModal
        isOpen={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
        features={resolvedFeatures}
        customFeatures={features?.customFeatures || []}
      />
    </>
  );
};

export default ListingDetailsClient;

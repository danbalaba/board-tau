'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Modal from '@/components/modals/Modal';
import MediaPreviewOverlay from '@/components/common/MediaPreviewOverlay';
import { Button } from '@/app/admin/components/ui/button';
import dynamic from 'next/dynamic';
import { 
  User, 
  Building2, 
  Check, 
  X,
  Clock,
  MapPin,
  Eye,
  ShieldCheck,
  CircleDollarSign,
  FileText,
  Award,
  Bath,
  Bed,
  Users,
  Maximize2,
  ListChecks,
  Shield,
  Star,
  ClipboardList,
  ShieldAlert,
  Sparkles,
  Wifi,
  Wind,
  SquareParking,
  Waves,
  Cigarette,
  PawPrint,
  Wine,
  Flame,
  WashingMachine,
  Tv,
  Zap,
  Droplets,
  BookOpen,
  Dumbbell,
  Camera,
  FileCheck,
  Lock,
  VolumeX,
  Ban,
  UserX,
  Utensils,
  Shirt,
  ShoppingBag,
  Car,
  Bike,
  Sofa,
  UserCheck,
  Coffee,
  Layers,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Archive,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatPropertyType } from '@/lib/utils';
import SafeImage from '@/components/common/SafeImage';
import { AdminListingRejectModal } from './admin-listing-reject-modal';
import { SharedAmenitiesModal } from '@/components/common/SharedAmenitiesModal';
import { generateLeaseContractPDF } from '@/utils/contractPdfGenerator';

import { 
  getCachedPropertyTypes, 
  getCachedAttributes, 
  getCachedRoomTypes,
  getCachedSubGroups,
  getSyncPropertyTypes,
  getSyncAttributes,
  getSyncSubGroups
} from '@/lib/landlordTaxonomyCache';

const Map = dynamic(() => import('@/components/common/Map'), { ssr: false });

const getParsedCoordinates = (listingObj: any): [number, number] => {
  const raw = listingObj?.latlng || listingObj?.coordinates;
  if (Array.isArray(raw) && raw.length === 2) {
    const v1 = Number(raw[0]);
    const v2 = Number(raw[1]);
    if (!isNaN(v1) && !isNaN(v2) && (v1 !== 0 || v2 !== 0)) {
      if (Math.abs(v1) < 30 && Math.abs(v2) > 100) return [v1, v2];
      if (Math.abs(v2) < 30 && Math.abs(v1) > 100) return [v2, v1];
    }
  }
  return [15.6885, 120.4146];
};

interface AdminListingReviewModalProps {
  listing: any | null;
  isOpen: boolean;
  onClose: () => void;
  onDecision: (id: string, action: 'approve' | 'reject', reason?: string) => void;
  isDeciding?: boolean;
  onRestore?: (listing: any) => void;
}

const TAB_ORDER: ('OVERVIEW' | 'LOCATION' | 'CONFIG' | 'ROOMS' | 'IMAGES' | 'DOCS')[] = [
  'OVERVIEW',
  'LOCATION',
  'CONFIG',
  'ROOMS',
  'IMAGES',
  'DOCS'
];

export interface StepChecklistItem {
  id: string;
  label: string;
  defaultNote: string;
}

export const STEP_CHECKLISTS: Record<string, { title: string; subtitle: string; items: StepChecklistItem[] }> = {
  OVERVIEW: {
    title: '1. Host & Identity Audit',
    subtitle: 'Verify host credentials, property name & base rates',
    items: [
      { id: 'host_profile', label: 'Landlord Host Profile Verified', defaultNote: 'Landlord account profile or contact details require verification.' },
      { id: 'prop_title', label: 'Property Title & Type Accurate', defaultNote: 'Property title or category description is inaccurate or misleading.' },
      { id: 'prop_desc', label: 'Overview & Description Legible', defaultNote: 'Property description contains improper formatting, missing details, or prohibited terms.' },
      { id: 'base_price', label: 'Monthly Base Price Reasonable', defaultNote: 'Listed monthly rental rate is unrealistic or inconsistent.' },
    ]
  },
  LOCATION: {
    title: '2. Geolocation & Map Audit',
    subtitle: 'Verify street address and pin coordinates near TAU',
    items: [
      { id: 'street_address', label: 'Valid Street & Barangay Address', defaultNote: 'Street address or barangay information is incomplete or inaccurate.' },
      { id: 'map_pin', label: 'Pinpoint Map Coordinates Accurate', defaultNote: 'Map pin location does not match physical property location near TAU campus.' },
      { id: 'tau_proximity', label: 'TAU Campus Proximity Validated', defaultNote: 'Proximity to TAU campus or walking distance claims could not be verified.' },
    ]
  },
  CONFIG: {
    title: '3. Setup & Rules Audit',
    subtitle: 'Verify house rules, curfew, shared amenities & safety',
    items: [
      { id: 'house_rules', label: 'House Rules & Curfew Clear', defaultNote: 'House rules, curfew hours, or visitor policy are ambiguous or missing.' },
      { id: 'shared_amenities', label: 'Shared Property Amenities Verified', defaultNote: 'Shared property amenities require clarification.' },
      { id: 'security_safety', label: 'Security & Safety Features Checked', defaultNote: 'Security setup (CCTV, gate locks, fire safety) does not meet platform standards.' },
      { id: 'lease_terms', label: 'Lease Deposit & Terms Fair', defaultNote: 'Security deposit terms or move-out notice period violate platform guidelines.' },
    ]
  },
  ROOMS: {
    title: '4. Rooms Breakdown Audit',
    subtitle: 'Verify individual room pricing, beds, and CR setup',
    items: [
      { id: 'room_capacity', label: 'Room Capacities & Beds Clear', defaultNote: 'Room capacity or bed count specs are invalid or mathematically inconsistent.' },
      { id: 'room_pricing', label: 'Per Head / Unit Pricing Fair', defaultNote: 'Individual room unit pricing is inconsistent with property base rate.' },
      { id: 'in_unit_amenities', label: 'In-Unit Amenities & CR Setup', defaultNote: 'Private vs shared CR setup or room amenities need correction.' },
    ]
  },
  IMAGES: {
    title: '5. Photo Showcase Audit',
    subtitle: 'Inspect photo resolution, authenticity & watermarks',
    items: [
      { id: 'main_cover', label: 'Featured Main Cover Photo Clear', defaultNote: 'Main cover photo is low resolution, blurry, or dark.' },
      { id: 'photo_quality', label: 'Interior Photos Authentic', defaultNote: 'Property photos uploaded are insufficient or unreflective of actual unit premises.' },
      { id: 'no_watermarks', label: 'No Watermarks or External Links', defaultNote: 'Uploaded photos contain third-party watermarks, phone numbers, or external site branding.' },
    ]
  },
  DOCS: {
    title: '6. Legal Documents Audit',
    subtitle: 'Inspect legal permits, owner ID, and fire safety clearance',
    items: [
      { id: 'gov_id', label: 'Government Photo ID Validated', defaultNote: 'Host government ID is missing, blurry, or name does not match host account.' },
      { id: 'business_permit', label: "Mayor's / Business Permit Valid", defaultNote: "Mayor's / DTI Business permit is missing, expired, or unreadable." },
      { id: 'land_title', label: 'Land Title / Ownership Confirmed', defaultNote: 'Land title or proof of property ownership/lease right is missing or unverified.' },
      { id: 'fire_safety', label: 'Fire Safety Clearance Active', defaultNote: 'BFP Fire Safety Inspection certificate is expired or missing.' },
    ]
  }
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30',
  approved: 'bg-primary/15 text-primary border border-primary/30',
  active: 'bg-primary/15 text-primary border border-primary/30',
  rejected: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30',
  archived: 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/30',
};

const PROPERTY_IMAGE_CATEGORIES = [
  { id: 'Exterior', label: 'Property Exterior & Entrance', icon: Building2, description: 'Building façade, main gate & cover thumbnail' },
  { id: 'Kitchen', label: 'Kitchen & Dining Space', icon: Utensils, description: 'Cooking area, appliances & dining table' },
  { id: 'Bathroom', label: 'Bathroom & Comfort Room (CR)', icon: Bath, description: 'Toilet, shower, vanity & fixtures' },
  { id: 'Common Area', label: 'Living & Common Lounge', icon: Sofa, description: 'Shared lounge, hallway & visitor area' },
  { id: 'Other', label: 'Other Shared Facilities', icon: Camera, description: 'Other shared facilities like parking, garden & laundry' },
];

export function AdminListingReviewModal({
  listing,
  isOpen,
  onClose,
  onDecision,
  isDeciding,
  onRestore
}: AdminListingReviewModalProps) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LOCATION' | 'CONFIG' | 'ROOMS' | 'IMAGES' | 'DOCS'>('OVERVIEW');
  const [maxUnlockedStepIdx, setMaxUnlockedStepIdx] = useState<number>(0);
  const [confirmedSteps, setConfirmedSteps] = useState<boolean[]>([false, false, false, false, false, false]);
  const [selectedRoomIdx, setSelectedRoomIdx] = useState<number>(0);
  const roomTabContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (roomTabContainerRef.current) {
        const activeTabEl = roomTabContainerRef.current.querySelector('[data-active="true"]');
        if (activeTabEl) {
          activeTabEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [selectedRoomIdx, activeTab]);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [amenitiesModalConfig, setAmenitiesModalConfig] = useState<{
    isOpen: boolean;
    initialCategory: 'ALL' | 'AMENITIES' | 'RULES' | 'SECURITY' | 'ROOMS';
  }>({
    isOpen: false,
    initialCategory: 'ALL'
  });
  const [stepChecklistsState, setStepChecklistsState] = useState<Record<string, boolean>>({});

  // Current Step Checklist Info
  const currentStepChecklistInfo = STEP_CHECKLISTS[activeTab] || STEP_CHECKLISTS.OVERVIEW;
  const currentStepChecklistItems = currentStepChecklistInfo.items;

  const isCurrentStepAllChecked = useMemo(() => {
    if (!listing || String(listing.status).toLowerCase() !== 'pending') return true;
    return currentStepChecklistItems.every(item => Boolean(stepChecklistsState[`${activeTab}_${item.id}`]));
  }, [listing, activeTab, currentStepChecklistItems, stepChecklistsState]);

  const failedChecklistNotes = useMemo(() => {
    const notes: string[] = [];
    currentStepChecklistItems.forEach(item => {
      if (!stepChecklistsState[`${activeTab}_${item.id}`]) {
        notes.push(item.defaultNote);
      }
    });
    return notes;
  }, [currentStepChecklistItems, stepChecklistsState, activeTab]);

  // Cached taxonomy datasets
  const [attributes, setAttributes] = useState<any[]>(() => getSyncAttributes() || []);
  const [dbSubGroups, setDbSubGroups] = useState<any[]>(() => getSyncSubGroups() || []);
  const [propertyTypes, setPropertyTypes] = useState<any[]>(() => getSyncPropertyTypes() || []);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      getCachedAttributes().then(attrs => { if (attrs) setAttributes(attrs); });
      getCachedSubGroups().then(sgs => { if (sgs) setDbSubGroups(sgs); });
      getCachedPropertyTypes().then(pts => {
        if (pts && pts.length > 0) {
          setPropertyTypes(pts);
          const catId = listing?.propertyTypeId || listing?.propertyType?.id || listing?.propertyType || listing?.category || '';
          const matchedPt = pts.find((p: any) => p.id === catId || p.value === catId || p.code === catId || p.name?.toLowerCase() === String(catId).toLowerCase());
          const realTypeId = matchedPt ? matchedPt.id : catId;

          getCachedRoomTypes(realTypeId).then(rts => {
            if (rts && rts.length > 0) {
              setRoomTypes(rts);
            } else {
              getCachedRoomTypes().then(all => { if (all) setRoomTypes(all); });
            }
          });
        } else {
          getCachedRoomTypes().then(all => { if (all) setRoomTypes(all); });
        }
      });
    }
  }, [isOpen, listing]);
  
  // Media Preview Lightbox State
  const [previewState, setPreviewState] = useState<{
    isOpen: boolean;
    images: string[];
    currentIndex: number;
    title: string;
    isDocument?: boolean;
  }>({
    isOpen: false,
    images: [],
    currentIndex: 0,
    title: '',
    isDocument: false
  });

  // Resolved Property Type Name
  const resolvedPropertyType = useMemo(() => {
    if (!listing) return 'Boarding House';
    if (listing.propertyType?.name) return listing.propertyType.name;
    if (listing.propertyTypeName) return listing.propertyTypeName;
    if (listing.propertyType && typeof listing.propertyType === 'string' && !/^[a-f0-9]{24}$/i.test(listing.propertyType)) {
      return listing.propertyType;
    }
    const targetId = listing.category || listing.propertyTypeId || listing.propertyType;
    if (targetId) {
      const matched = propertyTypes.find((pt: any) => pt.id === targetId || pt.value === targetId || pt._id === targetId || pt.code === targetId);
      if (matched) return matched.name || matched.label || matched.title;
      if (!/^[a-f0-9]{24}$/i.test(targetId)) return targetId.replace(/-/g, ' ');
    }
    return listing.category || 'Boarding House';
  }, [listing, propertyTypes]);

  const prevListingIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen && listing) {
      setShowRejectConfirm(false);
      setPreviewState(prev => ({ ...prev, isOpen: false }));

      const currentListingId = listing.id ? String(listing.id) : (listing._id ? String(listing._id) : null);
      if (prevListingIdRef.current !== currentListingId) {
        prevListingIdRef.current = currentListingId;
        setIsInitialLoading(true);
        setActiveTab('OVERVIEW');
        setSelectedRoomIdx(0);

        setTimeout(() => setIsInitialLoading(false), 150);
      } else {
        setIsInitialLoading(false);
      }

      const statusStr = String(listing.status || 'pending').toLowerCase();
      const isArchived = Boolean(listing.isAdminArchived || listing.isArchived || statusStr === 'archived');
      const isPending = statusStr === 'pending' && !isArchived;
      if (isPending) {
        setMaxUnlockedStepIdx(0);
        setConfirmedSteps([false, false, false, false, false, false]);
        setStepChecklistsState({});
      } else {
        setMaxUnlockedStepIdx(5);
        setConfirmedSteps([true, true, true, true, true, true]);
        // Auto mark all checked for non-pending
        const initialMap: Record<string, boolean> = {};
        Object.keys(STEP_CHECKLISTS).forEach(key => {
          STEP_CHECKLISTS[key].items.forEach(item => {
            initialMap[`${key}_${item.id}`] = true;
          });
        });
        setStepChecklistsState(initialMap);
      }
    }
  }, [isOpen, listing]);

  // Dynamic Icon Resolver matching Taxonomy
  const getItemIcon = (name: string, attrId?: string) => {
    if (attrId) {
      const matched = attributes.find(a => a.id === attrId || a.value === attrId || a._id === attrId || a.code === attrId || attrId.startsWith(a.id + '|'));
      if (matched && matched.icon) {
        return matched.icon;
      }
    }

    const n = (name || '').toLowerCase();

    // Rules & Policies
    if (n.includes("curfew") || n.includes("gate lock") || n.includes("8:00 pm") || n.includes("9:00 pm") || n.includes("10:00 pm")) return Lock;
    if (n.includes("24/7 open gate") || n.includes("no curfew") || n.includes("open gate")) return Clock;
    if (n.includes("quiet hours") || n.includes("quiet") || n.includes("noise")) return VolumeX;
    if (n.includes("pet")) return PawPrint;
    if (n.includes("smoke") || n.includes("smoking")) return Ban;
    if (n.includes("drink") || n.includes("alcohol") || n.includes("liquor")) return Wine;
    if (n.includes("female-only") || n.includes("female only") || n.includes("male-only") || n.includes("male only") || n.includes("no visitors")) return UserX;
    if (n.includes("visitors") || n.includes("guests") || n.includes("mixed") || n.includes("coed") || n.includes("gender")) return Users;

    // Kitchen & Appliances
    if (n.includes("utensil") || n.includes("dishware") || n.includes("plate") || n.includes("spoon")) return Utensils;
    if (n.includes("microwave")) return Utensils;
    if (n.includes("rice cooker")) return Utensils;
    if (n.includes("kettle")) return Coffee;
    if (n.includes("stove") || n.includes("cook")) return Flame;
    if (n.includes("fridge") || n.includes("refrigerator")) return Utensils;
    if (n.includes("sink") || n.includes("dish drying") || n.includes("kitchen")) return Utensils;

    // Bathroom & CR
    if (n.includes("bidet")) return Droplets;
    if (n.includes("shower") || n.includes("bath") || n.includes("cr")) return Bath;
    if (n.includes("toilet") || n.includes("flush")) return Bath;
    if (n.includes("mirror") || n.includes("vanity")) return Bath;
    if (n.includes("water storage") || n.includes("drum") || n.includes("tabo") || n.includes("poso") || n.includes("tank")) return Droplets;

    // Cooling & Fans
    if (n.includes("inverter") || n.includes("split type") || n.includes("window type") || n.includes("ac") || n.includes("aircon") || n.includes("air conditioner")) return Wind;
    if (n.includes("fan") || n.includes("exhaust")) return Wind;

    // Furniture & Interior Features
    if (n.includes("curtain") || n.includes("blind") || n.includes("screen") || n.includes("mosquito")) return Layers;
    if (n.includes("cabinet") || n.includes("closet") || n.includes("wardrobe") || n.includes("storage")) return Layers;
    if (n.includes("desk") || n.includes("chair") || n.includes("study") || n.includes("book")) return BookOpen;
    if (n.includes("sofa") || n.includes("lounge") || n.includes("living") || n.includes("couch")) return Sofa;
    if (n.includes("bed") || n.includes("mattress") || n.includes("pillow")) return Bed;
    if (n.includes("lock") || n.includes("lockable")) return Lock;

    // Utilities & Connectivity
    if (n.includes("wifi") || n.includes("internet") || n.includes("fiber")) return Wifi;
    if (n.includes("generator") || n.includes("electric") || n.includes("power") || n.includes("zap")) return Zap;
    if (n.includes("laundry") || n.includes("washing") || n.includes("sampayan")) return WashingMachine;
    if (n.includes("store") || n.includes("sari-sari") || n.includes("convenience") || n.includes("shop")) return ShoppingBag;
    if (n.includes("parking") || n.includes("garage") || n.includes("car") || n.includes("motorcycle")) return SquareParking;
    if (n.includes("bike") || n.includes("bicycle")) return Bike;
    if (n.includes("caretaker") || n.includes("housekeeping") || n.includes("repairs")) return UserCheck;
    if (n.includes("tv") || n.includes("smart tv")) return Tv;

    // Security & Safety
    if (n.includes("cctv") || n.includes("camera") || n.includes("security") || n.includes("guard")) return ShieldCheck;
    if (n.includes("flood") || n.includes("fire") || n.includes("emergency") || n.includes("first aid")) return ShieldAlert;

    return Sparkles;
  };

  const resolveAmenityName = (attrId: string) => {
    if (!attrId) return '';
    const cleanId = typeof attrId === 'string' && attrId.includes('|') ? attrId.split('|')[0] : attrId;
    const matched = attributes.find(a => 
      a.id === cleanId || 
      a.value === cleanId || 
      a._id === cleanId || 
      a.code === cleanId || 
      a.name === cleanId || 
      a.name?.toLowerCase() === String(cleanId).toLowerCase() || 
      (typeof cleanId === 'string' && cleanId.startsWith(a.id + '|'))
    );
    if (matched) return matched.name || matched.label || matched.title;
    if (typeof cleanId === 'string' && !/^[a-f0-9]{24}$/i.test(cleanId)) return cleanId.replace(/_/g, ' ').replace(/-/g, ' ');
    return typeof cleanId === 'string' ? cleanId : '';
  };

  const resolveRoomTypeName = (roomInput: any) => {
    if (!roomInput) return isApartmentOrFlatRate ? 'Standard Unit' : 'Standard Room';

    if (typeof roomInput === 'object' && roomInput !== null) {
      if (roomInput.roomTypeDefinition?.name) return roomInput.roomTypeDefinition.name;
      if (roomInput.roomTypeDefinition?.label) return roomInput.roomTypeDefinition.label;
      if (roomInput.roomTypeName) return roomInput.roomTypeName;
      if (roomInput.name && !roomInput.name.toLowerCase().startsWith('room ') && !roomInput.name.toLowerCase().startsWith('unit ')) return roomInput.name;
      if (roomInput.title && !roomInput.title.toLowerCase().startsWith('room ') && !roomInput.title.toLowerCase().startsWith('unit ')) return roomInput.title;
      if (roomInput.roomCategory && typeof roomInput.roomCategory === 'string' && !/^[a-f0-9]{24}$/i.test(roomInput.roomCategory)) {
        return roomInput.roomCategory.replace(/_/g, ' ').replace(/-/g, ' ');
      }
    }

    const roomTypeId = typeof roomInput === 'string' 
      ? roomInput 
      : (roomInput?.roomType || roomInput?.roomTypeDefinitionId || roomInput?.roomCategory || '');

    if (!roomTypeId) return isApartmentOrFlatRate ? 'Standard Unit' : 'Standard Room';

    const matched = roomTypes.find(t => 
      t.id === roomTypeId || 
      t.value === roomTypeId || 
      t._id === roomTypeId || 
      t.code === roomTypeId ||
      t.name?.toLowerCase() === roomTypeId?.toLowerCase() ||
      t.label?.toLowerCase() === roomTypeId?.toLowerCase()
    );
    if (matched) return matched.name || matched.label || matched.title;

    const knownRoomTypes: Record<string, string> = {
      'SOLO': 'Solo Room',
      'SHARED': 'Shared Room',
      'BEDSPACE': 'Bedspace',
      'STUDIO': 'Studio Unit',
      'WHOLE_HOUSE': 'Whole House',
      'APARTMENT': 'Apartment Unit',
    };
    if (knownRoomTypes[roomTypeId.toUpperCase()]) {
      return knownRoomTypes[roomTypeId.toUpperCase()];
    }

    if (!/^[a-f0-9]{24}$/i.test(roomTypeId)) {
      return roomTypeId.replace(/_/g, ' ').replace(/-/g, ' ');
    }

    return isApartmentOrFlatRate ? 'Standard Unit' : 'Standard Room';
  };

  const resolveBedTypeName = (bedTypeInput: any, roomTypeId?: string) => {
    if (!bedTypeInput) return 'Single Bed';

    if (typeof bedTypeInput === 'object' && bedTypeInput !== null) {
      if (bedTypeInput.name) return bedTypeInput.name;
      if (bedTypeInput.label) return bedTypeInput.label;
    }

    const bedType = typeof bedTypeInput === 'string' ? bedTypeInput : (bedTypeInput?.code || bedTypeInput?.id || '');
    if (!bedType) return 'Single Bed';
    
    if (roomTypeId) {
      const roomTypeObj = roomTypes.find((t: any) => 
        t.id === roomTypeId || t.value === roomTypeId || t.code === roomTypeId || t.name?.toLowerCase() === roomTypeId?.toLowerCase()
      );
      if (roomTypeObj && Array.isArray(roomTypeObj.bedSetups)) {
        const matched = roomTypeObj.bedSetups.find((b: any) => b.code === bedType || b.id === bedType || b.name?.toLowerCase() === bedType?.toLowerCase());
        if (matched) return matched.name;
      }
    }
    
    for (const rt of roomTypes) {
      if (Array.isArray(rt.bedSetups)) {
        const matched = rt.bedSetups.find((b: any) => b.code === bedType || b.id === bedType || b.name?.toLowerCase() === bedType?.toLowerCase());
        if (matched) return matched.name;
      }
    }

    const knownBedNames: Record<string, string> = {
      'SINGLE': 'Single Bed',
      'BUNK': 'Bunk Bed',
      'DOUBLE': 'Double Bed',
      'QUEEN': 'Queen Bed',
      'KING': 'King Bed',
      'TWIN': 'Twin Bed',
      'DOUBLE_BED_FRAME': 'Double Bed Frame',
      'SINGLE_BED_FRAME': 'Single Bed Frame',
    };

    if (knownBedNames[bedType.toUpperCase()]) {
      return knownBedNames[bedType.toUpperCase()];
    }

    if (!/^[a-f0-9]{24}$/i.test(bedType)) {
      return bedType.replace(/_/g, ' ').replace(/-/g, ' ');
    }

    return 'Single Bed';
  };

  // Dynamic Grouping of In-Unit Amenities by Taxonomy Sub-Group
  const groupInUnitAmenities = (amenitiesList: string[]) => {
    if (!Array.isArray(amenitiesList) || amenitiesList.length === 0) return [];

    const subGroupMap: Record<string, { key: string; label: string; items: string[] }> = {};

    amenitiesList.forEach(attrId => {
      if (!attrId) return;
      const resolved = resolveAmenityName(attrId);
      const cleanName = resolved || (typeof attrId === 'string' ? attrId.replace(/_/g, ' ').replace(/-/g, ' ') : '');
      if (!cleanName) return;

      const matchedAttr = attributes.find(a => 
        a.id === attrId || 
        a.name === attrId || 
        a.name?.toLowerCase() === String(attrId)?.toLowerCase() || 
        a.value === attrId || 
        a._id === attrId || 
        a.code === attrId || 
        (typeof attrId === 'string' && attrId.startsWith(a.id + '|'))
      );
      const subGroupKey = matchedAttr?.subGroupKey || matchedAttr?.subGroup || 'IN_UNIT_AMENITIES';
      const matchedSubGroup = dbSubGroups.find(sg => sg.key === subGroupKey);
      const label = matchedSubGroup?.tabLabel || matchedSubGroup?.title || matchedAttr?.category || 'In-Unit Features';

      if (!subGroupMap[subGroupKey]) {
        subGroupMap[subGroupKey] = { key: subGroupKey, label, items: [] };
      }
      if (!subGroupMap[subGroupKey].items.includes(cleanName)) {
        subGroupMap[subGroupKey].items.push(cleanName);
      }
    });

    return Object.values(subGroupMap);
  };

  const checkIsFlatRate = (room: any) => {
    if (!room) return false;
    if (typeof room.isFlatRate === 'boolean') return room.isFlatRate;
    if (room.pricingMode === 'WHOLE_UNIT') return true;
    if (room.pricingMode === 'PER_HEAD') return false;
    if (typeof room.roomTypeDefinition?.isFlatRate === 'boolean') return room.roomTypeDefinition.isFlatRate;

    const rtId = typeof room === 'string' ? room : (room.roomType || room.roomTypeDefinitionId || '');
    const selectedRoomType = roomTypes.find((t: any) => t.id === rtId || t.value === rtId || t._id === rtId || t.code === rtId);
    if (selectedRoomType && typeof selectedRoomType.isFlatRate === 'boolean') {
      return selectedRoomType.isFlatRate;
    }

    const knownFlatTypes = ['STUDIO', 'WHOLE_HOUSE', 'APARTMENT'];
    if (typeof rtId === 'string' && knownFlatTypes.includes(rtId.toUpperCase())) {
      return true;
    }
    return false;
  };

  const isApartmentOrFlatRate = useMemo(() => {
    const rooms = listing?.rooms || [];
    if (rooms.length > 0 && rooms.some((r: any) => checkIsFlatRate(r))) return true;
    const lowerCategory = (resolvedPropertyType || '').toLowerCase();
    return (
      lowerCategory.includes('apartment') ||
      lowerCategory.includes('flat') ||
      lowerCategory.includes('transient') ||
      lowerCategory.includes('hostel') ||
      lowerCategory.includes('suite') ||
      lowerCategory.includes('villa')
    );
  }, [listing, roomTypes, resolvedPropertyType]);

  const resolvedKitchenSetup = useMemo(() => {
    if (!listing) return 'Not Specified';
    const raw = listing.kitchenSetup || listing.kitchenType || listing.propertyConfig?.kitchenSetup || listing.config?.kitchenSetup || listing.businessInfo?.kitchenSetup || '';
    if (raw === 'SHARED') return 'Shared Common Kitchen';
    if (raw === 'IN_UNIT') return 'Private In-Unit Kitchen';
    if (raw === 'NONE' || raw === 'NO_KITCHEN') return 'No Kitchen Facility';
    if (raw && typeof raw === 'string' && raw.trim() !== '') return raw.replace(/_/g, ' ');

    const rawAmenities = [
      ...(Array.isArray(listing.amenities_list) ? listing.amenities_list : []),
      ...(Array.isArray(listing.amenities) ? listing.amenities : []),
      ...(Array.isArray(listing.propertyConfig?.amenities) ? listing.propertyConfig.amenities : []),
      ...(Array.isArray(listing.listingLinks) ? listing.listingLinks.map((l: any) => l.attribute?.id || l.attributeId || l.attribute?.name).filter(Boolean) : []),
    ];

    for (const attrId of rawAmenities) {
      const name = resolveAmenityName(attrId).toLowerCase();
      if (
        name.includes('kitchen') ||
        name.includes('dish drying') ||
        name.includes('stove') ||
        name.includes('fridge') ||
        name.includes('refrigerator') ||
        name.includes('microwave') ||
        name.includes('rice cooker') ||
        name.includes('cooker') ||
        name.includes('utensil') ||
        name.includes('kettle')
      ) {
        return isApartmentOrFlatRate ? 'Private In-Unit Kitchen' : 'Shared Common Kitchen';
      }
    }
    return 'Not Specified';
  }, [listing, attributes, isApartmentOrFlatRate]);

  const resolvedContractMode = useMemo(() => {
    if (!listing) return 'AUTO_GEN';
    const explicitMode = listing.contractMode || listing.propertyConfig?.contractMode || listing.businessInfo?.contractMode || listing.leaseContracts?.[0]?.contractMode;
    if (explicitMode === 'CUSTOM_PDF' || explicitMode === 'CUSTOM') return 'CUSTOM_PDF';

    const hasPdfDoc = Boolean(
      listing.customPdfUrl ||
      listing.pdfUrl ||
      listing.propertyConfig?.customPdfUrl ||
      listing.propertyConfig?.pdfUrl ||
      listing.documents?.customContract ||
      listing.documents?.contract ||
      listing.businessInfo?.documents?.customContract ||
      listing.businessInfo?.documents?.contract ||
      listing.contractUrl ||
      listing.leaseContracts?.[0]?.pdfUrl ||
      listing.leaseContracts?.[0]?.contractUrl
    );

    if (hasPdfDoc) return 'CUSTOM_PDF';
    return explicitMode || 'AUTO_GEN';
  }, [listing]);

  const resolvedLandlordSignature = useMemo(() => {
    if (!listing) return '';
    return listing.landlordSignatureBase64 ||
      listing.propertyConfig?.landlordSignatureBase64 ||
      listing.leaseContracts?.[0]?.signatures?.find((s: any) => s.signerType === 'LANDLORD')?.signatureUrl ||
      listing.signature ||
      listing.documents?.landlordSignature ||
      '';
  }, [listing]);

  const customContractPdfUrl = useMemo(() => {
    if (!listing) return '';
    return listing.customPdfUrl ||
      listing.pdfUrl ||
      listing.propertyConfig?.customPdfUrl ||
      listing.propertyConfig?.pdfUrl ||
      listing.documents?.customContract ||
      listing.documents?.contract ||
      listing.businessInfo?.documents?.customContract ||
      listing.businessInfo?.documents?.contract ||
      listing.contractUrl ||
      listing.leaseContracts?.[0]?.pdfUrl ||
      listing.leaseContracts?.[0]?.contractUrl ||
      '';
  }, [listing]);

  const cleanPropTitle = useMemo(() => {
    const raw = listing?.title || listing?.name || listing?.basicInfo?.name || 'Property';
    return String(raw).replace(/[^a-zA-Z0-9_\-]/g, '_');
  }, [listing]);

  const displayCustomPdfName = useMemo(() => {
    return listing?.customPdfFileName || listing?.pdfFileName || listing?.propertyConfig?.customPdfFileName || `${cleanPropTitle}_Custom_Lease_Agreement.pdf`;
  }, [listing, cleanPropTitle]);

  const handlePreviewAutoGeneratedPdf = async () => {
    const pdfWindow = typeof window !== 'undefined' ? window.open('', '_blank') : null;
    try {
      const propName = listing?.title || listing?.name || listing?.basicInfo?.name || 'Boarding House Property';
      const propAddress = listing?.address || listing?.streetAddress || listing?.location?.address || 'Property Address';
      const deposit = Number(listing?.depositAmount || listing?.propertyConfig?.depositAmount || 0);
      const noticeDays = Number(listing?.moveOutNoticeDays || listing?.propertyConfig?.moveOutNoticeDays || 30);
      const signature = resolvedLandlordSignature;
      const clauses = listing?.customContractClauses || listing?.propertyConfig?.customContractClauses || listing?.customClauses || [];

      const rooms = listing?.rooms || [];
      const roomPrices = rooms.map((r: any) => Number(r.price || 0)).filter((p: number) => p > 0);
      const rentPrice = roomPrices.length > 0 ? Math.min(...roomPrices) : Number(listing?.price || 0);

      const pdfBlob = await generateLeaseContractPDF(`${cleanPropTitle}_BoardTAU_Smart_Lease_Contract.pdf`, {
        contractHash: `AUDIT-${listing?.id ? String(listing.id).substring(0, 8).toUpperCase() : Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        landlordName: listing?.landlord?.fullName || listing?.landlordName || listing?.hostName || 'Property Owner / Landlord',
        tenantName: '[TENANT NAME APPLICANT]',
        propertyName: propName,
        roomName: 'Standard Unit / Room',
        propertyAddress: propAddress,
        moveInDate: 'Effective Upon Signing',
        checkOutDate: 'Per Lease Agreement Duration',
        depositAmount: deposit,
        rentAmount: rentPrice,
        moveOutNoticeDays: noticeDays,
        customClauses: clauses,
        landlordSignatureBase64: signature,
        tenantSignatureBase64: ''
      }, true);

      if (pdfBlob) {
        const blob = new Blob([pdfBlob as Blob], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(blob);
        if (pdfWindow) {
          pdfWindow.location.href = pdfUrl;
        } else {
          window.open(pdfUrl, '_blank');
        }
      } else if (pdfWindow) {
        pdfWindow.close();
      }
    } catch (err) {
      console.error('Error generating smart lease contract PDF preview:', err);
      if (pdfWindow) pdfWindow.close();
    }
  };

  const handleViewCustomPdf = () => {
    if (!customContractPdfUrl) return;
    if (customContractPdfUrl.startsWith('blob:')) {
      alert('This custom contract document was uploaded as a temporary browser session file during testing. A permanent cloud document upload is required.');
      return;
    }
    window.open(customContractPdfUrl, '_blank');
  };

  // Dynamic Grouping of Shared Amenities, Rules & Security by Sub-Group
  const groupedSubStepItems = useMemo(() => {
    if (!listing) return { amenitiesBySubGroup: [], rulesBySubGroup: [], featuresBySubGroup: [] };

    const rawAmenities: string[] = [
      ...(Array.isArray(listing.amenities_list) ? listing.amenities_list : []),
      ...(Array.isArray(listing.amenities) ? listing.amenities : []),
      ...(Array.isArray(listing.propertyConfig?.amenities) ? listing.propertyConfig.amenities : []),
      ...(Array.isArray(listing.listingLinks) ? listing.listingLinks.map((l: any) => l.attribute?.id || l.attributeId).filter(Boolean) : []),
    ];

    const rawRules: string[] = [
      ...(Array.isArray(listing.rules?.customRules) ? listing.rules.customRules : []),
      ...(Array.isArray(listing.customRules) ? listing.customRules : []),
      ...(Array.isArray(listing.customRulesList) ? listing.customRulesList : []),
      ...(Array.isArray(listing.rules) ? listing.rules : []),
      ...(Array.isArray(listing.propertyConfig?.rules) ? listing.propertyConfig.rules : []),
    ];

    const rawFeatures: string[] = [
      ...(Array.isArray(listing.features?.customFeatures) ? listing.features.customFeatures : []),
      ...(Array.isArray(listing.customFeatures) ? listing.customFeatures : []),
      ...(Array.isArray(listing.features) ? listing.features : []),
      ...(Array.isArray(listing.securityFeatures) ? listing.securityFeatures : []),
      ...(Array.isArray(listing.propertyConfig?.features) ? listing.propertyConfig.features : []),
    ];

    const getSubGroupTitle = (key: string, defaultTitle: string) => {
      const matched = dbSubGroups.find(s => s.key === key);
      return matched?.tabLabel || matched?.title || defaultTitle;
    };

    const amenitiesMap: Record<string, { key: string; label: string; items: string[] }> = {};
    const rulesMap: Record<string, { key: string; label: string; items: string[] }> = {};
    const featuresMap: Record<string, { key: string; label: string; items: string[] }> = {};

    const RULE_SUBGROUPS = new Set(['GENDER_POLICY', 'CURFEW', 'VISITOR_POLICY', 'PET_POLICY', 'SMOKING_POLICY', 'ALCOHOL_POLICY', 'SMOKE_ALCOHOL', 'HOUSE_RULES', 'POLICY']);
    const SECURITY_SUBGROUPS = new Set(['SECURITY', 'DISASTER_SAFETY', 'DISASTER_PREP', 'SAFETY', 'FIRE_SAFETY']);

    // 1. Shared Amenities & Categorized Rules/Features from attributes
    rawAmenities.forEach(attrId => {
      const name = resolveAmenityName(attrId);
      if (!name) return;

      const matched = attributes.find(a => a.id === attrId || a.value === attrId || a.code === attrId || attrId.startsWith(a.id + '|'));
      const key = matched?.subGroupKey || matched?.subGroup || 'STORES';
      const type = matched?.type;
      const lowerName = name.toLowerCase();

      const isSecurity = type === 'FEATURE' || SECURITY_SUBGROUPS.has(key) ||
        (lowerName.includes('smoke detector') || lowerName.includes('fire extinguisher') || lowerName.includes('first aid') || lowerName.includes('emergency hallway') || lowerName.includes('flood-free') || lowerName.includes('security') || lowerName.includes('cctv') || lowerName.includes('keycard') || lowerName.includes('biometric'));

      const isRule = !isSecurity && (type === 'RULE' || RULE_SUBGROUPS.has(key) ||
        lowerName.includes('curfew') || lowerName.includes('guest') || lowerName.includes('visitor') ||
        lowerName.includes('pet policy') || (lowerName.includes('smoke') && !lowerName.includes('detector')) || lowerName.includes('alcohol') ||
        lowerName.includes('gender') || lowerName.includes('female only') || lowerName.includes('male only'));

      if (isSecurity) {
        const label = getSubGroupTitle(key, 'Security Features');
        if (!featuresMap[key]) featuresMap[key] = { key, label, items: [] };
        if (!featuresMap[key].items.includes(name)) featuresMap[key].items.push(name);
      } else if (isRule) {
        const label = getSubGroupTitle(key, 'House Rules');
        if (!rulesMap[key]) rulesMap[key] = { key, label, items: [] };
        if (!rulesMap[key].items.includes(name)) rulesMap[key].items.push(name);
      } else {
        const label = getSubGroupTitle(key, 'Shared Amenities');
        if (!amenitiesMap[key]) amenitiesMap[key] = { key, label, items: [] };
        if (!amenitiesMap[key].items.includes(name)) amenitiesMap[key].items.push(name);
      }
    });

    // 2. House Rules Flags
    if (listing.rules?.femaleOnly || listing.femaleOnly || listing.propertyConfig?.femaleOnly) {
      const title = getSubGroupTitle('GENDER_POLICY', 'Gender Policy');
      if (!rulesMap['GENDER_POLICY']) rulesMap['GENDER_POLICY'] = { key: 'GENDER_POLICY', label: title, items: [] };
      if (!rulesMap['GENDER_POLICY'].items.includes('Female Only Accommodation')) rulesMap['GENDER_POLICY'].items.push('Female Only Accommodation');
    }
    if (listing.rules?.maleOnly || listing.maleOnly || listing.propertyConfig?.maleOnly) {
      const title = getSubGroupTitle('GENDER_POLICY', 'Gender Policy');
      if (!rulesMap['GENDER_POLICY']) rulesMap['GENDER_POLICY'] = { key: 'GENDER_POLICY', label: title, items: [] };
      if (!rulesMap['GENDER_POLICY'].items.includes('Male Only Accommodation')) rulesMap['GENDER_POLICY'].items.push('Male Only Accommodation');
    }
    if (listing.rules?.noCurfew || listing.noCurfew || listing.propertyConfig?.noCurfew) {
      const title = getSubGroupTitle('CURFEW', 'Curfew & Gate Rules');
      if (!rulesMap['CURFEW']) rulesMap['CURFEW'] = { key: 'CURFEW', label: title, items: [] };
      if (!rulesMap['CURFEW'].items.includes('24/7 Open Gate (No Curfew)')) rulesMap['CURFEW'].items.push('24/7 Open Gate (No Curfew)');
    }
    if (listing.rules?.visitorsAllowed || listing.visitorsAllowed || listing.propertyConfig?.visitorsAllowed) {
      const title = getSubGroupTitle('VISITOR_POLICY', 'Visitor Policy');
      if (!rulesMap['VISITOR_POLICY']) rulesMap['VISITOR_POLICY'] = { key: 'VISITOR_POLICY', label: title, items: [] };
      if (!rulesMap['VISITOR_POLICY'].items.includes('Visitors & Guests Allowed')) rulesMap['VISITOR_POLICY'].items.push('Visitors & Guests Allowed');
    }
    if (listing.rules?.petsAllowed || listing.petsAllowed || listing.propertyConfig?.petsAllowed) {
      const title = getSubGroupTitle('PET_POLICY', 'Pet Policy');
      if (!rulesMap['PET_POLICY']) rulesMap['PET_POLICY'] = { key: 'PET_POLICY', label: title, items: [] };
      if (!rulesMap['PET_POLICY'].items.includes('Pets Allowed Onsite')) rulesMap['PET_POLICY'].items.push('Pets Allowed Onsite');
    }

    rawRules.forEach(attrId => {
      const name = resolveAmenityName(attrId);
      if (!name) return;
      const matched = attributes.find(a => a.id === attrId || a.value === attrId || a.code === attrId || attrId.startsWith(a.id + '|'));
      const key = matched?.subGroupKey || matched?.subGroup || 'HOUSE_RULES';
      const label = getSubGroupTitle(key, 'House Rules');

      if (!rulesMap[key]) rulesMap[key] = { key, label, items: [] };
      if (!rulesMap[key].items.includes(name)) rulesMap[key].items.push(name);
    });

    // 3. Security Features Flags
    if (listing.features?.security24h || listing.security24h || listing.propertyConfig?.security24h) {
      const title = getSubGroupTitle('SECURITY', 'Security & Gate Access');
      if (!featuresMap['SECURITY']) featuresMap['SECURITY'] = { key: 'SECURITY', label: title, items: [] };
      if (!featuresMap['SECURITY'].items.includes('24/7 Security Guard')) featuresMap['SECURITY'].items.push('24/7 Security Guard');
    }
    if (listing.features?.cctv || listing.cctv || listing.propertyConfig?.cctv) {
      const title = getSubGroupTitle('SECURITY', 'Security & Gate Access');
      if (!featuresMap['SECURITY']) featuresMap['SECURITY'] = { key: 'SECURITY', label: title, items: [] };
      if (!featuresMap['SECURITY'].items.includes('CCTV Surveillance System')) featuresMap['SECURITY'].items.push('CCTV Surveillance System');
    }
    if (listing.features?.fireSafety || listing.fireSafety || listing.propertyConfig?.fireSafety) {
      const title = getSubGroupTitle('DISASTER_PREP', 'Disaster & Fire Safety');
      if (!featuresMap['DISASTER_PREP']) featuresMap['DISASTER_PREP'] = { key: 'DISASTER_PREP', label: title, items: [] };
      if (!featuresMap['DISASTER_PREP'].items.includes('Fire Alarm & Smoke Detectors')) featuresMap['DISASTER_PREP'].items.push('Fire Alarm & Smoke Detectors');
    }

    rawFeatures.forEach(attrId => {
      const name = resolveAmenityName(attrId);
      if (!name) return;
      const matched = attributes.find(a => a.id === attrId || a.value === attrId || a.code === attrId || attrId.startsWith(a.id + '|'));
      const key = matched?.subGroupKey || matched?.subGroup || 'SECURITY';
      const label = getSubGroupTitle(key, 'Security Features');

      if (!featuresMap[key]) featuresMap[key] = { key, label, items: [] };
      if (!featuresMap[key].items.includes(name)) featuresMap[key].items.push(name);
    });

    return {
      amenitiesBySubGroup: Object.values(amenitiesMap),
      rulesBySubGroup: Object.values(rulesMap),
      featuresBySubGroup: Object.values(featuresMap),
    };
  }, [listing, attributes, dbSubGroups]);

  if (!listing) return null;

  const statusStr = String(listing.status || 'pending').toLowerCase();
  const isArchived = Boolean(listing.isAdminArchived || listing.isArchived || statusStr === 'archived');
  const isPending = statusStr === 'pending' && !isArchived;
  const isApproved = (statusStr === 'approved' || statusStr === 'active') && !isArchived;
  const isRejected = statusStr === 'rejected' && !isArchived;

  const handleAction = async (action: 'approve' | 'reject', reason?: string) => {
    onDecision(listing.id, action, reason);
  };

  const handleOpenPreview = (images: any[], index = 0, title = 'Media Preview', isDocument = false) => {
    const rawList = Array.isArray(images) ? images : [images];
    const validImages = rawList
      .map(item => (typeof item === 'string' ? item : item?.url || item?.src || item?.path || ''))
      .filter(Boolean);

    if (validImages.length === 0) return;

    setPreviewState({
      isOpen: true,
      images: validImages,
      currentIndex: Math.max(0, Math.min(index, validImages.length - 1)),
      title,
      isDocument
    });
  };

  const PREDEFINED_REASONS = [
    "Fraudulent or forged business documents",
    "Fire safety certificate expired or invalid",
    "Property images do not meet quality standards",
    "Missing required legal information"
  ];

  const roomsList = listing.rooms || [];
  const propertyPhotos = Array.isArray(listing.images) ? listing.images : [];
  const docUrls: Record<string, string> = {
    governmentId: listing.businessInfo?.documents?.governmentId || listing.governmentIdUrl || listing.documents?.governmentId || '',
    businessPermit: listing.businessInfo?.documents?.businessPermit || listing.businessPermitUrl || listing.documents?.businessPermit || '',
    landTitle: listing.businessInfo?.documents?.landTitle || listing.landTitleUrl || listing.documents?.landTitle || '',
    barangayClearance: listing.businessInfo?.documents?.barangayClearance || listing.barangayClearanceUrl || listing.documents?.barangayClearance || '',
    fireSafetyCertificate: listing.businessInfo?.documents?.fireSafetyCertificate || listing.fireSafetyUrl || listing.documents?.fireSafetyCertificate || '',
  };
  const docCount = Object.values(docUrls).filter(Boolean).length;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} width="full" noPadding>
        <div className="flex flex-col h-[90vh] max-h-[920px] w-full max-w-[1380px] mx-auto bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
          
          {/* Modal Header */}
          <div className="p-5 sm:p-7 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 shrink-0 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 shadow-sm">
                  <Building2 size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                      {listing.title || listing.propertyName || 'Property Listing Review'}
                    </h2>
                    {isArchived ? (
                      <>
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30">
                          ARCHIVED
                        </span>
                        {listing.status && (
                          <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border opacity-75", statusColors[statusStr] || 'bg-amber-500/15 text-amber-700 border-amber-500/30')}>
                            {listing.status}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border", statusColors[statusStr] || 'bg-amber-500/15 text-amber-700 border-amber-500/30')}>
                        {listing.status}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1 flex items-center gap-2 flex-wrap">
                    <span>Host: <strong className="text-slate-900 dark:text-white">{listing.user?.name || listing.host?.name || 'Landlord Host'}</strong></span>
                    <span>•</span>
                    <span className="text-primary font-black">{resolvedPropertyType}</span>
                    <span>•</span>
                    <span className="text-slate-900 dark:text-white font-extrabold">₱{Number(listing.price || 0).toLocaleString()}/mo</span>
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
                  title="Close Review Window"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {[
                { id: 'OVERVIEW', label: '1. Basic Info & Host', icon: Building2 },
                { id: 'LOCATION', label: '2. Location & Map', icon: MapPin },
                { id: 'CONFIG', label: '3. Setup & Rules', icon: FileText },
                { id: 'ROOMS', label: `4. ${isApartmentOrFlatRate ? 'Units' : 'Rooms'} (${roomsList.length})`, icon: Bed },
                { id: 'IMAGES', label: `5. Photos (${propertyPhotos.length})`, icon: Camera },
                { id: 'DOCS', label: `6. Documents (${docCount})`, icon: ShieldCheck },
              ].map((tab, idx) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                const isUnlocked = !isPending || idx <= maxUnlockedStepIdx;
                const isConfirmed = confirmedSteps[idx];

                return (
                  <button
                    key={tab.id}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => {
                      if (isUnlocked) setActiveTab(tab.id as any);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border select-none shrink-0",
                      !isUnlocked
                        ? "bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 border-transparent cursor-not-allowed opacity-60"
                        : isActive
                          ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02] cursor-pointer"
                          : "bg-slate-100 dark:bg-slate-800/80 border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    )}
                  >
                    {!isUnlocked ? (
                      <Lock size={13} className="text-slate-400 shrink-0" />
                    ) : isConfirmed && !isActive ? (
                      <CheckCircle2 size={14} className="text-primary shrink-0" />
                    ) : (
                      <TabIcon size={14} />
                    )}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
          </div>

          {/* Inspection Mode Status Notification Banner (Non-Pending & Archived States) */}
          {!isPending && (
            <div className="mx-5 sm:mx-7 mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shrink-0 shadow-inner">
              {isArchived ? (
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/30 shrink-0">
                    <Archive size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                      <span>Archived Listing — Inspection Mode</span>
                    </h4>
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                      This property listing is currently archived. All photos, specs, and documents are available for inspection below.
                    </p>
                  </div>
                </div>
              ) : isApproved ? (
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/15 text-primary rounded-xl border border-primary/30 shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-primary">
                      Approved Listing — Read-Only Mode
                    </h4>
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                      This property listing has been verified and published.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-rose-500/15 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-500/30 shrink-0">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      Rejected Listing — Read-Only Mode
                    </h4>
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                      {listing.rejectionReason ? `Reason: ${listing.rejectionReason}` : 'This property listing was rejected during moderation.'}
                    </p>
                  </div>
                </div>
              )}

              {isArchived && onRestore && (
                <Button
                  type="button"
                  onClick={() => {
                    onRestore?.(listing);
                    onClose();
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/20 shrink-0 cursor-pointer"
                >
                  <RotateCcw size={14} /> Restore Listing
                </Button>
              )}
            </div>
          )}
          </div>

          {/* Scrollable Modal Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden custom-scrollbar bg-slate-50/60 dark:bg-slate-950/60">
            <AnimatePresence mode="wait">
              {isInitialLoading ? (
                <motion.div 
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-96 flex flex-col items-center justify-center gap-4"
                >
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">Loading Listing Details...</p>
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Active Step Content */}
                    <div className={cn(isPending ? "lg:col-span-8" : "lg:col-span-12", "space-y-6")}>
                      {/* TAB 1: BASIC INFO & HOST IDENTITY */}
                      {activeTab === 'OVERVIEW' && (
                        <div className="space-y-6">
                          {/* Host Profile Card (Rendered at top for Host & Identity Audit) */}
                          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                  <User size={18} />
                                </div>
                                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Landlord Host Profile</h4>
                              </div>

                              {/* Host Direct Contact Actions */}
                              <div className="flex items-center gap-2">
                                {(listing.user?.email || listing.host?.email) && (
                                  <a
                                    href={`mailto:${listing.user?.email || listing.host?.email}?subject=BoardTAU Listing Audit Query for ${encodeURIComponent(listing.title || 'your property')}`}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider transition-all border border-slate-200 dark:border-slate-700"
                                    title="Send Email to Host"
                                  >
                                    <Mail size={12} /> Email Host
                                  </a>
                                )}
                                {(listing.user?.phone || listing.host?.phone || listing.businessInfo?.phone) && (
                                  <a
                                    href={`tel:${listing.user?.phone || listing.host?.phone || listing.businessInfo?.phone}`}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider transition-all border border-slate-200 dark:border-slate-700"
                                    title="Call Host Phone"
                                  >
                                    <Phone size={12} /> Call Host
                                  </a>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                              <div className="flex items-center gap-4">
                                {listing.user?.image || listing.host?.image ? (
                                  <SafeImage src={listing.user?.image || listing.host?.image} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/20 shadow-md" />
                                ) : (
                                  <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary font-black text-xl flex items-center justify-center border border-primary/20">
                                    {(listing.user?.name || listing.host?.name || 'H').charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{listing.user?.name || listing.host?.name || 'Landlord Host'}</h3>
                                  <p className="text-xs font-semibold text-slate-400 mt-0.5">{listing.user?.email || listing.host?.email || 'N/A'}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                                      <ShieldCheck size={12} /> Verified Host Profile
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {listing.businessInfo && (
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 min-w-[220px]">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Registered Business</span>
                                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{listing.businessInfo.businessName || 'N/A'}</p>
                                  {listing.businessInfo.yearsExperience ? (
                                    <p className="text-[10px] font-bold text-primary uppercase">{listing.businessInfo.yearsExperience} Years Experience</p>
                                  ) : listing.businessInfo.businessType ? (
                                    <p className="text-[10px] font-bold text-primary uppercase">{formatPropertyType(listing.businessInfo.businessType)}</p>
                                  ) : null}
                                </div>
                              )}
                            </div>

                            {listing.businessInfo?.businessDescription && (
                              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Host Mission</span>
                                <div className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-3 whitespace-pre-line">
                                  {String(listing.businessInfo.businessDescription).split(/\n\s*\n/).map((para: string, idx: number) => (
                                    <p key={idx} className="leading-relaxed">
                                      {para.trim()}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Property Information Card */}
                          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                <Building2 size={18} />
                              </div>
                              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Property Information</h4>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Property Name</span>
                                <p className="text-sm font-black text-slate-900 dark:text-white">{listing.title || listing.propertyName || 'N/A'}</p>
                              </div>

                              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Property Type</span>
                                <p className="text-sm font-black text-primary uppercase">{resolvedPropertyType}</p>
                              </div>

                              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Monthly Rate</span>
                                <p className="text-sm font-black text-slate-900 dark:text-white">₱{Number(listing.price || 0).toLocaleString()}/mo</p>
                              </div>
                            </div>

                            {listing.description && (
                              <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Property Overview & Description</span>
                                <div className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-3 whitespace-pre-line">
                                  {listing.description.split(/\n\s*\n/).map((para: string, idx: number) => (
                                    <p key={idx} className="leading-relaxed">
                                      {para.trim()}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                  {/* TAB 2: LOCATION & MAP */}
                  {activeTab === 'LOCATION' && (() => {
                    const [mapLat, mapLng] = getParsedCoordinates(listing);
                    const heroImage = listing.imageSrc || (Array.isArray(listing.images) && listing.images[0]?.url) || '';

                    return (
                      <div className="space-y-6">
                        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                <MapPin size={18} />
                              </div>
                              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Property Location</h4>
                            </div>

                            {(listing.proximity || listing.distanceToTau || listing.distance) && (
                              <div className="px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                                <MapPin size={14} /> {listing.proximity || listing.distanceToTau || listing.distance}
                              </div>
                            )}
                          </div>

                          {/* Complete Organized Address Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Street Address & Barangay</span>
                              <p className="text-xs font-black text-slate-900 dark:text-white leading-relaxed">
                                {listing.address || (listing.location && listing.location.address) || 'Not Provided'}
                              </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">City / Municipality</span>
                              <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                                {listing.city || (listing.location && listing.location.city) || 'Camiling'}
                              </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Province</span>
                              <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                                {listing.region || listing.province || (listing.location && listing.location.province) || 'Tarlac'}
                              </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Zip Code</span>
                              <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                                {listing.zipCode || (listing.location && listing.location.zipCode) || '2306'}
                              </p>
                            </div>
                          </div>

                          {/* Interactive Geolocation Map with Property Title & Hero Image */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Pinpoint Coordinates Preview</span>
                            <div className="h-72 sm:h-96 w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md relative z-0">
                              <Map
                                center={[mapLat, mapLng]}
                                title={listing.title || listing.propertyName || "Property Location"}
                                imageSrc={heroImage}
                                readonly={true}
                                allowPinDrop={true}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* TAB 3: SETUP & RULES */}
                  {activeTab === 'CONFIG' && (
                    <div className="space-y-6">
                      {/* Building Specifications Card */}
                      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                            <FileText size={18} />
                          </div>
                          <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Property Structure & Specs</h4>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Total {isApartmentOrFlatRate ? 'Unit' : 'Room'} Inventory</span>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{roomsList.length || listing.roomCount || 1} {isApartmentOrFlatRate ? 'Units' : 'Rooms'} Registered</p>
                          </div>

                          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Bathroom Count</span>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{listing.bathroomCount || 1} Bathrooms</p>
                          </div>

                          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Kitchen Setup</span>
                            <p className="text-xs font-black text-primary uppercase">{resolvedKitchenSetup}</p>
                          </div>

                          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Bathroom Setup</span>
                            <p className="text-xs font-black text-primary uppercase">{listing.bathroomSetup === 'PRIVATE' ? 'Own Private CR' : 'Shared Common CR'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Shared Amenities Grouped by Taxonomy */}
                      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                          <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                            <ListChecks size={16} className="text-blue-500" />
                            <span>Shared Property Amenities</span>
                          </h4>

                          <button
                            type="button"
                            onClick={() => setAmenitiesModalConfig({ isOpen: true, initialCategory: 'AMENITIES' })}
                            className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
                          >
                            <Maximize2 size={13} /> View All Amenities
                          </button>
                        </div>

                        {groupedSubStepItems.amenitiesBySubGroup.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {groupedSubStepItems.amenitiesBySubGroup.map(group => (
                              <div key={group.key} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                                <span className="text-[9px] font-black uppercase tracking-wider text-blue-500 block">{group.label}</span>
                                <div className="flex flex-wrap gap-2">
                                  {group.items.map((item, i) => {
                                    const ItemIcon = getItemIcon(item);
                                    return (
                                      <span key={i} className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-200/60 dark:border-blue-500/30 text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 shadow-sm">
                                        <ItemIcon size={14} className="text-blue-500 shrink-0" />
                                        <span>{item}</span>
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs font-bold text-slate-400 italic">No shared property amenities specified</p>
                        )}
                      </div>

                      {/* House Rules Grouped by Taxonomy */}
                      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                          <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                            <Shield size={16} className="text-purple-500" />
                            <span>House Rules & Policies</span>
                          </h4>

                          <button
                            type="button"
                            onClick={() => setAmenitiesModalConfig({ isOpen: true, initialCategory: 'RULES' })}
                            className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
                          >
                            <Maximize2 size={13} /> View All Rules
                          </button>
                        </div>

                        {groupedSubStepItems.rulesBySubGroup.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {groupedSubStepItems.rulesBySubGroup.map(group => (
                              <div key={group.key} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                                <span className="text-[9px] font-black uppercase tracking-wider text-purple-500 block">{group.label}</span>
                                <div className="flex flex-wrap gap-2">
                                  {group.items.map((item, i) => {
                                    const ItemIcon = getItemIcon(item);
                                    return (
                                      <span key={i} className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-200/60 dark:border-purple-500/30 text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 shadow-sm">
                                        <ItemIcon size={14} className="text-purple-500 shrink-0" />
                                        <span>{item}</span>
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs font-bold text-slate-400 italic">No specific house rules specified</p>
                        )}
                      </div>

                      {/* Security Features */}
                      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                          <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                            <Star size={16} className="text-amber-500" />
                            <span>Security & Safety Features</span>
                          </h4>

                          <button
                            type="button"
                            onClick={() => setAmenitiesModalConfig({ isOpen: true, initialCategory: 'SECURITY' })}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
                          >
                            <Maximize2 size={13} /> View All Security
                          </button>
                        </div>

                        {groupedSubStepItems.featuresBySubGroup.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {groupedSubStepItems.featuresBySubGroup.map(group => (
                              <div key={group.key} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                                <span className="text-[9px] font-black uppercase tracking-wider text-amber-500 block">{group.label}</span>
                                <div className="flex flex-wrap gap-2">
                                  {group.items.map((item, i) => {
                                    const ItemIcon = getItemIcon(item);
                                    return (
                                      <span key={i} className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-amber-500/30 text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 shadow-sm">
                                        <ItemIcon size={14} className="text-amber-500 shrink-0" />
                                        <span>{item}</span>
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs font-bold text-slate-400 italic">No security features listed</p>
                        )}
                      </div>

                      {/* Lease Contract & Terms Verification */}
                      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-500">
                            <FileCheck size={18} />
                          </div>
                          <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Lease Contract & Terms Verification</h4>
                        </div>

                        {resolvedContractMode === 'CUSTOM_PDF' ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Contract Mode</span>
                              <p className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                                <FileText size={14} /> Uploaded Custom Lease Contract (PDF)
                              </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Custom Lease Contract File</span>
                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider truncate" title={displayCustomPdfName}>
                                  {customContractPdfUrl ? displayCustomPdfName : 'No Document Uploaded'}
                                </p>
                              </div>
                              {customContractPdfUrl ? (
                                <button
                                  type="button"
                                  onClick={handleViewCustomPdf}
                                  className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
                                >
                                  <Eye size={14} /> View Contract PDF
                                </button>
                              ) : (
                                <span className="text-[10px] font-extrabold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 shrink-0">
                                  Missing PDF
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Contract Mode</span>
                                <p className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                                  <Sparkles size={14} /> BoardTAU Smart Contract Generator
                                </p>
                              </div>

                              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Security Deposit Terms</span>
                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase">
                                  {(listing.depositAmount || listing.propertyConfig?.depositAmount) ? `₱${Number(listing.depositAmount || listing.propertyConfig?.depositAmount).toLocaleString()} Deposit` : 'No Deposit Required'}
                                </p>
                              </div>

                              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Move-Out Notice Period</span>
                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase">
                                  {(listing.moveOutNoticeDays || listing.propertyConfig?.moveOutNoticeDays) ? `${listing.moveOutNoticeDays || listing.propertyConfig?.moveOutNoticeDays} Days Notice` : '30 Days Notice Required'}
                                </p>
                              </div>
                            </div>

                            {resolvedLandlordSignature ? (
                              <div className="p-4 rounded-2xl bg-teal-500/5 border border-teal-500/20 space-y-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-teal-600 dark:text-teal-400 block">Landlord E-Signature Verification</span>
                                <div className="flex items-center gap-4">
                                  <img src={resolvedLandlordSignature} alt="Landlord Signature" className="h-14 object-contain bg-white rounded-xl p-2 border border-slate-200 dark:border-slate-700" />
                                  <div>
                                    <p className="text-xs font-black text-slate-900 dark:text-white">Digital Cryptographic Signature Captured</p>
                                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                      <Check size={10} /> Validated & Attached to Lease Contract
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Landlord E-Signature Verification</span>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 italic">No digital e-signature captured yet</p>
                              </div>
                            )}

                            {/* Auto-Generated Contract PDF Preview Action Banner for Admin */}
                            <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 shrink-0">
                                  <FileCheck size={20} />
                                </div>
                                <div>
                                  <h6 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Auto-Generated Smart Lease Agreement</h6>
                                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Generate and preview standard PDF lease contract populated with property rules & deposit terms.</p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={handlePreviewAutoGeneratedPdf}
                                className="w-full sm:w-auto px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 shadow-md cursor-pointer"
                              >
                                <Eye size={15} />
                                <span>Preview Smart Lease PDF</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: ROOM UNITS BREAKDOWN */}
                  {activeTab === 'ROOMS' && (
                    <div className="space-y-6">
                      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                              <Bed size={20} />
                            </div>
                            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Registered Property {isApartmentOrFlatRate ? 'Units' : 'Rooms'} ({roomsList.length})</h4>
                          </div>
                        </div>

                        {/* Room Selector Navigation Pills */}
                        {roomsList.length > 1 && (
                          <div ref={roomTabContainerRef} className="flex items-center gap-2 overflow-x-auto pb-2 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border-b border-slate-100 dark:border-slate-800">
                            {roomsList.map((room: any, idx: number) => {
                              const roomTypeName = resolveRoomTypeName(room);
                              const isActive = selectedRoomIdx === idx;
                              const isFlatRate = checkIsFlatRate(room);

                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  data-active={isActive ? "true" : "false"}
                                  onClick={() => setSelectedRoomIdx(idx)}
                                  className={cn(
                                    "flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer select-none shrink-0",
                                    isActive
                                      ? "bg-primary text-white border-primary shadow-sm"
                                      : "bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                  )}
                                >
                                  <Bed size={14} />
                                  <span>{isFlatRate ? 'Unit' : 'Room'} {idx + 1}: {roomTypeName}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Room Cards Display */}
                        {roomsList.length > 0 ? (
                          <div className="grid grid-cols-1 gap-6">
                            {roomsList
                              .filter((_: any, idx: number) => (selectedRoomIdx < roomsList.length ? selectedRoomIdx === idx : idx === 0))
                              .map((room: any) => {
                                const roomIdx = selectedRoomIdx < roomsList.length ? selectedRoomIdx : 0;
                                const roomTypeName = resolveRoomTypeName(room);
                                const isFlatRate = checkIsFlatRate(room);
                                const isPrivateCR = room.bathroomArrangement === 'PRIVATE_CR' || room.bathroomArrangement === 'PRIVATE' || room.bathroomType === 'PRIVATE';

                                const inUnitAmenities: string[] = [
                                  ...(Array.isArray(room.amenities) ? room.amenities : []),
                                  ...(Array.isArray(room.amenityNames) ? room.amenityNames : []),
                                  ...(Array.isArray(room.roomLinks) ? room.roomLinks.map((link: any) => link.attribute?.name || link.attribute?.id || link.attributeId).filter(Boolean) : []),
                                  ...(Array.isArray(room.attributes) ? room.attributes : []),
                                  ...(Array.isArray(room.features) ? room.features : []),
                                ];
                                const groupedAmenities = groupInUnitAmenities(inUnitAmenities);
                                const totalInUnitCount = groupedAmenities.reduce((sum, g) => sum + g.items.length, 0);

                                return (
                                  <div key={roomIdx} className="p-6 rounded-3xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-5 shadow-sm">
                                    {/* Header */}
                                    <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-700/60">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary font-black text-sm flex items-center justify-center shrink-0 border border-primary/20">
                                          {roomIdx + 1}
                                        </div>
                                        <div>
                                          <h5 className="text-xs sm:text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider">{roomTypeName}</h5>
                                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
                                            {isFlatRate ? 'Unit Layout' : 'Room Layout'} #{roomIdx + 1} • {isFlatRate ? 'Whole Unit Rent' : 'Per Head Rent'}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="text-right">
                                        <span className="text-xs sm:text-sm font-black text-primary uppercase block">
                                          ₱{Number(room.price || listing.price || 0).toLocaleString()}/mo {isFlatRate ? '(Whole Unit)' : '(per Head)'}
                                        </span>
                                        {room.reservationFee && (
                                          <span className="text-[9px] font-bold text-slate-400 uppercase block mt-0.5">₱{Number(room.reservationFee).toLocaleString()} Reservation Fee</span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Specs Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">
                                          {isFlatRate ? 'Unit Floor Area' : 'Room Size'}
                                        </span>
                                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{room.size ? `${room.size} SQM` : 'N/A'}</p>
                                      </div>

                                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Bed Setup</span>
                                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{room.bedCount || '1'} x {resolveBedTypeName(room.bedType, room.roomType)}</p>
                                      </div>

                                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">
                                          {isFlatRate ? 'Unit Capacity' : 'Room Capacity'}
                                        </span>
                                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase">
                                          {room.capacity || ((Number(room.bedCount) || 1) * (String(room.bedType || '').toUpperCase().includes('BUNK') ? 2 : 1))} {isFlatRate ? 'Pax' : 'Slots (Beds)'}
                                        </p>
                                      </div>

                                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">CR Setup</span>
                                        <p className="text-xs font-black text-primary uppercase">{isPrivateCR ? 'Own Private CR' : 'Shared Common CR'}</p>
                                      </div>
                                    </div>

                                    {/* In-Unit Amenities */}
                                    <div className="space-y-3 pt-2">
                                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <Sparkles size={13} className="text-primary" />
                                        <span>In-Unit Features ({totalInUnitCount})</span>
                                      </span>

                                      {groupedAmenities.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          {groupedAmenities.map(group => (
                                            <div key={group.key} className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                                              <span className="text-[9px] font-black uppercase tracking-wider text-primary block">{group.label}</span>
                                              <div className="flex flex-wrap gap-1.5">
                                                {group.items.map((item, i) => {
                                                  const ItemIcon = getItemIcon(item);
                                                  return (
                                                    <span key={i} className="px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                                      <ItemIcon size={12} className="text-primary shrink-0" />
                                                      <span>{item}</span>
                                                    </span>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="text-[11px] font-bold text-slate-400 italic">No specific in-unit amenities selected</span>
                                      )}

                                      {/* Dynamic Bottom Room Navigation Buttons */}
                                      {roomsList.length > 1 && (
                                        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                                          <div>
                                            {roomIdx > 0 && (() => {
                                              const prevRoom = roomsList[roomIdx - 1];
                                              const prevTypeName = resolveRoomTypeName(prevRoom);
                                              const prevIsFlat = checkIsFlatRate(prevRoom);
                                              const prevLabel = `${prevIsFlat ? 'Unit' : 'Room'} ${roomIdx}: ${prevTypeName}`;

                                              return (
                                                <button
                                                  type="button"
                                                  onClick={() => setSelectedRoomIdx(roomIdx - 1)}
                                                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-200 text-xs font-black uppercase tracking-wider transition-all border border-slate-200 dark:border-slate-700 cursor-pointer shadow-sm"
                                                >
                                                  <ChevronLeft size={15} />
                                                  <span>PREVIOUS: {prevLabel}</span>
                                                </button>
                                              );
                                            })()}
                                          </div>

                                          <div>
                                            {roomIdx < roomsList.length - 1 && (() => {
                                              const nextRoom = roomsList[roomIdx + 1];
                                              const nextTypeName = resolveRoomTypeName(nextRoom);
                                              const nextIsFlat = checkIsFlatRate(nextRoom);
                                              const nextLabel = `${nextIsFlat ? 'Unit' : 'Room'} ${roomIdx + 2}: ${nextTypeName}`;

                                              return (
                                                <button
                                                  type="button"
                                                  onClick={() => setSelectedRoomIdx(roomIdx + 1)}
                                                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                                                >
                                                  <span>NEXT: {nextLabel}</span>
                                                  <ChevronRight size={15} />
                                                </button>
                                              );
                                            })()}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        ) : (
                          <p className="text-xs font-bold text-slate-400 italic">No room units registered yet.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: PHOTO GALLERY SHOWCASE */}
                  {activeTab === 'IMAGES' && (
                    <div className="space-y-6">
                      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-500 border border-teal-500/20">
                              <Camera size={20} />
                            </div>
                            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Property Photo Gallery Showcase ({propertyPhotos.length})</h4>
                          </div>
                        </div>

                        {/* Primary Showcase Image */}
                        {listing.imageSrc && (
                          <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Featured Primary Cover</span>
                            <div 
                              onClick={() => handleOpenPreview([listing.imageSrc, ...propertyPhotos.map((i: any) => i.url || i)], 0, 'Primary Listing Cover')}
                              className="relative h-72 sm:h-96 w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 cursor-pointer group shadow-md"
                            >
                              <SafeImage src={listing.imageSrc} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Maximize2 size={28} className="text-white" />
                              </div>
                              <span className="absolute bottom-4 left-4 px-3.5 py-1.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                                Main Cover Photo
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Categorized Photo Buckets */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {PROPERTY_IMAGE_CATEGORIES.map(cat => {
                            const IconComp = cat.icon;
                            const catPhotos = propertyPhotos.filter((img: any) => img.roomType === cat.id || img.category === cat.id || (cat.id === 'General' && !img.roomType && !img.category));

                            return (
                              <div key={cat.id} className="p-5 rounded-3xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-teal-500/10 text-teal-500 rounded-xl shrink-0">
                                      <IconComp size={16} />
                                    </div>
                                    <div>
                                      <h6 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">{cat.label}</h6>
                                      <p className="text-[10px] font-bold text-slate-400">{cat.description}</p>
                                    </div>
                                  </div>

                                  <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase border bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700">
                                    {catPhotos.length} Photos
                                  </span>
                                </div>

                                {catPhotos.length > 0 ? (
                                  <div className="flex flex-wrap gap-2.5 pt-1">
                                    {catPhotos.map((img: any, idx: number) => {
                                      const url = typeof img === 'string' ? img : (img.url || img.src);
                                      return (
                                        <div 
                                          key={idx} 
                                          onClick={() => handleOpenPreview(catPhotos, idx, `${cat.label} Photos`)}
                                          className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-slate-100 dark:bg-slate-800 cursor-pointer"
                                        >
                                          <SafeImage src={url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                          <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[1px]">
                                            <Maximize2 size={16} className="text-white" />
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-[11px] font-bold text-slate-400 italic pt-1">No photos uploaded for this category</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 6: LEGAL VERIFICATION DOCUMENTS */}
                  {activeTab === 'DOCS' && (
                    <div className="space-y-6">
                      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                              <ShieldCheck size={20} />
                            </div>
                            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Legal Verification Documents ({docCount} Uploaded)</h4>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[
                            { key: 'governmentId', label: 'Government Photo ID', desc: 'Valid photo ID of property owner' },
                            { key: 'businessPermit', label: "Mayor's / DTI Business Permit", desc: 'Official business permit' },
                            { key: 'landTitle', label: 'Land Title / Tax Declaration', desc: 'Proof of property ownership' },
                            { key: 'barangayClearance', label: 'Barangay Clearance', desc: 'Local barangay clearance' },
                            { key: 'fireSafetyCertificate', label: 'Fire Safety Inspection', desc: 'BFP safety inspection certificate' },
                          ].map(doc => {
                            const url = docUrls[doc.key];

                            return (
                              <div key={doc.key} className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <h5 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">{doc.label}</h5>
                                    <span className={cn(
                                      "text-[8px] font-black px-2 py-0.5 rounded-full uppercase border",
                                      url ? "bg-primary/10 text-primary border-primary/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                    )}>
                                      {url ? 'Uploaded' : 'Missing'}
                                    </span>
                                  </div>
                                  <p className="text-[10px] font-bold text-slate-400">{doc.desc}</p>
                                </div>

                                {url ? (
                                  <div 
                                    onClick={() => handleOpenPreview([url], 0, doc.label, true)}
                                    className="relative h-36 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer group shadow-sm bg-slate-100 dark:bg-slate-900"
                                  >
                                    <SafeImage src={url} alt={doc.label} loaderText="Loading Doc..." className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 backdrop-blur-[1px]">
                                      <Eye size={20} className="text-white" />
                                      <span className="text-[9px] font-black text-white uppercase tracking-widest">Inspect Document</span>
                                    </div>
                                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-primary/90 text-white text-[7px] font-black uppercase tracking-widest shadow-sm">
                                      Encrypted File
                                    </span>
                                  </div>
                                ) : (
                                  <div className="h-36 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center p-3">
                                    <AlertCircle size={20} className="text-slate-300 dark:text-slate-600 mb-1" />
                                    <span className="text-[10px] font-bold text-slate-400 italic">No document uploaded</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Dynamic Moderation Audit Checklist & Stats (ONLY WHEN PENDING MODERATION) */}
                {isPending && (
                  <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-0 self-start">
                    {/* Step-Specific Moderation Audit Checklist Card */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                            <ShieldCheck size={18} />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                              {currentStepChecklistInfo.title}
                            </h4>
                            <p className="text-[10px] font-bold text-slate-400">
                              {currentStepChecklistInfo.subtitle}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...stepChecklistsState };
                            const allChecked = currentStepChecklistItems.every(i => Boolean(updated[`${activeTab}_${i.id}`]));
                            currentStepChecklistItems.forEach(i => {
                              updated[`${activeTab}_${i.id}`] = !allChecked;
                            });
                            setStepChecklistsState(updated);
                          }}
                          className="text-[10px] font-black uppercase tracking-wider text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0"
                        >
                          {isCurrentStepAllChecked ? 'Uncheck All' : 'Verify All'}
                        </button>
                      </div>

                      {/* Checklist items */}
                      <div className="space-y-2">
                        {currentStepChecklistItems.map(item => {
                          const itemKey = `${activeTab}_${item.id}`;
                          const isChecked = Boolean(stepChecklistsState[itemKey]);

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setStepChecklistsState(prev => ({ ...prev, [itemKey]: !prev[itemKey] }))}
                              className={cn(
                                "w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer select-none text-left gap-3",
                                isChecked
                                  ? "bg-primary/10 dark:bg-primary/15 border-primary/40 text-primary font-black shadow-xs ring-1 ring-primary/20"
                                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                              )}
                            >
                              <span className="leading-snug">{item.label}</span>
                              <div className={cn(
                                "w-5 h-5 rounded-lg flex items-center justify-center border transition-all shrink-0 shadow-xs",
                                isChecked ? "bg-primary text-white border-primary shadow-primary/20" : "border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50"
                              )}>
                                {isChecked && <Check size={13} strokeWidth={3} className="text-white" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Audit Status Bar */}
                      <div className="pt-2 flex items-center justify-between text-[10px] font-bold text-slate-400 border-t border-slate-100 dark:border-slate-800">
                        <span>Section Audit Status</span>
                        <span className={cn("font-black uppercase", isCurrentStepAllChecked ? "text-primary" : "text-amber-500")}>
                          {currentStepChecklistItems.filter(i => stepChecklistsState[`${activeTab}_${i.id}`]).length} / {currentStepChecklistItems.length} Verified
                        </span>
                      </div>
                    </div>

                    {/* Listing Summary Stats */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                      <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <Sparkles size={16} className="text-amber-500" /> Listing Summary Stats
                      </h4>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Rooms Registered</span>
                          <p className="text-base font-black text-slate-900 dark:text-white">{roomsList.length}</p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Photos Uploaded</span>
                          <p className="text-base font-black text-slate-900 dark:text-white">{propertyPhotos.length}</p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Legal Docs</span>
                          <p className="text-base font-black text-slate-900 dark:text-white">{docCount} / 5</p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Submitted On</span>
                          <p className="text-xs font-black text-slate-900 dark:text-white">
                            {listing.createdAt ? format(new Date(listing.createdAt), 'MMM d, yyyy') : 'Recently'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Moderation Footer */}
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 relative z-30">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {TAB_ORDER.indexOf(activeTab) > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const currIdx = TAB_ORDER.indexOf(activeTab);
                      if (currIdx > 0) setActiveTab(TAB_ORDER[currIdx - 1]);
                    }}
                    className="h-11 px-5 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronLeft size={16} /> Back Section
                  </Button>
                )}
                <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <Clock size={16} className={cn("shrink-0", isCurrentStepAllChecked ? "text-primary" : "text-amber-500 animate-pulse")} />
                  <span>
                    Section {TAB_ORDER.indexOf(activeTab) + 1} of 6 • {isCurrentStepAllChecked ? "Section audit verified! Click next." : `Verify all audit items (${currentStepChecklistItems.filter(i => stepChecklistsState[`${activeTab}_${i.id}`]).length}/${currentStepChecklistItems.length}) to proceed`}
                  </span>
                </div>
              </div>

              {isPending ? (
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setShowRejectConfirm(true)}
                    disabled={isDeciding}
                    className="flex-1 sm:flex-none h-11 px-5 text-xs font-black uppercase tracking-wider text-rose-500 border-rose-200 hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-900/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <X size={16} /> Reject Listing
                  </Button>

                  {TAB_ORDER.indexOf(activeTab) < 5 ? (
                    <Button 
                      type="button"
                      onClick={() => {
                        if (!isCurrentStepAllChecked) return;
                        const currIdx = TAB_ORDER.indexOf(activeTab);
                        const updatedConfirmed = [...confirmedSteps];
                        updatedConfirmed[currIdx] = true;
                        setConfirmedSteps(updatedConfirmed);

                        const nextIdx = currIdx + 1;
                        setMaxUnlockedStepIdx(prev => Math.max(prev, nextIdx));
                        setActiveTab(TAB_ORDER[nextIdx]);
                      }}
                      disabled={isDeciding || !isCurrentStepAllChecked}
                      className={cn(
                        "flex-1 sm:flex-none h-11 px-7 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2",
                        isCurrentStepAllChecked
                          ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 cursor-pointer"
                          : "bg-slate-200 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border border-slate-300/60 dark:border-slate-700/60 cursor-not-allowed shadow-none"
                      )}
                    >
                      <span>Confirm & Next Section</span>
                      <ChevronRight size={16} />
                    </Button>
                  ) : (
                    <Button 
                      type="button"
                      onClick={() => {
                        if (!isCurrentStepAllChecked) return;
                        handleAction('approve');
                      }}
                      disabled={isDeciding || !isCurrentStepAllChecked}
                      className={cn(
                        "flex-1 sm:flex-none h-11 px-8 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2",
                        isCurrentStepAllChecked
                          ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 cursor-pointer"
                          : "bg-slate-200 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border border-slate-300/60 dark:border-slate-700/60 cursor-not-allowed shadow-none"
                      )}
                    >
                      <Check size={16} /> Approve Listing
                    </Button>
                  )}
                </div>
              ) : isArchived ? (
                <div className="flex items-center justify-between gap-3 w-full">
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-black uppercase tracking-wider">
                    <Archive size={14} /> Status: Archived
                  </div>
                  <div className="flex items-center gap-2">
                    {onRestore && (
                      <Button
                        type="button"
                        onClick={() => {
                          onRestore?.(listing);
                          onClose();
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                      >
                        <RotateCcw size={14} /> Restore Listing
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={onClose}
                      variant="outline"
                      className="rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-wider border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Close Inspection
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 w-full">
                  <div className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider border",
                    isApproved ? "bg-primary/10 text-primary border-primary/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                  )}>
                    {isApproved ? <CheckCircle2 size={14} /> : <ShieldAlert size={14} />}
                    <span>Status: {statusStr}</span>
                  </div>
                  <Button
                    type="button"
                    onClick={onClose}
                    variant="outline"
                    className="rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-wider border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Close Inspection
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Dedicated Rejection Pop-up Overlay Modal */}
      <AdminListingRejectModal
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        listingTitle={listing?.title || listing?.propertyName || 'this property'}
        isSubmitting={isDeciding}
        activeStep={activeTab}
        uncheckedNotes={failedChecklistNotes}
        onConfirm={(reason) => {
          setShowRejectConfirm(false);
          handleAction('reject', reason);
        }}
      />

      {/* Lightbox Media & Document Preview Overlay */}
      <MediaPreviewOverlay
        isOpen={previewState.isOpen}
        onClose={() => setPreviewState(prev => ({ ...prev, isOpen: false }))}
        images={previewState.images}
        currentIndex={previewState.currentIndex}
        onNavigate={(index) => setPreviewState(prev => ({ ...prev, currentIndex: index }))}
        title={previewState.title}
        isDocument={previewState.isDocument}
      />

      {/* Shared Amenities, Rules & Features Full Breakdown Modal */}
      <SharedAmenitiesModal
        isOpen={amenitiesModalConfig.isOpen}
        onClose={() => setAmenitiesModalConfig(prev => ({ ...prev, isOpen: false }))}
        propertyTitle={listing.title || listing.propertyName || 'Property Features & Rules'}
        initialCategory={amenitiesModalConfig.initialCategory}
        amenities={listing.amenities || listing.amenities_list || []}
        customRules={listing.customRules || listing.rules?.customRules}
        customFeatures={listing.customFeatures || listing.features?.customFeatures}
        rulesObj={listing.rules || listing}
        featuresObj={listing.features || listing}
        rooms={roomsList}
      />
    </>
  );
}


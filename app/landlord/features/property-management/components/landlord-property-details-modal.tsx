'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useIsClient } from '@/hooks/useIsClient';
import { 
  Building2, 
  Pencil, 
  Eye, 
  Bath, 
  X, 
  MapPin, 
  Banknote, 
  LayoutGrid,
  Bed,
  Users,
  Tag,
  Check,
  Maximize,
  Maximize2,
  Receipt,
  Award,
  UserRound,
  PawPrint,
  Cigarette,
  ShieldCheck,
  Cctv,
  Flame,
  Bus,
  Book,
  Calendar,
  Sparkles,
  Camera,
  DoorOpen,
  Wifi,
  Wind,
  Utensils,
  Shirt,
  Car,
  Dumbbell,
  Tv,
  Waves,
  BookOpen,
  Landmark,
  Droplets,
  WashingMachine,
  Refrigerator,
  Shield,
  Coffee,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  ShieldAlert,
  FileText,
  FileCheck,
  Lock,
  Clock,
  Wine,
  VolumeX,
  Ban,
  UserX,
  ShoppingBag,
  Bike,
  Sofa,
  UserCheck,
  Layers,
  AlertCircle,
  ExternalLink,
  ListChecks,
  Star,
  CheckCircle2
} from 'lucide-react';
import { getDynamicIcon } from '@/lib/iconResolver';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/utils/helper';
import Button from '@/components/common/Button';
import { Property } from '../hooks/use-property-logic';
import SafeImage from '@/components/common/SafeImage';
import MediaPreviewOverlay from '@/components/common/MediaPreviewOverlay';
import { SharedAmenitiesModal } from '@/components/common/SharedAmenitiesModal';
import dynamic from 'next/dynamic';

import { 
  getCachedPropertyTypes,
  getCachedAttributes, 
  getCachedSubGroups, 
  getCachedRoomTypes,
  getSyncPropertyTypes,
  getSyncAttributes,
  getSyncSubGroups
} from '@/lib/landlordTaxonomyCache';

const Map = dynamic(() => import('@/components/common/Map'), { ssr: false });

interface PropertyDetailsModalProps {
  property: Property;
  onClose: () => void;
  statusColors: Record<string, string>;
  formatStatus: (status: string) => string;
  properties?: Property[];
  onNavigate?: (property: Property) => void;
}

const PROPERTY_IMAGE_CATEGORIES = [
  { id: 'Exterior', label: 'Exterior & Cover', icon: Building2, description: 'Gate, building front, parking & balcony' },
  { id: 'Kitchen', label: 'Kitchen & Dining', icon: Utensils, description: 'Stove, fridge, sink & dining area' },
  { id: 'Bathroom', label: 'Bathroom & CR', icon: Bath, description: 'Toilet, shower & bathroom fixtures' },
  { id: 'Common Area', label: 'Living Room & Lounge', icon: Sofa, description: 'Sofa, common area & TV' },
  { id: 'Other', label: 'Other Property Photos', icon: Camera, description: 'Hallways, compound & general view' },
];

const getParsedCoordinates = (prop: any): [number, number] => {
  if (!prop) return [15.6371, 120.4090];

  // 1. Direct latitude & longitude fields on property (from database Listing model)
  const directLat = Number(prop.latitude ?? prop.lat);
  const directLng = Number(prop.longitude ?? prop.lng);
  if (!isNaN(directLat) && !isNaN(directLng) && (directLat !== 0 || directLng !== 0)) {
    if (Math.abs(directLat) < 30 && Math.abs(directLng) > 100) return [directLat, directLng];
    if (Math.abs(directLng) < 30 && Math.abs(directLat) > 100) return [directLng, directLat];
  }

  // 2. Nested location object check (prop.location)
  if (prop.location && typeof prop.location === 'object') {
    const locLat = Number(prop.location.latitude ?? prop.location.lat);
    const locLng = Number(prop.location.longitude ?? prop.location.lng);
    if (!isNaN(locLat) && !isNaN(locLng) && (locLat !== 0 || locLng !== 0)) {
      if (Math.abs(locLat) < 30 && Math.abs(locLng) > 100) return [locLat, locLng];
      if (Math.abs(locLng) < 30 && Math.abs(locLat) > 100) return [locLng, locLat];
    }

    if (Array.isArray(prop.location.coordinates) && prop.location.coordinates.length === 2) {
      const v1 = Number(prop.location.coordinates[0]);
      const v2 = Number(prop.location.coordinates[1]);
      if (!isNaN(v1) && !isNaN(v2) && (v1 !== 0 || v2 !== 0)) {
        if (Math.abs(v1) < 30 && Math.abs(v2) > 100) return [v1, v2];
        if (Math.abs(v2) < 30 && Math.abs(v1) > 100) return [v2, v1];
      }
    }
  }

  // 3. Array coordinates / latlng
  const raw = prop.latlng || prop.coordinates;
  if (Array.isArray(raw) && raw.length === 2) {
    const v1 = Number(raw[0]);
    const v2 = Number(raw[1]);
    if (!isNaN(v1) && !isNaN(v2) && (v1 !== 0 || v2 !== 0)) {
      if (Math.abs(v1) < 30 && Math.abs(v2) > 100) return [v1, v2];
      if (Math.abs(v2) < 30 && Math.abs(v1) > 100) return [v2, v1];
    }
  }

  // 4. Default TAU Malacampa coordinate center
  return [15.6371, 120.4090];
};

export function LandlordPropertyDetailsModal({
  property,
  onClose,
  statusColors,
  formatStatus,
  properties = [],
  onNavigate
}: PropertyDetailsModalProps) {
  const isClient = useIsClient();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LOCATION' | 'CONFIG' | 'ROOMS' | 'IMAGES'>('OVERVIEW');
  const [selectedRoomIdx, setSelectedRoomIdx] = useState<number>(0);
  const [isMapFullscreenOpen, setIsMapFullscreenOpen] = useState<boolean>(false);
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
  const [configSubFilter, setConfigSubFilter] = useState<'ALL' | 'AMENITIES' | 'RULES' | 'SECURITY'>('ALL');
  const [amenitiesModalConfig, setAmenitiesModalConfig] = useState<{
    isOpen: boolean;
    initialCategory: 'ALL' | 'AMENITIES' | 'RULES' | 'SECURITY';
  }>({
    isOpen: false,
    initialCategory: 'ALL'
  });
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    AMENITIES: true,
    RULES: true,
    SECURITY: true,
    LEASE: true,
  });

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [propertyTypes, setPropertyTypes] = useState<any[]>(() => getSyncPropertyTypes() || []);
  const [attributes, setAttributes] = useState<any[]>(() => getSyncAttributes() || []);
  const [dbSubGroups, setDbSubGroups] = useState<any[]>(() => getSyncSubGroups() || []);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);

  useEffect(() => {
    getCachedPropertyTypes().then(pts => { if (pts) setPropertyTypes(pts); });
    getCachedAttributes().then(attrs => { if (attrs) setAttributes(attrs); });
    getCachedSubGroups().then(sgs => { if (sgs) setDbSubGroups(sgs); });

    const propTypeId = (property as any).propertyTypeId || (property as any).propertyType?.id || (property as any).propertyType || (property as any).category || '';
    getCachedRoomTypes(propTypeId).then(rts => {
      if (rts && rts.length > 0) {
        setRoomTypes(rts);
      } else {
        getCachedRoomTypes().then(all => { if (all) setRoomTypes(all); });
      }
    });
  }, [property]);

  const { scrollY } = useScroll({ 
    container: container ? { current: container } : undefined 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [galleryPreview, setGalleryPreview] = useState<{ images: string[]; index: number; category: string } | null>(null);
  const [currentBannerImageIndex, setCurrentBannerImageIndex] = useState(0);

  const bannerImages = Array.from(new Set([
    ...(property.imageSrc ? [property.imageSrc] : []),
    ...(property.images?.map((img: any) => img.url) || [])
  ]));

  const handleNextBannerImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentBannerImageIndex((prev) => (prev + 1) % bannerImages.length);
  };

  const handlePrevBannerImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentBannerImageIndex((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
  };

  useEffect(() => {
    setCurrentBannerImageIndex(0);
    setActiveTab('OVERVIEW');
    setSelectedRoomIdx(0);
    setConfigSubFilter('ALL');
  }, [property.id]);

  const openGallery = (images: string[], index: number, category: string) => {
    setGalleryPreview({ images, index, category });
  };

  const closeGallery = () => setGalleryPreview(null);

  const galleryNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setGalleryPreview(prev => prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : null);
  };

  const galleryPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setGalleryPreview(prev => prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : null);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && container) {
      container.scrollTop = 0;
    }
  }, [isLoading, container]);

  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalStyle || ''; };
  }, []);

  const currentIndex = properties.findIndex(p => p.id === property.id);
  const hasNext = currentIndex !== -1 && currentIndex < properties.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNext = () => {
    if (hasNext && onNavigate) {
      onNavigate(properties[currentIndex + 1]);
      if (container) container.scrollTop = 0;
    }
  };

  const handlePrev = () => {
    if (hasPrev && onNavigate) {
      onNavigate(properties[currentIndex - 1]);
      if (container) container.scrollTop = 0;
    }
  };

  const navigationRef = useRef({ handleNext, handlePrev, onClose });
  useEffect(() => {
    navigationRef.current = { handleNext, handlePrev, onClose };
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (galleryPreview) {
        if (e.key === 'Escape') closeGallery();
        if (e.key === 'ArrowRight') galleryNext();
        if (e.key === 'ArrowLeft') galleryPrev();
        return;
      }
      
      if (e.key === 'Escape') navigationRef.current.onClose();
      if (e.key === 'ArrowRight') navigationRef.current.handleNext();
      if (e.key === 'ArrowLeft') navigationRef.current.handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryPreview]);

  const getItemIcon = (name: string, attrId?: string) => {
    const cleanName = (name || '').trim();

    // 1. Try keyword matching on human name first if it resolves to a specific non-Sparkles icon
    const nameMatchedIcon = getDynamicIcon(cleanName, null);
    if (nameMatchedIcon && nameMatchedIcon !== Sparkles) {
      return nameMatchedIcon;
    }

    // 2. If taxonomy matched attribute has a specific non-Sparkles icon
    const cleanId = attrId ? (attrId.includes('|') ? attrId.split('|')[0] : attrId) : '';
    const matched = attributes.find(a => 
      (cleanId && (a.id === cleanId || a.value === cleanId || a._id === cleanId || a.code === cleanId || cleanId.startsWith(a.id + '|'))) ||
      (cleanName && (a.name === cleanName || a.name?.toLowerCase() === cleanName.toLowerCase() || a.id === cleanName || a.code === cleanName))
    );

    if (matched && matched.icon && matched.icon !== 'Sparkles' && matched.icon !== 'Sparkle') {
      const IconObj = getDynamicIcon(matched.icon, null);
      if (IconObj && IconObj !== Sparkles) return IconObj;
    }

    return getDynamicIcon(cleanName, Sparkles);
  };

  const resolveAmenityName = (attrId: string) => {
    if (!attrId) return '';
    const cleanId = attrId.includes('|') ? attrId.split('|')[0] : attrId;
    const matched = attributes.find(a => a.id === cleanId || a.value === cleanId || a._id === cleanId || a.code === cleanId || cleanId.startsWith(a.id + '|'));
    if (matched) return matched.name || matched.label || matched.title;
    if (!/^[a-f0-9]{24}$/i.test(cleanId)) return cleanId.replace(/-/g, ' ');
    return cleanId;
  };

  const resolvePropertyTypeName = (typeInput: any) => {
    if (!typeInput) return 'Boarding House';
    if (typeof typeInput === 'object' && typeInput !== null) {
      if (typeInput.name) return typeInput.name;
      if (typeInput.label) return typeInput.label;
      if (typeInput.title) return typeInput.title;
    }
    const typeId = typeof typeInput === 'string' ? typeInput : (typeInput?.id || typeInput?.code || '');
    if (!typeId) return 'Boarding House';

    const matched = propertyTypes.find(t => 
      t.id === typeId || 
      t.value === typeId || 
      t._id === typeId || 
      t.code === typeId ||
      t.name?.toLowerCase() === typeId?.toLowerCase()
    );
    if (matched) return matched.name || matched.label || matched.title;
    if (!/^[a-f0-9]{24}$/i.test(typeId)) return typeId.replace(/_/g, ' ').replace(/-/g, ' ');
    return 'Boarding House';
  };

  const resolvedPropertyType = useMemo(() => {
    return resolvePropertyTypeName(
      (property as any).propertyType || 
      (property as any).propertyTypeId || 
      (property as any).category || 
      (property as any).type
    );
  }, [property, propertyTypes]);

  const resolveRoomTypeName = (roomInput: any) => {
    if (!roomInput) return 'Standard Room';

    // 1. Direct object property checks if room object is passed
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

    if (!roomTypeId) return 'Standard Room';

    // 2. Match against dynamic roomTypes loaded from cache/API
    const matched = roomTypes.find(t => 
      t.id === roomTypeId || 
      t.value === roomTypeId || 
      t._id === roomTypeId || 
      t.code === roomTypeId ||
      t.name?.toLowerCase() === roomTypeId?.toLowerCase() ||
      t.label?.toLowerCase() === roomTypeId?.toLowerCase()
    );
    if (matched) return matched.name || matched.label || matched.title;
    
    // 3. Fallback map for common codes
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

    // 4. Non-hex clean text
    if (!/^[a-f0-9]{24}$/i.test(roomTypeId)) {
      return roomTypeId.replace(/_/g, ' ').replace(/-/g, ' ');
    }

    return 'Standard Room';
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

  const groupInUnitAmenities = (amenitiesList: string[]) => {
    if (!Array.isArray(amenitiesList) || amenitiesList.length === 0) return [];

    const subGroupMap: Record<string, { key: string; label: string; items: string[] }> = {};

    amenitiesList.forEach(attrId => {
      const cleanName = resolveAmenityName(attrId);
      if (!cleanName) return;

      const matchedAttr = attributes.find(a => 
        a.id === attrId || 
        a.name === attrId || 
        a.name?.toLowerCase() === attrId?.toLowerCase() || 
        a.value === attrId || 
        a._id === attrId || 
        a.code === attrId || 
        attrId.startsWith(a.id + '|')
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

  const groupedSubStepItems = useMemo(() => {
    if (!property) return { amenitiesBySubGroup: [], rulesBySubGroup: [], featuresBySubGroup: [] };

    const rawAmenities: string[] = Array.isArray((property as any).amenities_list) ? (property as any).amenities_list : (Array.isArray(property.amenities) ? property.amenities : []);
    const rawRules: string[] = Array.isArray(property.rules?.customRules) ? property.rules.customRules : (Array.isArray((property as any).customRules) ? (property as any).customRules : (Array.isArray((property as any).customRulesList) ? (property as any).customRulesList : []));
    const rawFeatures: string[] = Array.isArray(property.features?.customFeatures) ? property.features.customFeatures : (Array.isArray((property as any).customFeatures) ? (property as any).customFeatures : []);

    const getSubGroupTitle = (key: string, defaultTitle: string) => {
      const matched = dbSubGroups.find(s => s.key === key);
      return matched?.tabLabel || matched?.title || defaultTitle;
    };

    const amenitiesMap: Record<string, { key: string; label: string; items: string[] }> = {};
    const rulesMap: Record<string, { key: string; label: string; items: string[] }> = {};
    const featuresMap: Record<string, { key: string; label: string; items: string[] }> = {};

    const RULE_SUBGROUPS = new Set(['GENDER_POLICY', 'CURFEW', 'VISITOR_POLICY', 'PET_POLICY', 'SMOKING_POLICY', 'ALCOHOL_POLICY', 'SMOKE_ALCOHOL', 'HOUSE_RULES', 'POLICY']);
    const SECURITY_SUBGROUPS = new Set(['SECURITY', 'DISASTER_SAFETY', 'DISASTER_PREP', 'SAFETY', 'FIRE_SAFETY']);

    rawAmenities.forEach(attrId => {
      const name = resolveAmenityName(attrId);
      const matched = attributes.find(a => a.id === attrId || a.value === attrId || a.code === attrId || attrId.startsWith(a.id + '|'));
      const key = matched?.subGroupKey || matched?.subGroup || 'STORES';
      const type = matched?.type;
      const lowerName = name.toLowerCase();

      // Categorize Rules vs Security vs General Amenities based on taxonomy type & subGroupKey
      const isSecurity = type === 'FEATURE' || SECURITY_SUBGROUPS.has(key) ||
        (lowerName.includes('smoke detector') || lowerName.includes('fire extinguisher') || lowerName.includes('first aid') || lowerName.includes('emergency hallway') || lowerName.includes('flood-free') || lowerName.includes('security') || lowerName.includes('cctv') || lowerName.includes('keycard') || lowerName.includes('biometric'));

      const isRule = !isSecurity && (type === 'RULE' || RULE_SUBGROUPS.has(key) ||
        lowerName.includes('curfew') || lowerName.includes('guest') || lowerName.includes('visitor') ||
        lowerName.includes('pet policy') || (lowerName.includes('smoke') && !lowerName.includes('detector')) || lowerName.includes('alcohol') ||
        lowerName.includes('gender') || lowerName.includes('male & female') || lowerName.includes('female only') || lowerName.includes('male only'));

      if (isSecurity) {
        const label = getSubGroupTitle(key, 'Security & Safety');
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

    if (property.rules?.femaleOnly) {
      const title = getSubGroupTitle('GENDER_POLICY', 'Gender Policy');
      if (!rulesMap['GENDER_POLICY']) rulesMap['GENDER_POLICY'] = { key: 'GENDER_POLICY', label: title, items: [] };
      if (!rulesMap['GENDER_POLICY'].items.includes('Female Only Accommodation')) rulesMap['GENDER_POLICY'].items.push('Female Only Accommodation');
    }
    if (property.rules?.maleOnly) {
      const title = getSubGroupTitle('GENDER_POLICY', 'Gender Policy');
      if (!rulesMap['GENDER_POLICY']) rulesMap['GENDER_POLICY'] = { key: 'GENDER_POLICY', label: title, items: [] };
      if (!rulesMap['GENDER_POLICY'].items.includes('Male Only Accommodation')) rulesMap['GENDER_POLICY'].items.push('Male Only Accommodation');
    }
    if (property.rules?.noCurfew) {
      const title = getSubGroupTitle('CURFEW', 'Curfew & Gate Rules');
      if (!rulesMap['CURFEW']) rulesMap['CURFEW'] = { key: 'CURFEW', label: title, items: [] };
      if (!rulesMap['CURFEW'].items.includes('24/7 Open Gate (No Curfew)')) rulesMap['CURFEW'].items.push('24/7 Open Gate (No Curfew)');
    }
    if (property.rules?.visitorsAllowed) {
      const title = getSubGroupTitle('VISITOR_POLICY', 'Visitor Policy');
      if (!rulesMap['VISITOR_POLICY']) rulesMap['VISITOR_POLICY'] = { key: 'VISITOR_POLICY', label: title, items: [] };
      if (!rulesMap['VISITOR_POLICY'].items.includes('Visitors Allowed')) rulesMap['VISITOR_POLICY'].items.push('Visitors Allowed');
    }
    if (property.rules?.petsAllowed) {
      const title = getSubGroupTitle('PET_POLICY', 'Pet Policy');
      if (!rulesMap['PET_POLICY']) rulesMap['PET_POLICY'] = { key: 'PET_POLICY', label: title, items: [] };
      if (!rulesMap['PET_POLICY'].items.includes('Pets Allowed')) rulesMap['PET_POLICY'].items.push('Pets Allowed');
    }

    rawRules.forEach(attrId => {
      const name = resolveAmenityName(attrId);
      const matched = attributes.find(a => a.id === attrId || a.value === attrId || a.code === attrId || attrId.startsWith(a.id + '|'));
      const key = matched?.subGroupKey || matched?.subGroup || 'HOUSE_RULES';
      const label = getSubGroupTitle(key, 'House Rules');

      if (!rulesMap[key]) rulesMap[key] = { key, label, items: [] };
      if (!rulesMap[key].items.includes(name)) rulesMap[key].items.push(name);
    });

    if (property.features?.security24h) {
      const title = getSubGroupTitle('SECURITY', 'Security');
      if (!featuresMap['SECURITY']) featuresMap['SECURITY'] = { key: 'SECURITY', label: title, items: [] };
      if (!featuresMap['SECURITY'].items.includes('24/7 Security Guard')) featuresMap['SECURITY'].items.push('24/7 Security Guard');
    }
    if (property.features?.cctv) {
      const title = getSubGroupTitle('SECURITY', 'Security');
      if (!featuresMap['SECURITY']) featuresMap['SECURITY'] = { key: 'SECURITY', label: title, items: [] };
      if (!featuresMap['SECURITY'].items.includes('CCTV Cameras')) featuresMap['SECURITY'].items.push('CCTV Cameras');
    }
    if (property.features?.fireSafety) {
      const title = getSubGroupTitle('DISASTER_PREP', 'Disaster Safety');
      if (!featuresMap['DISASTER_PREP']) featuresMap['DISASTER_PREP'] = { key: 'DISASTER_PREP', label: title, items: [] };
      if (!featuresMap['DISASTER_PREP'].items.includes('Fire Safety Extinguishers')) featuresMap['DISASTER_PREP'].items.push('Fire Safety Extinguishers');
    }

    rawFeatures.forEach(attrId => {
      const name = resolveAmenityName(attrId);
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
  }, [property, attributes, dbSubGroups]);

  const propertyPhotos = Array.isArray(property.images) ? property.images : [];
  const roomsList = property.rooms || [];

  const docUrls: Record<string, string> = {
    governmentId: (property as any).businessInfo?.documents?.governmentId || (property as any).documents?.governmentId || '',
    businessPermit: (property as any).businessInfo?.documents?.businessPermit || (property as any).documents?.businessPermit || '',
    landTitle: (property as any).businessInfo?.documents?.landTitle || (property as any).documents?.landTitle || '',
    barangayClearance: (property as any).businessInfo?.documents?.barangayClearance || (property as any).documents?.barangayClearance || '',
    fireSafetyCertificate: (property as any).businessInfo?.documents?.fireSafetyCertificate || (property as any).documents?.fireSafetyCertificate || '',
  };
  const docCount = Object.values(docUrls).filter(Boolean).length;

  if (!isClient) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-gray-900/40 dark:bg-gray-950/80 backdrop-blur-sm" 
      />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 40 }} className="relative bg-white dark:bg-[#111827] rounded-none sm:rounded-[2.5rem] border-0 sm:border border-gray-100 dark:border-white/10 max-w-6xl w-full h-full sm:h-auto max-h-full sm:max-h-[92vh] shadow-2xl overflow-hidden flex flex-col antialiased">
        
        {/* Scrollable Container */}
        <div ref={setContainer} className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar scroll-smooth">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[60vh] flex flex-col items-center justify-center gap-6"
              >
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-xl shadow-primary/10" />
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Syncing Property Details...</p>
              </motion.div>
            ) : (
              <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                
                {/* Hero Showcase Banner */}
                <div className="relative h-52 sm:h-72 w-full overflow-hidden group">
                  {bannerImages.length > 0 ? (
                    <div 
                      onClick={() => openGallery(bannerImages, currentBannerImageIndex, 'Property Cover Photos')}
                      className="w-full h-full cursor-pointer relative z-0"
                    >
                      <SafeImage 
                        key={currentBannerImageIndex}
                        src={bannerImages[currentBannerImageIndex]} 
                        alt={property.title} 
                        priority={true} 
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                      <Building2 size={64} className="text-gray-300 dark:text-gray-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent dark:from-gray-950 dark:via-gray-950/30 pointer-events-none z-10" />
                  
                  {bannerImages.length > 1 && (
                    <>
                      <button 
                        onClick={handlePrevBannerImage}
                        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/40 backdrop-blur-xl border border-white/10 text-white rounded-xl sm:rounded-2xl opacity-70 sm:opacity-40 group-hover:opacity-100 transition-all hover:bg-black/60 hover:scale-110 pointer-events-auto z-40 cursor-pointer"
                      >
                        <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
                      </button>
                      <button 
                        onClick={handleNextBannerImage}
                        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/40 backdrop-blur-xl border border-white/10 text-white rounded-xl sm:rounded-2xl opacity-70 sm:opacity-40 group-hover:opacity-100 transition-all hover:bg-black/60 hover:scale-110 pointer-events-auto z-40 cursor-pointer"
                      >
                        <ChevronRight size={18} className="sm:w-5 sm:h-5" />
                      </button>
                    </>
                  )}

                  {/* Banner Content Overlay */}
                  <div className="absolute inset-0 p-4 sm:p-10 flex flex-col justify-between z-30 pointer-events-none">
                    <div className="flex items-center justify-between pointer-events-auto">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] uppercase font-black tracking-wider shadow-lg backdrop-blur-md border", 
                        property.status === 'PENDING'
                          ? "bg-amber-500/90 text-white border-amber-400/50 shadow-amber-500/20"
                          : property.status === 'REJECTED'
                          ? "bg-rose-500/90 text-white border-rose-400/50"
                          : statusColors[property.status] || "bg-primary/90 text-white border-primary/40"
                      )}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        <span>{formatStatus(property.status)}</span>
                      </div>

                      <button onClick={onClose} className="p-2 sm:p-3 bg-black/30 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-all border border-white/20 z-50 shadow-2xl cursor-pointer">
                        <X size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                    </div>

                    <div 
                      onClick={() => openGallery(bannerImages, currentBannerImageIndex, 'Property Cover Photos')}
                      className="space-y-1 sm:space-y-2 pointer-events-auto cursor-pointer"
                    >
                      <h3 className="text-xl sm:text-4xl font-black text-white leading-tight drop-shadow-2xl tracking-tighter line-clamp-1">{property.title}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 sm:gap-2 bg-black/30 backdrop-blur-md w-fit px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl border border-white/10 text-white/90 font-bold text-[10px] sm:text-xs">
                          <MapPin size={12} className="text-primary shrink-0 sm:w-3.5 sm:h-3.5" />
                          <span className="truncate max-w-[200px] sm:max-w-none">{(property as any).address || property.region || 'Camiling, Tarlac'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 bg-primary/90 backdrop-blur-md w-fit px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl border border-primary/30 text-white font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-sm">
                          <Building2 size={12} className="shrink-0 sm:w-3.5 sm:h-3.5" />
                          <span>{resolvedPropertyType}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-Step Navigation Pills Bar (6 Steps matching Admin & Landlord Creator) */}
                <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-3 sm:px-10 py-2 sm:py-3 flex items-center gap-1.5 sm:gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shadow-sm">
                  {[
                    { id: 'OVERVIEW', label: '1. Basic Info', icon: Building2 },
                    { id: 'LOCATION', label: '2. Location & Map', icon: MapPin },
                    { id: 'CONFIG', label: '3. Setup & Rules', icon: FileText },
                    { id: 'ROOMS', label: `4. Rooms (${roomsList.length})`, icon: Bed },
                    { id: 'IMAGES', label: `5. Photos (${propertyPhotos.length})`, icon: Camera },
                  ].map(tab => {
                    const TabIcon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                          "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer select-none shrink-0",
                          isActive
                            ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02]"
                            : "bg-gray-100/90 dark:bg-gray-800/80 border-gray-200/60 dark:border-gray-700/60 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/80 dark:hover:bg-gray-700"
                        )}
                      >
                        <TabIcon size={13} className="sm:w-3.5 sm:h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content Body */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {/* TAB 1: OVERVIEW & BASIC INFO */}
                      {activeTab === 'OVERVIEW' && (
                        <div className="space-y-8">
                          {/* Highlights Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
                            {[
                              { label: 'Property Type', value: resolvedPropertyType, icon: Tag, color: 'text-primary', bg: 'bg-primary/5' },
                              { 
                                label: 'Base Rent Starts At', 
                                value: `₱${(property.price || 0).toLocaleString()}/mo`, 
                                icon: Banknote, 
                                color: 'text-primary', 
                                bg: 'bg-primary/5' 
                              },
                              { label: 'Total Units', value: `${roomsList.length || property.roomCount || 1} Units`, icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/5' },
                              { label: 'Available Slots', value: `${roomsList.reduce((acc: number, r: any) => acc + (r.availableSlots || 0), 0)} Guests`, icon: DoorOpen, color: 'text-teal-500', bg: 'bg-teal-500/5' },
                              { label: 'Bathrooms', value: `${property.bathroomCount || 1} CRs`, icon: Bath, color: 'text-purple-500', bg: 'bg-purple-500/5' },
                            ].map((item, i) => (
                              <div key={i} className={cn("p-4 sm:p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between", item.bg)}>
                                <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center mb-3 shadow-sm border border-gray-100 dark:border-gray-700", item.color)}>
                                  <item.icon size={18} />
                                </div>
                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{item.label}</p>
                                  <p className="text-xs sm:text-sm font-black text-gray-900 dark:text-white truncate">{item.value}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Description Card */}
                          <div className="p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                              <div className="w-3 h-0.5 bg-primary rounded-full" />
                              <span>About this Property</span>
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm font-medium whitespace-pre-wrap">
                              {property.description || "No description provided."}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* TAB 2: LOCATION & MAP */}
                      {activeTab === 'LOCATION' && (() => {
                        const [lat, lng] = getParsedCoordinates(property);

                        return (
                          <div className="space-y-6">
                            {/* 1. Real Location Metadata & Address Breakdown */}
                            <div className="p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                                <Building2 size={16} />
                                <span>Postal Address & Location Details</span>
                              </h4>

                              {/* 4 Location Cards with Smart TAU Fallbacks */}
                              {(() => {
                                const propAddr = (property as any).address || (property as any).location?.address;
                                const displayStreet = (propAddr && typeof propAddr === 'string' && propAddr.trim().length > 0)
                                  ? propAddr
                                  : 'Camiling - Malacampa Road';
                                const displayCity = (property as any).city || (property as any).location?.city || 'Camiling';
                                const displayProvince = property.region || (property as any).province || (property as any).location?.province || 'Tarlac';
                                const displayZip = (property as any).zipCode || (property as any).location?.zipCode || '2306';

                                return (
                                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
                                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/80">
                                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">Street Address</span>
                                      <p className="text-xs font-black text-gray-900 dark:text-white truncate">
                                        {displayStreet}
                                      </p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/80">
                                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">City / Municipality</span>
                                      <p className="text-xs font-black text-gray-900 dark:text-white truncate">
                                        {displayCity}
                                      </p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/80">
                                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">Province</span>
                                      <p className="text-xs font-black text-gray-900 dark:text-white truncate">
                                        {displayProvince}
                                      </p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/80">
                                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">Zip Code</span>
                                      <p className="text-xs font-black text-gray-900 dark:text-white truncate">
                                        {displayZip}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>

                            {/* 2. Main Interactive Leaflet Map Showcase */}
                            <div className="p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                  <MapPin size={16} />
                                  <span>Property Location & Map</span>
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => setIsMapFullscreenOpen(true)}
                                  className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                                >
                                  <Maximize2 size={12} /> Fullscreen View
                                </button>
                              </div>

                              {/* Leaflet Map Frame */}
                              <div className="relative h-56 sm:h-96 w-full rounded-2xl sm:rounded-[2rem] overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md z-0 group">
                                <Map
                                  center={[lat, lng]}
                                  title={property.title || "Property Location"}
                                  imageSrc={property.imageSrc}
                                  readonly={true}
                                  allowPinDrop={false}
                                />

                                {/* ⤢ Top Right Expand Icon Button */}
                                <button
                                  type="button"
                                  onClick={() => setIsMapFullscreenOpen(true)}
                                  title="Expand Map Fullscreen"
                                  className="absolute top-3 right-3 z-[400] p-2.5 bg-white/90 dark:bg-gray-900/90 hover:bg-primary hover:text-white backdrop-blur-md text-gray-700 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer"
                                >
                                  <Maximize2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* TAB 3: SETUP, AMENITIES & RULES */}
                      {activeTab === 'CONFIG' && (
                        <div className="space-y-5">
                          {/* Sub-Filter Pills Bar */}
                          {(() => {
                            const totalAmenitiesCount = groupedSubStepItems.amenitiesBySubGroup.reduce((acc, g) => acc + g.items.length, 0);
                            const totalRulesCount = groupedSubStepItems.rulesBySubGroup.reduce((acc, g) => acc + g.items.length, 0);
                            const totalFeaturesCount = groupedSubStepItems.featuresBySubGroup.reduce((acc, g) => acc + g.items.length, 0);

                            return (
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-1">
                                  {[
                                    { id: 'ALL', label: 'All Categories', count: totalAmenitiesCount + totalRulesCount + totalFeaturesCount },
                                    { id: 'AMENITIES', label: 'Amenities', count: totalAmenitiesCount },
                                    { id: 'RULES', label: 'House Rules', count: totalRulesCount },
                                    { id: 'SECURITY', label: 'Security & Safety', count: totalFeaturesCount },
                                  ].map(sub => (
                                    <button
                                      key={sub.id}
                                      type="button"
                                      onClick={() => setConfigSubFilter(sub.id as any)}
                                      className={cn(
                                        "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer select-none shrink-0",
                                        configSubFilter === sub.id
                                          ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02]"
                                          : "bg-gray-100/90 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 border-gray-200/60 dark:border-gray-700/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/80 dark:hover:bg-gray-700"
                                      )}
                                    >
                                      <span>{sub.label}</span>
                                      <span className={cn(
                                        "px-1.5 py-0.5 rounded-md text-[9px] font-black",
                                        configSubFilter === sub.id ? "bg-white/20 text-white" : "bg-gray-200/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 font-bold"
                                      )}>
                                        {sub.count}
                                      </span>
                                    </button>
                                  ))}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setAmenitiesModalConfig({ isOpen: true, initialCategory: 'ALL' })}
                                  className="px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
                                >
                                  <Maximize2 size={13} /> Expand Full Breakdown
                                </button>
                              </div>
                            );
                          })()}

                          {/* Shared Amenities Grouped by Taxonomy */}
                          {(configSubFilter === 'ALL' || configSubFilter === 'AMENITIES') && (() => {
                            const totalAmenitiesCount = groupedSubStepItems.amenitiesBySubGroup.reduce((acc, g) => acc + g.items.length, 0);
                            const isExpanded = expandedSections.AMENITIES !== false;

                            return (
                              <div className="p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                                  <div 
                                    onClick={() => toggleSection('AMENITIES')}
                                    className="flex items-center gap-2 cursor-pointer select-none group"
                                  >
                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
                                      <ListChecks size={16} />
                                      <span>Shared Amenities</span>
                                      <span className="text-[10px] font-bold text-gray-400 font-mono">({totalAmenitiesCount})</span>
                                    </h4>
                                    <div className="p-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors">
                                      <motion.div animate={{ rotate: isExpanded ? 0 : 180 }} transition={{ duration: 0.2 }}>
                                        <ChevronUp size={14} />
                                      </motion.div>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => setAmenitiesModalConfig({ isOpen: true, initialCategory: 'AMENITIES' })}
                                    className="px-2.5 py-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
                                  >
                                    <Maximize2 size={12} /> View All Amenities
                                  </button>
                                </div>

                                <AnimatePresence initial={false}>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                                      className="overflow-hidden"
                                    >
                                      {groupedSubStepItems.amenitiesBySubGroup.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                                          {groupedSubStepItems.amenitiesBySubGroup.map(group => (
                                            <div key={group.key} className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/80 space-y-1.5">
                                              <span className="text-[9px] font-black uppercase tracking-wider text-blue-500 block">{group.label}</span>
                                              <div className="flex flex-wrap gap-1.5">
                                                {group.items.map((item, i) => {
                                                  const ItemIcon = getItemIcon(item);
                                                  return (
                                                    <span key={i} className="px-2.5 py-1 rounded-xl bg-white dark:bg-gray-900 border border-blue-200/60 dark:border-blue-500/30 text-[10px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                                      <ItemIcon size={13} className="text-blue-500 shrink-0" />
                                                      <span>{item}</span>
                                                    </span>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-xs font-bold text-gray-400 italic pt-1">No shared amenities specified</p>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })()}

                          {/* House Rules */}
                          {(configSubFilter === 'ALL' || configSubFilter === 'RULES') && (() => {
                            const totalRulesCount = groupedSubStepItems.rulesBySubGroup.reduce((acc, g) => acc + g.items.length, 0);
                            const isExpanded = expandedSections.RULES !== false;

                            return (
                              <div className="p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                                  <div 
                                    onClick={() => toggleSection('RULES')}
                                    className="flex items-center gap-2 cursor-pointer select-none group"
                                  >
                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-purple-500 flex items-center gap-2">
                                      <Shield size={16} />
                                      <span>House Rules</span>
                                      <span className="text-[10px] font-bold text-gray-400 font-mono">({totalRulesCount})</span>
                                    </h4>
                                    <div className="p-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:text-purple-500 transition-colors">
                                      <motion.div animate={{ rotate: isExpanded ? 0 : 180 }} transition={{ duration: 0.2 }}>
                                        <ChevronUp size={14} />
                                      </motion.div>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => setAmenitiesModalConfig({ isOpen: true, initialCategory: 'RULES' })}
                                    className="px-2.5 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
                                  >
                                    <Maximize2 size={12} /> View All Rules
                                  </button>
                                </div>

                                <AnimatePresence initial={false}>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                                      className="overflow-hidden"
                                    >
                                      {groupedSubStepItems.rulesBySubGroup.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                                          {groupedSubStepItems.rulesBySubGroup.map(group => (
                                            <div key={group.key} className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/80 space-y-1.5">
                                              <span className="text-[9px] font-black uppercase tracking-wider text-purple-500 block">{group.label}</span>
                                              <div className="flex flex-wrap gap-1.5">
                                                {group.items.map((item, i) => {
                                                  const ItemIcon = getItemIcon(item);
                                                  return (
                                                    <span key={i} className="px-2.5 py-1 rounded-xl bg-white dark:bg-gray-900 border border-purple-200/60 dark:border-purple-500/30 text-[10px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                                      <ItemIcon size={13} className="text-purple-500 shrink-0" />
                                                      <span>{item}</span>
                                                    </span>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-xs font-bold text-gray-400 italic pt-1">No specific house rules specified</p>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })()}

                          {/* Security Features */}
                          {(configSubFilter === 'ALL' || configSubFilter === 'SECURITY') && (() => {
                            const totalFeaturesCount = groupedSubStepItems.featuresBySubGroup.reduce((acc, g) => acc + g.items.length, 0);
                            const isExpanded = expandedSections.SECURITY !== false;

                            return (
                              <div className="p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                                  <div 
                                    onClick={() => toggleSection('SECURITY')}
                                    className="flex items-center gap-2 cursor-pointer select-none group"
                                  >
                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-amber-500 flex items-center gap-2">
                                      <Star size={16} />
                                      <span>Security & Safety</span>
                                      <span className="text-[10px] font-bold text-gray-400 font-mono">({totalFeaturesCount})</span>
                                    </h4>
                                    <div className="p-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:text-amber-500 transition-colors">
                                      <motion.div animate={{ rotate: isExpanded ? 0 : 180 }} transition={{ duration: 0.2 }}>
                                        <ChevronUp size={14} />
                                      </motion.div>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => setAmenitiesModalConfig({ isOpen: true, initialCategory: 'SECURITY' })}
                                    className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
                                  >
                                    <Maximize2 size={12} /> View All Security
                                  </button>
                                </div>

                                <AnimatePresence initial={false}>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                                      className="overflow-hidden"
                                    >
                                      {groupedSubStepItems.featuresBySubGroup.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                                          {groupedSubStepItems.featuresBySubGroup.map(group => (
                                            <div key={group.key} className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/80 space-y-1.5">
                                              <span className="text-[9px] font-black uppercase tracking-wider text-amber-500 block">{group.label}</span>
                                              <div className="flex flex-wrap gap-1.5">
                                                {group.items.map((item, i) => {
                                                  const ItemIcon = getItemIcon(item);
                                                  return (
                                                    <span key={i} className="px-2.5 py-1 rounded-xl bg-white dark:bg-gray-900 border border-amber-200/60 dark:border-amber-500/30 text-[10px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                                      <ItemIcon size={13} className="text-amber-500 shrink-0" />
                                                      <span>{item}</span>
                                                    </span>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-xs font-bold text-gray-400 italic pt-1">No security features listed</p>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })()}

                          {/* Lease Terms */}
                          {((property as any).depositAmount || (property as any).moveOutNoticeDays) && (() => {
                            const isExpanded = expandedSections.LEASE !== false;

                            return (
                              <div className="p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                                <div 
                                  onClick={() => toggleSection('LEASE')}
                                  className="flex items-center justify-between cursor-pointer select-none pb-3 border-b border-gray-100 dark:border-gray-800 group"
                                >
                                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-teal-500 flex items-center gap-2">
                                    <Receipt size={16} />
                                    <span>Lease Contract Terms</span>
                                  </h4>
                                  <div className="p-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:text-teal-500 transition-colors">
                                    <motion.div animate={{ rotate: isExpanded ? 0 : 180 }} transition={{ duration: 0.2 }}>
                                      <ChevronUp size={14} />
                                    </motion.div>
                                  </div>
                                </div>

                                <AnimatePresence initial={false}>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                                      className="overflow-hidden"
                                    >
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-gray-700 dark:text-gray-300 pt-1">
                                        <div className="p-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                          <span className="text-[9px] font-black text-gray-400 block uppercase mb-1">Security Deposit Terms</span>
                                          <span>{(property as any).depositAmount ? `₱${Number((property as any).depositAmount).toLocaleString()} Security Deposit` : 'No Deposit Required'}</span>
                                        </div>
                                        <div className="p-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                          <span className="text-[9px] font-black text-gray-400 block uppercase mb-1">Move-Out Notice Period</span>
                                          <span>{(property as any).moveOutNoticeDays ? `${(property as any).moveOutNoticeDays} Days Notice Required` : '30 Days Notice Required'}</span>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* TAB 4: ROOM UNITS BREAKDOWN */}
                      {activeTab === 'ROOMS' && (
                        <div className="space-y-6">
                          <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 sm:space-y-5">
                            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-gray-100 dark:border-gray-800">
                              <div className="flex items-center gap-3">
                                <div className="p-2.5 sm:p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                  <Bed size={18} className="sm:w-5 sm:h-5" />
                                </div>
                                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">Registered Room Units ({roomsList.length})</h4>
                              </div>
                            </div>

                            {/* Room Selector Bar (For 2+ Rooms) */}
                            {roomsList.length > 1 && (
                              <div ref={roomTabContainerRef} className="flex items-center gap-2 overflow-x-auto pb-2 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border-b border-gray-100 dark:border-gray-800">
                                {roomsList.map((room: any, idx: number) => {
                                  const roomTypeName = resolveRoomTypeName(room);
                                  const isFlatRate = checkIsFlatRate(room);
                                  const isActive = selectedRoomIdx === idx;

                                  return (
                                    <button
                                      key={idx}
                                      type="button"
                                      data-active={isActive ? "true" : "false"}
                                      onClick={() => setSelectedRoomIdx(idx)}
                                      className={cn(
                                        "flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer select-none shrink-0",
                                        isActive
                                          ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02]"
                                          : "bg-gray-100/90 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 border-gray-200/60 dark:border-gray-700/60 hover:text-gray-900 dark:hover:text-white"
                                      )}
                                    >
                                      <Bed size={14} />
                                      <span>{isFlatRate ? 'Unit' : 'Room'} {idx + 1}: {roomTypeName}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {/* Room Unit Display */}
                            {roomsList.length > 0 ? (
                              <div className="grid grid-cols-1 gap-4 sm:gap-5">
                                {roomsList
                                  .filter((_: any, idx: number) => (selectedRoomIdx < roomsList.length ? selectedRoomIdx === idx : idx === 0))
                                  .map((room: any) => {
                                    const roomIdx = selectedRoomIdx < roomsList.length ? selectedRoomIdx : 0;
                                    const roomTypeName = resolveRoomTypeName(room);
                                    const isFlatRate = checkIsFlatRate(room);
                                    const isPrivateCR = room.bathroomArrangement === 'PRIVATE_CR' || room.bathroomArrangement === 'PRIVATE' || room.bathroomType === 'PRIVATE';

                                    const inUnitAmenities: string[] = Array.isArray(room.amenities) && room.amenities.length > 0
                                       ? room.amenities
                                       : Array.isArray(room.amenityNames) && room.amenityNames.length > 0
                                         ? room.amenityNames
                                         : Array.isArray(room.roomLinks) && room.roomLinks.length > 0
                                           ? room.roomLinks.map((link: any) => link.attribute?.name || link.attribute?.id || link.attributeId).filter(Boolean)
                                           : [];
                                    const groupedAmenities = groupInUnitAmenities(inUnitAmenities);
                                    const totalInUnitCount = groupedAmenities.reduce((sum, g) => sum + g.items.length, 0);

                                    return (
                                      <div key={roomIdx} className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-4 shadow-sm">
                                        {/* Header */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-200/60 dark:border-gray-700/60">
                                          <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-primary/10 text-primary font-black text-xs sm:text-sm flex items-center justify-center shrink-0 border border-primary/20">
                                              {roomIdx + 1}
                                            </div>
                                            <div>
                                              <h5 className="text-xs sm:text-sm font-black uppercase text-gray-900 dark:text-white tracking-wider">{roomTypeName}</h5>
                                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mt-0.5">
                                                {isFlatRate ? 'Unit Layout' : 'Room Layout'} #{roomIdx + 1} • {isFlatRate ? 'Whole Unit Rent' : 'Per Head Rent'}
                                              </span>
                                            </div>
                                          </div>

                                          <div className="text-left sm:text-right bg-primary/5 sm:bg-transparent p-2.5 sm:p-0 rounded-xl sm:rounded-none w-full sm:w-auto border border-primary/10 sm:border-0">
                                            <span className="text-xs sm:text-sm font-black text-primary uppercase block">
                                              ₱{Number(room.price || property.price || 0).toLocaleString()}/mo {isFlatRate ? '(Whole Unit)' : '(per Head)'}
                                            </span>
                                            {room.reservationFee && (
                                              <span className="text-[9px] font-bold text-gray-400 uppercase block mt-0.5">₱{Number(room.reservationFee).toLocaleString()} Reservation Fee</span>
                                            )}
                                          </div>
                                        </div>

                                        {/* Specs Grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                          <div className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-0.5">
                                              {isFlatRate ? 'Unit Floor Area' : 'Room Size'}
                                            </span>
                                            <p className="text-xs font-black text-gray-900 dark:text-white uppercase">{room.size ? `${room.size} SQM` : 'N/A'}</p>
                                          </div>

                                          <div className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-0.5">Bed Setup</span>
                                            <p className="text-xs font-black text-gray-900 dark:text-white uppercase">{room.bedCount || '1'} x {resolveBedTypeName(room.bedType, room.roomType)}</p>
                                          </div>

                                          <div className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-0.5">
                                              {isFlatRate ? 'Unit Capacity' : 'Room Capacity'}
                                            </span>
                                            <p className="text-xs font-black text-gray-900 dark:text-white uppercase">
                                              {room.capacity || ((Number(room.bedCount) || 1) * (String(room.bedType || '').toUpperCase().includes('BUNK') ? 2 : 1))} {isFlatRate ? 'Pax' : 'Slots (Beds)'}
                                            </p>
                                          </div>

                                          <div className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-0.5">CR Setup</span>
                                            <p className="text-xs font-black text-primary uppercase">{isPrivateCR ? 'Own Private CR' : 'Common Shared CR'}</p>
                                          </div>
                                        </div>

                                        {/* In-Unit Amenities Grouped */}
                                        <div className="space-y-3 pt-2">
                                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
                                            <Sparkles size={13} className="text-primary" />
                                            <span>In-Unit Features ({totalInUnitCount})</span>
                                          </span>

                                          {groupedAmenities.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                              {groupedAmenities.map(group => (
                                                <div key={group.key} className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 space-y-2">
                                                  <span className="text-[9px] font-black uppercase tracking-wider text-primary block">{group.label}</span>
                                                  <div className="flex flex-wrap gap-1.5">
                                                    {group.items.map((item, i) => {
                                                      const ItemIcon = getItemIcon(item);
                                                      return (
                                                        <span key={i} className="px-2.5 py-1 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-[10px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
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
                                            <span className="text-[11px] font-bold text-gray-400 italic">No in-unit features selected</span>
                                          )}
                                        </div>

                                        {/* Dynamic Bottom Room Navigation Buttons */}
                                        {roomsList.length > 1 && (
                                          <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-200/60 dark:border-gray-700/60">
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
                                                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white text-gray-700 dark:text-gray-200 text-xs font-black uppercase tracking-wider transition-all border border-gray-200 dark:border-gray-700 cursor-pointer shadow-sm"
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
                                    );
                                  })}
                              </div>
                            ) : (
                              <p className="text-xs font-bold text-gray-400 italic">No room units registered yet.</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* TAB 5: PHOTO GALLERY */}
                      {activeTab === 'IMAGES' && (
                        <div className="space-y-6">
                          <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                              <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-500 border border-teal-500/20">
                                  <Camera size={20} />
                                </div>
                                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">Property Photos ({propertyPhotos.length})</h4>
                              </div>
                            </div>

                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {PROPERTY_IMAGE_CATEGORIES.map(cat => {
                                const IconComp = cat.icon;

                                const isCatMatch = (img: any, categoryId: string) => {
                                  const rawCat = String(img.category || img.roomType || img.type || '').trim().toLowerCase();
                                  const target = categoryId.trim().toLowerCase();

                                  if (rawCat === target) return true;

                                  // Living Room / Common Area
                                  if (target === 'common area' || target === 'living room' || target === 'living') {
                                    return rawCat.includes('common') || rawCat.includes('living') || rawCat.includes('lounge');
                                  }
                                  // Bedroom
                                  if (target === 'bedroom') return rawCat.includes('bedroom') || rawCat.includes('bed');
                                  // Kitchen
                                  if (target === 'kitchen') return rawCat.includes('kitchen') || rawCat.includes('dining');
                                  // Bathroom
                                  if (target === 'bathroom') return rawCat.includes('bathroom') || rawCat.includes('comfort') || rawCat.includes('cr');
                                  // Exterior
                                  if (target === 'exterior') return rawCat.includes('exterior') || rawCat.includes('facade') || rawCat.includes('entrance') || rawCat.includes('building');
                                  // General
                                  if (target === 'general') return !rawCat || rawCat.includes('general') || rawCat.includes('other');

                                  return false;
                                };

                                const catPhotos = propertyPhotos.filter((img: any) => isCatMatch(img, cat.id));
                                const catPhotoUrls = catPhotos.map((img: any) => typeof img === 'string' ? img : (img.url || img.src)).filter(Boolean);

                                return (
                                  <div key={cat.id} className="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2.5">
                                        <div className="p-2 bg-teal-500/10 text-teal-500 rounded-xl shrink-0">
                                          <IconComp size={16} />
                                        </div>
                                        <div>
                                          <h6 className="text-xs font-black uppercase text-gray-900 dark:text-white tracking-wider">{cat.label}</h6>
                                          <p className="text-[10px] font-bold text-gray-400">{cat.description}</p>
                                        </div>
                                      </div>

                                      <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase border bg-gray-100 dark:bg-gray-800 text-gray-500 border-transparent">
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
                                              onClick={() => openGallery(catPhotoUrls, idx, `${cat.label}`)}
                                              className="relative group w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm bg-gray-100 dark:bg-gray-800 cursor-pointer"
                                            >
                                              <SafeImage src={url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                              <div className="absolute inset-0 bg-gray-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[1px]">
                                                <Eye size={14} className="text-white" />
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <p className="text-[11px] font-bold text-gray-400 italic pt-1">No photos uploaded for this category</p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fixed Landlord Action Footer */}
        {!isLoading && (
          <div className="flex-shrink-0 px-4 sm:px-8 py-3.5 sm:py-5 bg-white dark:bg-gray-900/50 border-t border-gray-100 dark:border-white/5 flex flex-row items-center justify-between gap-3 z-50">
             <div className="flex flex-col items-start text-left">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Last Updated</span>
              <span className="text-[10px] font-black text-gray-500 dark:text-gray-300">{new Date(property.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {!(property as any).isArchived && (
                <Link href={`/landlord/properties/${property.id}/edit`}>
                  <button className="rounded-xl sm:rounded-2xl px-4 sm:px-8 py-2.5 sm:py-3 bg-primary text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 sm:gap-2 border border-primary/20 cursor-pointer">
                    <Pencil size={13} className="sm:w-3.5 sm:h-3.5" />
                    <span><span className="hidden sm:inline">Full Property </span>Editor</span>
                  </button>
                </Link>
              )}
              <button
                onClick={onClose}
                className="rounded-xl sm:rounded-2xl px-4 sm:px-8 py-2.5 sm:py-3 border border-gray-200 dark:border-gray-700 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-sm cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Image Lightbox Overlay using MediaPreviewOverlay */}
      <MediaPreviewOverlay
        isOpen={!!galleryPreview}
        onClose={closeGallery}
        images={galleryPreview?.images || []}
        currentIndex={galleryPreview?.index || 0}
        onNavigate={(newIdx) => setGalleryPreview(prev => prev ? { ...prev, index: newIdx } : null)}
        title={galleryPreview?.category || 'Property Photo Preview'}
      />

      {/* Interactive Fullscreen Map Modal */}
      <AnimatePresence>
        {isMapFullscreenOpen && (
          <div className="fixed inset-0 z-[99999] bg-slate-900/20 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 md:p-8" onClick={() => setIsMapFullscreenOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl h-full sm:h-[85vh] min-h-screen sm:min-h-[550px] bg-white dark:bg-gray-900 border-0 sm:border border-gray-200 dark:border-gray-800 rounded-none sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col font-sans"
            >
              {/* Header */}
              <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 sm:p-3 bg-primary/10 rounded-xl sm:rounded-2xl text-primary shrink-0 border border-primary/20">
                    <MapPin size={20} className="sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">
                      Verified Map Location Inspection
                    </h3>
                    <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 mt-0.5">
                      {property.title || 'Property Location'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMapFullscreenOpen(false)}
                  className="p-2 sm:p-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shrink-0 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Map Canvas */}
              <div className="flex-1 w-full relative bg-gray-100 dark:bg-gray-950 overflow-hidden">
                {(() => {
                  const [modalLat, modalLng] = getParsedCoordinates(property);
                  return (
                    <Map
                      center={[modalLat, modalLng]}
                      readonly={true}
                      allowPinDrop={false}
                      title={property.title || 'Property Location'}
                    />
                  );
                })()}

                {/* Bottom Left Coordinates Badge inside Map */}
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-[400] max-w-[calc(100%-40px)] truncate bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl text-[10px] sm:text-xs font-black text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                  <span className="truncate">
                    Lat: {getParsedCoordinates(property)[0].toFixed(6)}, Lng: {getParsedCoordinates(property)[1].toFixed(6)}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/80 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
                <div className="w-full md:w-auto px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl text-gray-900 dark:text-white text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2">
                  <CheckCircle2 size={14} className="sm:w-4 sm:h-4 text-primary" />
                  <span>
                    Verified Location: {getParsedCoordinates(property)[0].toFixed(6)}, {getParsedCoordinates(property)[1].toFixed(6)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMapFullscreenOpen(false)}
                  className="w-full md:w-auto px-6 py-2.5 sm:px-8 sm:py-3 bg-primary hover:bg-primary/90 text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Dismiss Map View
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shared Amenities, Rules & Features Full Breakdown Modal */}
      <SharedAmenitiesModal
        isOpen={amenitiesModalConfig.isOpen}
        onClose={() => setAmenitiesModalConfig(prev => ({ ...prev, isOpen: false }))}
        initialCategory={amenitiesModalConfig.initialCategory}
        propertyTitle={property.title || (property as any).propertyName || 'Property Features & Rules'}
        amenities={(property as any).amenities_list || property.amenities || []}
        customRules={property.rules?.customRules || (property as any).customRules || []}
        customFeatures={property.features?.customFeatures || (property as any).customFeatures || []}
        rulesObj={property.rules || property}
        featuresObj={property.features || property}
        rooms={roomsList}
      />
    </div>,
    document.body
  );
}

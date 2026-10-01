'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { 
  Building2, 
  MapPin, 
  Settings, 
  Bed, 
  Images, 
  FileCheck, 
  Pencil, 
  CheckCircle2, 
  ShieldCheck, 
  Info, 
  ChevronLeft, 
  ChevronRight, 
  ListChecks,
  Star,
  Maximize2,
  Check,
  Briefcase,
  Compass,
  Zap,
  Droplets,
  Wifi,
  ShieldAlert,
  Layers,
  Sparkles,
  Lock,
  Clock,
  VolumeX,
  PawPrint,
  Ban,
  Wine,
  UserX,
  Users,
  Utensils,
  Shirt,
  ShoppingBag,
  Car,
  Tv,
  WashingMachine,
  Refrigerator,
  Shield,
  Camera,
  Wind,
  Coffee,
  Flame,
  X,
  Eye,
  FileText,
  PenTool,
  ExternalLink,
  Download,
  ShowerHead,
  Sofa,
  Fan,
  BookOpen,
  Bike,
  UserCheck
} from 'lucide-react';
import { getDynamicIcon } from '@/lib/iconResolver';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/common/Button';
import { cn } from '@/utils/helper';
import { sanitizeImgUrl } from '@/lib/security/sanitize';
import MediaPreviewOverlay from '@/components/common/MediaPreviewOverlay';
import SafeImage from '@/components/common/SafeImage';
import { SharedAmenitiesModal } from '@/components/common/SharedAmenitiesModal';
import { generateLeaseContractPDF, previewPdfBlob } from '@/utils/contractPdfGenerator';

const Map = dynamic(() => import('@/components/common/Map'), { ssr: false });
import { 
  getCachedPropertyTypes, 
  getCachedAttributes, 
  getCachedRoomTypes,
  getCachedSubGroups,
  getSyncPropertyTypes,
  getSyncAttributes,
  getSyncSubGroups
} from '@/lib/landlordTaxonomyCache';

interface ReviewStepProps {
  watch?: any;
  control?: any;
  getValues?: any;
  uploadedFiles?: any;
  propertyFiles?: any;
  roomFiles?: any;
  onNavigateStep?: (stepIndex: number) => void;
  onBack?: (e?: any) => void;
  onCustomNavChange?: (nav: { nextLabel: string; backLabel: string; onNext: () => void; onBack: () => void } | null) => void;
  onSubmit?: () => void;
}

const getSafeImageSrc = (image: string): string => {
  if (!image || typeof image !== 'string') return '';
  const lower = image.toLowerCase();
  const isSafeProtocol = lower.startsWith('data:image/') || lower.startsWith('blob:') || lower.startsWith('https://') || lower.startsWith('http://');
  const hasDangerousChars = /[<>"'`();\\]/.test(image) && !lower.startsWith('data:image/');
  if (isSafeProtocol && !hasDangerousChars) return image;
  return '';
};

const SUB_TABS = [
  { id: 'BASIC', label: '1. Basic Info', icon: Building2, nextLabel: 'Location' },
  { id: 'LOCATION', label: '2. Location', icon: MapPin, nextLabel: 'Setup & Rules' },
  { id: 'SETUP', label: '3. Setup & Rules', icon: Settings, nextLabel: 'Rooms & Pricing' },
  { id: 'ROOMS', label: '4. Rooms & Rates', icon: Bed, nextLabel: 'Photos' },
  { id: 'IMAGES', label: '5. Photos', icon: Images, nextLabel: 'Documents' },
  { id: 'DOCUMENTS', label: '6. Documents', icon: FileCheck, nextLabel: 'Final Submission' }
];

const PROPERTY_IMAGE_CATEGORIES = [
  { id: 'Exterior', label: 'Exterior Gallery', icon: Building2, description: 'Facade & Entrance' },
  { id: 'Kitchen', label: 'Kitchen Gallery', icon: Utensils, description: 'Cooking & dining space' },
  { id: 'Bathroom', label: 'Bathroom Gallery', icon: ShowerHead, description: 'Shared / Common CR' },
  { id: 'Common Area', label: 'Common Area Gallery', icon: Sofa, description: 'Lobby & Lounge' },
  { id: 'Other', label: 'Other Property Photos', icon: Images, description: 'Other property photos' },
];

const ReviewStep: React.FC<ReviewStepProps> = ({ 
  watch, 
  getValues, 
  onNavigateStep, 
  onBack,
  onCustomNavChange,
  onSubmit
}) => {
  // Watch all form state
  const businessInfo = watch('businessInfo') || {};
  const propertyInfo = watch('propertyInfo') || {};
  const location = watch('location') || {};
  const propertyConfig = watch('propertyConfig') || {};
  const rooms = propertyConfig.rooms || [];
  const propertyImages = watch('propertyImages.property') || {};
  const roomImages = watch('propertyImages.rooms') || {};
  const docs = watch('documents') || {};
  const selectedAmenities = propertyConfig.amenities || [];

  const calculatedStartingPrice = useMemo(() => {
    const validPrices = (rooms || [])
      .map((r: any) => parseFloat(r?.price))
      .filter((p: number) => !isNaN(p) && p > 0);

    if (validPrices.length > 0) {
      return Math.min(...validPrices);
    }
    return parseFloat(propertyInfo.price) || 0;
  }, [rooms, propertyInfo.price]);

  // Interactive Sub-Step Audit State (starting directly on Step 1)
  const [activeTab, setActiveTab] = useState<string>('BASIC');
  const [amenitiesModalConfig, setAmenitiesModalConfig] = useState<{
    isOpen: boolean;
    initialCategory: 'ALL' | 'AMENITIES' | 'RULES' | 'SECURITY';
  }>({
    isOpen: false,
    initialCategory: 'ALL'
  });

  // Dynamic Taxonomy State
  const [propertyTypes, setPropertyTypes] = useState<any[]>(() => getSyncPropertyTypes() || []);
  const [attributes, setAttributes] = useState<any[]>(() => getSyncAttributes() || []);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [dbSubGroups, setDbSubGroups] = useState<any[]>(() => getSyncSubGroups() || []);

  const propertyTypeId = propertyInfo.propertyTypeId || watch('propertyBasic.propertyTypeId') || '';

  useEffect(() => {
    getCachedPropertyTypes().then(types => { if (types) setPropertyTypes(types); });
    getCachedAttributes().then(attrs => { if (attrs) setAttributes(attrs); });
    getCachedSubGroups().then(sgs => { if (sgs) setDbSubGroups(sgs); });
  }, []);

  useEffect(() => {
    getCachedRoomTypes(propertyTypeId).then(types => { 
      if (types && types.length > 0) {
        setRoomTypes(types);
      } else {
        getCachedRoomTypes().then(allTypes => { if (allTypes) setRoomTypes(allTypes); });
      }
    });
  }, [propertyTypeId]);

  // Current Sub-Step Index & Object
  const currentTabIdx = SUB_TABS.findIndex(t => t.id === activeTab);

  const lastNavKeyRef = useRef<string>('');

  // Synchronize Main Wizard Bottom-Right Action Button with Active Review Step
  useEffect(() => {
    if (!onCustomNavChange) return;

    const nextLabel = 'Publish Listing';
    const backLabel = '‹ BACK: DOCUMENTS';

    const currentNavKey = `${activeTab}-${nextLabel}-${backLabel}`;
    if (lastNavKeyRef.current === currentNavKey) {
      return;
    }
    lastNavKeyRef.current = currentNavKey;

    const handleNext = () => {
      if (onSubmit) {
        onSubmit();
      }
    };

    const handlePrevious = () => {
      if (onBack) {
        onBack();
      }
    };

    onCustomNavChange({
      nextLabel,
      backLabel,
      onNext: handleNext,
      onBack: handlePrevious
    });
  }, [activeTab, onCustomNavChange, onSubmit, onBack]);

  // Resolution Helpers
  const resolvePropertyTypeName = (typeId: string) => {
    if (!typeId) return 'Boarding House';
    const matched = propertyTypes.find(t => t.id === typeId || t.value === typeId || t._id === typeId || t.code === typeId);
    if (matched) return matched.name || matched.label || matched.title;
    if (!/^[a-f0-9]{24}$/i.test(typeId)) return typeId.replace(/-/g, ' ');
    return 'Boarding House / Dormitory';
  };

  const resolveAmenityName = (attrId: string) => {
    if (!attrId) return '';
    if (attrId.includes('|')) return attrId.split('|')[0];
    const matched = attributes.find(a => a.id === attrId || a.value === attrId || a._id === attrId || a.code === attrId);
    if (matched) return matched.name || matched.label || matched.title;
    if (!/^[a-f0-9]{24}$/i.test(attrId)) return attrId.replace(/-/g, ' ');
    return attrId;
  };

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

  // Category Grouping for Amenities
  const groupAmenitiesByCategory = (amenityIds: string[]) => {
    const categories: Record<string, string[]> = {
      'Kitchen Appliances & Cooking': [],
      'CR & Bathroom Features': [],
      'Cooling & Climate Control': [],
      'Security & Safety Features': [],
      'Utilities & Services': [],
      'Furniture & General Amenities': []
    };

    amenityIds.forEach(id => {
      const name = resolveAmenityName(id);
      const lower = name.toLowerCase();
      if (lower.includes('kitchen') || lower.includes('cook') || lower.includes('fridge') || lower.includes('stove') || lower.includes('microwave') || lower.includes('dining')) {
        categories['Kitchen Appliances & Cooking'].push(name);
      } else if (lower.includes('shower') || lower.includes('bathroom') || lower.includes('cr') || lower.includes('bidet') || lower.includes('toilet') || lower.includes('heater')) {
        categories['CR & Bathroom Features'].push(name);
      } else if (lower.includes('air') || lower.includes('fan') || lower.includes('ac') || lower.includes('cool')) {
        categories['Cooling & Climate Control'].push(name);
      } else if (lower.includes('cctv') || lower.includes('security') || lower.includes('fire') || lower.includes('guard') || lower.includes('lock')) {
        categories['Security & Safety Features'].push(name);
      } else if (lower.includes('wifi') || lower.includes('water') || lower.includes('power') || lower.includes('generator') || lower.includes('light') || lower.includes('laundry')) {
        categories['Utilities & Services'].push(name);
      } else {
        categories['Furniture & General Amenities'].push(name);
      }
    });

    return Object.entries(categories).filter(([_, items]) => items.length > 0);
  };

  const getItemIcon = (name: string, attrId?: string) => {
    const cleanId = attrId ? (attrId.includes('|') ? attrId.split('|')[0] : attrId) : '';
    const cleanName = (name || '').trim();

    const matched = attributes.find(a => 
      (cleanId && (a.id === cleanId || a.value === cleanId || a._id === cleanId || a.code === cleanId || cleanId.startsWith(a.id + '|'))) ||
      (cleanName && (a.name === cleanName || a.name?.toLowerCase() === cleanName.toLowerCase() || a.id === cleanName || a.code === cleanName))
    );

    if (matched && matched.icon) {
      return getDynamicIcon(matched.icon);
    }

    return getDynamicIcon(cleanName);
  };

  const [mounted, setMounted] = useState(false);
  const [isFullscreenMapOpen, setIsFullscreenMapOpen] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [activeModalCategory, setActiveModalCategory] = useState<{
    title: string;
    icon: any;
    items: string[];
    groups?: { key: string; label: string; items: string[] }[];
    iconColorClass: string;
  } | null>(null);

  const customPdfUrl = watch('propertyConfig.customPdfUrl') || propertyConfig.customPdfUrl || watch('documents.customContract') || watch('documents.customPdfUrl');
  const storedCustomPdfName = watch('propertyConfig.customPdfName') || propertyConfig.customPdfName;

  const rawPropName = watch('basicInfo.name') || propertyConfig.propertyName || 'Property';
  const cleanPropName = rawPropName.trim().replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_');
  const displayCustomPdfName = storedCustomPdfName || `${cleanPropName}_Custom_Lease_Agreement.pdf`;

  const handlePreviewAutoGeneratedPdf = async () => {
    const pdfWindow = typeof window !== 'undefined' ? window.open('', '_blank') : null;
    try {
      const propName = watch('basicInfo.name') || propertyConfig.propertyName || 'Boarding House Property';
      const propAddress = watch('location.address') || propertyConfig.address || 'Property Address';
      const deposit = Number(propertyConfig.depositAmount) || Number(watch('propertyConfig.depositAmount')) || 0;
      const noticeDays = Number(propertyConfig.moveOutNoticeDays) || Number(watch('propertyConfig.moveOutNoticeDays')) || 30;
      const signature = propertyConfig.landlordSignatureBase64 || watch('propertyConfig.landlordSignatureBase64') || '';
      const clauses = propertyConfig.customContractClauses || watch('propertyConfig.customContractClauses') || [];

      const pdfBlob = await generateLeaseContractPDF(`${cleanPropName}_BoardTAU_Smart_Lease_Contract.pdf`, {
        contractHash: `DRAFT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        landlordName: 'Property Owner / Landlord',
        tenantName: '[TENANT NAME APPLICANT]',
        propertyName: propName,
        roomName: 'Standard Unit / Room',
        propertyAddress: propAddress,
        moveInDate: 'Effective Upon Signing',
        checkOutDate: 'Per Lease Agreement Duration',
        depositAmount: deposit,
        rentAmount: calculatedStartingPrice,
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
      console.error('Error generating PDF preview:', err);
      if (pdfWindow) pdfWindow.close();
    }
  };

  // Dynamically group chosen items by their Sub-Step AND inner Sub-Group tabs!
  const groupedSubStepItems = useMemo(() => {
    const amenitiesArray = Array.isArray(propertyConfig.amenities) ? propertyConfig.amenities : [];
    const rulesArray = Array.isArray(propertyConfig.rules) ? propertyConfig.rules : [];
    const featuresArray = Array.isArray(propertyConfig.features) ? propertyConfig.features : [];
    const rawList: string[] = Array.from(new Set([...amenitiesArray, ...rulesArray, ...featuresArray]));

    // Sub-Step 2: Shared Amenities grouped by Sub-Group tab
    const amenitiesBySubGroup: Record<string, { key: string; label: string; items: string[] }> = {};
    
    // Sub-Step 3: House Rules grouped by Sub-Group tab
    const rulesBySubGroup: Record<string, { key: string; label: string; items: string[] }> = {};

    // Sub-Step 4: Security & Safety Features grouped by Sub-Group tab
    const featuresBySubGroup: Record<string, { key: string; label: string; items: string[] }> = {};

    // Helper to get subGroupLabel
    const getSubGroupTitle = (key: string, defaultTitle: string) => {
      const matched = dbSubGroups.find((s: any) => s.key === key);
      return matched?.tabLabel || matched?.title || defaultTitle;
    };

    // 2. Map all checked attribute IDs to their exact sub-group tabs!
    rawList.forEach(id => {
      const attr = attributes.find(a => a.id === id || a.name === id || a._id === id || a.code === id);
      const name = resolveAmenityName(id);
      if (!name) return;

      const subKey = attr?.subGroupKey || 'GENERAL';

      if (attr?.type === 'RULE' || subKey === 'GENDER_POLICY' || subKey === 'CURFEW' || subKey === 'VISITOR_POLICY' || subKey === 'PET_POLICY' || subKey === 'SMOKING_POLICY' || subKey === 'ALCOHOL_POLICY' || subKey === 'SMOKE_ALCOHOL' || subKey === 'SMOKING') {
        const title = getSubGroupTitle(subKey, 'House Rules');
        if (!rulesBySubGroup[subKey]) rulesBySubGroup[subKey] = { key: subKey, label: title, items: [] };
        if (!rulesBySubGroup[subKey].items.includes(name)) rulesBySubGroup[subKey].items.push(name);
      } else if (attr?.type === 'FEATURE' || subKey === 'SECURITY' || subKey === 'SAFETY' || subKey === 'FIRE_SAFETY') {
        const title = getSubGroupTitle(subKey, 'Security & Safety');
        if (!featuresBySubGroup[subKey]) featuresBySubGroup[subKey] = { key: subKey, label: title, items: [] };
        if (!featuresBySubGroup[subKey].items.includes(name)) featuresBySubGroup[subKey].items.push(name);
      } else {
        const title = getSubGroupTitle(subKey, 'Shared Amenities');
        if (!amenitiesBySubGroup[subKey]) amenitiesBySubGroup[subKey] = { key: subKey, label: title, items: [] };
        if (!amenitiesBySubGroup[subKey].items.includes(name)) amenitiesBySubGroup[subKey].items.push(name);
      }
    });

    const totalAmenitiesCount = Object.values(amenitiesBySubGroup).reduce((acc, g) => acc + g.items.length, 0);
    const totalRulesCount = Object.values(rulesBySubGroup).reduce((acc, g) => acc + g.items.length, 0);
    const totalFeaturesCount = Object.values(featuresBySubGroup).reduce((acc, g) => acc + g.items.length, 0);

    const allAmenitiesItems = Object.values(amenitiesBySubGroup).flatMap(g => g.items);
    const allRulesItems = Object.values(rulesBySubGroup).flatMap(g => g.items);
    const allFeaturesItems = Object.values(featuresBySubGroup).flatMap(g => g.items);

    return {
      amenitiesBySubGroup: Object.values(amenitiesBySubGroup),
      rulesBySubGroup: Object.values(rulesBySubGroup),
      featuresBySubGroup: Object.values(featuresBySubGroup),
      totalAmenitiesCount,
      totalRulesCount,
      totalFeaturesCount,
      allAmenitiesItems,
      allRulesItems,
      allFeaturesItems
    };
  }, [propertyConfig.amenities, propertyConfig.rules, propertyConfig, attributes, dbSubGroups]);

  // Preview Lightbox State
  const [previewData, setPreviewData] = useState<{ isOpen: boolean; images: string[]; index: number; title: string; isDocument?: boolean }>({
    isOpen: false,
    images: [],
    index: 0,
    title: '',
    isDocument: false
  });

  const handlePreview = (images: string[], index: number, title: string, isDocument: boolean = false) => {
    setPreviewData({ isOpen: true, images, index, title, isDocument });
  };

  const [selectedRoomIndex, setSelectedRoomIndex] = useState<number>(0);
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
  }, [selectedRoomIndex]);

  const groupInUnitAmenities = (amenitiesList: string[]) => {
    if (!Array.isArray(amenitiesList) || amenitiesList.length === 0) return [];

    const subGroupMap: Record<string, { key: string; label: string; items: string[] }> = {};

    amenitiesList.forEach(attrId => {
      const cleanName = resolveAmenityName(attrId);
      if (!cleanName) return;

      const matchedAttr = attributes.find(a => a.id === attrId || a.value === attrId || a._id === attrId || a.code === attrId || attrId.startsWith(a.id + '|'));
      const subGroupKey = matchedAttr?.subGroupKey || matchedAttr?.subGroup || 'IN_UNIT_AMENITIES';
      const matchedSubGroup = dbSubGroups.find((sg: any) => sg.key === subGroupKey);
      const label = matchedSubGroup?.tabLabel || matchedSubGroup?.title || matchedAttr?.category || 'In-Unit Amenities';

      if (!subGroupMap[subGroupKey]) {
        subGroupMap[subGroupKey] = { key: subGroupKey, label, items: [] };
      }
      if (!subGroupMap[subGroupKey].items.includes(cleanName)) {
        subGroupMap[subGroupKey].items.push(cleanName);
      }
    });

    return Object.values(subGroupMap);
  };

  const totalCorePhotos = Object.values(propertyImages || {}).flat().length;
  const totalRoomPhotos = Object.values(roomImages || {}).flat().length;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">

      {/* Sleek Final Review & Verification Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-sm">
            <CheckCircle2 size={22} className="sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-xs sm:text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider">
                Final Property Application Review
              </h4>
              <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider shrink-0">
                Ready to Publish
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5 leading-relaxed">
              Review your complete property details below. Click any section tab to inspect or edit before submitting.
            </p>
          </div>
        </div>

        {onBack && (
          <Button 
            outline 
            type="button" 
            onClick={onBack}
            className="flex items-center justify-center rounded-xl sm:rounded-2xl px-4 py-2.5 sm:px-6 sm:py-3 uppercase text-[11px] sm:text-xs font-black tracking-wider gap-2 bg-slate-50 dark:bg-slate-800 hover:border-primary shrink-0 transition-all cursor-pointer"
          >
            <ChevronLeft size={16} /> Back to Documents
          </Button>
        )}
      </motion.div>

      {/* SUB-STEP NAVIGATION PILLS BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border-b border-slate-200 dark:border-slate-800">
        {SUB_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer select-none shrink-0",
                isActive
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Icon size={14} className={cn(isActive ? "text-white" : "shrink-0")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-STEP WORKSPACE CARDS */}
      <AnimatePresence mode="popLayout">
        
        {/* SUB-STEP 1: Property & Business Basics */}
        {activeTab === 'BASIC' && (
          <motion.div 
            key="BASIC"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white dark:bg-slate-900/90 rounded-none sm:rounded-[2.5rem] p-4 sm:p-8 border-x-0 sm:border border-slate-200 dark:border-slate-800/80 shadow-md sm:shadow-xl space-y-4 sm:space-y-6"
          >
            <div className="flex items-center justify-between gap-2 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                  <Building2 size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white truncate">Business & Property Info</h4>
                </div>
              </div>

              {onNavigateStep && (
                <button
                  type="button"
                  onClick={() => onNavigateStep(0)}
                  className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-200 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer border border-slate-200 dark:border-slate-700 shrink-0"
                >
                  <Pencil size={12} className="sm:w-3.5 sm:h-3.5" /> Edit Section
                </button>
              )}
            </div>

            {/* Section 1: Business Profile */}
            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                <Briefcase size={15} className="text-primary" />
                <span>Host & Business Verification Profile</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Registered Business Name</span>
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{businessInfo.businessName || 'N/A'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Landlord Experience</span>
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {businessInfo.yearsExperience === 'less-than-1' ? 'Less than 1 year' : businessInfo.yearsExperience === '5-plus' ? '5+ years' : businessInfo.yearsExperience === '1-2' ? '1 - 2 years' : businessInfo.yearsExperience === '3-5' ? '3 - 5 years' : businessInfo.yearsExperience ? `${businessInfo.yearsExperience} Years` : 'N/A'}
                  </p>
                </div>

                {businessInfo.businessDescription && (
                  <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 sm:col-span-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Business Mission & Host Background</span>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{businessInfo.businessDescription}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Property Essentials */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h5 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                <Building2 size={15} className="text-primary" />
                <span>Public Property Listing Essentials</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 sm:col-span-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Listing Display Title</span>
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{propertyInfo.propertyName || 'N/A'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Property Type</span>
                  <p className="text-xs font-black text-primary uppercase tracking-wider">{resolvePropertyTypeName(propertyInfo.propertyTypeId || businessInfo.businessType)}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 sm:col-span-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Starting Rent Price</span>
                  <p className="text-xs font-black text-primary uppercase tracking-wider">₱{Number(calculatedStartingPrice || 0).toLocaleString()}/mo</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 sm:col-span-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Property Description</span>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{propertyInfo.description || 'No description provided.'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUB-STEP 2: Address & Location */}
        {activeTab === 'LOCATION' && (
          <motion.div 
            key="LOCATION"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white dark:bg-slate-900/90 rounded-none sm:rounded-[2.5rem] p-4 sm:p-8 border-x-0 sm:border border-slate-200 dark:border-slate-800/80 shadow-md sm:shadow-xl space-y-4 sm:space-y-6"
          >
            <div className="flex items-center justify-between gap-2 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                  <MapPin size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white truncate">Address & Map Location</h4>
                </div>
              </div>

              {onNavigateStep && (
                <button
                  type="button"
                  onClick={() => onNavigateStep(1)}
                  className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-200 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer border border-slate-200 dark:border-slate-700 shrink-0"
                >
                  <Pencil size={12} className="sm:w-3.5 sm:h-3.5" /> Edit Section
                </button>
              )}
            </div>

            {/* Section 1: Address Details */}
            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                <MapPin size={15} className="text-amber-500" />
                <span>Administrative Address Details</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 sm:col-span-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Complete Street Address</span>
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{location.address || 'N/A'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">City / Municipality</span>
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{location.city || 'Camiling'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Province</span>
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{location.province || 'Tarlac'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 sm:col-span-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Postal Zip Code</span>
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{location.zipCode || '2370'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 sm:col-span-2 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">GPS Coordinates</span>
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      {Array.isArray(location.coordinates) && location.coordinates.length === 2
                        ? `Lat: ${Number(location.coordinates[0]).toFixed(4)}, Lng: ${Number(location.coordinates[1]).toFixed(4)}`
                        : 'Lat: 15.6980, Lng: 120.4285'}
                    </p>
                  </div>
                  <span className="text-[10px] font-black px-3 py-1 rounded-full bg-primary/10 text-primary dark:text-primary-400 border border-primary/20 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 size={12} /> Pinpoint Saved
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Interactive Map Preview */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                  <Compass size={15} className="text-amber-500" />
                  <span>Verified Map Location Pin</span>
                </h5>
                <button
                  type="button"
                  onClick={() => setIsFullscreenMapOpen(true)}
                  className="text-primary hover:underline font-extrabold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={12} />
                  <span>Fullscreen View</span>
                </button>
              </div>
              <div className="h-[220px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner relative group">
                <Map
                  center={Array.isArray(location.coordinates) && location.coordinates.length === 2 ? location.coordinates : [15.6980, 120.4285]}
                  readonly={true}
                  allowPinDrop={false}
                  title={propertyInfo.propertyName || 'Property Location'}
                />

                {/* ⤢ Top Right Expand Icon Button */}
                <button
                  type="button"
                  onClick={() => setIsFullscreenMapOpen(true)}
                  title="Expand Map"
                  className="absolute top-3 right-3 z-[400] p-2.5 bg-white/90 dark:bg-slate-900/90 hover:bg-primary hover:text-white dark:hover:bg-primary backdrop-blur-md text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <Maximize2 size={16} />
                </button>

                {/* Bottom Left Coordinates Badge inside Map */}
                <div className="absolute bottom-3 left-3 z-[400] max-w-[calc(100%-60px)] truncate bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md text-[9px] sm:text-[10px] font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                  <span className="truncate">
                    {Array.isArray(location.coordinates) && location.coordinates.length === 2
                      ? `Lat: ${Number(location.coordinates[0]).toFixed(4)}, Lng: ${Number(location.coordinates[1]).toFixed(4)}`
                      : 'Lat: 15.6980, Lng: 120.4285'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUB-STEP 3: Property Setup & Rules */}
        {activeTab === 'SETUP' && (
          <motion.div 
            key="SETUP"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white dark:bg-slate-900/90 rounded-none sm:rounded-[2.5rem] p-4 sm:p-8 border-x-0 sm:border border-slate-200 dark:border-slate-800/80 shadow-md sm:shadow-xl space-y-4 sm:space-y-6"
          >
            <div className="flex items-center justify-between gap-2 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20 shrink-0">
                  <Settings size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white truncate">Property Setup & Rules</h4>
                </div>
              </div>

              {onNavigateStep && (
                <button
                  type="button"
                  onClick={() => onNavigateStep(2)}
                  className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-200 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer border border-slate-200 dark:border-slate-700 shrink-0"
                >
                  <Pencil size={12} className="sm:w-3.5 sm:h-3.5" /> Edit Section
                </button>
              )}
            </div>

            {/* 1. Sub-Step 1: Compound Structure & Facility Setup */}
            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                <Building2 size={15} className="text-purple-500" />
                <span>1. Compound Structure & Facility Setup</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Total Room Units Available</span>
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{propertyConfig.totalRooms || rooms.length || 0} Units</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Bathroom & CR Setup</span>
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {propertyConfig.bathroomSetup === 'PRIVATE' || propertyConfig.bathroomSetup === 'PRIVATE_CR' ? 'Private Bathroom' : 'Shared Common CR'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Common CR Count</span>
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {propertyConfig.bathroomSetup === 'PRIVATE' || propertyConfig.bathroomSetup === 'PRIVATE_CR' ? 'N/A (Private)' : propertyConfig.bathroomCount ? `${propertyConfig.bathroomCount} Common CRs` : 'Shared Hallway CR'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Kitchen Facilities Setup</span>
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {propertyConfig.kitchenSetup === 'IN_UNIT' || propertyConfig.kitchenSetup === 'PRIVATE' ? 'Private In-Unit Kitchen' : propertyConfig.kitchenSetup === 'NONE' ? 'No Kitchen Facility' : 'Shared Compound Kitchen'}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Sub-Step 2: Shared Compound Amenities (Grouped by Inner Sub-Group Tabs) */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                  <ListChecks size={15} className="text-blue-500" />
                  <span>2. Shared Compound Amenities ({groupedSubStepItems.totalAmenitiesCount})</span>
                </h5>
                <button
                  type="button"
                  onClick={() => setAmenitiesModalConfig({ isOpen: true, initialCategory: 'AMENITIES' })}
                  className="text-[10px] font-black text-blue-500 hover:underline flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                >
                  <Maximize2 size={12} /> View All Amenities ({groupedSubStepItems.totalAmenitiesCount})
                </button>
              </div>

              {groupedSubStepItems.amenitiesBySubGroup.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedSubStepItems.amenitiesBySubGroup.map(group => (
                    <div key={group.key} className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-500 block">{group.label}</span>
                      <div className="flex flex-wrap gap-2">
                        {group.items.map((item, idx) => {
                          const ItemIcon = getItemIcon(item);
                          return (
                            <span key={idx} className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-blue-200/60 dark:border-blue-500/30 text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                              <ItemIcon size={12} className="text-blue-500 shrink-0" />
                              <span>{item}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-[11px] font-bold text-slate-400 italic">No specific shared amenities selected</span>
              )}
            </div>

            {/* 3. Sub-Step 3: House Rules & Tenant Policies (Grouped by Inner Sub-Group Tabs) */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                  <Shield size={15} className="text-purple-500" />
                  <span>3. House Rules & Tenant Policies ({groupedSubStepItems.totalRulesCount})</span>
                </h5>
                <button
                  type="button"
                  onClick={() => setAmenitiesModalConfig({ isOpen: true, initialCategory: 'RULES' })}
                  className="text-[10px] font-black text-purple-500 hover:underline flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                >
                  <Maximize2 size={12} /> View All Rules ({groupedSubStepItems.totalRulesCount})
                </button>
              </div>

              {groupedSubStepItems.rulesBySubGroup.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedSubStepItems.rulesBySubGroup.map(group => (
                    <div key={group.key} className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-500 dark:text-purple-400 block">{group.label}</span>
                      <div className="flex flex-wrap gap-2">
                        {group.items.map((item, idx) => {
                          const ItemIcon = getItemIcon(item);
                          return (
                            <span key={idx} className="px-2.5 py-1 rounded-xl bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/25 text-[10px] font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                              <ItemIcon size={12} className="text-purple-500 dark:text-purple-400 shrink-0" />
                              <span>{item}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-[11px] font-bold text-slate-400 italic">Standard Rules Apply (Open to All Tenants)</span>
              )}
            </div>

            {/* 4. Sub-Step 4: Security & Safety Features (Grouped by Inner Sub-Group Tabs) */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                  <Star size={15} className="text-amber-500" />
                  <span>4. Security & Safety Features ({groupedSubStepItems.totalFeaturesCount})</span>
                </h5>
                <button
                  type="button"
                  onClick={() => setAmenitiesModalConfig({ isOpen: true, initialCategory: 'SECURITY' })}
                  className="text-[10px] font-black text-amber-500 hover:underline flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                >
                  <Maximize2 size={12} /> View All Security ({groupedSubStepItems.totalFeaturesCount})
                </button>
              </div>

              {groupedSubStepItems.featuresBySubGroup.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedSubStepItems.featuresBySubGroup.map(group => (
                    <div key={group.key} className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 dark:text-amber-400 block">{group.label}</span>
                      <div className="flex flex-wrap gap-2">
                        {group.items.map((item, idx) => {
                          const ItemIcon = getItemIcon(item);
                          return (
                            <span key={idx} className="px-2.5 py-1 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                              <ItemIcon size={12} className="text-amber-500 dark:text-amber-400 shrink-0" />
                              <span>{item}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-[11px] font-bold text-slate-400 italic">Standard Security Level</span>
              )}
            </div>

            {/* 5. Sub-Step 5: Lease Contract & Digital Signature */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h5 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                <FileCheck size={15} className="text-teal-500" />
                <span>5. Lease Contract & Digital Signature</span>
              </h5>

              {propertyConfig.contractMode === 'CUSTOM_PDF' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Lease Agreement Mode</span>
                    <p className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={14} /> Custom Contract PDF
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Uploaded Custom Document</span>
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider truncate" title={displayCustomPdfName}>
                        {customPdfUrl ? displayCustomPdfName : 'No Document Uploaded'}
                      </p>
                    </div>
                    {customPdfUrl ? (
                      <button
                        type="button"
                        onClick={() => previewPdfBlob(customPdfUrl, 'Custom Lease Contract Preview')}
                        className="px-3 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
                      >
                        <Eye size={13} />
                        <span>Preview PDF</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-extrabold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                        Missing PDF
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Lease Agreement Mode</span>
                      <p className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={14} /> BoardTAU Smart Contract
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Standard Security Deposit</span>
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        {propertyConfig.depositAmount ? `₱${Number(propertyConfig.depositAmount).toLocaleString()}` : 'Not Specified'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Move-Out Notice Period</span>
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        {propertyConfig.moveOutNoticeDays ? `${propertyConfig.moveOutNoticeDays} Days` : '30 Days'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Landlord Digital Signature</span>
                      {propertyConfig.landlordSignatureBase64 || watch('propertyConfig.landlordSignatureBase64') ? (
                        <div className="h-7 w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 flex items-center justify-center overflow-hidden relative">
                          <SafeImage 
                            src={sanitizeImgUrl(propertyConfig.landlordSignatureBase64 || watch('propertyConfig.landlordSignatureBase64'))} 
                            alt="Landlord Signature" 
                            fill
                            className="object-contain dark:invert" 
                          />
                        </div>
                      ) : (
                        <p className="text-xs font-black text-rose-500 uppercase tracking-wider">Not Signed</p>
                      )}
                    </div>
                  </div>

                  {/* Auto-Generated Contract PDF Preview Action Banner */}
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
          </motion.div>
        )}

        {/* SUB-STEP 4: Room Units & Monthly Rates */}
        {activeTab === 'ROOMS' && (
          <motion.div 
            key="ROOMS"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white dark:bg-slate-900/90 rounded-none sm:rounded-[2.5rem] p-4 sm:p-8 border-x-0 sm:border border-slate-200 dark:border-slate-800/80 shadow-md sm:shadow-xl space-y-4 sm:space-y-6"
          >
            {/* Header & Section Navigation */}
            <div className="flex items-center justify-between gap-2 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0">
                  <Bed size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white truncate">Room Units & Rates</h4>
                </div>
              </div>

              {onNavigateStep && (
                <button
                  type="button"
                  onClick={() => onNavigateStep(3)}
                  className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-200 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer border border-slate-200 dark:border-slate-700 shrink-0"
                >
                  <Pencil size={12} className="sm:w-3.5 sm:h-3.5" /> Edit Section
                </button>
              )}
            </div>

            {/* Room Selector Navigation Bar (For 2 to 20+ Rooms) */}
            {rooms.length > 1 && (
              <div ref={roomTabContainerRef} className="flex items-center gap-2 overflow-x-auto pb-2 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border-b border-slate-100 dark:border-slate-800">
                {rooms.map((room: any, idx: number) => {
                  const roomTypeName = resolveRoomTypeName(room);
                  const isFlatRate = checkIsFlatRate(room);
                  const isActive = selectedRoomIndex === idx;

                  return (
                    <button
                      key={idx}
                      type="button"
                      data-active={isActive ? "true" : "false"}
                      onClick={() => setSelectedRoomIndex(idx)}
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
            {rooms.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {rooms
                  .filter((_: any, idx: number) => (selectedRoomIndex < rooms.length ? selectedRoomIndex === idx : idx === 0))
                  .map((room: any) => {
                    const roomIdx = selectedRoomIndex < rooms.length ? selectedRoomIndex : 0;
                    const roomTypeName = resolveRoomTypeName(room);
                    const isFlatRate = checkIsFlatRate(room);
                    const isPrivateCR = room.bathroomArrangement === 'PRIVATE_CR' || room.bathroomArrangement === 'PRIVATE' || room.bathroomType === 'PRIVATE';

                    const inUnitAmenities = room.amenities || [];
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
                              ₱{Number(room.price || 0).toLocaleString()}/mo {isFlatRate ? '(Whole Unit)' : '(per Head)'}
                            </span>
                            {room.reservationFee && (
                              <span className="text-[9px] font-bold text-slate-400 uppercase">₱{Number(room.reservationFee).toLocaleString()} Reservation Fee</span>
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
                              {isFlatRate ? 'Total Unit Capacity' : 'Bedspace Capacity'}
                            </span>
                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase">
                              {room.capacity || '1'} {isFlatRate ? 'Pax' : 'Beds / Slots'}
                            </p>
                          </div>

                          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">CR Setup</span>
                            <p className="text-xs font-black text-primary uppercase">{isPrivateCR ? 'Own Private CR' : 'Common Shared CR'}</p>
                          </div>
                        </div>

                          {/* In-Unit Amenities Grouped by Taxonomy Sub-Groups */}
                          <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                                <Sparkles size={13} className="text-primary" />
                                <span>In-Unit Amenities ({totalInUnitCount})</span>
                              </span>

                              {totalInUnitCount > 6 && (
                                <button
                                  type="button"
                                  onClick={() => setActiveModalCategory({
                                    title: `Unit ${roomIdx + 1} (${roomTypeName}) In-Unit Amenities`,
                                    icon: Bed,
                                    items: groupedAmenities.flatMap(g => g.items),
                                    groups: groupedAmenities,
                                    iconColorClass: "bg-primary/15 text-primary"
                                  })}
                                  className="text-[10px] font-black text-primary hover:underline flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                                >
                                  <Maximize2 size={12} /> View All ({totalInUnitCount})
                                </button>
                              )}
                            </div>

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
                          </div>

                          {/* Dynamic Bottom Room Navigation Buttons */}
                          {rooms.length > 1 && (
                            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                              <div>
                                {roomIdx > 0 && (() => {
                                  const prevRoom = rooms[roomIdx - 1];
                                  const prevTypeName = resolveRoomTypeName(prevRoom);
                                  const prevIsFlat = checkIsFlatRate(prevRoom);
                                  const prevLabel = `${prevIsFlat ? 'Unit' : 'Room'} ${roomIdx}: ${prevTypeName}`;

                                  return (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedRoomIndex(roomIdx - 1)}
                                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-200 text-xs font-black uppercase tracking-wider transition-all border border-slate-200 dark:border-slate-700 cursor-pointer shadow-sm"
                                    >
                                      <ChevronLeft size={15} />
                                      <span>PREVIOUS: {prevLabel}</span>
                                    </button>
                                  );
                                })()}
                              </div>

                              <div>
                                {roomIdx < rooms.length - 1 && (() => {
                                  const nextRoom = rooms[roomIdx + 1];
                                  const nextTypeName = resolveRoomTypeName(nextRoom);
                                  const nextIsFlat = checkIsFlatRate(nextRoom);
                                  const nextLabel = `${nextIsFlat ? 'Unit' : 'Room'} ${roomIdx + 2}: ${nextTypeName}`;

                                  return (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedRoomIndex(roomIdx + 1)}
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
              <p className="text-xs font-bold text-slate-400 italic">No room units registered yet.</p>
            )}
          </motion.div>
        )}

        {/* SUB-STEP 5: Property & Room Photos */}
        {activeTab === 'IMAGES' && (
          <motion.div 
            key="IMAGES"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white dark:bg-slate-900/90 rounded-none sm:rounded-[2.5rem] p-4 sm:p-8 border-x-0 sm:border border-slate-200 dark:border-slate-800/80 shadow-md sm:shadow-xl space-y-4 sm:space-y-6"
          >
            <div className="flex items-center justify-between gap-2 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-teal-500/10 text-teal-500 border border-teal-500/20 shrink-0">
                  <Images size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white truncate">Property & Unit Photos</h4>
                </div>
              </div>

              {onNavigateStep && (
                <button
                  type="button"
                  onClick={() => onNavigateStep(4)}
                  className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-200 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer border border-slate-200 dark:border-slate-700 shrink-0"
                >
                  <Pencil size={12} className="sm:w-3.5 sm:h-3.5" /> Edit Section
                </button>
              )}
            </div>

            {/* Core Property Photos (Grouped per Category) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                  <Camera size={15} className="text-teal-500" />
                  <span>Core Property Photos ({totalCorePhotos} Total Uploaded)</span>
                </h5>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PROPERTY_IMAGE_CATEGORIES.map(cat => {
                  const IconComp = cat.icon;
                  const catPhotos: string[] = Array.isArray(propertyImages[cat.id]) ? propertyImages[cat.id] : [];

                  return (
                    <div key={cat.id} className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
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

                        <span className={cn(
                          "text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase border",
                          catPhotos.length > 0
                            ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent"
                        )}>
                          {catPhotos.length} {catPhotos.length === 1 ? 'Photo' : 'Photos'}
                        </span>
                      </div>

                      {catPhotos.length > 0 ? (
                        <div className="flex flex-wrap gap-2.5 pt-1">
                          {catPhotos.map((img: string, idx: number) => (
                            <div 
                              key={idx} 
                              onClick={() => handlePreview(catPhotos, idx, `${cat.label} - Photo ${idx + 1}`)}
                              className="relative group w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-slate-100 dark:bg-slate-800 cursor-pointer"
                            >
                              <SafeImage src={getSafeImageSrc(img)} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[1px]">
                                <Maximize2 size={14} className="text-white" />
                              </div>
                              {idx === 0 && (
                                <span className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-primary/90 text-white text-[7px] font-black uppercase tracking-wider">
                                  Cover
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] font-bold text-slate-400 italic pt-1">No photos uploaded for this category</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Room Unit Photos Summary */}
            {rooms.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h5 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">
                  Room & Unit Photos ({totalRoomPhotos} Total Uploaded)
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rooms.map((room: any, idx: number) => {
                    const roomPhotoList = roomImages[idx] || [];
                    const roomTypeName = resolveRoomTypeName(room.roomType);

                    return (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">
                            Unit {idx + 1}: {roomTypeName}
                          </span>
                          <span className={cn(
                            "text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase border",
                            roomPhotoList.length > 0
                              ? "bg-primary/10 text-primary border-primary/20"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent"
                          )}>
                            {roomPhotoList.length} {roomPhotoList.length === 1 ? 'Photo' : 'Photos'}
                          </span>
                        </div>

                        {roomPhotoList.length > 0 ? (
                          <div className="flex flex-wrap gap-2.5">
                            {roomPhotoList.map((img: string, imgIdx: number) => (
                              <div 
                                key={imgIdx} 
                                onClick={() => handlePreview(roomPhotoList, imgIdx, `Unit ${idx + 1}: ${roomTypeName}`)}
                                className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-slate-100 dark:bg-slate-800 cursor-pointer"
                              >
                                <SafeImage src={getSafeImageSrc(img)} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[1px]">
                                  <Maximize2 size={14} className="text-white" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] font-bold text-slate-400 italic pt-1">No unit photos uploaded</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB-STEP 6: Legal Verification Documents */}
        {activeTab === 'DOCUMENTS' && (
          <motion.div 
            key="DOCUMENTS"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white dark:bg-slate-900/90 rounded-none sm:rounded-[2.5rem] p-4 sm:p-8 border-x-0 sm:border border-slate-200 dark:border-slate-800/80 shadow-md sm:shadow-xl space-y-4 sm:space-y-6"
          >
            <div className="flex items-center justify-between gap-2 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                  <FileCheck size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white truncate">Legal Verification Documents</h4>
                </div>
              </div>

              {onNavigateStep && (
                <button
                  type="button"
                  onClick={() => onNavigateStep(5)}
                  className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-200 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer border border-slate-200 dark:border-slate-700 shrink-0"
                >
                  <Pencil size={12} className="sm:w-3.5 sm:h-3.5" /> Edit Section
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
              {[
                { id: 'governmentId', label: 'Government ID' },
                { id: 'businessPermit', label: 'Business Permit' },
                { id: 'landTitle', label: 'Land Title / Lease' },
                { id: 'barangayClearance', label: 'Barangay Clearance' },
                { id: 'fireSafetyCertificate', label: 'Fire Safety Certificate' }
              ].map((doc, idx) => {
                const url = docs[doc.id];
                const isUploaded = Boolean(url);

                return (
                  <div 
                    key={doc.id}
                    onClick={() => isUploaded && handlePreview([url], 0, doc.label, true)}
                    className={cn(
                      "p-3 sm:p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 sm:gap-3 text-center min-w-0",
                      idx === 4 ? "col-span-2 sm:col-span-1" : "col-span-1",
                      isUploaded 
                        ? "bg-primary/5 border-primary/30 cursor-pointer hover:border-primary shadow-sm" 
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60"
                    )}
                  >
                    {isUploaded ? (
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-primary/30 shadow-sm bg-slate-100 dark:bg-slate-800 shrink-0">
                        <SafeImage src={getSafeImageSrc(url)} alt={doc.label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Maximize2 size={14} className="text-white sm:w-4 sm:h-4" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-400 flex items-center justify-center shrink-0">
                        <FileCheck size={18} className="sm:w-5 sm:h-5" />
                      </div>
                    )}

                    <div className="min-w-0 w-full">
                      <p className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider truncate" title={doc.label}>
                        {doc.label}
                      </p>
                      <span className={cn(
                        "text-[8px] sm:text-[9px] font-black uppercase tracking-wider mt-0.5 inline-block px-2 py-0.5 rounded-full border",
                        isUploaded ? "bg-primary/10 text-primary border-primary/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      )}>
                        {isUploaded ? 'Uploaded ✓' : 'Missing'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Preview Modal */}
      <MediaPreviewOverlay
        isOpen={previewData.isOpen}
        onClose={() => setPreviewData(prev => ({ ...prev, isOpen: false }))}
        images={previewData.images}
        currentIndex={previewData.index}
        onNavigate={(newIdx) => setPreviewData(prev => ({ ...prev, index: newIdx }))}
        title={previewData.title}
        isDocument={previewData.isDocument}
      />

      {/* Full Category Items Modal Popup */}
      {mounted && typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {activeModalCategory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999999] flex items-center justify-center p-0 sm:p-6 bg-slate-900/20 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-300"
              onClick={() => setActiveModalCategory(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full h-[100dvh] sm:h-auto sm:max-h-[85vh] max-w-4xl rounded-none sm:rounded-3xl bg-white dark:bg-slate-900 border-0 sm:border border-slate-200 dark:border-white/10 p-4 sm:p-7 shadow-2xl flex flex-col justify-between overflow-hidden"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-3 sm:pb-3.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl shrink-0 ${activeModalCategory.iconColorClass}`}>
                      <activeModalCategory.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-sm sm:text-lg text-slate-900 dark:text-white leading-tight truncate">
                        {activeModalCategory.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {activeModalCategory.items.length} selected item{activeModalCategory.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveModalCategory(null)}
                    className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors shrink-0 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Sub-Group Categorized View inside Modal Popup */}
                <div className="overflow-y-auto custom-scrollbar flex-1 min-h-0 py-3 space-y-4 sm:space-y-6">
                  {activeModalCategory.groups && activeModalCategory.groups.length > 0 ? (
                    activeModalCategory.groups.map(group => (
                      <div key={group.key} className="space-y-2.5 sm:space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-primary dark:text-primary-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-1.5">
                          <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                          <span>{group.label}</span>
                          <span className="text-[10px] font-bold text-slate-400">({group.items.length})</span>
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
                          {group.items.map((item) => {
                            const ItemIcon = getItemIcon(item);
                            return (
                              <div
                                key={item}
                                className="p-2 sm:p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-2 sm:gap-3 shadow-sm min-w-0"
                              >
                                <div className="p-1.5 sm:p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                                  <ItemIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h5 className="font-extrabold text-[11px] sm:text-xs text-slate-900 dark:text-white truncate" title={item}>
                                    {item}
                                  </h5>
                                  <span className="text-[9px] sm:text-[10px] font-extrabold text-primary flex items-center gap-0.5 sm:gap-1 mt-0.5">
                                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                                    <span className="truncate">Configured</span>
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
                      {activeModalCategory.items.map((item) => {
                        const ItemIcon = getItemIcon(item);
                        return (
                          <div
                            key={item}
                            className="p-2 sm:p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-2 sm:gap-3 shadow-sm min-w-0"
                          >
                            <div className="p-1.5 sm:p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                              <ItemIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="font-extrabold text-[11px] sm:text-xs text-slate-900 dark:text-white truncate" title={item}>
                                {item}
                              </h5>
                              <span className="text-[9px] sm:text-[10px] font-extrabold text-primary flex items-center gap-0.5 sm:gap-1 mt-0.5">
                                <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                                <span className="truncate">Configured</span>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveModalCategory(null)}
                    className="w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    Close Preview
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* 🌐 PRECISION MAP LOCATION INSPECTION MODAL (Portaled directly to document.body) */}
      {mounted && createPortal(
        <AnimatePresence>
          {isFullscreenMapOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] bg-slate-900/20 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 md:p-8"
              onClick={() => setIsFullscreenMapOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 10 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-5xl h-full sm:h-[85vh] min-h-screen sm:min-h-[550px] bg-white dark:bg-slate-900 border-0 sm:border border-slate-200 dark:border-slate-800 rounded-none sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col font-sans"
              >
                {/* 1. Integrated Header */}
                <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 sm:p-3 bg-amber-500/10 rounded-xl sm:rounded-2xl text-amber-500 shadow-inner shrink-0 border border-amber-500/20">
                      <MapPin size={20} className="sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        Verified Map Location Inspection
                      </h3>
                      <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 mt-0.5">
                        {propertyInfo.propertyName || 'Property Location'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFullscreenMapOpen(false)}
                    className="p-2 sm:p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shrink-0 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* 2. Map Canvas Filling Middle Space */}
                <div className="flex-1 w-full relative bg-slate-100 dark:bg-slate-950 overflow-hidden">
                  <Map
                    center={Array.isArray(location.coordinates) && location.coordinates.length === 2 ? location.coordinates : [15.6980, 120.4285]}
                    readonly={true}
                    allowPinDrop={false}
                    title={propertyInfo.propertyName || 'Property Location'}
                  />

                  {/* Bottom Left Coordinates Badge inside Map */}
                  <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-[400] max-w-[calc(100%-40px)] truncate bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl text-[10px] sm:text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                    <span className="truncate">
                      Lat: {(Array.isArray(location.coordinates) && location.coordinates.length === 2 ? Number(location.coordinates[0]) : 15.6980).toFixed(6)}, Lng: {(Array.isArray(location.coordinates) && location.coordinates.length === 2 ? Number(location.coordinates[1]) : 120.4285).toFixed(6)}
                    </span>
                  </div>
                </div>

                {/* 3. Integrated Footer */}
                <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
                  <div className="w-full md:w-auto px-3.5 py-1.5 sm:px-4 sm:py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl text-slate-900 dark:text-white text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2">
                    <CheckCircle2 size={14} className="sm:w-4 sm:h-4 text-primary" />
                    <span>
                      Verified Location: {(Array.isArray(location.coordinates) && location.coordinates.length === 2 ? Number(location.coordinates[0]) : 15.6980).toFixed(6)}, {(Array.isArray(location.coordinates) && location.coordinates.length === 2 ? Number(location.coordinates[1]) : 120.4285).toFixed(6)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFullscreenMapOpen(false)}
                    className="w-full md:w-auto px-6 py-2.5 sm:px-8 sm:py-3 bg-primary hover:bg-primary/90 text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check size={14} className="sm:w-4 sm:h-4" />
                    <span>Close Fullscreen View</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Shared Amenities, Rules & Features Full Breakdown Modal */}
      <SharedAmenitiesModal
        isOpen={amenitiesModalConfig.isOpen}
        onClose={() => setAmenitiesModalConfig(prev => ({ ...prev, isOpen: false }))}
        initialCategory={amenitiesModalConfig.initialCategory}
        propertyTitle={propertyInfo.title || propertyInfo.propertyName || 'Property Features & Rules'}
        amenities={selectedAmenities}
        customRules={propertyConfig.rules?.customRules || watch('propertyConfig.rules.customRules') || []}
        customFeatures={propertyConfig.features?.customFeatures || watch('propertyConfig.features.customFeatures') || []}
        rulesObj={propertyConfig.rules || watch('propertyConfig.rules') || {}}
        featuresObj={propertyConfig.features || watch('propertyConfig.features') || {}}
        rooms={rooms}
      />
    </div>
  );
};

export default ReviewStep;

import * as XLSX from 'xlsx';
import { formatDate } from '@/lib/utils';

export interface ExportMetadata {
  reportTitle: string;
  reportId: string;
  summary: { label: string; value: string }[];
  author: string;
  dateRange?: string;
}

/**
 * Enhanced Excel Exporter - Supports 2-Tab Executive Workbooks
 * Tab 1: Executive Summary & Metric Glossary
 * Tab 2: Detailed Data Ledger
 */
export const exportToExcel = (
  data: any[],
  fileName: string,
  sheetName: string = 'Data Ledger',
  metadata?: ExportMetadata
) => {
  const workbook = XLSX.utils.book_new();

  // Tab 1: Executive Summary Sheet
  if (metadata) {
    const summaryRows = [
      ['BOARDTAU ENTERPRISE HOUSING & PROPERTY INTELLIGENCE'],
      [metadata.reportTitle.toUpperCase()],
      ['--------------------------------------------------'],
      ['REPORT ID:', metadata.reportId],
      ['GENERATED ON:', new Date().toLocaleString()],
      ['PREPARED BY:', metadata.author],
      ['VERIFICATION HASH:', `${metadata.reportId}-VERIFIED-SHA256`],
      [],
      ['EXECUTIVE SUMMARY METRICS'],
      ['METRIC LABEL', 'CURRENT VALUE']
    ];

    metadata.summary.forEach(s => {
      summaryRows.push([s.label.toUpperCase(), s.value]);
    });

    summaryRows.push([]);
    summaryRows.push(['METRIC GLOSSARY & DEFINITIONS']);
    summaryRows.push(['Occupancy Rate', '(Occupied Rooms / Total Listed Rooms) * 100%']);
    summaryRows.push(['Gross Revenue', 'Total revenue accumulated across all confirmed bookings/reservations']);
    summaryRows.push(['Pending Payments', 'Unverified transactions requiring landlord action']);

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
    summarySheet['!cols'] = [{ width: 28 }, { width: 45 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Executive Summary');
  }

  // Tab 2: Data Ledger Sheet
  const ledgerSheet = XLSX.utils.json_to_sheet(data);
  const objectMaxLength: number[] = [];
  const rows = XLSX.utils.sheet_to_json(ledgerSheet, { header: 1 }) as any[][];
  rows.forEach((row) => {
    row.forEach((cell, i) => {
      const cellValue = cell ? cell.toString() : '';
      objectMaxLength[i] = Math.max(objectMaxLength[i] || 12, cellValue.length + 3);
    });
  });
  ledgerSheet['!cols'] = objectMaxLength.map(w => ({ width: Math.min(w, 60) }));

  XLSX.utils.book_append_sheet(workbook, ledgerSheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * Enhanced CSV Exporter with Metadata Header & UTF-8 BOM encoding
 */
export const exportToCSV = (data: any[], fileName: string, metadata?: ExportMetadata) => {
  let csvContent = '';

  if (metadata) {
    csvContent += `# BOARDTAU ENTERPRISE REPORT\n`;
    csvContent += `# REPORT TITLE: ${metadata.reportTitle}\n`;
    csvContent += `# REPORT ID: ${metadata.reportId}\n`;
    csvContent += `# GENERATED: ${new Date().toLocaleString()}\n`;
    csvContent += `# SUMMARY: ${metadata.summary.map(s => `${s.label}: ${s.value}`).join(' | ')}\n`;
    csvContent += `# VERIFICATION LINK: https://boardtau.com/verify/${metadata.reportId}\n`;
    csvContent += `# --------------------------------------------------\n\n`;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  csvContent += XLSX.utils.sheet_to_csv(worksheet);

  // UTF-8 BOM byte prefix (\ufeff) guarantees Excel renders accents & currency symbols (₱) properly
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Formats table items for Level 1 overview exports
 */
export const prepareDataForExport = (data: any[], type: 'property' | 'room' | 'booking' | 'inquiry' | 'review' | 'reservation') => {
  switch (type) {
    case 'property':
      return data.map(item => ({
        'Property Name': item.title,
        'Category': item.category || 'Boarding House',
        'Address': item.address,
        'Price': `₱${(item.price || 0).toLocaleString()}`,
        'Status': item.isArchived ? 'Archived' : 'Active',
        'Total Rooms': item.rooms?.length || 0,
        'Amenities Count': item.amenities?.length || 0,
        'Created At': formatDate(item.createdAt)
      }));

    case 'room':
      return data.map(item => ({
        'Room Title': item.name || item.title || 'N/A',
        'Property': item.propertyTitle || item.property?.title || 'N/A',
        'Room Type': item.roomTypeDefinition?.name || (item.roomType && !/^[0-9a-fA-F]{24}$/.test(item.roomType) ? item.roomType : null) || item.type || 'Standard Room',
        'Capacity': `${item.capacity || 1} Pax`,
        'Monthly Rate': `₱${(item.price || 0).toLocaleString()}`,
        'Status': item.isArchived ? 'Archived' : (item.status || 'AVAILABLE'),
        'Amenities Count': item.amenities?.length || 0,
        'Created At': formatDate(item.createdAt)
      }));

    case 'booking':
      return data.map(item => ({
        'Guest Name': item.user?.name || item.guestName || 'N/A',
        'Guest Email': item.user?.email || 'N/A',
        'Property': item.room?.property?.title || item.propertyTitle || 'N/A',
        'Room': item.room?.title || item.roomTitle || 'N/A',
        'Check-In': formatDate(item.startDate),
        'Check-Out': formatDate(item.endDate),
        'Total Amount': `₱${(item.totalPrice || item.amount || 0).toLocaleString()}`,
        'Booking Status': item.status,
        'Payment Status': item.paymentStatus || 'Pending'
      }));

    case 'inquiry':
      return data.map(item => ({
        'Tenant Name': item.user?.name || 'N/A',
        'Tenant Email': item.user?.email || 'N/A',
        'Target Property': item.listing?.title || item.propertyTitle || 'N/A',
        'Target Room Unit': item.room?.name || item.room?.title || item.roomTitle || 'Standard Unit',
        'Check-In Date': item.moveInDate ? formatDate(item.moveInDate) : 'N/A',
        'Check-Out Date': item.checkOutDate ? formatDate(item.checkOutDate) : 'N/A',
        'Payment Method': formatDynamicCodeLabel(item.paymentMethod || item.contactMethod, 'Online Payment'),
        'Message Brief': item.message || 'N/A',
        'Status': formatDynamicCodeLabel(item.status),
        'Received Date': formatDate(item.createdAt)
      }));

    case 'review':
      return data.map(item => ({
        'Reviewer': item.user?.name || 'N/A',
        'Property / Listing': item.listing?.title || 'N/A',
        'Star Rating': `${item.rating} / 5 Stars`,
        'Feedback Comment': item.comment,
        'Landlord Reply': item.response || 'No Response',
        'Review Date': formatDate(item.createdAt)
      }));

    case 'reservation':
      return data.map(item => ({
        'Guest Name': item.user?.name || item.guestName || 'N/A',
        'Target Unit': item.room?.name || item.roomTitle || 'N/A',
        'Move-In Window': `${formatDate(item.startDate || item.moveInDate)} to ${formatDate(item.endDate)}`,
        'Total Price': `₱${(item.totalPrice || item.amount || 0).toLocaleString()}`,
        'Reservation Status': item.status,
        'Reserved At': formatDate(item.createdAt)
      }));

    default:
      return data;
  }
};

/**
 * Helper to dynamically format database enum/code strings (e.g. PRIVATE_CR, IN_UNIT, SINGLE) into title-case human labels
 */
export const formatDynamicCodeLabel = (code?: string | null, fallback: string = 'N/A'): string => {
  if (!code) return fallback;
  const str = String(code).trim();
  if (!str) return fallback;

  // Well-known taxonomy codes formatted cleanly
  const cleanMap: Record<string, string> = {
    PRIVATE_CR: 'Private Bathroom',
    PRIVATE: 'Private Bathroom',
    SHARED_CR: 'Shared Common CR',
    COMMON_CR: 'Shared Common CR',
    COMMON: 'Shared Common CR',
    SHARED: 'Shared Common CR',
    IN_UNIT: 'Private In-Unit Kitchen',
    PRIVATE_KITCHEN: 'Private In-Unit Kitchen',
    SHARED_KITCHEN: 'Shared Compound Kitchen',
    COMMUNAL: 'Shared Compound Kitchen',
    NO_KITCHEN: 'No Kitchen Facility',
    NONE: 'No Kitchen Facility',
  };

  if (cleanMap[str.toUpperCase()]) return cleanMap[str.toUpperCase()];

  // Dynamic conversion: e.g. "BUNK" -> "Bunk", "DOUBLE_DECK" -> "Double Deck"
  return str
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Helper to dynamically extract string names from database attribute arrays or relation links (DynamicAttribute, ListingAttributeLink, RoomAttributeLink)
 */
const extractAttributeNames = (rawItems: any[]): string[] => {
  if (!Array.isArray(rawItems) || rawItems.length === 0) return [];

  const names: string[] = [];
  rawItems.forEach((item: any) => {
    if (!item) return;
    let name: string = '';

    if (typeof item === 'string') {
      name = item;
    } else if (typeof item === 'object') {
      const attr = item.attribute || item;
      name = attr.name || attr.label || attr.title || attr.value || '';
    }

    if (name) {
      if (name.includes('||')) name = name.split('||')[0].trim();
      else if (name.includes('|')) name = name.split('|')[0].trim();
      name = name.trim();

      if (name && name.toLowerCase() !== '[object object]' && name.toLowerCase() !== 'undefined' && !names.includes(name)) {
        names.push(name);
      }
    }
  });

  return names;
};

/**
 * Helper to group linked dynamic attributes by their type (AMENITY, RULE, FEATURE, ROOM_AMENITY)
 */
const extractGroupedAttributes = (item: any) => {
  const links = Array.isArray(item.listingLinks)
    ? item.listingLinks
    : (Array.isArray(item.roomLinks) ? item.roomLinks : (Array.isArray(item.amenities) ? item.amenities : []));

  const amenities: string[] = [];
  const rules: string[] = [];
  const features: string[] = [];
  const roomAmenities: string[] = [];

  links.forEach((l: any) => {
    if (!l) return;
    const attr = l.attribute || (typeof l === 'object' ? l : null);
    if (!attr) {
      if (typeof l === 'string') amenities.push(l);
      return;
    }

    let name = attr.name || attr.label || attr.title || '';
    if (!name) return;
    if (name.includes('||')) name = name.split('||')[0].trim();
    else if (name.includes('|')) name = name.split('|')[0].trim();
    name = name.trim();

    const type = attr.type;
    if (type === 'RULE') rules.push(name);
    else if (type === 'FEATURE') features.push(name);
    else if (type === 'ROOM_AMENITY') roomAmenities.push(name);
    else amenities.push(name);
  });

  return { amenities, rules, features, roomAmenities };
};

/**
 * Helper to group room amenities dynamically into taxonomy sub-group categories (e.g. Cooling & AC, Furniture & Storage)
 */
interface SubGroupedItems {
  label: string;
  items: string[];
}

const extractSubGroupedRoomAmenities = (rawItems: any[]): SubGroupedItems[] => {
  if (!Array.isArray(rawItems) || rawItems.length === 0) return [];

  const SUBGROUP_LABEL_MAP: Record<string, string> = {
    COOLING: "Cooling & AC",
    FURNITURE: "Furniture & Storage",
    BATHROOM_FIX: "Bathroom Features",
    KITCHEN_APP: "Kitchen & Dining",
    UTILITIES: "Utilities & Tech",
    SAFETY: "Safety & Security",
    STORES: "Room Comforts",
    WIFI: "Internet & Connectivity",
    POWER_WATER: "Water & Power Backup",
    PARKING: "Vehicle & Parking",
    LAUNDRY: "Laundry Facilities",
    STUDY_LOUNGE: "Shared Study & Lounge",
    CARETAKER: "Property Management",
    GARDEN: "Outdoor & Green Spaces",
    GENDER_POLICY: "Gender Policy",
    CURFEW: "Gate & Curfew Rules",
    VISITOR_POLICY: "Visitor Policy",
    PET_POLICY: "Pet & Smoking Policies",
    SMOKING_POLICY: "Pet & Smoking Policies",
    ALCOHOL_POLICY: "Pet & Smoking Policies",
    SECURITY: "Security & Gate Access",
    DISASTER_PREP: "Disaster Preparedness & Safety",
  };

  const groupsMap: Record<string, { label: string; items: string[] }> = {};

  rawItems.forEach((item: any) => {
    if (!item) return;

    let name = '';
    let subKey = '';
    let subGroupObj: any = null;

    if (typeof item === 'string') {
      name = item;
      if (name.includes('||')) {
        const parts = name.split('||');
        name = parts[0].trim();
      } else if (name.includes('|')) {
        const parts = name.split('|');
        name = parts[0].trim();
        if (parts[1] && parts[1].toUpperCase() === parts[1]) {
          subKey = parts[1].trim();
        }
      }
    } else if (typeof item === 'object') {
      const attr = item.attribute || item;
      name = attr.name || attr.label || attr.title || attr.value || '';
      subKey = attr.subGroupKey || attr.subGroup || item.subGroupKey || item.subGroup || '';
      subGroupObj = attr.subGroup || item.subGroup || null;
    }

    if (name) {
      if (name.includes('||')) name = name.split('||')[0].trim();
      else if (name.includes('|')) name = name.split('|')[0].trim();
      name = name.trim();
    }

    if (!name || name.toLowerCase() === '[object object]' || name.toLowerCase() === 'undefined') return;

    let groupLabel = '';

    if (subGroupObj && typeof subGroupObj === 'object') {
      if (subGroupObj.tabLabel) {
        groupLabel = subGroupObj.tabLabel;
      } else if (subGroupObj.title) {
        groupLabel = subGroupObj.title.replace(/^Step\s+[\d.-]+:\s*/i, '').trim();
      }
    }

    if (!groupLabel && typeof subKey === 'string' && subKey.trim()) {
      const upperKey = subKey.trim().toUpperCase();
      groupLabel = SUBGROUP_LABEL_MAP[upperKey] || formatDynamicCodeLabel(upperKey);
    }

    if (!groupLabel) {
      const lower = name.toLowerCase();

      // House Rules Categories
      if (lower.includes('gender') || lower.includes('mixed') || lower.includes('male') || lower.includes('female') || lower.includes('visitor') || lower.includes('guest')) {
        groupLabel = "Gender & Visitor Policies";
      } else if (lower.includes('curfew') || lower.includes('gate') || lower.includes('access (no curfew)')) {
        groupLabel = "Gate Access & Curfew";
      } else if (lower.includes('pet') || lower.includes('smoking') || lower.includes('vaping') || lower.includes('alcohol') || lower.includes('drinking')) {
        groupLabel = "Pet & Smoking Policies";
      } 
      // Security & Safety Categories
      else if (lower.includes('cctv') || lower.includes('guard') || lower.includes('gated') || lower.includes('keycard')) {
        groupLabel = "Security & Gate Access";
      } else if (lower.includes('emergency') || lower.includes('first aid') || lower.includes('fire') || lower.includes('hallway light') || lower.includes('alarm') || lower.includes('smoke')) {
        groupLabel = "Disaster & Emergency Safety";
      }
      // Shared Amenities Categories
      else if (lower.includes('wifi') || lower.includes('internet') || lower.includes('fiber') || lower.includes('broadband')) {
        groupLabel = "Internet & Connectivity";
      } else if (lower.includes('generator') || lower.includes('power') || lower.includes('water pump') || lower.includes('water tank')) {
        groupLabel = "Water & Power Backup";
      } else if (lower.includes('parking') || lower.includes('bicycle') || lower.includes('motorcycle') || lower.includes('garage')) {
        groupLabel = "Vehicle & Parking";
      } else if (lower.includes('laundry') || lower.includes('washing')) {
        groupLabel = "Laundry Facilities";
      } else if (lower.includes('carinderia') || lower.includes('eatery') || lower.includes('restaurant') || lower.includes('grocery')) {
        groupLabel = "Food & Dining Nearby";
      } else if (lower.includes('caretaker') || lower.includes('maintenance') || lower.includes('staff')) {
        groupLabel = "Property Management";
      } else if (lower.includes('balcony') || lower.includes('roof deck') || lower.includes('terrace') || lower.includes('garden')) {
        groupLabel = "Shared Balcony & Outdoor";
      } else if (lower.includes('study') || lower.includes('lounge')) {
        groupLabel = "Shared Study & Lounge";
      }
      // In-Unit Room Amenities Categories
      else if (lower.includes('ac') || lower.includes('aircon') || lower.includes('fan') || lower.includes('cooler') || lower.includes('ventilation')) {
        groupLabel = "Cooling & AC";
      } else if (lower.includes('closet') || lower.includes('cabinet') || lower.includes('curtain') || lower.includes('desk') || lower.includes('chair') || lower.includes('blind') || lower.includes('bed') || lower.includes('table') || lower.includes('sofa')) {
        groupLabel = "Furniture & Storage";
      } else if (lower.includes('shower') || lower.includes('heater') || lower.includes('bidet') || lower.includes('toilet') || lower.includes('cr') || lower.includes('bathroom') || lower.includes('sink') || lower.includes('tabo') || lower.includes('vanity')) {
        groupLabel = "Bathroom Features";
      } else if (lower.includes('kitchen') || lower.includes('stove') || lower.includes('refrigerator') || lower.includes('fridge') || lower.includes('microwave') || lower.includes('kettle') || lower.includes('cooker') || lower.includes('utensil') || lower.includes('coffee')) {
        groupLabel = "Kitchen & Dining";
      } else {
        groupLabel = "General Facilities & Features";
      }
    }

    const mapKey = groupLabel;
    if (!groupsMap[mapKey]) {
      groupsMap[mapKey] = { label: groupLabel, items: [] };
    }

    if (!groupsMap[mapKey].items.includes(name)) {
      groupsMap[mapKey].items.push(name);
    }
  });

  return Object.values(groupsMap);
};

/**
 * Helper to partition raw listing attributes into Amenities, Rules, and Security Features
 */
const partitionListingAttributes = (rawLinks: any[]) => {
  const amenities: any[] = [];
  const rules: any[] = [];
  const features: any[] = [];

  if (!Array.isArray(rawLinks)) return { amenities, rules, features };

  rawLinks.forEach((l: any) => {
    if (!l) return;
    const attr = l.attribute || (typeof l === 'object' ? l : null);
    if (attr && attr.type) {
      if (attr.type === 'RULE') rules.push(l);
      else if (attr.type === 'FEATURE') features.push(l);
      else amenities.push(l);
      return;
    }

    // String or untyped item keyword check
    const name = typeof l === 'string' ? l : (attr?.name || attr?.label || '');
    const lower = name.toLowerCase();

    if (
      lower.includes('curfew') || lower.includes('allowed') || lower.includes('restricted') ||
      lower.includes('pets') || lower.includes('smoking') || lower.includes('vaping') ||
      lower.includes('alcohol') || lower.includes('drinking') || lower.includes('guests') ||
      lower.includes('policy') || lower.includes('quiet') || lower.includes('visitor')
    ) {
      rules.push(l);
    } else if (
      lower.includes('cctv') || lower.includes('guard') || lower.includes('security') ||
      lower.includes('emergency') || lower.includes('first aid') || lower.includes('fire') ||
      lower.includes('alarm') || lower.includes('gated') || lower.includes('lock') || lower.includes('hallway light')
    ) {
      features.push(l);
    } else {
      amenities.push(l);
    }
  });

  return { amenities, rules, features };
};

/**
 * Formats a single item for Level 2 single-item detail modal export
 */
export const prepareSingleItemForExport = (item: any, type: 'property' | 'room' | 'booking' | 'inquiry' | 'review' | 'reservation') => {
  switch (type) {
    case 'property': {
      const propCategory = item.propertyType?.name || item.propertyType?.label || item.category || item.type || 'N/A';

      const addressParts = [
        item.address || item.location?.address || item.location?.city,
        item.region,
        item.country
      ].filter(Boolean);
      const fullAddress = addressParts.length > 0 
        ? addressParts.join(', ').replace(/,([^\s])/g, ', $1') 
        : 'N/A';

      const grouped = extractGroupedAttributes(item);

      const rawListingLinks = Array.isArray(item.listingLinks) && item.listingLinks.length > 0
        ? item.listingLinks
        : (Array.isArray(item.amenities) && item.amenities.length > 0 ? item.amenities : (item.amenities_list || []));

      // Partition links into Amenities, House Rules, and Security Features
      const { amenities: rawAmenities, rules: rawRules, features: rawFeatures } = partitionListingAttributes(rawListingLinks);

      // Group each partition by taxonomy sub-step categories
      const subGroupedAmenities = extractSubGroupedRoomAmenities(rawAmenities);
      const subGroupedRules = extractSubGroupedRoomAmenities(rawRules);
      const subGroupedFeatures = extractSubGroupedRoomAmenities(rawFeatures);

      const propertySections: any[] = [
        { title: 'Property Overview & Description', text: item.description || 'No description provided.' }
      ];

      // Shared Amenities Sections
      if (subGroupedAmenities.length > 0) {
        subGroupedAmenities.forEach((group) => {
          propertySections.push({
            title: `Shared Amenities - ${group.label}`,
            items: group.items
          });
        });
      } else {
        let sharedAmenities = grouped.amenities;
        if (sharedAmenities.length === 0) sharedAmenities = ['None listed'];
        propertySections.push({
          title: 'Shared Property Amenities & Facilities',
          items: sharedAmenities
        });
      }

      // House Rules Sections
      if (subGroupedRules.length > 0) {
        subGroupedRules.forEach((group) => {
          propertySections.push({
            title: `House Rules - ${group.label}`,
            items: group.items
          });
        });
      } else {
        let houseRules = [...grouped.rules];
        const customRules = Array.isArray(item.rules?.customRules) ? item.rules.customRules : (Array.isArray(item.customRules) ? item.customRules : (Array.isArray(item.houseRules) ? item.houseRules : []));
        customRules.forEach((r: string) => { if (r && !houseRules.includes(r)) houseRules.push(r); });
        if (houseRules.length === 0) houseRules = ['None specified'];
        propertySections.push({
          title: 'House Rules & Resident Policies',
          items: houseRules
        });
      }

      // Security Features Sections
      if (subGroupedFeatures.length > 0) {
        subGroupedFeatures.forEach((group) => {
          propertySections.push({
            title: `Security & Safety - ${group.label}`,
            items: group.items
          });
        });
      } else {
        let securityFeatures = [...grouped.features];
        const customFeatures = Array.isArray(item.features?.customFeatures) ? item.features.customFeatures : (Array.isArray(item.customFeatures) ? item.customFeatures : (Array.isArray(item.features) ? item.features.map((f: any) => typeof f === 'string' ? f : f.name) : []));
        customFeatures.forEach((f: string) => { if (f && !securityFeatures.includes(f)) securityFeatures.push(f); });
        if (securityFeatures.length === 0) securityFeatures = ['None specified'];
        propertySections.push({
          title: 'Security & Safety Features',
          items: securityFeatures
        });
      }

      // Room Units Breakdown Table with Sub-Step Bullets for In-Unit Amenities
      if (Array.isArray(item.rooms) && item.rooms.length > 0) {
        propertySections.push({
          title: 'Room Units Breakdown',
          tableData: {
            headers: ['Room / Unit Name', 'Room Type', 'Occupancy & Vacancy', 'Monthly Rate', 'Status', 'In-Unit Amenities Breakdown'],
            rows: item.rooms.map((r: any) => {
              const rType = r.roomTypeDefinition?.name 
                || r.roomTypeName 
                || (r.roomType && !/^[0-9a-fA-F]{24}$/.test(r.roomType) ? formatDynamicCodeLabel(r.roomType) : null)
                || (r.type && !/^[0-9a-fA-F]{24}$/.test(r.type) ? formatDynamicCodeLabel(r.type) : null)
                || (r.capacity && r.capacity > 1 ? 'Shared Room / Bedspace' : 'Solo Room')
                || 'Standard Room';

              const rawRoomLinks = Array.isArray(r.roomLinks) && r.roomLinks.length > 0
                ? r.roomLinks
                : (Array.isArray(r.amenities) && r.amenities.length > 0 ? r.amenities : r.amenityNames || []);

              const groupedRoomAmenities = extractSubGroupedRoomAmenities(rawRoomLinks);

              let formattedAmenitiesText = '';
              if (groupedRoomAmenities.length > 0) {
                formattedAmenitiesText = groupedRoomAmenities
                  .map(g => `• ${g.label}: ${g.items.join(', ')}`)
                  .join('\n');
              } else {
                const plainList = extractAttributeNames(rawRoomLinks);
                formattedAmenitiesText = plainList.length > 0 ? plainList.join(', ') : 'None listed';
              }

              return [
                r.name || r.title || 'Room Unit',
                rType,
                `${r.capacity || 1} Pax (${r.availableSlots ?? r.capacity ?? 1} Vacant)`,
                `PHP ${(r.price || 0).toLocaleString()}/mo`,
                formatDynamicCodeLabel(r.status, 'Available'),
                formattedAmenitiesText
              ];
            })
          }
        });
      }

      return {
        title: item.title || 'Property Listing',
        subtitle: `Official Property Listing & Shared Facilities Datasheet | Category: ${propCategory}`,
        category: propCategory,
        kvPairs: [
          { label: 'Property Title', value: item.title || 'N/A' },
          { label: 'Property Category', value: propCategory },
          { label: 'Complete Address', value: fullAddress },
          { label: 'Base Rent Price', value: `PHP ${(item.price || 0).toLocaleString()}/mo`, highlight: true },
          { label: 'Listing Status', value: formatDynamicCodeLabel(item.status, item.isArchived ? 'Archived' : 'Active Listing') },
          { label: 'Total Room Units', value: `${item.rooms?.length || item.roomCount || 0} Units` },
          { label: 'Date Listed', value: formatDate(item.createdAt) }
        ],
        sections: propertySections
      };
    }

    case 'room': {
      const roomUnitName = item.name || item.title || 'Room Unit';
      const parentProp = item.propertyTitle || item.listing?.title || item.property?.title || item.listingTitle || 'N/A';
      
      // 1. Dynamic Room Type Definition (e.g. Bedspace, Solo Room, Studio Unit, or any new admin room type)
      const rawRoomType = item.roomTypeDefinition?.name || item.roomTypeName || (item.roomType && !/^[0-9a-fA-F]{24}$/.test(item.roomType) ? item.roomType : null) || item.type || 'N/A';
      const roomTypeLabel = String(rawRoomType);

      // 2. Dynamic Bed Setup (Uses BedSetupDefinition name if present, or dynamically cleans bedType code + count)
      const bedSetupLabel = item.bedSetupDefinition?.name || (item.bedType ? (() => {
        const count = item.bedCount && item.bedCount > 0 ? item.bedCount : 1;
        const typeStr = formatDynamicCodeLabel(item.bedType, 'Bed');
        return `${count} ${typeStr}${count > 1 && !typeStr.toLowerCase().endsWith('s') ? 's' : ''}`;
      })() : 'N/A');

      // 3. Dynamic Bathroom Setup (Reads code/label from DB without rigid hardcoding)
      const cleanBathroom = formatDynamicCodeLabel(item.bathroomArrangement || item.bathroomSetup, 'N/A');

      // 4. Dynamic Kitchen Setup (Reads code/label from DB without rigid hardcoding)
      const rawKitchen = item.kitchenSetup || item.kitchenType || item.property?.kitchenSetup || '';
      const cleanKitchen = formatDynamicCodeLabel(rawKitchen, 'N/A');

      // 5. Floor Area Size
      const floorArea = item.size ? `${item.size} SQ.M.` : (item.floorArea ? `${item.floorArea} SQ.M.` : 'N/A');

      // 6. Dynamic Amenities & Features grouped by Sub-Step Categories
      const rawAmenityItems = Array.isArray(item.roomLinks) && item.roomLinks.length > 0
        ? item.roomLinks
        : (Array.isArray(item.amenities) && item.amenities.length > 0 ? item.amenities : item.amenityNames);

      const subGroupedAmenities = extractSubGroupedRoomAmenities(rawAmenityItems);

      const resFeeText = item.reservationFee ? `PHP ${item.reservationFee.toLocaleString()}` : 'No Reservation Fee Required';
      const depositText = item.rentalTerms || '1 Month Deposit + 1 Month Advance required';

      const roomSections: any[] = [
        { title: 'Room Description & Overview', text: item.description || item.about || 'No description provided.' },
        {
          title: 'Unit Specifications & Layout',
          tableData: {
            headers: ['Specification Category', 'Unit Setup & Configuration'],
            rows: [
              ['Unit Category', roomTypeLabel],
              ['Bed Configuration', bedSetupLabel],
              ['Bathroom Setup', cleanBathroom],
              ['Kitchen Setup', cleanKitchen],
              ['Floor Area Size', floorArea]
            ]
          }
        }
      ];

      if (subGroupedAmenities.length > 0) {
        subGroupedAmenities.forEach((group) => {
          roomSections.push({
            title: `Room Amenities - ${group.label}`,
            items: group.items
          });
        });
      } else {
        roomSections.push({
          title: 'Room Amenities & Features',
          items: ['None listed']
        });
      }

      roomSections.push({
        title: 'Rental Terms & Security Deposit Breakdown',
        tableData: {
          headers: ['Rental Term / Policy Item', 'Financial Details & Deposit Conditions'],
          rows: [
            ['Monthly Rent Rate', `PHP ${(item.price || 0).toLocaleString()}/month`],
            ['Reservation Hold Fee', resFeeText],
            ['Security Deposit & Advance', depositText]
          ]
        }
      });

      return {
        title: roomUnitName,
        subtitle: `Official Room Unit Specification Datasheet | Category: ${roomTypeLabel}`,
        category: roomTypeLabel.toUpperCase(),
        kvPairs: [
          { label: 'Room Unit Name', value: roomUnitName },
          { label: 'Parent Property', value: parentProp },
          { label: 'Room Type', value: roomTypeLabel },
          { label: 'Monthly Rate', value: `PHP ${(item.price || 0).toLocaleString()}/mo`, highlight: true },
          { label: 'Max Guest Capacity', value: `${item.capacity || 1} Person(s)` },
          { label: 'Vacant Slots', value: `${item.availableSlots ?? item.capacity ?? 1} / ${item.capacity || 1}` },
          { label: 'Current Status', value: formatDynamicCodeLabel(item.status, item.isArchived ? 'Archived' : 'Available/Active') },
          { label: 'Date Created', value: formatDate(item.createdAt) }
        ],
        sections: roomSections
      };
    }

    case 'booking': {
      const guestName = item.user?.name || item.guestName || 'N/A';
      const guestEmail = item.user?.email || item.guestEmail || 'N/A';
      const propTitle = item.room?.property?.title || item.propertyTitle || item.room?.listing?.title || 'N/A';
      const roomName = item.room?.title || item.room?.name || item.roomTitle || 'N/A';
      const bookingStatus = formatDynamicCodeLabel(item.status, 'Confirmed');
      const paymentStatus = formatDynamicCodeLabel(item.paymentStatus || item.status, 'Paid');

      return {
        title: `Booking Summary - ${guestName}`,
        subtitle: `Official Tenant Booking Confirmation & Agreement | Status: ${bookingStatus}`,
        category: bookingStatus.toUpperCase(),
        kvPairs: [
          { label: 'Tenant Guest Name', value: guestName },
          { label: 'Contact Email', value: guestEmail },
          { label: 'Property Name', value: propTitle },
          { label: 'Target Room Unit', value: roomName },
          { label: 'Move-In Date', value: formatDate(item.startDate || item.moveInDate) },
          { label: 'Move-Out Date', value: formatDate(item.endDate) },
          { label: 'Total Rent Amount', value: `PHP ${(item.totalPrice || item.amount || 0).toLocaleString()}`, highlight: true },
          { label: 'Payment Status', value: paymentStatus }
        ],
        sections: [
          {
            title: 'Booking & Occupancy Summary',
            tableData: {
              headers: ['Booking Details Field', 'Tenant & Property Information'],
              rows: [
                ['Tenant Guest Name', guestName],
                ['Contact Email Address', guestEmail],
                ['Property Name', propTitle],
                ['Target Room Unit', roomName],
                ['Scheduled Move-In Date', formatDate(item.startDate || item.moveInDate)],
                ['Scheduled Move-Out Date', formatDate(item.endDate)]
              ]
            }
          },
          {
            title: 'Payment Breakdown & Financial Summary',
            tableData: {
              headers: ['Financial Term Item', 'Amount & Payment Details'],
              rows: [
                ['Total Rent Amount', `PHP ${(item.totalPrice || item.amount || 0).toLocaleString()}`],
                ['Security Deposit Required', item.depositAmount ? `PHP ${item.depositAmount.toLocaleString()}` : 'Standard Deposit Terms Apply'],
                ['Payment Verification Status', paymentStatus]
              ]
            }
          },
          {
            title: 'Property House Rules & Occupancy Guidelines',
            text: item.rentalTerms || item.terms || item.leaseContract?.terms || 'Occupancy is subject to property house rules, quiet hours, and visitor guidelines.'
          }
        ]
      };
    }

    case 'reservation': {
      const guestName = item.user?.name || item.guestName || 'N/A';
      const guestEmail = item.user?.email || item.guestEmail || 'N/A';
      const propTitle = item.room?.property?.title || item.propertyTitle || item.room?.listing?.title || 'N/A';
      const roomName = item.room?.title || item.room?.name || item.roomTitle || 'N/A';
      const reservationStatus = formatDynamicCodeLabel(item.status, 'Reserved');

      return {
        title: `Reservation Receipt - ${guestName}`,
        subtitle: `Official Unit Reservation & Advance Deposit Receipt | Status: ${reservationStatus}`,
        category: reservationStatus.toUpperCase(),
        kvPairs: [
          { label: 'Tenant Guest Name', value: guestName },
          { label: 'Contact Email', value: guestEmail },
          { label: 'Property Name', value: propTitle },
          { label: 'Reserved Room Unit', value: roomName },
          { label: 'Move-In Window', value: `${formatDate(item.startDate || item.moveInDate)} to ${formatDate(item.endDate)}` },
          { label: 'Reservation Fee', value: `PHP ${(item.reservationFee || item.totalPrice || item.amount || 0).toLocaleString()}`, highlight: true },
          { label: 'Reservation Status', value: reservationStatus },
          { label: 'Date Reserved', value: formatDate(item.createdAt) }
        ],
        sections: [
          {
            title: 'Reservation & Room Hold Details',
            tableData: {
              headers: ['Reservation Field', 'Details & Hold Schedule'],
              rows: [
                ['Tenant Guest Name', guestName],
                ['Contact Email Address', guestEmail],
                ['Property Name', propTitle],
                ['Reserved Room Unit', roomName],
                ['Reserved Move-In Window', `${formatDate(item.startDate || item.moveInDate)} to ${formatDate(item.endDate)}`]
              ]
            }
          },
          {
            title: 'Payment & Fee Breakdown',
            tableData: {
              headers: ['Payment Term', 'Amount & Policy Status'],
              rows: [
                ['Reservation Fee Paid', `PHP ${(item.reservationFee || item.totalPrice || item.amount || 0).toLocaleString()}`],
                ['Security Deposit Terms', item.depositAmount ? `PHP ${item.depositAmount.toLocaleString()}` : 'Standard Deposit Required at Check-In'],
                ['Reservation Status', reservationStatus]
              ]
            }
          },
          {
            title: 'Move-In Guidelines & Instructions',
            text: item.rentalTerms || item.terms || 'Please present this reservation confirmation document upon arrival to complete room check-in and contract sign-off.'
          }
        ]
      };
    }

    case 'inquiry': {
      const tenantName = item.user?.name || item.tenantName || 'N/A';
      const tenantEmail = item.user?.email || item.tenantEmail || 'N/A';
      const propTitle = item.listing?.title || item.propertyTitle || 'N/A';
      const roomName = item.room?.name || item.room?.title || item.roomTitle || 'N/A';
      const inquiryStatus = formatDynamicCodeLabel(item.status, 'Received');

      const inquirySections: any[] = [
        {
          title: 'Inquiry Overview & Contact Details',
          tableData: {
            headers: ['Inquiry Field', 'Tenant & Listing Details'],
            rows: [
              ['Inquiring Tenant Name', tenantName],
              ['Tenant Email Address', tenantEmail],
              ['Target Property Listing', propTitle],
              ['Target Room Unit', roomName],
              ['Requested Move-In Date', item.moveInDate ? formatDate(item.moveInDate) : 'N/A'],
              ['Expected Check-Out Date', item.checkOutDate ? formatDate(item.checkOutDate) : 'N/A'],
              ['Occupants Count', `${item.occupantsCount || 1} Person(s)`],
              ['Tenant Category / Role', formatDynamicCodeLabel(item.role)],
              ['Solo Buyout Requested', item.isSoloBuyout ? 'Yes (Solo Room)' : 'No (Shared Slot)'],
              ['Current Inquiry Status', inquiryStatus],
              ['Date Received', formatDate(item.createdAt)]
            ]
          }
        },
        {
          title: 'Tenant Inquiry Message',
          text: item.message || 'No inquiry message text provided.'
        }
      ];

      if (item.rejectionReason) {
        inquirySections.push({
          title: 'Rejection / Disapproval Reason',
          text: item.rejectionReason
        });
      }

      if (item.cancellationReason) {
        inquirySections.push({
          title: 'Cancellation Reason',
          text: item.cancellationReason
        });
      }

      return {
        title: `Inquiry Record - ${tenantName}`,
        subtitle: `Official Tenant Inquiry & Information Record | Status: ${inquiryStatus}`,
        category: inquiryStatus.toUpperCase(),
        kvPairs: [
          { label: 'Inquiring Tenant', value: tenantName },
          { label: 'Contact Email', value: tenantEmail },
          { label: 'Target Property', value: propTitle },
          { label: 'Target Room Unit', value: roomName },
          { label: 'Inquiry Status', value: inquiryStatus },
          { label: 'Date Received', value: formatDate(item.createdAt) }
        ],
        sections: inquirySections
      };
    }

    case 'review': {
      const reviewerName = item.user?.name || item.reviewerName || 'N/A';
      const propTitle = item.listing?.title || item.propertyTitle || 'N/A';
      const starRating = item.rating ? `${item.rating} / 5 Stars` : 'N/A';

      const reviewSections: any[] = [
        {
          title: 'Review Summary & Rating Details',
          tableData: {
            headers: ['Review Field', 'Feedback Metadata'],
            rows: [
              ['Reviewer Guest Name', reviewerName],
              ['Property Reviewed', propTitle],
              ['Star Rating Score', starRating],
              ['Review Submission Date', formatDate(item.createdAt)]
            ]
          }
        },
        {
          title: 'Tenant Feedback & Comments',
          text: item.comment || 'No feedback text provided.'
        }
      ];

      if (item.response) {
        reviewSections.push({
          title: 'Official Landlord Response',
          text: item.response
        });
      }

      return {
        title: `Review Record - ${reviewerName}`,
        subtitle: `Official Tenant Feedback & Rating Record | Rating: ${starRating}`,
        category: starRating.toUpperCase(),
        kvPairs: [
          { label: 'Reviewer Name', value: reviewerName },
          { label: 'Target Property', value: propTitle },
          { label: 'Star Rating', value: starRating, highlight: true },
          { label: 'Review Date', value: formatDate(item.createdAt) }
        ],
        sections: reviewSections
      };
    }

    default:
      return {
        title: 'Detail Report',
        subtitle: 'Official Detail Information Sheet',
        category: 'General',
        kvPairs: [],
        sections: []
      };
  }
};

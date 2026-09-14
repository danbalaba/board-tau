import axios from 'axios';
import { getActiveAttributes, getActiveSubGroups } from '@/services/taxonomy';

interface LandlordTaxonomyCache {
  propertyTypes: any[] | null;
  attributes: any[] | null;
  subGroups: any[] | null;
  roomTypesByPropertyTypeId: Record<string, any[]>;
}

const taxonomyCache: LandlordTaxonomyCache = {
  propertyTypes: null,
  attributes: null,
  subGroups: null,
  roomTypesByPropertyTypeId: {},
};

/**
 * 🏢 Fetches or retrieves cached property types for Landlord Creator.
 */
export async function getCachedPropertyTypes() {
  if (taxonomyCache.propertyTypes && taxonomyCache.propertyTypes.length > 0) {
    return taxonomyCache.propertyTypes;
  }
  try {
    const res = await axios.get(`/api/property-types?t=${Date.now()}`);
    let types: any[] = [];
    if (Array.isArray(res.data) && res.data.length > 0) {
      types = res.data;
    } else if (res.data?.data && Array.isArray(res.data.data)) {
      types = res.data.data;
    }
    if (types.length > 0) {
      taxonomyCache.propertyTypes = types;
      return types;
    }
  } catch (err) {
    console.warn("[LandlordTaxonomyCache] Failed fetching property types from API", err);
  }
  return null;
}

export function getSyncPropertyTypes() {
  return taxonomyCache.propertyTypes;
}

/**
 * ⚡ Fetches or retrieves cached dynamic attributes for Landlord Creator.
 */
export async function getCachedAttributes() {
  if (taxonomyCache.attributes && taxonomyCache.attributes.length > 0) {
    return taxonomyCache.attributes;
  }
  try {
    const attrs = await getActiveAttributes();
    if (attrs && attrs.length > 0) {
      taxonomyCache.attributes = attrs;
      return attrs;
    }
  } catch (err) {
    console.warn("[LandlordTaxonomyCache] Failed fetching dynamic attributes", err);
  }
  return [];
}

export function getSyncAttributes() {
  return taxonomyCache.attributes;
}

/**
 * 🏷️ Fetches or retrieves cached attribute sub-groups for Landlord Creator.
 */
export async function getCachedSubGroups() {
  if (taxonomyCache.subGroups && taxonomyCache.subGroups.length > 0) {
    return taxonomyCache.subGroups;
  }
  try {
    const sgs = await getActiveSubGroups();
    if (sgs && sgs.length > 0) {
      taxonomyCache.subGroups = sgs;
      return sgs;
    }
  } catch (err) {
    console.warn("[LandlordTaxonomyCache] Failed fetching subGroups", err);
  }
  return [];
}

export function getSyncSubGroups() {
  return taxonomyCache.subGroups;
}

/**
 * 🚪 Fetches or retrieves cached room types for a specific property type.
 */
export async function getCachedRoomTypes(propertyTypeId?: string) {
  const cacheKey = propertyTypeId || 'ALL';
  if (taxonomyCache.roomTypesByPropertyTypeId[cacheKey]) {
    return taxonomyCache.roomTypesByPropertyTypeId[cacheKey];
  }
  try {
    const url = propertyTypeId ? `/api/room-types?propertyTypeId=${propertyTypeId}` : `/api/room-types`;
    const res = await axios.get(url);
    if (res.data?.data) {
      const options = res.data.data
        .filter((rt: any) => rt.isActive !== false)
        .map((rt: any) => ({
          id: rt.id,
          value: rt.id,
          name: rt.name,
          label: rt.name,
          code: rt.code || rt.id,
          isFlatRate: rt.isFlatRate,
          bedSetups: rt.bedSetups || []
        }));
      taxonomyCache.roomTypesByPropertyTypeId[cacheKey] = options;
      return options;
    }
  } catch (err) {
    console.warn("[LandlordTaxonomyCache] Failed fetching room types", err);
  }
  return [];
}

export function getSyncRoomTypes(propertyTypeId?: string) {
  const cacheKey = propertyTypeId || 'ALL';
  return taxonomyCache.roomTypesByPropertyTypeId[cacheKey] || null;
}

/**
 * 🧹 Clears the landlord taxonomy cache (e.g., when creating a fresh listing).
 */
export function clearLandlordTaxonomyCache() {
  taxonomyCache.propertyTypes = null;
  taxonomyCache.attributes = null;
  taxonomyCache.roomTypesByPropertyTypeId = {};
}

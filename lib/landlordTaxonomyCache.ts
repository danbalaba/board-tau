import axios from 'axios';
import { getActiveAttributes, getActiveSubGroups } from '@/services/taxonomy';

interface LandlordTaxonomyCache {
  propertyTypes: any[] | null;
  attributes: any[] | null;
  subGroups: any[] | null;
  colleges: any[] | null;
  roomTypesByPropertyTypeId: Record<string, any[]>;
  timestamp: number;
}

const STORAGE_KEYS = {
  PROPERTY_TYPES: 'bt_cache_property_types',
  ATTRIBUTES: 'bt_cache_attributes',
  SUB_GROUPS: 'bt_cache_sub_groups',
  COLLEGES: 'bt_cache_colleges',
  ROOM_TYPES: 'bt_cache_room_types',
  TIMESTAMP: 'bt_cache_timestamp',
};

// 1 hour client cache TTL
const CACHE_TTL_MS = 60 * 60 * 1000;

function safeGetStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeSetStorage(key: string, value: any): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function safeRemoveStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {}
}

const taxonomyCache: LandlordTaxonomyCache = {
  propertyTypes: safeGetStorage<any[]>(STORAGE_KEYS.PROPERTY_TYPES),
  attributes: safeGetStorage<any[]>(STORAGE_KEYS.ATTRIBUTES),
  subGroups: safeGetStorage<any[]>(STORAGE_KEYS.SUB_GROUPS),
  colleges: safeGetStorage<any[]>(STORAGE_KEYS.COLLEGES),
  roomTypesByPropertyTypeId: safeGetStorage<Record<string, any[]>>(STORAGE_KEYS.ROOM_TYPES) || {},
  timestamp: safeGetStorage<number>(STORAGE_KEYS.TIMESTAMP) || 0,
};

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key && event.key.startsWith('bt_cache_')) {
      taxonomyCache.propertyTypes = safeGetStorage<any[]>(STORAGE_KEYS.PROPERTY_TYPES);
      taxonomyCache.attributes = safeGetStorage<any[]>(STORAGE_KEYS.ATTRIBUTES);
      taxonomyCache.subGroups = safeGetStorage<any[]>(STORAGE_KEYS.SUB_GROUPS);
      taxonomyCache.colleges = safeGetStorage<any[]>(STORAGE_KEYS.COLLEGES);
      taxonomyCache.roomTypesByPropertyTypeId = safeGetStorage<Record<string, any[]>>(STORAGE_KEYS.ROOM_TYPES) || {};
      taxonomyCache.timestamp = safeGetStorage<number>(STORAGE_KEYS.TIMESTAMP) || 0;
    }
  });
}

/**
 * 🏢 Synchronously returns cached property types (from memory or localStorage).
 */
export function getSyncPropertyTypes() {
  if (!taxonomyCache.propertyTypes) {
    taxonomyCache.propertyTypes = safeGetStorage<any[]>(STORAGE_KEYS.PROPERTY_TYPES);
  }
  return taxonomyCache.propertyTypes;
}

/**
 * ⚡ Synchronously returns cached dynamic attributes (from memory or localStorage).
 */
export function getSyncAttributes() {
  if (!taxonomyCache.attributes) {
    taxonomyCache.attributes = safeGetStorage<any[]>(STORAGE_KEYS.ATTRIBUTES);
  }
  return taxonomyCache.attributes;
}

/**
 * 🏷️ Synchronously returns cached attribute sub-groups (from memory or localStorage).
 */
export function getSyncSubGroups() {
  if (!taxonomyCache.subGroups) {
    taxonomyCache.subGroups = safeGetStorage<any[]>(STORAGE_KEYS.SUB_GROUPS);
  }
  return taxonomyCache.subGroups;
}

/**
 * 🎓 Synchronously returns cached campus colleges (from memory or localStorage).
 */
export function getSyncColleges() {
  if (!taxonomyCache.colleges) {
    taxonomyCache.colleges = safeGetStorage<any[]>(STORAGE_KEYS.COLLEGES);
  }
  return taxonomyCache.colleges;
}

/**
 * 🏢 Fetches or retrieves cached property types.
 * Instant return from cache + background revalidation if stale.
 */
export async function getCachedPropertyTypes() {
  const current = getSyncPropertyTypes();
  const isFresh = (Date.now() - taxonomyCache.timestamp) < CACHE_TTL_MS;

  if (current && current.length > 0 && isFresh) {
    return current;
  }

  if (current && current.length > 0) {
    // Revalidate in background
    axios.get(`/api/property-types?t=${Date.now()}`).then(res => {
      let types: any[] = [];
      if (Array.isArray(res.data) && res.data.length > 0) types = res.data;
      else if (res.data?.data && Array.isArray(res.data.data)) types = res.data.data;
      if (types.length > 0) {
        taxonomyCache.propertyTypes = types;
        safeSetStorage(STORAGE_KEYS.PROPERTY_TYPES, types);
      }
    }).catch(err => console.warn("[LandlordTaxonomyCache] Background revalidation failed for propertyTypes", err));

    return current;
  }

  try {
    const res = await axios.get(`/api/property-types?t=${Date.now()}`);
    let types: any[] = [];
    if (Array.isArray(res.data) && res.data.length > 0) types = res.data;
    else if (res.data?.data && Array.isArray(res.data.data)) types = res.data.data;
    if (types.length > 0) {
      taxonomyCache.propertyTypes = types;
      taxonomyCache.timestamp = Date.now();
      safeSetStorage(STORAGE_KEYS.PROPERTY_TYPES, types);
      safeSetStorage(STORAGE_KEYS.TIMESTAMP, taxonomyCache.timestamp);
      return types;
    }
  } catch (err) {
    console.warn("[LandlordTaxonomyCache] Failed fetching property types from API", err);
  }
  return current || null;
}

/**
 * ⚡ Fetches or retrieves cached dynamic attributes.
 * Instant return from cache + background revalidation if stale.
 */
export async function getCachedAttributes() {
  const current = getSyncAttributes();
  const isFresh = (Date.now() - taxonomyCache.timestamp) < CACHE_TTL_MS;

  if (current && current.length > 0 && isFresh) {
    return current;
  }

  if (current && current.length > 0) {
    // Revalidate in background
    getActiveAttributes().then(attrs => {
      if (attrs && attrs.length > 0) {
        taxonomyCache.attributes = attrs;
        safeSetStorage(STORAGE_KEYS.ATTRIBUTES, attrs);
      }
    }).catch(err => console.warn("[LandlordTaxonomyCache] Background revalidation failed for attributes", err));

    return current;
  }

  try {
    const attrs = await getActiveAttributes();
    if (attrs && attrs.length > 0) {
      taxonomyCache.attributes = attrs;
      taxonomyCache.timestamp = Date.now();
      safeSetStorage(STORAGE_KEYS.ATTRIBUTES, attrs);
      safeSetStorage(STORAGE_KEYS.TIMESTAMP, taxonomyCache.timestamp);
      return attrs;
    }
  } catch (err) {
    console.warn("[LandlordTaxonomyCache] Failed fetching dynamic attributes", err);
  }
  return current || [];
}

/**
 * 🏷️ Fetches or retrieves cached attribute sub-groups.
 * Instant return from cache + background revalidation if stale.
 */
export async function getCachedSubGroups() {
  const current = getSyncSubGroups();
  const isFresh = (Date.now() - taxonomyCache.timestamp) < CACHE_TTL_MS;

  if (current && current.length > 0 && isFresh) {
    return current;
  }

  if (current && current.length > 0) {
    // Revalidate in background
    getActiveSubGroups().then(sgs => {
      if (sgs && sgs.length > 0) {
        taxonomyCache.subGroups = sgs;
        safeSetStorage(STORAGE_KEYS.SUB_GROUPS, sgs);
      }
    }).catch(err => console.warn("[LandlordTaxonomyCache] Background revalidation failed for subGroups", err));

    return current;
  }

  try {
    const sgs = await getActiveSubGroups();
    if (sgs && sgs.length > 0) {
      taxonomyCache.subGroups = sgs;
      taxonomyCache.timestamp = Date.now();
      safeSetStorage(STORAGE_KEYS.SUB_GROUPS, sgs);
      safeSetStorage(STORAGE_KEYS.TIMESTAMP, taxonomyCache.timestamp);
      return sgs;
    }
  } catch (err) {
    console.warn("[LandlordTaxonomyCache] Failed fetching subGroups", err);
  }
  return current || [];
}

/**
 * 🎓 Fetches or retrieves cached campus colleges.
 * Instant return from cache + background revalidation if stale.
 */
export async function getCachedColleges() {
  const current = getSyncColleges();
  const isFresh = (Date.now() - taxonomyCache.timestamp) < CACHE_TTL_MS;

  if (current && current.length > 0 && isFresh) {
    return current;
  }

  if (current && current.length > 0) {
    axios.get('/api/colleges').then(res => {
      if (Array.isArray(res.data) && res.data.length > 0) {
        taxonomyCache.colleges = res.data;
        safeSetStorage(STORAGE_KEYS.COLLEGES, res.data);
      }
    }).catch(err => console.warn("[LandlordTaxonomyCache] Background revalidation failed for colleges", err));

    return current;
  }

  try {
    const res = await axios.get('/api/colleges');
    if (Array.isArray(res.data) && res.data.length > 0) {
      taxonomyCache.colleges = res.data;
      taxonomyCache.timestamp = Date.now();
      safeSetStorage(STORAGE_KEYS.COLLEGES, res.data);
      safeSetStorage(STORAGE_KEYS.TIMESTAMP, taxonomyCache.timestamp);
      return res.data;
    }
  } catch (err) {
    console.warn("[LandlordTaxonomyCache] Failed fetching colleges from API", err);
  }
  return current || [];
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
          icon: rt.icon || null,
          isFlatRate: rt.isFlatRate,
          bedSetups: rt.bedSetups || []
        }));
      taxonomyCache.roomTypesByPropertyTypeId[cacheKey] = options;
      safeSetStorage(STORAGE_KEYS.ROOM_TYPES, taxonomyCache.roomTypesByPropertyTypeId);
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
 * 🧹 Clears the landlord taxonomy cache (e.g., when updating admin settings).
 */
export function clearLandlordTaxonomyCache() {
  taxonomyCache.propertyTypes = null;
  taxonomyCache.attributes = null;
  taxonomyCache.subGroups = null;
  taxonomyCache.colleges = null;
  taxonomyCache.roomTypesByPropertyTypeId = {};
  taxonomyCache.timestamp = 0;

  safeRemoveStorage(STORAGE_KEYS.PROPERTY_TYPES);
  safeRemoveStorage(STORAGE_KEYS.ATTRIBUTES);
  safeRemoveStorage(STORAGE_KEYS.SUB_GROUPS);
  safeRemoveStorage(STORAGE_KEYS.COLLEGES);
  safeRemoveStorage(STORAGE_KEYS.ROOM_TYPES);
  safeRemoveStorage(STORAGE_KEYS.TIMESTAMP);
}

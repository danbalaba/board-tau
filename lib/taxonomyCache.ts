import axios from "axios";

interface TaxonomyCacheEntry {
  attributes: any[];
  subGroups: any[];
  timestamp: number;
}

const STORAGE_PREFIX = "bt_search_tax_cache_";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour client TTL

function safeGetStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeSetStorage(key: string, value: any): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { }
}

function safeRemoveStorage(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch { }
}

const memoryCache: Record<string, TaxonomyCacheEntry> = {};

export function notifySearchTaxonomyUpdated(detail?: any) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("search_taxonomy_updated", { detail }));
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key && event.key.startsWith(STORAGE_PREFIX)) {
      const type = event.key.replace(STORAGE_PREFIX, "");
      const stored = safeGetStorage<TaxonomyCacheEntry>(event.key);
      if (stored) {
        memoryCache[type] = stored;
      } else {
        delete memoryCache[type];
      }
      notifySearchTaxonomyUpdated({ storageEvent: true, key: event.key, type });
    }
  });
}

/**
 * ⚡ Fetches user-side search taxonomy data (Amenities, Rules, Features) with instant local cache + background revalidation.
 */
export async function fetchTaxonomyData(type: string, forceFresh = false): Promise<TaxonomyCacheEntry> {
  const now = Date.now();
  const syncData = getTaxonomyDataSync(type);

  const revalidate = async () => {
    try {
      const [attrRes, sgRes] = await Promise.all([
        axios.get(`/api/admin/attributes?type=${type}&t=${Date.now()}`),
        axios.get(`/api/admin/sub-groups?type=${type}&t=${Date.now()}`),
      ]);

      const freshAttrs = attrRes.data?.data || [];
      const freshSubGroups = sgRes.data?.data || [];
      const entry: TaxonomyCacheEntry = {
        attributes: freshAttrs,
        subGroups: freshSubGroups,
        timestamp: Date.now(),
      };

      const prevEntry = memoryCache[type] || safeGetStorage<TaxonomyCacheEntry>(STORAGE_PREFIX + type);
      const hasChanged =
        !prevEntry ||
        JSON.stringify(prevEntry.attributes) !== JSON.stringify(freshAttrs) ||
        JSON.stringify(prevEntry.subGroups) !== JSON.stringify(freshSubGroups);

      memoryCache[type] = entry;
      safeSetStorage(STORAGE_PREFIX + type, entry);

      if (hasChanged) {
        notifySearchTaxonomyUpdated({ type, entry });
      }

      return entry;
    } catch (err) {
      console.warn(`[TaxonomyCache] Background revalidation failed for ${type}`, err);
    }
    return null;
  };

  if (forceFresh) {
    const fresh = await revalidate();
    if (fresh) return fresh;
  } else {
    // Initiate background revalidation so admin edits update tenant UI immediately
    revalidate();
  }

  if (syncData) {
    return syncData;
  }

  const fresh = await revalidate();
  return fresh || { attributes: [], subGroups: [], timestamp: now };
}

/**
 * ⚡ Synchronously gets cached user-side taxonomy data from memory or localStorage.
 */
export function getTaxonomyDataSync(type: string): TaxonomyCacheEntry | null {
  if (memoryCache[type]) {
    return memoryCache[type];
  }
  const stored = safeGetStorage<TaxonomyCacheEntry>(STORAGE_PREFIX + type);
  if (stored) {
    memoryCache[type] = stored;
    return stored;
  }
  return null;
}

/**
 * 🧹 Clears the user-side search taxonomy cache.
 */
export function clearTaxonomyCache() {
  Object.keys(memoryCache).forEach((k) => delete memoryCache[k]);
  if (typeof window !== "undefined") {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(STORAGE_PREFIX))
        .forEach((k) => safeRemoveStorage(k));
    } catch { }
  }
  notifySearchTaxonomyUpdated({ cleared: true });
}


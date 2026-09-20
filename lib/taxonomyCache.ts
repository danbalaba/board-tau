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
  } catch {}
}

function safeRemoveStorage(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {}
}

const memoryCache: Record<string, TaxonomyCacheEntry> = {};

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key && event.key.startsWith(STORAGE_PREFIX)) {
      const type = event.key.replace(STORAGE_PREFIX, '');
      const stored = safeGetStorage<TaxonomyCacheEntry>(event.key);
      if (stored) {
        memoryCache[type] = stored;
      } else {
        delete memoryCache[type];
      }
    }
  });
}

/**
 * ⚡ Fetches user-side search taxonomy data (Amenities, Rules, Features) with instant local cache.
 */
export async function fetchTaxonomyData(type: string, forceFresh = false) {
  const now = Date.now();
  const syncData = getTaxonomyDataSync(type);

  if (!forceFresh && syncData && now - syncData.timestamp < CACHE_TTL_MS) {
    return syncData;
  }

  if (syncData && !forceFresh) {
    // Revalidate in background if cache is old
    Promise.all([
      axios.get(`/api/admin/attributes?type=${type}&t=${now}`),
      axios.get(`/api/admin/sub-groups?type=${type}&t=${now}`),
    ]).then(([attrRes, sgRes]) => {
      const entry: TaxonomyCacheEntry = {
        attributes: attrRes.data?.data || [],
        subGroups: sgRes.data?.data || [],
        timestamp: now,
      };
      memoryCache[type] = entry;
      safeSetStorage(STORAGE_PREFIX + type, entry);
    }).catch(err => console.warn(`[TaxonomyCache] Background revalidation failed for ${type}`, err));

    return syncData;
  }

  try {
    const [attrRes, sgRes] = await Promise.all([
      axios.get(`/api/admin/attributes?type=${type}&t=${now}`),
      axios.get(`/api/admin/sub-groups?type=${type}&t=${now}`),
    ]);

    const entry: TaxonomyCacheEntry = {
      attributes: attrRes.data?.data || [],
      subGroups: sgRes.data?.data || [],
      timestamp: now,
    };

    memoryCache[type] = entry;
    safeSetStorage(STORAGE_PREFIX + type, entry);
    return entry;
  } catch (err) {
    console.warn(`[TaxonomyCache] Failed fetching taxonomy for ${type}`, err);
  }
  return syncData || { attributes: [], subGroups: [], timestamp: now };
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
    } catch {}
  }
}

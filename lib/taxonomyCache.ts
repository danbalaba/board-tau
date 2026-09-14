import axios from "axios";

interface TaxonomyCacheEntry {
  attributes: any[];
  subGroups: any[];
  timestamp: number;
}

const cache: Record<string, TaxonomyCacheEntry> = {};

export async function fetchTaxonomyData(type: string, forceFresh = false) {
  const now = Date.now();
  // Cache entries remain fresh for 5 minutes (300,000ms)
  if (!forceFresh && cache[type] && now - cache[type].timestamp < 300000) {
    return cache[type];
  }

  const [attrRes, sgRes] = await Promise.all([
    axios.get(`/api/admin/attributes?type=${type}&t=${now}`),
    axios.get(`/api/admin/sub-groups?type=${type}&t=${now}`),
  ]);

  const entry: TaxonomyCacheEntry = {
    attributes: attrRes.data?.data || [],
    subGroups: sgRes.data?.data || [],
    timestamp: now,
  };

  cache[type] = entry;
  return entry;
}

export function getTaxonomyDataSync(type: string) {
  const now = Date.now();
  if (cache[type] && now - cache[type].timestamp < 300000) {
    return cache[type];
  }
  return null;
}

export function clearTaxonomyCache() {
  Object.keys(cache).forEach((k) => delete cache[k]);
}

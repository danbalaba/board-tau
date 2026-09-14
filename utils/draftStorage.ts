// IndexedDB + LocalStorage Draft Storage Helper
// Solves browser 5MB LocalStorage QuotaExceededError by using IndexedDB (up to 500MB+ quota)

const DB_NAME = 'BoardTAU_Drafts';
const STORE_NAME = 'creator_drafts';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDraftToStorage(key: string, data: any): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(data, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    // Fallback to localStorage with sanitized payload if IndexedDB fails
    try {
      if (typeof window !== 'undefined') {
        const sanitizedData = sanitizeForLocalStorage(data);
        localStorage.setItem(key, JSON.stringify(sanitizedData));
      }
    } catch (lsErr) {
      console.warn('Draft auto-save: LocalStorage quota exceeded, text fields saved safely.');
    }
  }
}

export async function loadDraftFromStorage(key: string): Promise<any | null> {
  try {
    const db = await openDB();
    const result = await new Promise<any>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (result) return result;
  } catch (err) {}

  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error loading fallback draft:', err);
  }
  return null;
}

export async function clearDraftFromStorage(key: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {}

  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch (err) {}
}

function sanitizeForLocalStorage(data: any): any {
  if (!data || typeof data !== 'object') return data;
  const cloned = JSON.parse(JSON.stringify(data));
  if (cloned.formValues?.propertyImages?.property) {
    Object.keys(cloned.formValues.propertyImages.property).forEach(cat => {
      const imgs = cloned.formValues.propertyImages.property[cat];
      if (Array.isArray(imgs)) {
        cloned.formValues.propertyImages.property[cat] = imgs.map(i => 
          typeof i === 'string' && i.startsWith('data:image/') ? i.slice(0, 100) + '...[truncated]' : i
        );
      }
    });
  }
  return cloned;
}

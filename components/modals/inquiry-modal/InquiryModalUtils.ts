
/**
 * Only allow blob URLs generated from validated File objects as image sources.
 * Prevents DOM text reinterpretation and XSS via src attribute injection.
 */
export const getSafeImageSrc = (file: File | null): string => {
  if (!file || !(file instanceof File)) return '';
  
  const safeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
  if (!safeTypes.includes(file.type)) return '';

  try {
    const rawUrl = URL.createObjectURL(file as any);
    const safeUrl = rawUrl.split('').filter(c => /^[-a-zA-Z0-9:/_. ]$/.test(c)).join('');
    
    if (safeUrl.startsWith('blob:') && safeUrl.length < 2048 && safeUrl === rawUrl) {
      return safeUrl;
    }
  } catch (error) {
    return '';
  }
  
  return '';
};

/**
 * Validates and sanitizes image sources from URI strings using a strict whitelist.
 */
export const getSafeImageSrcString = (image: string | null | undefined): string => {
  if (!image || typeof image !== 'string' || image.length > 2048) return '';
  
  const lower = image.toLowerCase();
  const isSafeProtocol = lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('blob:');
  const isRelative = image.startsWith('/');

  if (isSafeProtocol || isRelative) {
    const safeUrl = image.split('').filter(c => /^[-a-zA-Z0-9:/_. ?#&%=]$/.test(c)).join('');
    if (safeUrl === image) {
      return safeUrl;
    }
  }
  
  return '';
};

/**
 * Helper to convert base64 to File for EdgeStore
 */
export const base64ToFile = (base64: string, filename: string) => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

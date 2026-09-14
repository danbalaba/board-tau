/**
 * Security & Input Validation Utilities for Host Onboarding & Form Inputs
 */

// 1. Anti-XSS & Anti-SQL Injection Regex Patterns
const XSS_PATTERN = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|javascript:|onerror\s*=|onload\s*=|eval\s*\(|<iframe|<object|<embed|<link|<meta|style\s*=|data:/i;
const SQL_INJECTION_PATTERN = /(\b(SELECT\s+[\s\S]*?\s+FROM|INSERT\s+INTO|UPDATE\s+[\s\S]*?\s+SET|DELETE\s+FROM|DROP\s+(TABLE|DATABASE)|UNION\s+SELECT|ALTER\s+TABLE|TRUNCATE\s+TABLE|EXEC\s*\()\b)|(--\s|;\s*DROP|;\s*SELECT|'\s*OR\s*['"\d]|=\s*['"\d]|\/\*|\*\/)/i;
const HTML_TAG_PATTERN = /<[^>]*>/g;

/**
 * Step Synchronization Helpers for Host Onboarding (Desktop vs Mobile)
 */
export const getMobileStepForDesktopStep = (desktopStep: number): number => {
  switch (desktopStep) {
    case 1: return 1;
    case 2: return 6;
    case 3: return 9;
    case 4: return 11;
    case 5: return 13;
    case 6: return 14;
    case 7: return 15;
    case 8: return 17;
    default: return 1;
  }
};

export const getDesktopStepForMobileStep = (mStep: number): number => {
  if (mStep >= 1 && mStep <= 5) return 1;
  if (mStep >= 6 && mStep <= 8) return 2;
  if (mStep >= 9 && mStep <= 10) return 3;
  if (mStep >= 11 && mStep <= 12) return 4;
  if (mStep === 13) return 5;
  if (mStep === 14) return 6;
  if (mStep === 15) return 7;
  if (mStep >= 16) return 8;
  return 1;
};

/**
 * Checks string for malicious injection attempts (XSS or SQLi).
 * Returns true if clean, or an error string if malicious payload detected.
 */
export const checkForMaliciousInput = (value: string): true | string => {
  if (!value) return true;

  if (XSS_PATTERN.test(value) || HTML_TAG_PATTERN.test(value)) {
    return "Malicious HTML tag or script pattern detected.";
  }

  if (SQL_INJECTION_PATTERN.test(value)) {
    return "Invalid syntax or database query pattern detected.";
  }

  return true;
};

/**
 * Checks for repetitive character spam (e.g. "kkkkkk", "aaaaaa", "asdfghjkl")
 */
export const checkForSpamPattern = (value: string): true | string => {
  if (!value) return true;

  const trimmed = value.trim();

  // 1. Check if same character repeated 4 or more times consecutively (e.g. "kkkk", "aaaa")
  if (/(.)\1{3,}/i.test(trimmed)) {
    return "Please enter a valid input (repetitive character pattern detected).";
  }

  // 2. Check for keyboard mashing patterns like "asdfghjkl" or "qwertyuiop"
  const mashingPatterns = ["asdfghjkl", "qwertyuiop", "zxcvbnm", "1234567890"];
  const lower = trimmed.toLowerCase();
  for (const pattern of mashingPatterns) {
    if (lower.includes(pattern)) {
      return "Please enter a real name instead of keyboard mashing.";
    }
  }

  return true;
};

/**
 * Production-grade Full Name Validator
 * Rules:
 * - Must be at least 3 characters long
 * - Max 100 characters
 * - No numbers (0-9) or special code symbols
 * - Must allow letters, spaces, hyphens (-), apostrophes ('), and dots (.)
 * - Anti-XSS / SQLi protection
 * - Anti-Spam protection
 */
export const validateFullName = (value: string): true | string => {
  if (!value || !value.trim()) {
    return "Full name is required.";
  }

  const trimmed = value.trim();

  if (trimmed.length < 3) {
    return "Full name must be at least 3 characters long (e.g., Juan Dela Cruz).";
  }

  if (trimmed.length > 100) {
    return "Full name cannot exceed 100 characters.";
  }

  // Security check (Anti-XSS & Anti-SQLi)
  const secCheck = checkForMaliciousInput(trimmed);
  if (secCheck !== true) return secCheck;

  // Spam check
  const spamCheck = checkForSpamPattern(trimmed);
  if (spamCheck !== true) return spamCheck;

  // Character set check: Letters (including Unicode / Filipino ñ/Ñ), spaces, hyphens, apostrophes, dots
  const validNameRegex = /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFFñÑ\s\.'\-]+$/;
  if (!validNameRegex.test(trimmed)) {
    return "Full name can only contain letters, spaces, hyphens, and apostrophes (no numbers or special symbols).";
  }

  // Ensure at least one letter token exists
  if (!/[a-zA-ZñÑ]/.test(trimmed)) {
    return "Full name must contain letters.";
  }

  return true;
};

/**
 * Production-grade Phone Number Validator
 */
export const validatePhoneNumber = (value: string): true | string => {
  if (!value || !value.trim()) {
    return "Phone number is required.";
  }

  const trimmed = value.trim();

  const secCheck = checkForMaliciousInput(trimmed);
  if (secCheck !== true) return secCheck;

  // PH Phone format check: 09XXXXXXXXX or +639XXXXXXXXX or 11 digits
  const cleanNum = trimmed.replace(/[\s\-\(\)]/g, "");
  const phPhoneRegex = /^(09|\+639)\d{9}$/;

  if (!phPhoneRegex.test(cleanNum)) {
    return "Please enter a valid Philippine mobile number (e.g., 09123456789 or +639123456789).";
  }

  return true;
};

/**
 * Production-grade Email Validator
 */
export const validateEmail = (value: string): true | string => {
  if (!value || !value.trim()) {
    return "Email address is required.";
  }

  const trimmed = value.trim();

  const secCheck = checkForMaliciousInput(trimmed);
  if (secCheck !== true) return secCheck;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return "Please enter a valid email address (e.g., name@example.com).";
  }

  return true;
};

/**
 * Production-grade Business / Establishment Name Validator
 */
export const validateBusinessName = (value: string): true | string => {
  if (!value || !value.trim()) {
    return "Establishment name is required.";
  }

  const trimmed = value.trim();

  if (trimmed.length < 3) {
    return "Establishment name must be at least 3 characters long.";
  }

  if (trimmed.length > 120) {
    return "Establishment name cannot exceed 120 characters.";
  }

  const secCheck = checkForMaliciousInput(trimmed);
  if (secCheck !== true) return secCheck;

  const spamCheck = checkForSpamPattern(trimmed);
  if (spamCheck !== true) return spamCheck;

  return true;
};

/**
 * Formats disorganized text strings into Proper Capitalization (Title Case)
 * and collapses extra spaces.
 * Example: "   john   roldan   Simon  " -> "John Roldan Simon"
 * Example: "de-la-cruz" -> "De-La-Cruz"
 */
export const formatTitleCase = (value: string): string => {
  if (!value) return '';
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (!word) return '';
      return word
        .split('-')
        .map(subWord => subWord.charAt(0).toUpperCase() + subWord.slice(1))
        .join('-');
    })
    .join(' ');
};

/**
 * Organizes and sanitizes all form data fields before saving/submitting application
 */
export const sanitizeHostFormData = (data: any): any => {
  if (!data) return data;
  const sanitized = JSON.parse(JSON.stringify(data));

  if (sanitized.contactInfo) {
    if (sanitized.contactInfo.fullName) {
      sanitized.contactInfo.fullName = formatTitleCase(sanitized.contactInfo.fullName);
    }
    if (sanitized.contactInfo.email) {
      sanitized.contactInfo.email = sanitized.contactInfo.email.trim().toLowerCase();
    }
    if (sanitized.contactInfo.phoneNumber) {
      sanitized.contactInfo.phoneNumber = sanitized.contactInfo.phoneNumber.trim();
    }
  }

  if (sanitized.businessInfo) {
    if (sanitized.businessInfo.businessName) {
      sanitized.businessInfo.businessName = formatTitleCase(sanitized.businessInfo.businessName);
    }
  }

  if (sanitized.propertyEvidence) {
    if (sanitized.propertyEvidence.address) {
      sanitized.propertyEvidence.address = formatTitleCase(sanitized.propertyEvidence.address);
    }
  }

  return sanitized;
};

/**
 * Utility function to validate file uploads (Type, Size in MB, and Quantity)
 */
export const validateImageUpload = (
  file: File,
  options?: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  }
): true | string => {
  const maxSizeMB = options?.maxSizeMB || 5;
  const allowedTypes = options?.allowedTypes || ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];

  // 1. File Size Validation
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    return `File size is too large (${sizeInMB} MB). Maximum allowed size is ${maxSizeMB} MB.`;
  }

  // 2. File Type Validation
  const fileType = file.type.toLowerCase();
  const fileExt = file.name.split('.').pop()?.toLowerCase() || '';

  const isAllowedType = allowedTypes.some(type => {
    if (type.startsWith('.')) {
      return `.${fileExt}` === type.toLowerCase();
    }
    if (type === 'image/*') {
      return fileType.startsWith('image/');
    }
    return fileType === type.toLowerCase();
  });

  if (!isAllowedType) {
    return `Invalid file format (${fileExt.toUpperCase() || 'FILE'}). Allowed formats: JPG, PNG, WEBP, PDF.`;
  }

  return true;
};

/**
 * Converts a base64 string (from webcam screenshot) into a File object 
 * for secure EdgeStore uploads.
 */
export const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) throw new Error("Invalid base64 string");
  
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
};

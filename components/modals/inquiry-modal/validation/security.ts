/**
 * Security validation for Inquiry Modal to prevent malicious payloads
 */

/**
 * Sanitizes strings by removing HTML tags and other common XSS/Injection patterns.
 * Similar to landlord creator validation.
 */
export const sanitizeSecurityString = (str: string): string => {
  if (!str) return '';
  
  // Basic cleaning: escape HTML characters to prevent XSS and HTML injection
  const clean = str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
  
  // Prevent common SQL injection keywords if they appear as standalone words
  const sqlKeywords = /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|OR|AND|EXEC)\b/gi;
  const sanitized = clean.replace(sqlKeywords, '');
  
  return sanitized.slice(0, 500); // Limit to 500 chars for inquiry safety
};

/**
 * Validates if a string contains ONLY alphanumeric characters, hyphens, and underscores.
 * Used for sensitive ID fields or specific contact formats.
 */
export const validateStrictChars = (str: string): boolean => {
  if (!str) return true;
  // Allows only numbers, hyphens (-), and underscores (_)
  const regex = /^[0-9\-_]+$/;
  return regex.test(str);
};

/**
 * Validates if a string is clean of XSS/malicious patterns
 */
export const isCleanString = (str: string): boolean => {
  if (!str) return true;
  // Check for suspicious characters like < > { } [ ] \ / 
  const suspiciousChars = /[<>{}[\]\\/]/;
  return !suspiciousChars.test(str);
};

/**
 * Validates a phone number format (supports local PH and International)
 */
export const validatePhoneNumber = (str: string): boolean => {
  if (!str) return false;
  
  // Remove common formatting characters for validation
  const clean = str.replace(/[\s\-()]/g, '');
  
  // 1. PH Mobile: 09XXXXXXXXX (11 digits) or +639XXXXXXXXX (13 chars)
  const phRegex = /^(09|\+639)\d{9}$/;
  
  // 2. Global: +[CountryCode][Number] (Min 10 digits total)
  const globalRegex = /^\+?[1-9]\d{9,14}$/;
  
  return phRegex.test(clean) || globalRegex.test(clean);
};

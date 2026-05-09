/**
 * Security validation for Inquiry Modal to prevent malicious payloads
 */

/**
 * Sanitizes strings by removing HTML tags and other common XSS/Injection patterns.
 * Similar to landlord creator validation.
 */
export const sanitizeSecurityString = (str: string): string => {
  if (!str) return '';
  
  // Basic cleaning: remove HTML tags and trim
  const clean = str.replace(/<[^>]*>?/gm, '').trim();
  
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

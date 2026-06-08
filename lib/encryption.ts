import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

// To ensure the app doesn't crash during development if the key is missing, we provide a fallback.
// IMPORTANT: In production, you MUST set MESSAGE_ENCRYPTION_KEY in your .env file to a secure 32-byte hex string.
const ENCRYPTION_KEY = process.env.MESSAGE_ENCRYPTION_KEY 
  ? Buffer.from(process.env.MESSAGE_ENCRYPTION_KEY, 'hex') 
  : crypto.scryptSync('development-fallback-secret-do-not-use-in-prod', 'salt', 32);

export function encryptMessage(text: string): string {
  if (!text) return text;
  
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Format: iv:tag:encryptedText
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error("Encryption failed:", error);
    return text; // Fallback to plaintext if encryption fails
  }
}

export function decryptMessage(encryptedText: string): string {
  // If it doesn't have the exact format iv:tag:encryptedText, it's a legacy plaintext message
  if (!encryptedText || !encryptedText.includes(':')) {
    return encryptedText; 
  }

  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return encryptedText;

    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    // If decryption fails (wrong key, tampered data), return a placeholder message
    return "🔒 This message could not be decrypted.";
  }
}

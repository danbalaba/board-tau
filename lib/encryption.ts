import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

// 1. Database Message Encryption Key (Server-Only)
function getEncryptionKey(): Buffer {
  const hex = process.env.MESSAGE_ENCRYPTION_KEY;
  if (hex && hex.length === 64) {
    return Buffer.from(hex, 'hex');
  }
  const secret = hex || process.env.NEXTAUTH_SECRET || 'boardtau-db-message-secret';
  return crypto.createHash('sha256').update(secret).digest();
}

// 2. URL Chat Token Encryption Key (Client & Server)
function getChatTokenKey(): Buffer {
  const secret = process.env.NEXT_PUBLIC_CHAT_TOKEN_SECRET 
    || process.env.MESSAGE_ENCRYPTION_KEY 
    || process.env.NEXTAUTH_SECRET 
    || 'boardtau-chat-url-token-secret';
  return crypto.createHash('sha256').update(secret).digest();
}

export function encryptMessage(text: string): string {
  if (!text) return text;
  
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
    
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

  const parts = encryptedText.split(':');
  if (parts.length !== 3) return encryptedText;

  try {
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    // Build key candidates (Current .env key, SHA-256 key, PREVIOUS_MESSAGE_ENCRYPTION_KEYS, legacy scryptSync key)
    const candidates: Buffer[] = [
      getEncryptionKey(),
      crypto.createHash('sha256').update(process.env.MESSAGE_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || 'boardtau-db-message-secret').digest(),
      crypto.createHash('sha256').update('development-fallback-secret-do-not-use-in-prod').digest(),
      crypto.scryptSync('development-fallback-secret-do-not-use-in-prod', 'salt', 32),
    ];

    // Add any configured previous rotated keys from .env
    const prevKeysRaw = process.env.PREVIOUS_MESSAGE_ENCRYPTION_KEYS;
    if (prevKeysRaw) {
      prevKeysRaw.split(',').forEach((k) => {
        const trimmed = k.trim();
        if (trimmed) {
          if (trimmed.length === 64) {
            candidates.push(Buffer.from(trimmed, 'hex'));
          }
          candidates.push(crypto.createHash('sha256').update(trimmed).digest());
        }
      });
    }

    for (const key of candidates) {
      try {
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
      } catch {
        // Try next key candidate silently
      }
    }

    return "🔒 This message was encrypted with a previous key.";
  } catch (error) {
    return "🔒 This message could not be decrypted.";
  }
}

export function encryptChatToken(listingId: string, otherUserId: string): string {
  if (!listingId || !otherUserId) return '';
  try {
    const payload = JSON.stringify({ listingId, otherUserId });
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getChatTokenKey(), iv);
    
    let encrypted = cipher.update(payload, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();

    const raw = `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
    const base64 = Buffer.from(raw, 'utf8').toString('base64');
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (error) {
    console.error("Failed to encrypt chat token:", error);
    return '';
  }
}

export function decryptChatToken(token: string): { listingId: string; otherUserId: string } | null {
  if (!token) return null;
  try {
    let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const raw = Buffer.from(base64, 'base64').toString('utf8');
    const parts = raw.split(':');
    if (parts.length !== 3) return null;

    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, getChatTokenKey(), iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Failed to decrypt chat token:", error);
    return null;
  }
}

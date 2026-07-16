import { encryptMessage, decryptMessage } from '../encryption';

describe('encryption', () => {
  it('encrypts and decrypts a message correctly', () => {
    const original = 'Hello World';
    const encrypted = encryptMessage(original);
    
    // Ensure it's actually encrypted and formatted correctly
    expect(encrypted).not.toBe(original);
    expect(encrypted.split(':').length).toBe(3);

    const decrypted = decryptMessage(encrypted);
    expect(decrypted).toBe(original);
  });

  it('returns plaintext for empty strings', () => {
    expect(encryptMessage('')).toBe('');
    expect(decryptMessage('')).toBe('');
  });

  it('returns original text if decrypting a non-encrypted string', () => {
    expect(decryptMessage('plaintext message')).toBe('plaintext message');
  });

  it('returns placeholder if decryption fails due to invalid format', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(decryptMessage('invalid:format:string')).toBe('🔒 This message could not be decrypted.');
    consoleSpy.mockRestore();
  });
});

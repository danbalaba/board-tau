import { createRestrictionToken, verifyRestrictionToken } from '../security-tokens';

describe('security-tokens utility', () => {
  it('encrypts email and reason into a secure token and decrypts successfully', () => {
    const email = 'williamguy6767@gmail.com';
    const token = createRestrictionToken(email, 'suspended');

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.includes(email)).toBe(false); // Email should NOT be visible in plaintext

    const verified = verifyRestrictionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.email).toBe(email);
    expect(verified?.reason).toBe('suspended');
  });

  it('returns null for tampered token strings', () => {
    const token = createRestrictionToken('user@test.com', 'banned');
    const tampered = token.substring(0, token.length - 4) + 'abcd';

    const verified = verifyRestrictionToken(tampered);
    expect(verified).toBeNull();
  });

  it('returns null for null, empty, or undefined tokens', () => {
    expect(verifyRestrictionToken(null)).toBeNull();
    expect(verifyRestrictionToken(undefined)).toBeNull();
    expect(verifyRestrictionToken('')).toBeNull();
    expect(verifyRestrictionToken('invalid-garbage-token')).toBeNull();
  });

  it('returns null for expired tokens', () => {
    jest.useFakeTimers();
    const token = createRestrictionToken('expired@test.com', 'suspended');

    // Fast-forward 25 hours (TTL is 24 hours)
    jest.advanceTimersByTime(25 * 60 * 60 * 1000);

    const verified = verifyRestrictionToken(token);
    expect(verified).toBeNull();

    jest.useRealTimers();
  });
});

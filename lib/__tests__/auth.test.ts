import { authOptions } from '../auth';
import { db } from '../db';
import bcrypt from 'bcryptjs';
import { triggerLoginSecurityAlert } from '@/services/auth-security';

jest.mock('../db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn()
    },
    emailOTP: {
      findFirst: jest.fn()
    }
  }
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn()
}));

jest.mock('@/services/auth-security', () => ({
  triggerLoginSecurityAlert: jest.fn()
}));

// Suppress console output for neat test logs
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.log as jest.Mock).mockRestore();
  (console.error as jest.Mock).mockRestore();
});

describe('NextAuth authOptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CredentialsProvider authorize()', () => {
    // Extract the raw authorize function to bypass NextAuth's error-swallowing wrapper
    const credentialsProvider = authOptions.providers.find((p: any) => p.type === 'credentials' || p.id === 'credentials') as any;
    const authorize = credentialsProvider?.options?.authorize;

    it('throws error on missing credentials', async () => {
      await expect(authorize({})).rejects.toThrow('Invalid credentials');
    });

    it('throws error if user not found', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(authorize({ email: 'test@test.com', password: 'Password123!' })).rejects.toThrow('Invalid credentials');
    });

    it('throws error if login lockout is active', async () => {
      const futureDate = new Date(Date.now() + 5 * 60000);
      (db.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        loginLockoutUntil: futureDate
      });
      await expect(authorize({ email: 'test@test.com', password: 'Password123!' })).rejects.toThrow(/Account locked/);
    });

    it('throws error if permanent OTP lock exists', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue({ id: '1', email: 'test@test.com' });
      (db.emailOTP.findFirst as jest.Mock).mockResolvedValue({ isPermanentlyLocked: true });
      await expect(authorize({ email: 'test@test.com', password: 'Password123!' })).rejects.toThrow('AccountLocked');
    });

    it('throws error if email is not verified', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1', email: 'test@test.com', password: 'hashed', role: 'USER', emailVerified: null
      });
      (db.emailOTP.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(authorize({ email: 'test@test.com', password: 'Password123!' })).rejects.toThrow('Email not verified');
    });

    it('returns user if password is correct', async () => {
      const user = { id: '1', email: 'test@test.com', password: 'hashed', role: 'USER', emailVerified: new Date() };
      (db.user.findUnique as jest.Mock).mockResolvedValue(user);
      (db.emailOTP.findFirst as jest.Mock).mockResolvedValue(null);
      // Ensure bcrypt mock is structured correctly for default imports
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);

      const result = await authorize({ email: 'test@test.com', password: 'Password123!' });
      expect(result).toEqual(user);
      expect(db.user.update).toHaveBeenCalledWith(expect.objectContaining({ data: { failedLoginAttempts: 0, loginLockoutUntil: null } }));
    });

    it('increments failed login attempts if password incorrect', async () => {
      const user = { id: '1', email: 'test@test.com', password: 'hashed', role: 'USER', emailVerified: new Date(), failedLoginAttempts: 4 };
      (db.user.findUnique as jest.Mock).mockResolvedValue(user);
      (db.emailOTP.findFirst as jest.Mock).mockResolvedValue(null);
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(false);

      await expect(authorize({ email: 'test@test.com', password: 'Password123!' })).rejects.toThrow('Invalid credentials');
      
      expect(db.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: '1' },
        data: expect.objectContaining({ failedLoginAttempts: 5 })
      }));
    });
  });

  describe('Callbacks', () => {
    describe('signIn()', () => {
      const signIn = authOptions.callbacks?.signIn as any;

      it('blocks sign in if OTP permanently locked', async () => {
        (db.emailOTP.findFirst as jest.Mock).mockResolvedValue({ isPermanentlyLocked: true });
        await expect(signIn({ user: { email: 'test@test.com' } })).rejects.toThrow('AccountLocked:test@test.com');
      });

      it('triggers login security alert', async () => {
        (db.emailOTP.findFirst as jest.Mock).mockResolvedValue(null);
        (db.user.findUnique as jest.Mock).mockResolvedValue(null);
        await signIn({ user: { email: 'test@test.com', name: 'Test' }, account: { provider: 'credentials' } });
        expect(triggerLoginSecurityAlert).toHaveBeenCalledWith({ email: 'test@test.com', name: 'Test' });
      });

      it('returns true for credentials if email verified', async () => {
        (db.emailOTP.findFirst as jest.Mock).mockResolvedValue(null);
        (db.user.findUnique as jest.Mock).mockResolvedValue({ emailVerified: new Date() });
        const result = await signIn({ user: { email: 'test@test.com' }, account: { provider: 'credentials' } });
        expect(result).toBe(true);
      });
    });

    describe('session()', () => {
      const session = authOptions.callbacks?.session as any;

      it('returns invalid session if token.isInvalid', async () => {
        const result = await session({ token: { isInvalid: true }, session: { user: { name: 'test' } } });
        expect(result.user).toBeNull();
      });

      it('populates session with token data', async () => {
        const token = { id: '1', role: 'ADMIN', emailVerified: true };
        const result = await session({ token, session: { user: {} } });
        expect(result.user.id).toBe('1');
        expect(result.user.role).toBe('ADMIN');
      });
    });

    describe('jwt()', () => {
      const jwt = authOptions.callbacks?.jwt as any;

      it('returns initial token for new user login', async () => {
        const user = { id: '1', role: 'ADMIN', securityVersion: 2 };
        const result = await jwt({ token: {}, user });
        expect(result.id).toBe('1');
        expect(result.securityVersion).toBe(2);
      });

      it('invalidates token if securityVersion mismatches', async () => {
        (db.user.findUnique as jest.Mock).mockResolvedValue({ securityVersion: 3 });
        const result = await jwt({ token: { id: '1', securityVersion: 2 } });
        expect(result.isInvalid).toBe(true);
      });
    });
  });
});

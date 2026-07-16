import { generateOTP, generateAndStoreOTP, verifyOTP, sendOTPEmail } from '../otp';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

jest.mock('@/lib/db', () => ({
  db: {
    emailOTP: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => Promise.resolve('hashed')),
  compare: jest.fn(),
}));

jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: { send: jest.fn().mockResolvedValue({ id: 'resend1' }) },
    })),
  };
});

jest.mock('@/emails/OTPEmail', () => ({
  __esModule: true,
  default: () => 'OTPEmail',
}));

jest.mock('@react-email/render', () => ({
  render: jest.fn(() => Promise.resolve('<html>email</html>')),
}));

jest.mock('@/lib/validators', () => ({
  validateEmail: jest.fn((email) => email === 'invalid@email.com' ? 'Invalid email' : null),
  validateOTP: jest.fn((otp) => otp.length !== 6 ? 'Invalid OTP format' : null),
  sanitizeInput: jest.fn((input) => input),
}));

describe('otp.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateOTP', () => {
    it('generates a 6 digit string', () => {
      const otp = generateOTP();
      expect(otp).toHaveLength(6);
      expect(Number(otp)).toBeGreaterThanOrEqual(100000);
    });
  });

  describe('sendOTPEmail', () => {
    it('sends an email via resend', async () => {
      const res = await sendOTPEmail('test@test.com', '123456');
      expect(res).toEqual({ id: 'resend1' });
    });
  });

  describe('generateAndStoreOTP', () => {
    it('throws on invalid email', async () => {
      await expect(generateAndStoreOTP('invalid@email.com')).rejects.toThrow('Invalid email');
    });

    it('throws if permanently locked', async () => {
      (db.emailOTP.findFirst as jest.Mock).mockResolvedValueOnce({ isPermanentlyLocked: true });
      await expect(generateAndStoreOTP('test@test.com')).rejects.toThrow(/temporarily locked/);
    });

    it('throws if active lockout', async () => {
      (db.emailOTP.findFirst as jest.Mock)
        .mockResolvedValueOnce(null) // permanently locked check
        .mockResolvedValueOnce({ lockoutUntil: new Date(Date.now() + 10000) }); // active lockout check
      await expect(generateAndStoreOTP('test@test.com')).rejects.toThrow(/Please wait/);
    });

    it('throws if rate limit for resending applies', async () => {
      (db.emailOTP.findFirst as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ createdAt: new Date(Date.now() - 5000), lockoutPhase: 1 }); // existing OTP check
      await expect(generateAndStoreOTP('test@test.com')).rejects.toThrow(/Please wait/);
    });

    it('creates a new OTP record', async () => {
      (db.emailOTP.findFirst as jest.Mock).mockResolvedValue(null);
      
      const otp = await generateAndStoreOTP('test@test.com');
      expect(otp).toHaveLength(6);
      expect(db.emailOTP.create).toHaveBeenCalled();
    });

    it('updates existing OTP record', async () => {
      (db.emailOTP.findFirst as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: '1', createdAt: new Date(Date.now() - 100000), lockoutPhase: 1 });
      
      const otp = await generateAndStoreOTP('test@test.com');
      expect(otp).toHaveLength(6);
      expect(db.emailOTP.update).toHaveBeenCalled();
    });
  });

  describe('verifyOTP', () => {
    it('throws on invalid email', async () => {
      await expect(verifyOTP('invalid@email.com', '123456')).rejects.toThrow('Invalid email');
    });

    it('throws on invalid OTP format', async () => {
      await expect(verifyOTP('test@test.com', '123')).rejects.toThrow('Invalid OTP format');
    });

    it('throws if permanently locked', async () => {
      (db.emailOTP.findFirst as jest.Mock).mockResolvedValueOnce({ isPermanentlyLocked: true });
      await expect(verifyOTP('test@test.com', '123456')).rejects.toThrow(/temporarily locked/);
    });

    it('throws if active lockout', async () => {
      (db.emailOTP.findFirst as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ lockoutUntil: new Date(Date.now() + 10000) });
      await expect(verifyOTP('test@test.com', '123456')).rejects.toThrow(/OTP attempt limit reached/);
    });

    it('throws if no active record', async () => {
      (db.emailOTP.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(verifyOTP('test@test.com', '123456')).rejects.toThrow('Invalid or expired OTP');
    });

    it('throws if attempts >= 3 and still locked', async () => {
      (db.emailOTP.findFirst as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: '1', attempts: 3, lockoutUntil: new Date(Date.now() + 10000), used: false, expiresAt: new Date(Date.now() + 10000) });

      await expect(verifyOTP('test@test.com', '123456')).rejects.toThrow(/OTP attempt limit reached/);
    });

    it('resets attempts if attempts >= 3 and lockout expired', async () => {
      (db.emailOTP.findFirst as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: '1', attempts: 3, lockoutUntil: new Date(Date.now() - 10000), used: false, expiresAt: new Date(Date.now() + 10000) })
        .mockResolvedValueOnce({ id: '1', otpHash: 'hashed', attempts: 0 }); // refetch after reset

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const res = await verifyOTP('test@test.com', '123456');
      expect(res).toBe(true);
      expect(db.emailOTP.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ attempts: 0 }) }));
    });

    it('verifies correctly', async () => {
      (db.emailOTP.findFirst as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: '1', otpHash: 'hashed', attempts: 0 });
        
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const res = await verifyOTP('test@test.com', '123456');
      expect(res).toBe(true);
      expect(db.emailOTP.update).toHaveBeenCalledWith(expect.objectContaining({ data: { used: true } }));
      expect(db.user.update).toHaveBeenCalled();
    });

    it('increments attempts on wrong OTP', async () => {
      (db.emailOTP.findFirst as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: '1', otpHash: 'hashed', attempts: 0, lockoutPhase: 1 });
        
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(verifyOTP('test@test.com', '123456')).rejects.toThrow(/Invalid OTP/);
      expect(db.emailOTP.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ attempts: 1 }) }));
    });

    it('locks out if attempts reach max per phase', async () => {
      (db.emailOTP.findFirst as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: '1', otpHash: 'hashed', attempts: 2, lockoutPhase: 1 });
        
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(verifyOTP('test@test.com', '123456')).rejects.toThrow(/OTP attempt limit reached/);
      expect(db.emailOTP.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ lockoutPhase: 2 }) }));
    });

    it('permanently locks if phase 4 completed', async () => {
      (db.emailOTP.findFirst as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: '1', otpHash: 'hashed', attempts: 2, lockoutPhase: 4 });
        
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(verifyOTP('test@test.com', '123456')).rejects.toThrow(/temporarily locked|AccountSuspended/);
      expect(db.emailOTP.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ isPermanentlyLocked: true }) }));
    });
  });
});

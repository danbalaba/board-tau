import { requireLandlord, isLandlord, hasPendingLandlordApplication } from '../landlord';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn().mockImplementation(() => { throw new Error('Redirected'); }),
}));

jest.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
    }
  }
}));

jest.mock('@/lib/auth', () => ({
  authOptions: {}
}));

describe('landlord utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requireLandlord', () => {
    it('redirects if user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValueOnce(null);
      await expect(requireLandlord()).rejects.toThrow('Redirected');
      expect(redirect).toHaveBeenCalledWith('/');
    });

    it('redirects if user is not a verified landlord', async () => {
      (getServerSession as jest.Mock).mockResolvedValueOnce({ user: { id: '1' } });
      (db.user.findUnique as jest.Mock).mockResolvedValueOnce({ role: 'USER', isVerifiedLandlord: false });
      
      await expect(requireLandlord()).rejects.toThrow('Redirected');
      expect(redirect).toHaveBeenCalledWith('/');
    });

    it('returns user if verified landlord', async () => {
      (getServerSession as jest.Mock).mockResolvedValueOnce({ user: { id: '1' } });
      const mockUser = { role: 'LANDLORD', isVerifiedLandlord: true, name: 'Landlord' };
      (db.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      
      const user = await requireLandlord();
      expect(user).toEqual(mockUser);
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe('isLandlord', () => {
    it('returns false if not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValueOnce(null);
      expect(await isLandlord()).toBe(false);
    });

    it('returns true if verified landlord', async () => {
      (getServerSession as jest.Mock).mockResolvedValueOnce({ user: { id: '1' } });
      (db.user.findUnique as jest.Mock).mockResolvedValueOnce({ role: 'LANDLORD', isVerifiedLandlord: true });
      expect(await isLandlord()).toBe(true);
    });
  });

  describe('hasPendingLandlordApplication', () => {
    it('returns true if user is USER, unverified, and no landlordApprovedAt', async () => {
      (getServerSession as jest.Mock).mockResolvedValueOnce({ user: { id: '1' } });
      (db.user.findUnique as jest.Mock).mockResolvedValueOnce({
        role: 'USER',
        isVerifiedLandlord: false,
        landlordApprovedAt: null
      });
      expect(await hasPendingLandlordApplication()).toBe(true);
    });

    it('returns false if already landlord', async () => {
      (getServerSession as jest.Mock).mockResolvedValueOnce({ user: { id: '1' } });
      (db.user.findUnique as jest.Mock).mockResolvedValueOnce({
        role: 'LANDLORD',
        isVerifiedLandlord: true,
        landlordApprovedAt: new Date()
      });
      expect(await hasPendingLandlordApplication()).toBe(false);
    });
  });
});

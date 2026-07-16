import { requireAdmin, logAdminAction } from '../admin';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('@/lib/db', () => ({
  db: {
    adminActivityLog: {
      create: jest.fn(),
    }
  }
}));

jest.mock('@/lib/auth', () => ({
  authOptions: {}
}));

describe('admin utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requireAdmin', () => {
    it('redirects if user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValueOnce(null);
      await requireAdmin();
      expect(redirect).toHaveBeenCalledWith('/');
    });

    it('redirects if user is not ADMIN or SUPER_ADMIN', async () => {
      (getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { id: '1', role: 'USER' }
      });
      await requireAdmin();
      expect(redirect).toHaveBeenCalledWith('/');
    });

    it('returns user if user is ADMIN', async () => {
      const mockUser = { id: '1', role: 'ADMIN', name: 'Admin User' };
      (getServerSession as jest.Mock).mockResolvedValueOnce({
        user: mockUser
      });
      const user = await requireAdmin();
      expect(user).toEqual(mockUser);
      expect(redirect).not.toHaveBeenCalled();
    });

    it('returns user if user is SUPER_ADMIN', async () => {
      const mockUser = { id: '2', role: 'SUPER_ADMIN', name: 'Super' };
      (getServerSession as jest.Mock).mockResolvedValueOnce({
        user: mockUser
      });
      const user = await requireAdmin();
      expect(user).toEqual(mockUser);
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe('logAdminAction', () => {
    it('logs admin action to the database', async () => {
      const params = {
        adminId: 'admin-1',
        action: 'DELETE',
        entityType: 'USER',
        entityId: 'user-1',
      };
      
      await logAdminAction(params);
      
      expect(db.adminActivityLog.create).toHaveBeenCalledWith({
        data: {
          adminId: params.adminId,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          details: undefined,
          ipAddress: undefined,
          userAgent: undefined,
        }
      });
    });
  });
});

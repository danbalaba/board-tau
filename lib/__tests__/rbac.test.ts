import { hasPermission, hasAnyPermission, requirePermission, requirePagePermission } from '../rbac';
import { db } from '../db';
import { redirect } from 'next/navigation';

jest.mock('../db', () => ({
  db: {
    user: {
      findUnique: jest.fn()
    }
  }
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}));

// Suppress console.error in tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

describe('RBAC', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hasPermission', () => {
    it('returns false if no userId', async () => {
      const result = await hasPermission('', 'VIEW_DASHBOARD');
      expect(result).toBe(false);
    });

    it('returns false if user not found', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await hasPermission('user-1', 'VIEW_DASHBOARD');
      expect(result).toBe(false);
    });

    it('returns true for SUPER_ADMIN role bypass', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue({ role: 'SUPER_ADMIN' });
      const result = await hasPermission('user-1', 'ANY_PERMISSION');
      expect(result).toBe(true);
    });

    it('returns true if permission is in roleRelation', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue({
        role: 'USER',
        roleRelation: { permissions: ['SPECIFIC_PERM'] }
      });
      const result = await hasPermission('user-1', 'SPECIFIC_PERM');
      expect(result).toBe(true);
    });

    it('returns true for default legacy role permissions if no roleRelation matches', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue({ role: 'LANDLORD' });
      const result = await hasPermission('user-1', 'CREATE_PROPERTY');
      expect(result).toBe(true);
    });

    it('returns false for unknown permission', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue({ role: 'USER' });
      const result = await hasPermission('user-1', 'CREATE_PROPERTY');
      expect(result).toBe(false);
    });
    
    it('handles database errors gracefully and returns false', async () => {
      (db.user.findUnique as jest.Mock).mockRejectedValue(new Error('DB Error'));
      const result = await hasPermission('user-1', 'CREATE_PROPERTY');
      expect(result).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('returns false if no userId', async () => {
      expect(await hasAnyPermission('', ['PERM'])).toBe(false);
    });

    it('returns false if user not found', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);
      expect(await hasAnyPermission('u1', ['PERM'])).toBe(false);
    });

    it('returns true for SUPER_ADMIN', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue({ role: 'SUPER_ADMIN' });
      expect(await hasAnyPermission('u1', ['PERM'])).toBe(true);
    });

    it('returns true if user has any of the requested permissions', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue({
        roleRelation: { permissions: ['A', 'B'] }
      });
      expect(await hasAnyPermission('u1', ['B', 'C'])).toBe(true);
    });

    it('returns false if user lacks all permissions', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue({
        roleRelation: { permissions: ['A'] }
      });
      expect(await hasAnyPermission('u1', ['B', 'C'])).toBe(false);
    });
    
    it('returns false on error', async () => {
      (db.user.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));
      expect(await hasAnyPermission('u1', ['B', 'C'])).toBe(false);
    });
  });

  describe('requirePermission', () => {
    it('does nothing if permitted', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue({ role: 'SUPER_ADMIN' });
      await expect(requirePermission('u1', 'PERM')).resolves.toBeUndefined();
    });

    it('throws error if not permitted', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue({ role: 'USER' });
      await expect(requirePermission('u1', 'SUPER_PERM')).rejects.toThrow('Forbidden: Missing permission SUPER_PERM');
    });
  });

  describe('requirePagePermission', () => {
    it('does nothing if permitted', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue({ role: 'SUPER_ADMIN' });
      await expect(requirePagePermission('u1', 'PERM')).resolves.toBeUndefined();
    });

    it('redirects to /unauthorized if not permitted', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue({ role: 'USER' });
      await requirePagePermission('u1', 'SUPER_PERM');
      expect(redirect).toHaveBeenCalledWith('/unauthorized');
    });
  });
});

import { db } from "./db";

/**
 * RBAC (Role-Based Access Control) Utility
 *
 * Provides functions to verify user permissions against their assigned roles.
 */

/**
 * Checks if a user has a specific permission.
 *
 * @param userId - The ID of the user to check
 * @param permissionName - The name of the permission required (e.g., 'CREATE_INQUIRY')
 * @returns Promise<boolean> - True if the user has the permission, false otherwise
 */
export async function hasPermission(userId: string, permissionName: string): Promise<boolean> {
  if (!userId) return false;

  try {
    // 1. Fetch user and their associated role
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        roleRelation: true // This is the UserRole model
      }
    });

    if (!user) return false;

    // 2. Special case: If user is "SUPER_ADMIN" in the legacy role field, grant all permissions
    // This bypasses the granular checks so Super Admins can never be locked out
    if (user.role === 'SUPER_ADMIN') return true;

    // 3. Check permissions associated with the UserRole
    if (user.roleRelation && user.roleRelation.permissions && user.roleRelation.permissions.length > 0) {
      return user.roleRelation.permissions.includes(permissionName);
    }

    // 4. Default fallback: Grant basic permissions based on the User's legacy role level
    // This handles users who haven't been assigned a specific granular role yet
    const defaultPermissions: Record<string, string[]> = {
      'USER': [
        'FAVORITE_LISTING', 'CREATE_INQUIRY', 'VIEW_INQUIRIES', 
        'VIEW_RESERVATIONS', 'PAY_RESERVATION', 'CREATE_REVIEW', 
        'VIEW_REVIEWS', 'UPDATE_PROFILE', 'UPLOAD_AVATAR', 
        'UPDATE_PASSWORD', 'SEND_MESSAGES', 'CREATE_HOST_APPLICATION'
      ],
      'LANDLORD': [
        'VIEW_DASHBOARD', 'VIEW_PROPERTIES', 'CREATE_PROPERTY', 
        'UPDATE_PROPERTY', 'VIEW_ROOMS', 'CREATE_ROOM', 
        'UPDATE_ROOM', 'MANAGE_INQUIRIES', 'MANAGE_RESERVATIONS', 
        'RESPOND_REVIEW', 'VIEW_TENANT_PROFILE'
      ],
      'ADMIN': [
        'VIEW_MODERATION_QUEUE', 'MODERATE_HOSTS', 'MODERATE_LISTINGS', 
        'MODERATE_REVIEWS', 'MANAGE_USERS'
      ],
      'SUPER_ADMIN': [
        '*'
      ]
    };

    const rolesPermissions = defaultPermissions[user.role] || [];
    if (rolesPermissions.includes(permissionName) || rolesPermissions.includes('*')) {
      return true;
    }

    // 5. Final fallback: No permission
    return false;
  } catch (error) {
    console.error(`Error checking permission ${permissionName} for user ${userId}:`, error);
    return false;
  }
}

/**
 * Checks if a user has any of the specified permissions.
 *
 * @param userId - The ID of the user to check
 * @param permissionNames - Array of permission names
 * @returns Promise<boolean>
 */
export async function hasAnyPermission(userId: string, permissionNames: string[]): Promise<boolean> {
  if (!userId) return false;

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        roleRelation: true
      }
    });

    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;

    if (user.roleRelation && user.roleRelation.permissions) {
      return permissionNames.some(perm => user.roleRelation?.permissions.includes(perm));
    }

    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Ensures a user has a specific permission, or throws an error.
 * Useful for API routes.
 */
export async function requirePermission(userId: string, permissionName: string) {
  const permitted = await hasPermission(userId, permissionName);

  if (!permitted) {
    throw new Error(`Forbidden: Missing permission ${permissionName}`);
  }
}

import { redirect } from 'next/navigation';

/**
 * Ensures a user has a specific permission, or redirects to /unauthorized.
 * Useful for Next.js App Router Server Components.
 */
export async function requirePagePermission(userId: string, permissionName: string) {
  const permitted = await hasPermission(userId, permissionName);

  if (!permitted) {
    redirect('/unauthorized');
  }
}

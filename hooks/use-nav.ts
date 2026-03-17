'use client';

import { useMemo } from 'react';
import type { NavItem } from '@/types';

/**
 * Hook to filter navigation items based on RBAC (simplified version)
 *
 * This simplified version returns all navigation items without any filtering.
 * For actual security (API routes, server actions), always use server-side checks.
 * This is only for UI visibility.
 *
 * @param items - Array of navigation items to filter
 * @returns All items without filtering
 */
export function useFilteredNavItems(items: NavItem[]) {
  // For this simplified version, we just return all items
  // without any filtering. You can add your own filtering logic
  // based on your authentication system.

  return useMemo(() => {
    return items.map(item => {
      if (item.items && item.items.length > 0) {
        return {
          ...item,
          items: item.items // Return all child items without filtering
        };
      }
      return item;
    });
  }, [items]);
}

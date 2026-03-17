'use client';

/**
 * Hook to filter navigation items for BoardTAU admin
 *
 * Since all admin users have full access, this simplifies to returning all items
 * with their children (if any).
 */

import { useMemo } from 'react';

import type { NavItem } from '@/types';

/**
 * Hook to filter navigation items based on RBAC
 *
 * @param items - Array of navigation items to filter
 * @returns Filtered items
 */
export function useFilteredNavItems(items: NavItem[]) {
  // For admin users, we return all navigation items without filtering
  // since admin has full access to all features
  const filteredItems = useMemo(() => {
    return items.map((item) => {
      // If item has children, include them all (no filtering)
      if (item.items && item.items.length > 0) {
        return {
          ...item,
          items: item.items
        };
      }
      return item;
    });
  }, [items]);

  return filteredItems;
}

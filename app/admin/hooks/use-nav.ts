'use client';

/**
 * Hook to filter navigation items for BoardTAU admin
 *
 * Since all admin users have full access, this simplifies to returning all items
 * with their children (if any).
 */

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';

import type { NavItem } from '@/types';

/**
 * Hook to filter navigation items based on RBAC
 *
 * @param items - Array of navigation items to filter
 * @returns Filtered items
 */
export function useFilteredNavItems(items: NavItem[]) {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const filteredItems = useMemo(() => {
    const filterNavItems = (navItems: NavItem[]): NavItem[] => {
      return navItems
        .filter((item) => {
          if (item.allowedRoles && !item.allowedRoles.includes(userRole ?? '')) {
            return false;
          }
          return true;
        })
        .map((item) => {
          if (item.items && item.items.length > 0) {
            return {
              ...item,
              items: filterNavItems(item.items)
            };
          }
          return item;
        });
    };

    return filterNavItems(items);
  }, [items, userRole]);

  return filteredItems;
}

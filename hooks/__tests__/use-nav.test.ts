import { renderHook } from '@testing-library/react';
import { useFilteredNavItems } from '../use-nav';
import type { NavItem } from '@/types';

describe('useFilteredNavItems', () => {
  it('returns an empty array when given an empty array', () => {
    const { result } = renderHook(() => useFilteredNavItems([]));
    expect(result.current).toEqual([]);
  });

  it('returns top-level navigation items exactly as provided', () => {
    const navItems: NavItem[] = [
      { title: 'Dashboard', href: '/dashboard' },
      { title: 'Settings', href: '/settings' }
    ] as any; // Using 'any' since NavItem has specific properties not fully defined here

    const { result } = renderHook(() => useFilteredNavItems(navItems));
    expect(result.current).toEqual(navItems);
  });

  it('processes items with nested children correctly without filtering', () => {
    const navItems = [
      {
        title: 'Properties',
        href: '/properties',
        items: [
          { title: 'All Properties', href: '/properties/all' },
          { title: 'Create', href: '/properties/new' }
        ]
      },
      { title: 'Dashboard', href: '/dashboard' }
    ] as any;

    const { result } = renderHook(() => useFilteredNavItems(navItems));
    
    // The simplified hook just maps over them and returns all children
    expect(result.current[0].items).toHaveLength(2);
    expect(result.current[0].items![0].title).toBe('All Properties');
    expect(result.current[1].title).toBe('Dashboard');
    
    // Result should strictly deeply equal the input based on the current simplified logic
    expect(result.current).toEqual(navItems);
  });
});

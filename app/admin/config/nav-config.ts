import { NavItem } from '@/types';

/**
 * Navigation configuration with RBAC support
 */
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/admin/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    allowedRoles: ['SUPER_ADMIN'],
    items: []
  },
  {
    title: 'Dashboard',
    url: '/admin/dashboard',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    allowedRoles: ['ADMIN'],
    items: []
  },
  {
    title: 'User Directory',
    url: '/admin/user-management/users',
    icon: 'users',
    isActive: false,
    shortcut: ['u', 'd'],
    items: []
  },
  {
    title: 'Content Moderation',
    url: '/admin/moderation',
    icon: 'shieldCheck',
    isActive: false,
    shortcut: ['m', 'm'],
    items: [
      {
        title: 'Moderation Queue',
        url: '/admin/moderation/queue',
        icon: 'list',
        shortcut: ['m', 'q']
      },
      {
        title: 'Host Applications Review',
        url: '/admin/moderation/hosts',
        icon: 'userCheck',
        shortcut: ['h', 'a']
      },
      {
        title: 'Listings Review',
        url: '/admin/moderation/listings',
        icon: 'home',
        shortcut: ['l', 'r']
      },
      {
        title: 'Reviews & Ratings',
        url: '/admin/moderation/reviews',
        icon: 'star',
        shortcut: ['r', 'r']
      }
    ]
  },
  {
    title: 'System Monitoring',
    url: '/admin/monitoring/audit-logs',
    icon: 'monitor',
    isActive: false,
    shortcut: ['s', 'm'],
    allowedRoles: ['SUPER_ADMIN'],
    items: []
  },
  {
    title: 'Platform Configuration',
    url: '/admin/settings',
    icon: 'settings',
    isActive: false,
    shortcut: ['s', 's'],
    allowedRoles: ['SUPER_ADMIN'],
    items: [
      {
        title: 'Property Configuration',
        url: '/admin/settings/property-configuration',
        icon: 'settings',
        shortcut: ['p', 'c']
      },
      {
        title: 'Feature Flags',
        url: '/admin/settings/features',
        icon: 'flag',
        shortcut: ['f', 'f']
      },
      {
        title: 'System Backup',
        url: '/admin/settings/backup',
        icon: 'database',
        shortcut: ['s', 'b']
      }
    ]
  }
];

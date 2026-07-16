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
    title: 'User Management',
    url: '/admin/user-management',
    icon: 'users',
    isActive: false,
    shortcut: ['u', 'u'],
    items: [
      {
        title: 'User Directory',
        url: '/admin/user-management/users',
        icon: 'user',
        shortcut: ['u', 'd']
      },
      {
        title: 'Roles & Permissions',
        url: '/admin/user-management/roles',
        icon: 'shield',
        shortcut: ['r', 'p'],
        allowedRoles: ['SUPER_ADMIN']
      },
      {
        title: 'User Analytics',
        url: '/admin/user-management/analytics',
        icon: 'chartBar',
        shortcut: ['u', 'a'],
        allowedRoles: ['SUPER_ADMIN']
      }
    ]
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
        title: 'Host Applications',
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
    title: 'Financial Management',
    url: '/admin/finance',
    icon: 'currencyDollar',
    isActive: false,
    shortcut: ['f', 'f'],
    allowedRoles: ['SUPER_ADMIN'],
    items: [
      {
        title: 'Revenue Dashboard',
        url: '/admin/finance/revenue',
        icon: 'chartLine',
        shortcut: ['r', 'd']
      },
      {
        title: 'Transactions',
        url: '/admin/finance/transactions',
        icon: 'creditCard',
        shortcut: ['t', 't']
      },
      {
        title: 'Top Performing Listings',
        url: '/admin/finance/top-listings',
        icon: 'star',
        shortcut: ['t', 'l']
      }
    ]
  },
  {
    title: 'Property Management',
    url: '/admin/properties',
    icon: 'home',
    isActive: false,
    shortcut: ['p', 'p'],
    allowedRoles: ['SUPER_ADMIN'],
    items: [
      {
        title: 'Property Directory',
        url: '/admin/properties/directory',
        icon: 'building',
        shortcut: ['p', 'd']
      }
    ]
  },
  {
    title: 'System Monitoring',
    url: '/admin/monitoring',
    icon: 'monitor',
    isActive: false,
    shortcut: ['s', 'm'],
    allowedRoles: ['SUPER_ADMIN'],
    items: [
      {
        title: 'System Health',
        url: '/admin/monitoring/health',
        icon: 'heartbeat',
        shortcut: ['s', 'h']
      },
      {
        title: 'Audit Logs',
        url: '/admin/monitoring/audit-logs',
        icon: 'shieldAlert',
        shortcut: ['a', 'l']
      }
    ]
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
        title: 'General Settings',
        url: '/admin/settings/general',
        icon: 'settings',
        shortcut: ['g', 's']
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
  },
  {
    title: 'Account',
    url: '#',
    icon: 'account',
    isActive: false,
    items: [
      {
        title: 'Profile',
        url: '/admin/profile',
        icon: 'profile',
        shortcut: ['p', 'p']
      },
      {
        title: 'Logout',
        shortcut: ['l', 'o'],
        url: '#logout',
        icon: 'login'
      }
    ]
  }
];

import { NavItem } from '@/types';

/**
 * Navigation configuration with RBAC support
 *
 * This configuration is used for both the sidebar navigation and Cmd+K bar.
 *
 * RBAC Access Control:
 * Each navigation item can have an `access` property that controls visibility
 * based on permissions, plans, features, roles, and organization context.
 *
 * Examples:
 *
 * 1. Require organization:
 *    access: { requireOrg: true }
 *
 * 2. Require specific permission:
 *    access: { requireOrg: true, permission: 'org:teams:manage' }
 *
 * 3. Require specific plan:
 *    access: { plan: 'pro' }
 *
 * 4. Require specific feature:
 *    access: { feature: 'premium_access' }
 *
 * 5. Require specific role:
 *    access: { role: 'admin' }
 *
 * 6. Multiple conditions (all must be true):
 *    access: { requireOrg: true, permission: 'org:teams:manage', plan: 'pro' }
 *
 * Note: The `visible` function is deprecated but still supported for backward compatibility.
 * Use the `access` property for new items.
 */
export const navItems: NavItem[] = [
  {
    title: 'Executive Overview',
    url: '/admin/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
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
        shortcut: ['r', 'p']
      },
      {
        title: 'User Analytics',
        url: '/admin/user-management/analytics',
        icon: 'chartBar',
        shortcut: ['u', 'a']
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
        title: 'Commissions & Fees',
        url: '/admin/finance/fees',
        icon: 'receipt',
        shortcut: ['c', 'f']
      },
      {
        title: 'Tax Compliance',
        url: '/admin/finance/taxes',
        icon: 'fileText',
        shortcut: ['t', 'c']
      },
      {
        title: 'Financial Reports',
        url: '/admin/finance/reports',
        icon: 'chartBar',
        shortcut: ['f', 'r']
      }
    ]
  },
  {
    title: 'Property Management',
    url: '/admin/properties',
    icon: 'home',
    isActive: false,
    shortcut: ['p', 'p'],
    items: [
      {
        title: 'Property Directory',
        url: '/admin/properties/directory',
        icon: 'building',
        shortcut: ['p', 'd']
      },
      {
        title: 'Performance Metrics',
        url: '/admin/properties/performance',
        icon: 'chartBar',
        shortcut: ['p', 'm']
      },
      {
        title: 'Occupancy Tracking',
        url: '/admin/properties/occupancy',
        icon: 'users',
        shortcut: ['o', 't']
      },
      {
        title: 'Pricing Optimization',
        url: '/admin/properties/pricing',
        icon: 'tag',
        shortcut: ['p', 'o']
      },
      {
        title: 'Booking Management',
        url: '/admin/properties/bookings',
        icon: 'calendar',
        shortcut: ['b', 'm']
      }
    ]
  },
  {
    title: 'System Monitoring',
    url: '/admin/monitoring',
    icon: 'monitor',
    isActive: false,
    shortcut: ['s', 'm'],
    items: [
      {
        title: 'System Health',
        url: '/admin/monitoring/health',
        icon: 'heartbeat',
        shortcut: ['s', 'h']
      },
      {
        title: 'Server Metrics',
        url: '/admin/monitoring/servers',
        icon: 'server',
        shortcut: ['s', 'm']
      },
      {
        title: 'Database Performance',
        url: '/admin/monitoring/database',
        icon: 'database',
        shortcut: ['d', 'p']
      },
      {
        title: 'API Monitoring',
        url: '/admin/monitoring/api',
        icon: 'api',
        shortcut: ['a', 'm']
      },
      {
        title: 'Error Tracking',
        url: '/admin/monitoring/errors',
        icon: 'alertTriangle',
        shortcut: ['e', 't']
      },
      {
        title: 'Security Logs',
        url: '/admin/monitoring/security',
        icon: 'shieldAlert',
        shortcut: ['s', 'l']
      }
    ]
  },
    {
      title: 'Advanced Analytics',
      url: '/admin/analytics',
      icon: 'chartBar',
      isActive: false,
      shortcut: ['a', 'a'],
      items: [
        {
          title: 'Analytics Dashboard',
          url: '/admin/analytics',
          icon: 'chartLine',
          shortcut: ['a', 'd']
        },
        {
          title: 'Reports',
          url: '/admin/analytics/reports',
          icon: 'fileText',
          shortcut: ['a', 'r']
        },
        {
          title: 'Custom Dashboards',
          url: '/admin/analytics/dashboards',
          icon: 'grid3X3',
          shortcut: ['a', 'c']
        },
        {
          title: 'Data Export',
          url: '/admin/analytics/export',
          icon: 'download',
          shortcut: ['a', 'e']
        }
      ]
    },
    {
      title: 'Platform Configuration',
      url: '/admin/settings',
      icon: 'settings',
      isActive: false,
      shortcut: ['s', 's'],
      items: [
        {
          title: 'General Settings',
          url: '/admin/settings',
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
          title: 'Email Templates',
          url: '/admin/settings/email-templates',
          icon: 'mail',
          shortcut: ['e', 't']
        },
        {
          title: 'Security',
          url: '/admin/settings/security',
          icon: 'shield',
          shortcut: ['s', 's']
        },
        {
          title: 'Payments & Taxes',
          url: '/admin/settings/payments',
          icon: 'creditCard',
          shortcut: ['p', 's']
        }
      ]
    },
  {
    title: 'Account',
    url: '#',
    icon: 'account',
    isActive: true,
    items: [
      {
        title: 'Profile',
        url: '/admin/profile',
        icon: 'profile',
        shortcut: ['p', 'p']
      },
      {
        title: 'Billing',
        url: '/admin/billing',
        icon: 'billing',
        shortcut: ['b', 'b'],
        // Only show billing if in organization context
        access: { requireOrg: true }
        // Alternative: require billing management permission
        // access: { requireOrg: true, permission: 'org:manage:billing' }
      },
      {
        title: 'Login',
        shortcut: ['l', 'l'],
        url: '/',
        icon: 'login'
      }
    ]
  }
];

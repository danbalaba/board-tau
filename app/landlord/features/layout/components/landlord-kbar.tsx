'use client';

import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch,
  useKBar
} from 'kbar';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { 
  IconLayoutDashboard, 
  IconBuilding, 
  IconMessage, 
  IconCalendarCheck, 
  IconCalendarStats, 
  IconStar, 
  IconChartBar,
  IconSettings,
  IconUser,
  IconPlus,
  IconSearch
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

// Separate result renderer for styling
const RenderResults = () => {
  const { results, rootActionId } = useKBar((state: any) => ({
    results: state.results,
    rootActionId: state.rootActionId,
  }));

  return (
    <div className="p-2 space-y-1">
      {results?.map((item: any, index: number) => {
        if (typeof item === 'string') {
          return (
            <div key={index} className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              {item}
            </div>
          );
        }
        return (
          <div
            key={item.id}
            onClick={item.perform}
            className={`flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
              index === 0 ? 'bg-primary/10 text-primary shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon && <span className="text-current opacity-70">{item.icon}</span>}
              <div className="flex flex-col">
                <span className="text-sm font-bold">{item.name}</span>
                {item.subtitle && <span className="text-[10px] opacity-70 font-medium">{item.subtitle}</span>}
              </div>
            </div>
            {item.shortcut?.length > 0 && (
              <div className="flex gap-1">
                {item.shortcut.map((sc: string) => (
                  <kbd key={sc} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-bold">
                    {sc}
                  </kbd>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function LandlordKBar({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const actions = useMemo(() => [
    {
      id: 'dashboard',
      name: 'Dashboard',
      shortcut: ['g', 'd'],
      keywords: 'home stats overview',
      section: 'Navigation',
      perform: () => router.push('/landlord'),
      icon: <IconLayoutDashboard size={18} strokeWidth={2} />
    },
    {
      id: 'properties',
      name: 'Manage Properties',
      shortcut: ['g', 'p'],
      keywords: 'listings house condo apartment',
      section: 'Management',
      perform: () => router.push('/landlord/properties'),
      icon: <IconBuilding size={18} strokeWidth={2} />
    },
    {
      id: 'create-property',
      name: 'Create New Property',
      shortcut: ['n', 'p'],
      keywords: 'add new listing build',
      section: 'Quick Actions',
      perform: () => router.push('/landlord/properties/create'),
      icon: <IconPlus size={18} strokeWidth={2} />
    },
    {
      id: 'inquiries',
      name: 'Tenant Inquiries',
      shortcut: ['g', 'i'],
      keywords: 'messages chat tenants',
      section: 'Management',
      perform: () => router.push('/landlord/inquiries'),
      icon: <IconMessage size={18} strokeWidth={2} />
    },
    {
      id: 'reservations',
      name: 'Reservations',
      shortcut: ['g', 'r'],
      keywords: 'requests pending bookings',
      section: 'Management',
      perform: () => router.push('/landlord/reservations'),
      icon: <IconCalendarCheck size={18} strokeWidth={2} />
    },
    {
      id: 'bookings',
      name: 'Manage Bookings',
      shortcut: ['g', 'b'],
      keywords: 'tenants active stay',
      section: 'Management',
      perform: () => router.push('/landlord/bookings'),
      icon: <IconCalendarStats size={18} strokeWidth={2} />
    },
    {
      id: 'reviews',
      name: 'Guest Reviews',
      shortcut: ['g', 'v'],
      keywords: 'ratings feedback stars',
      section: 'Management',
      perform: () => router.push('/landlord/reviews'),
      icon: <IconStar size={18} strokeWidth={2} />
    },
    {
      id: 'analytics',
      name: 'Analytics Hub',
      shortcut: ['g', 'a'],
      keywords: 'stats performance data revenue',
      section: 'Insights',
      perform: () => router.push('/landlord/analytics'),
      icon: <IconChartBar size={18} strokeWidth={2} />
    },
    {
      id: 'settings',
      name: 'Account Settings',
      shortcut: [','],
      keywords: 'profile security payment',
      section: 'Personal',
      perform: () => router.push('/landlord/settings'),
      icon: <IconSettings size={18} strokeWidth={2} />
    }
  ], [router]);

  return (
    <KBarProvider actions={actions}>
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  );
}

const KBarComponent = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <KBarPortal>
        <KBarPositioner className="bg-black/60 fixed inset-0 z-[100000] backdrop-blur-md p-4">
          <KBarAnimator className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/20 shadow-2xl overflow-y-auto">
            <div className="sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
              <div className="flex items-center px-6 py-4">
                <IconSearch className="text-primary mr-3" size={20} strokeWidth={2.5} />
                <KBarSearch className="w-full bg-transparent border-none text-base font-bold outline-none focus:ring-0 placeholder:text-gray-400" placeholder="Type a command or search..." />
                <div className="flex gap-1 ml-4">
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-[10px] font-black text-gray-400 border border-gray-200 dark:border-gray-700">ESC</kbd>
                </div>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              <RenderResults />
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <kbd className="p-1 px-1.5 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">⏎</kbd>
                  <span>to select</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <kbd className="p-1 px-1.5 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">↑↓</kbd>
                  <span>to navigate</span>
                </div>
              </div>
              <div className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">Landlord Search</div>
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};

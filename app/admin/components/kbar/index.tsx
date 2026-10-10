'use client';
import { navItems } from "../../config/nav-config";
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch
} from 'kbar';
import { useKBar } from 'kbar';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import RenderResults from './render-result';
import useThemeSwitching from './use-theme-switching';
import { useFilteredNavItems } from "../../hooks/use-nav";
import { IconSearch } from '@tabler/icons-react';

import { Icons } from '../icons';

const KEYWORD_MAP: Record<string, string> = {
  'dashboard': 'overview analytics stats metrics home operations',
  'user directory': 'user management users students landlords staff accounts profiles directory members',
  'content moderation': 'moderation queue reported reports listings flags review issues',
  'moderation queue': 'moderation queue reported reports listings flags review issues tickets queue',
  'host applications review': 'host applications landlords verification approval hosts verify properties documents',
  'listings review': 'listings review properties rooms boarding houses apartments dorms approve listings verify',
  'reviews & ratings': 'reviews ratings feedback student reviews stars comments testimonials',
  'system monitoring': 'monitoring health audit logs status performance system',
  'system health': 'system health status database performance latency monitoring uptime servers diagnostics',
  'audit logs': 'audit logs activity security events history monitoring records inspect audit trail',
  'platform configuration': 'platform configuration property amenities settings features backup',
  'property configuration': 'property configuration amenities room types rules housing settings property config room setup',
  'feature flags': 'feature flags toggles beta experiments settings switches',
  'system backup': 'system backup database snapshot restore export data backups save',
};

export default function KBar({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const filteredItems = useFilteredNavItems(navItems);

  // These actions are for the navigation
  const actions = useMemo(() => {
    // Define navigateTo inside the useMemo callback to avoid dependency array issues
    const navigateTo = (url: string) => {
      router.push(url);
    };

    return filteredItems.flatMap((navItem, index) => {
      // Use index to ensure absolute uniqueness for IDs
      const parentId = `nav-parent-${index}-${navItem.title.toLowerCase()}`;
      const hasChildren = navItem.items && navItem.items.length > 0;
      const Icon = navItem.icon ? (Icons[navItem.icon] as any) : Icons.logo;
      const titleLower = navItem.title.toLowerCase();
      const keywords = `${titleLower} ${KEYWORD_MAP[titleLower] || ''}`.trim();

      // The primary action for this navigation item
      const topLevelAction = {
        id: parentId,
        name: navItem.title,
        keywords: keywords,
        section: 'Menu',
        subtitle: hasChildren ? `${navItem.items?.length} options` : `Go to ${navItem.title}`,
        icon: Icon ? <Icon className='h-4 w-4' /> : null,
        // If it has children, perform MUST be undefined for kbar to drill down correctly
        perform: hasChildren ? undefined : () => navigateTo(navItem.url)
      };

      // If no children, just return the leaf node
      if (!hasChildren) return [topLevelAction];

      // Map child items and link them to the parent ID
      const childActions = navItem.items!.map((childItem, childIndex) => {
        const ChildIcon = childItem.icon ? (Icons[childItem.icon] as any) : Icons.logo;
        const childTitleLower = childItem.title.toLowerCase();
        const childKeywords = `${childTitleLower} ${KEYWORD_MAP[childTitleLower] || ''} ${titleLower}`.trim();

        return {
          id: `${parentId}-child-${childIndex}-${childTitleLower}`,
          name: childItem.title,
          keywords: childKeywords,
          parent: parentId,
          subtitle: `Go to ${childItem.title}`,
          icon: ChildIcon ? <ChildIcon className='h-4 w-4' /> : null,
          perform: () => navigateTo(childItem.url)
        };
      });

      return [topLevelAction, ...childActions];
    });
  }, [router, filteredItems]);

  return (
    <KBarProvider actions={actions} options={{ toggleShortcut: '' }}>
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  );
}
function KBarComponent({ children }: { children: React.ReactNode }) {
  useThemeSwitching();
  const { visible } = useKBar((state) => ({ visible: state.visualState === 'showing' }));

  return (
    <>
      {visible && (
        <style dangerouslySetInnerHTML={{ __html: `
          body, main, [data-slot="sidebar-inset"], [data-slot="sidebar-wrapper"] {
            overflow: hidden !important;
            touch-action: none !important;
          }
        `}} />
      )}
      <KBarPortal>
        <KBarPositioner className="fixed inset-0 z-[100000] p-4 bg-gray-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <KBarAnimator className="w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-300 flex flex-col">
            <div className="relative border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center px-8 py-6">
                <div className="mr-4 flex items-center justify-center w-10 h-10 rounded-2xl bg-primary/10 text-primary dark:text-emerald-400 shadow-sm shadow-primary/20 shrink-0">
                  <IconSearch size={20} strokeWidth={2.5} />
                </div>
                <KBarSearch 
                  className="w-full bg-transparent border-none text-lg font-bold outline-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                  placeholder="Type a command or search..." 
                />
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <div className="flex items-center justify-center h-7 px-2 font-black border border-primary/20 bg-primary/10 text-primary dark:text-emerald-400 tracking-tighter text-[10px] rounded-md uppercase">
                    ESC
                  </div>
                </div>
              </div>
            </div>
            
            <div className="overflow-hidden">
              <RenderResults />
            </div>

            <div className="px-8 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  <kbd className="p-1 px-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 shadow-sm font-bold">⏎</kbd>
                  <span>Select</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  <kbd className="p-1 px-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 shadow-sm font-bold">↑↓</kbd>
                  <span>Navigate</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary dark:text-emerald-400">
                <div className="w-2 h-2 rounded-full bg-primary dark:bg-emerald-400 animate-pulse" />
                Quick Search
              </div>
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};

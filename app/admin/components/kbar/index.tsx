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

export default function KBar({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const filteredItems = useFilteredNavItems(navItems);

  // These action are for the navigation
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

      // The primary action for this navigation item
      const topLevelAction = {
        id: parentId,
        name: navItem.title,
        keywords: navItem.title.toLowerCase(),
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
        return {
          id: `${parentId}-child-${childIndex}-${childItem.title.toLowerCase()}`,
          name: childItem.title,
          keywords: childItem.title.toLowerCase(),
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
          <KBarAnimator className="w-full max-w-2xl bg-white/90 dark:bg-gray-950/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-300 flex flex-col">
            <div className="relative border-b border-gray-100 dark:border-gray-800/50 shrink-0">
              <div className="flex items-center px-8 py-6">
                <div className="mr-4 flex items-center justify-center w-10 h-10 rounded-2xl bg-primary/10 text-primary shadow-sm shadow-primary/20 shrink-0">
                  <IconSearch size={20} strokeWidth={2.5} />
                </div>
                <KBarSearch 
                  className="w-full bg-transparent border-none text-lg font-bold outline-none focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-600" 
                  placeholder="What can I help you find?" 
                />
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <div className="flex items-center justify-center h-7 px-2 font-black border border-primary/20 bg-primary/5 text-primary tracking-tighter text-[10px] rounded-md uppercase">
                    ESC
                  </div>
                </div>
              </div>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
              <RenderResults />
            </div>

            <div className="px-8 py-4 bg-gray-50/50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-gray-800/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <kbd className="p-1 px-1.5 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-sm">⏎</kbd>
                  <span>Select</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <kbd className="p-1 px-1.5 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-sm">↑↓</kbd>
                  <span>Navigate</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
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

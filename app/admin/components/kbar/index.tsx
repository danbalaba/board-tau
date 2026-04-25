'use client';
import { navItems } from "../../config/nav-config";
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch
} from 'kbar';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import RenderResults from './render-result';
import useThemeSwitching from './use-theme-switching';
import { useFilteredNavItems } from "../../hooks/use-nav";

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
        section: 'Navigation',
        subtitle: hasChildren ? `${navItem.items?.length} sub-sections` : `Go to ${navItem.title}`,
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
const KBarComponent = ({ children }: { children: React.ReactNode }) => {
  useThemeSwitching();

  return (
    <>
      <KBarPortal>
        <KBarPositioner className='bg-black/60 fixed inset-0 z-[100000] p-4 backdrop-blur-[2px] animate-in fade-in duration-300'>
          <KBarAnimator className='bg-card text-card-foreground relative flex w-full max-w-[600px] flex-col overflow-hidden rounded-xl border border-border shadow-2xl animate-in zoom-in-95 slide-in-from-top-4 duration-300'>
            <div className='bg-card border-border sticky top-0 z-10 border-b shrink-0'>
              <KBarSearch className='bg-card w-full border-none px-6 py-4 text-lg outline-hidden focus:ring-0 focus:ring-offset-0' />
            </div>
            <div className='max-h-[450px] overflow-auto'>
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};

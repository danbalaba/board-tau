'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSidebar } from '@/app/admin/components/ui/sidebar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/app/admin/components/ui/sheet';
import { Button } from '@/app/admin/components/ui/button';
import { SidebarToggle } from '@/app/admin/components/layout/sidebar-toggle';
import { LandlordMenu } from './landlord-menu';
import { cn } from '@/lib/utils';

export default function LandlordSidebar() {
  const { open, toggleSidebar, isMobile, openMobile, setOpenMobile, setIsHover, getOpenState } = useSidebar();
  const isOpen = getOpenState();

  // Mobile Drawer (Sheet)
  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side="left"
          className="w-72 p-0 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col justify-between"
        >
          <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4">
            <SheetHeader className="text-left px-2 pt-2">
              <SheetTitle className="sr-only">Landlord Navigation</SheetTitle>
              <Link
                href="/landlord"
                onClick={() => setOpenMobile(false)}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center p-1.5 border border-primary/20">
                  <Image
                    src="/logo.png"
                    alt="BoardTAU"
                    width={22}
                    height={22}
                    className="object-contain"
                    priority
                    unoptimized
                  />
                </div>
                <div>
                  <span className="font-extrabold text-base tracking-tight text-gray-900 dark:text-white block leading-none">
                    BoardTAU
                  </span>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mt-1">
                    Landlord Portal
                  </span>
                </div>
              </Link>
            </SheetHeader>

            <LandlordMenu isOpen={true} onItemClick={() => setOpenMobile(false)} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop Salimi Retractable Sidebar (Click Toggle & Hover-to-Expand)
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 h-screen flex flex-col border-r border-gray-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl transition-[width] ease-in-out duration-300",
        !isOpen ? "w-[90px]" : "w-72"
      )}
    >
      {/* ── Floating Retract Button on border seam (Reflects pinned state) ── */}
      <SidebarToggle isOpen={open} setIsOpen={toggleSidebar} />

      <div
        onMouseEnter={() => {
          if (!open) setIsHover(true);
        }}
        onMouseLeave={() => {
          setIsHover(false);
        }}
        className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-xs dark:shadow-none"
      >
        {/* ── Header: Brand & Logo ── */}
        <Button
          className={cn(
            "transition-transform ease-in-out duration-300 mb-1 justify-start px-3 hover:no-underline",
            !isOpen ? "translate-x-1" : "translate-x-0"
          )}
          variant="link"
          asChild
        >
          <Link href="/landlord" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 mr-1 shadow-2xs">
              <Image
                src="/logo.png"
                alt="BoardTAU"
                width={22}
                height={22}
                className="object-contain"
                priority
                unoptimized
              />
            </div>
            <div
              className={cn(
                "flex flex-col whitespace-nowrap overflow-hidden transition-[transform,opacity,display] ease-in-out duration-300",
                !isOpen
                  ? "-translate-x-96 opacity-0 hidden"
                  : "translate-x-0 opacity-100"
              )}
            >
              <span className="font-extrabold text-[17px] tracking-tight text-gray-900 dark:text-white leading-none">
                BoardTAU
              </span>
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider mt-1">
                Landlord Portal
              </span>
            </div>
          </Link>
        </Button>

        {/* ── Scrollable Menu Area ── */}
        <LandlordMenu isOpen={isOpen} />
      </div>
    </aside>
  );
}

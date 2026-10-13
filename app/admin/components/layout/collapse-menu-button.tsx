'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, Dot } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '../ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuArrow,
} from '../ui/dropdown-menu';
import { usePathname } from 'next/navigation';

export type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

interface CollapseMenuButtonProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  submenus: Submenu[];
  isOpen: boolean | undefined;
}

export function CollapseMenuButton({
  icon: Icon,
  label,
  active,
  submenus,
  isOpen,
}: CollapseMenuButtonProps) {
  const pathname = usePathname();
  const isSubmenuActive = submenus.some((submenu) =>
    submenu.active === undefined ? pathname === submenu.href || pathname.startsWith(submenu.href + '/') : submenu.active
  );
  const [isCollapsed, setIsCollapsed] = useState<boolean>(isSubmenuActive);

  return isOpen ? (
    <Collapsible
      open={isCollapsed}
      onOpenChange={setIsCollapsed}
      className="w-full"
    >
      <CollapsibleTrigger
        className="[&[data-state=open]>div>div>svg]:rotate-180 mb-1"
        asChild
      >
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start h-11 mb-1.5 transition-all rounded-xl px-3.5",
            isSubmenuActive
              ? "bg-primary text-white shadow-xs shadow-primary/25 hover:bg-primary/90 hover:text-white font-semibold"
              : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 font-medium"
          )}
        >
          <div className="w-full items-center flex justify-between">
            <div className="flex items-center">
              <span className={cn("mr-3.5", isSubmenuActive ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-primary")}>
                <Icon size={20} />
              </span>
              <p
                className={cn(
                  "max-w-[150px] truncate text-sm font-semibold",
                  isOpen
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-96 opacity-0"
                )}
              >
                {label}
              </p>
            </div>
            <div
              className={cn(
                "whitespace-nowrap",
                isOpen
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-96 opacity-0"
              )}
            >
              <ChevronDown
                size={18}
                className={cn("transition-transform duration-200", isSubmenuActive ? "text-white/80" : "text-gray-400 dark:text-gray-500 group-hover:text-primary")}
              />
            </div>
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        {submenus.map(({ href, label: subLabel, active: itemActive }, index) => {
          const isItemActive = itemActive === undefined ? pathname === href || pathname.startsWith(href + '/') : itemActive;
          return (
            <Button
              key={index}
              variant="ghost"
              className={cn(
                "w-full justify-start h-10 mb-1 transition-colors rounded-xl",
                isItemActive
                  ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-[#4fa89a] font-semibold hover:bg-primary/15"
                  : "text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white hover:bg-primary/5 dark:hover:bg-white/5 font-medium"
              )}
              asChild
            >
              <Link href={href}>
                <span className={cn("mr-3 ml-2", isItemActive ? "text-primary dark:text-[#4fa89a]" : "text-gray-400 dark:text-gray-600")}>
                  <Dot size={20} />
                </span>
                <p
                  className={cn(
                    "max-w-[170px] truncate text-sm",
                    isOpen
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-96 opacity-0"
                  )}
                >
                  {subLabel}
                </p>
              </Link>
            </Button>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  ) : (
    <DropdownMenu>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full h-11 mb-1.5 transition-all rounded-xl justify-center px-0",
                isSubmenuActive
                  ? "bg-primary text-white shadow-xs shadow-primary/25 hover:bg-primary/90 hover:text-white font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 font-medium"
              )}
            >
              <span className={cn("flex items-center justify-center shrink-0", isSubmenuActive ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-primary")}>
                <Icon size={20} />
              </span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="right" align="start" alignOffset={2}>
          {label}
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent side="right" sideOffset={25} align="start" className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xl rounded-xl p-1.5 min-w-[180px]">
        <DropdownMenuLabel className="max-w-[190px] truncate text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 py-1.5">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-100 dark:bg-slate-800 -mx-1 my-1" />
        {submenus.map(({ href, label: subLabel, active: itemActive }, index) => {
          const isItemActive = itemActive === undefined ? pathname === href || pathname.startsWith(href + '/') : itemActive;
          return (
            <DropdownMenuItem key={index} asChild>
              <Link
                className={cn(
                  "cursor-pointer rounded-lg px-2.5 py-1.5 text-sm transition-colors",
                  isItemActive
                    ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-[#4fa89a] font-semibold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-primary/5 hover:text-primary dark:hover:bg-slate-800/60 dark:hover:text-white"
                )}
                href={href}
                onClick={(e) => {
                  (e.currentTarget as HTMLElement)?.blur();
                }}
              >
                <p className="max-w-[180px] truncate">{subLabel}</p>
              </Link>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuArrow className="fill-white dark:fill-slate-900" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

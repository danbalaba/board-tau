'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "./ui/sidebar";

export function OrgSwitcher() {
  const { state } = useSidebar();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          onClick={() => router.push('/admin')}
          className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
        >
          {state === 'collapsed' ? (
            <div className='flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg'>
               <Image
                  src="/logo.png"
                  alt="logo"
                  width={32}
                  height={32}
                  priority
                  unoptimized
                />
            </div>
          ) : (
            <div className='flex-1 text-left text-sm leading-tight transition-all duration-200 ease-in-out visible max-w-full opacity-100 ml-1'>
               <div className="relative h-[30px] w-[150px]">
                  <Image
                    src={isDark ? "/images/TauBOARD-Dark.png" : "/images/TauBOARD-Light.png"}
                    alt="BoardTAU"
                    fill
                    style={{ objectFit: 'contain', objectPosition: 'left' }}
                    priority
                    unoptimized
                  />
               </div>
            </div>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}


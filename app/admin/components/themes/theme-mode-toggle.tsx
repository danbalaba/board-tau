'use client';

import { IconBrightness } from '@tabler/icons-react';
import { Button } from "../ui/button";

export function ThemeModeToggle() {
  const handleThemeToggle = (e?: React.MouseEvent) => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');

    if (isDark) {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }

    // Save to localStorage for persistence
    localStorage.setItem('theme-mode', isDark ? 'light' : 'dark');
  };

  return (
    <Button
      variant='secondary'
      size='icon'
      className='group/toggle size-8'
      onClick={handleThemeToggle}
    >
      <IconBrightness />
      <span className='sr-only'>Toggle theme</span>
    </Button>
  );
}

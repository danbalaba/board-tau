'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../icons';
import { Button } from '../ui/button';

export function ThemeModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = (e: React.MouseEvent) => {
    const isDark = resolvedTheme === 'dark';
    const newTheme = isDark ? 'light' : 'dark';

    const applyTheme = () => {
      setTheme(newTheme);
    };

    if (!document.startViewTransition) {
      applyTheme();
      return;
    }

    const root = document.documentElement;
    root.style.setProperty('--x', `${e.clientX}px`);
    root.style.setProperty('--y', `${e.clientY}px`);

    document.startViewTransition(applyTheme);
  };

  if (!mounted) {
    return (
      <Button variant='ghost' size='icon' className='size-9 opacity-50' disabled>
        <Icons.sun className='h-5 w-5' />
      </Button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant='ghost'
      size='icon'
      className='group relative size-9 overflow-hidden rounded-full'
      onClick={handleThemeToggle}
    >
      <AnimatePresence mode='wait' initial={false}>
        {isDark ? (
          <motion.div
            key='moon'
            initial={{ y: 20, rotate: 45, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            exit={{ y: -20, rotate: -45, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className='flex items-center justify-center'
          >
            <Icons.moon className='h-5 w-5 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]' />
          </motion.div>
        ) : (
          <motion.div
            key='sun'
            initial={{ y: 20, rotate: -45, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            exit={{ y: -20, rotate: 45, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className='flex items-center justify-center'
          >
            <Icons.sun className='h-5 w-5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' />
          </motion.div>
        )}
      </AnimatePresence>
      <span className='sr-only'>Toggle theme</span>
      
      {/* Subtle hover ring */}
      <span className='absolute inset-0 rounded-full border border-primary/0 transition-colors group-hover:border-primary/10' />
    </Button>
  );
}

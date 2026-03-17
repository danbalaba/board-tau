'use client';
import { ActiveThemeProvider } from '../themes/active-theme';
import { useEffect } from 'react';

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  // Apply saved theme mode from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode');
    if (savedMode === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <ActiveThemeProvider initialTheme={activeThemeValue}>
      {children}
    </ActiveThemeProvider>
  );
}

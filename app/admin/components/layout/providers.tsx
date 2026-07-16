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

  return (
    <ActiveThemeProvider initialTheme={activeThemeValue}>
      {children}
    </ActiveThemeProvider>
  );
}

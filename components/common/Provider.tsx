"use client";
import React, { PropsWithChildren, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EdgeStoreProvider } from "@/lib/edgestore";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "./Toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

const Providers = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    // Ensure light mode doesn't have any theme class
    const root = document.documentElement;
    if (root.classList.contains('light')) {
      root.classList.remove('light');
    }
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      storageKey="theme-preference"
      disableTransitionOnChange={false}
      themes={['light', 'dark']}
    >
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <EdgeStoreProvider>
            <Toaster />
            {children}
          </EdgeStoreProvider>
        </SessionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default Providers;

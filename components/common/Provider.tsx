"use client";
import React, { PropsWithChildren, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EdgeStoreProvider } from "@/lib/edgestore";
import { SessionProvider, useSession } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { LoadingProvider } from "@/components/loading/LoadingContext";
import { ResponsiveToastProvider } from "./ResponsiveToast";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      onSuccess: () => {
        // Invalidate queries on mutation success to ensure fresh data
        queryClient.invalidateQueries({
          queryKey: ['listings'],
        });
        queryClient.invalidateQueries({
          queryKey: ['properties'],
        });
        queryClient.invalidateQueries({
          queryKey: ['reservations'],
        });
        queryClient.invalidateQueries({
          queryKey: ['analytics'],
        });
      },
    },
  },
});

const EdgeStoreWrapper = ({ children }: PropsWithChildren) => {
  const { status, data: session } = useSession();
  
  // Use session status + userId as key to force re-initialization when login state changes
  return (
    <EdgeStoreProvider key={status === "authenticated" ? session?.user?.id : "guest"}>
      {children}
    </EdgeStoreProvider>
  );
};

const Providers = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    // Ensure light mode doesn't have any theme class
    const root = document.documentElement;
    if (root.classList.contains('light')) {
      root.classList.remove('light');
    }
  }, []);

  return (
    <LoadingProvider>
      <NuqsAdapter>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          scriptProps={{ nonce: '' }}
        >
          <QueryClientProvider client={queryClient}>
            <SessionProvider>
              <EdgeStoreWrapper>
                <ResponsiveToastProvider>
                  {children}
                </ResponsiveToastProvider>
              </EdgeStoreWrapper>
            </SessionProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </NuqsAdapter>
    </LoadingProvider>
  );
};

export default Providers;

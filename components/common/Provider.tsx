"use client";
import React, { PropsWithChildren, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EdgeStoreProvider } from "@/lib/edgestore";
import { SessionProvider, useSession } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { LoadingProvider } from "@/components/loading/LoadingContext";
import { ResponsiveToastProvider } from "./ResponsiveToast";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { NotificationProvider } from "@/context/NotificationContext";

if (typeof window !== "undefined") {
  const filterPostHogAndScript = (...args: any[]) => {
    const str = args.map(String).join(" ");
    if (str.includes("Encountered a script tag while rendering React component")) return true;
    if (str.includes("[PostHog.js]")) return true;
    return false;
  };

  const originalError = console.error;
  console.error = (...args) => {
    if (filterPostHogAndScript(...args)) return;
    originalError(...args);
  };

  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (filterPostHogAndScript(...args)) return;
    originalWarn(...args);
  };
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

const EdgeStoreWrapper = ({ children }: PropsWithChildren) => {
  const { status, data: session } = useSession();

  // Use session status + userId as key to force re-initialization when login state changes
  return (
    <EdgeStoreProvider key={status === "authenticated" ? session?.user?.id : "guest"}>
      {children}
    </EdgeStoreProvider>
  );
};

import { preloadKerbyAssets } from "@/utils/imagePreloader";

const Providers = ({ children }: PropsWithChildren) => {
  const queryClient = getQueryClient();

  useEffect(() => {
    preloadKerbyAssets();
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
        >
          <QueryClientProvider client={queryClient}>
            <SessionProvider>
              <EdgeStoreWrapper>
                <ResponsiveToastProvider>
                  <NotificationProvider>
                    {children}
                  </NotificationProvider>
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

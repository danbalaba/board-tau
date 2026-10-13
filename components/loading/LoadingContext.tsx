"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface LoadingMeta {
  context?: string;
  title?: string;
  subtitle?: string;
}

interface LoadingContextType {
  isLoading: boolean;
  loadingContext?: string;
  loadingMeta?: LoadingMeta;
  startLoading: (contextOrMeta?: string | LoadingMeta) => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState<LoadingMeta | undefined>(undefined);

  const startLoading = useCallback((contextOrMeta?: string | LoadingMeta) => {
    if (typeof contextOrMeta === "string") {
      setLoadingMeta({ context: contextOrMeta });
    } else if (contextOrMeta && typeof contextOrMeta === "object") {
      setLoadingMeta(contextOrMeta);
    } else {
      setLoadingMeta(undefined);
    }
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMeta(undefined);
  }, []);

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        loadingContext: loadingMeta?.context,
        loadingMeta,
        startLoading,
        stopLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    // Fallback for Next.js SSR/SSG edge cases (like global-error prerendering)
    return {
      isLoading: false,
      loadingContext: undefined,
      loadingMeta: undefined,
      startLoading: () => {},
      stopLoading: () => {},
    };
  }
  return context;
};

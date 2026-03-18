"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Toaster, sileo } from "sileo";
import { useMediaQuery } from "react-responsive";
import { Toaster as HotToaster } from "./Toast";
import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "next-themes";

// Responsive toast context
interface ResponsiveToastContextType {
  success: (message: string | { title: string; description?: string | React.ReactNode; [key: string]: any }, options?: any) => void;
  error: (message: string | { title: string; description?: string | React.ReactNode; [key: string]: any }, options?: any) => void;
  warning: (message: string | { title: string; description?: string | React.ReactNode; [key: string]: any }, options?: any) => void;
  info: (message: string | { title: string; description?: string | React.ReactNode; [key: string]: any }, options?: any) => void;
  loading: (message: string | { title: string; description?: string | React.ReactNode; [key: string]: any }, options?: any) => void;
}

const ResponsiveToastContext = createContext<ResponsiveToastContextType | undefined>(undefined);

// Custom hook to get screen dimensions
const useScreenSize = () => {
  const [isMobile, setIsMobile] = useState(false);
  const isMobileMQ = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    setIsMobile(isMobileMQ);
  }, [isMobileMQ]);

  return { isMobile };
};

// Responsive toast hook
export const useResponsiveToast = (): ResponsiveToastContextType => {
  const context = useContext(ResponsiveToastContext);
  if (!context) {
    throw new Error("useResponsiveToast must be used within ResponsiveToastProvider");
  }
  return context;
};

// Responsive toast provider
export const ResponsiveToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isMobile } = useScreenSize();

  const showToast = (
    type: "success" | "error" | "warning" | "info" | "loading",
    message: string | { title: string; description?: string | React.ReactNode; [key: string]: any },
    options?: any
  ) => {
    if (isMobile) {
      // Use Sileo for mobile
      // Default options for Sileo
      const defaultOptions = {
        autopilot: { expand: 500, collapse: 3000 },
        roundness: 16,
        styles: {
          title: "text-lg font-semibold",
          description: "text-base",
        },
        ...options,
      };

      // Sileo doesn't support loading type, fallback to info
      if (type === "loading") {
        if (typeof message === "string") {
          sileo.info({ title: message, ...defaultOptions });
        } else {
          sileo.info({ ...message, ...defaultOptions });
        }
      } else {
        const sileoMethod = sileo[type];
        if (sileoMethod) {
          if (typeof message === "string") {
            sileoMethod({ title: message, ...defaultOptions });
          } else {
            sileoMethod({ ...message, ...defaultOptions });
          }
        } else {
          // Fallback if type is not supported
          if (typeof message === "string") {
            sileo.info({ title: message, ...defaultOptions });
          } else {
            sileo.info({ ...message, ...defaultOptions });
          }
        }
      }
    } else {
      // Use existing toast library for desktop
      const toastFunction = toast[type as keyof typeof toast];
      if (toastFunction) {
        // Handle react-hot-toast API
        const displayMessage = typeof message === "string"
          ? message
          : message.description ? `${message.title}: ${message.description}` : message.title;
        // @ts-ignore - react-hot-toast has dynamic type definitions
        toastFunction(displayMessage, options);
      }
    }
  };

  const toastMethods = {
    success: (message: string | { title: string; description?: string | React.ReactNode; [key: string]: any }, options?: any) =>
      showToast("success", message, options),
    error: (message: string | { title: string; description?: string | React.ReactNode; [key: string]: any }, options?: any) =>
      showToast("error", message, options),
    warning: (message: string | { title: string; description?: string | React.ReactNode; [key: string]: any }, options?: any) =>
      showToast("warning", message, options),
    info: (message: string | { title: string; description?: string | React.ReactNode; [key: string]: any }, options?: any) =>
      showToast("info", message, options),
    loading: (message: string | { title: string; description?: string | React.ReactNode; [key: string]: any }, options?: any) =>
      showToast("loading", message, options),
  };

  return (
    <ResponsiveToastContext.Provider value={toastMethods}>
      {/* Render toasters based on screen size */}
      <ResponsiveToasters />
      {children}
    </ResponsiveToastContext.Provider>
  );
};

// Responsive toasters component
const ResponsiveToasters: React.FC = () => {
  const { isMobile } = useScreenSize();
  const { theme } = useTheme(); // Get current theme (light/dark)

  return (
    <>
      {/* Desktop toasters */}
      {!isMobile && <HotToaster />}
      {/* Admin toaster */}
      {!isMobile && <SonnerToaster position="top-center" />}

      {/* Mobile toaster (Sileo) */}
      {isMobile && (
        <div style={{ position: 'fixed', top: '80px', left: 0, right: 0, zIndex: 60 }}>
          <Toaster
            position="top-center"
            options={{
              fill: theme === 'dark' ? '#171717' : '#ffffff',
              roundness: 16,
              styles: {
                title: theme === 'dark' ? 'text-white!' : 'text-gray-900!',
                description: theme === 'dark' ? 'text-white/75!' : 'text-gray-600!',
                badge: theme === 'dark' ? 'bg-white/10!' : 'bg-gray-200!',
                button: theme === 'dark' ? 'bg-white/10! hover:bg-white/15!' : 'bg-gray-200! hover:bg-gray-300!',
              },
            }}
          />
        </div>
      )}
    </>
  );
};

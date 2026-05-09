"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Toaster, sileo } from "sileo";
import { useMediaQuery } from "react-responsive";
import { Toaster as HotToaster } from "./Toast";
import { useTheme } from "next-themes";

// Responsive toast context
interface ResponsiveToastContextType {
  success: (message: string | { title: string; description?: string | React.ReactNode; [key: string]: any }, options?: any) => void;
  error: (message: string | { title: string; description?: string | React.ReactNode; [key: string]: any }, options?: any) => void;
  warning: (message: string | { title: string; description?: string | React.ReactNode; [key: string]: any }, options?: any) => void;
  info: (message: string | { title: string; description?: string | React.ReactNode; [key: string]: any }, options?: any) => void;
  loading: (message: string | { title: string; description?: string | React.ReactNode; [key: string]: any }, options?: any) => void;
  toast: (message: string | { title: string; description?: string | React.ReactNode; [key: string]: any }, options?: any) => void;
}

const ResponsiveToastContext = createContext<ResponsiveToastContextType | undefined>(undefined);

// Custom hook to get screen dimensions
const useScreenSize = () => {
  const [isMobile, setIsMobile] = useState(false);
  const isMobileMQ = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    // Initial check for mobile to avoid the "false" state on mount
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    // Direct detection for logic to avoid state race conditions
    const isMobileNow = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;

    if (isMobileNow) {
      // Use Sileo for mobile
      const defaultOptions = {
        autopilot: { expand: 500, collapse: 4000 },
        roundness: 24,
        styles: {
          title: `text-[10px]! font-black! uppercase! tracking-[0.2em]! leading-tight! block! whitespace-pre-wrap! break-words! text-center! w-[240px]! mx-auto! py-1!`,
          description: `text-xs! font-bold! leading-relaxed! block! whitespace-pre-wrap! break-words! text-center! w-[240px]! mx-auto! pb-2!`,
        },
        ...options,
      };

      const sileoInstance = sileo as any;
      const method = (type === "loading" || !sileoInstance[type]) ? "info" : type;
      
      if (typeof message === "string") {
        sileoInstance[method]({ title: "Notification", description: message, ...defaultOptions });
      } else {
        sileoInstance[method]({ ...message, ...defaultOptions });
      }
    } else {
      // Use existing toast library for desktop
      let toastFunction;
      if (type === "success") toastFunction = toast.success;
      else if (type === "error") toastFunction = toast.error;
      else if (type === "loading") toastFunction = toast.loading;
      else {
        toastFunction = (msg: string, opts: any) => toast(msg, { ...opts, type: type as any });
      }

      if (toastFunction) {
        const displayMessage = typeof message === "string"
          ? message
          : message.description ? `${message.title}: ${message.description}` : message.title;
        
        toastFunction(displayMessage, options);
      }
    }
  };

  const toastMethods = React.useMemo(() => ({
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
    toast: (message: string | { title: string; description?: string | React.ReactNode; [key: string]: any }, options?: any) =>
      showToast("info", message, options),
  }), [isMobile]);

  return (
    <ResponsiveToastContext.Provider value={toastMethods}>
      <ResponsiveToasters />
      {children}
    </ResponsiveToastContext.Provider>
  );
};

// Responsive toasters component
const ResponsiveToasters: React.FC = () => {
  const { isMobile } = useScreenSize();
  const { theme } = useTheme();

  return (
    <>
      {!isMobile && <HotToaster />}

      {isMobile && (
        <div style={{ position: 'fixed', top: '24px', left: 0, right: 0, zIndex: 99999, pointerEvents: 'none' }}>
          <div className="flex justify-center w-full px-4 pointer-events-auto">
            <Toaster
              position="top-center"
              options={{
                fill: theme === 'dark' ? '#1c1c1e' : '#ffffff',
                roundness: 24,
                styles: {
                  title: `text-[10px]! font-black! uppercase! tracking-[0.2em]! leading-tight! block! whitespace-pre-wrap! break-words! text-center! w-[240px]! mx-auto! py-1! ${theme === 'dark' ? 'text-white/60!' : 'text-gray-400!'}`,
                  description: `text-xs! font-bold! leading-relaxed! block! whitespace-pre-wrap! break-words! text-center! w-[240px]! mx-auto! pb-2! ${theme === 'dark' ? 'text-white!' : 'text-gray-900!'}`,
                  badge: theme === 'dark' ? 'bg-white/10!' : 'bg-gray-200!',
                  button: theme === 'dark' ? 'bg-white/10! hover:bg-white/15!' : 'bg-gray-200! hover:bg-gray-300!',
                },
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

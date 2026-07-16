'use client';

import { useTheme } from 'next-themes';
import { Toaster as SileoToaster, sileo } from 'sileo';

const Toaster = () => {
  const { theme = 'system' } = useTheme();

  return (
    <div style={{ position: 'fixed', top: '24px', left: 0, right: 0, zIndex: 99999, pointerEvents: 'none' }}>
      <div className="flex justify-center w-full px-4 pointer-events-none">
        <SileoToaster
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
  );
};

const defaultOptions = {
  autopilot: { expand: 500, collapse: 4000 }
};

export const toast = {
  success: (msg: string, opts?: any) => (sileo as any).success({ title: "Success", description: msg, ...defaultOptions, ...opts }),
  error: (msg: string, opts?: any) => (sileo as any).error({ title: "Error", description: msg, ...defaultOptions, ...opts }),
  info: (msg: string, opts?: any) => (sileo as any).info({ title: "Info", description: msg, ...defaultOptions, ...opts }),
  warning: (msg: string, opts?: any) => (sileo as any).warning({ title: "Warning", description: msg, ...defaultOptions, ...opts }),
  loading: (msg: string, opts?: any) => (sileo as any).info({ title: "Loading", description: msg, ...defaultOptions, ...opts }),
  promise: async (promise: Promise<any>, data: { loading: string; success: string; error: string | ((err: any) => string) }) => {
    (sileo as any).info({ title: "Loading", description: data.loading, ...defaultOptions });
    try {
      const result = await promise;
      (sileo as any).success({ title: "Success", description: data.success, ...defaultOptions });
      return result;
    } catch (e: any) {
      const errMsg = typeof data.error === 'function' ? data.error(e) : data.error;
      (sileo as any).error({ title: "Error", description: errMsg, ...defaultOptions });
      throw e;
    }
  }
};

export { Toaster };

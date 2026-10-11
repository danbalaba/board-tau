'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/utils/helper';

interface TooltipContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  isTouchOpen: boolean;
  toggleTouch: () => void;
  closeTooltip: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const TooltipContext = React.createContext<TooltipContextType>({
  open: false,
  setOpen: () => {},
  isTouchOpen: false,
  toggleTouch: () => {},
  closeTooltip: () => {},
  triggerRef: { current: null },
});

function TooltipProvider({
  delayDuration = 100,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  delayDuration = 150,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const [isTouchOpen, setIsTouchOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const triggerRef = React.useRef<HTMLElement | null>(null);

  const closeTooltip = React.useCallback(() => {
    setIsTouchOpen(false);
    if (!isControlled) {
      setUncontrolledOpen(false);
    }
    onOpenChange?.(false);
  }, [isControlled, onOpenChange]);

  const handleOpenChange = React.useCallback(
    (value: boolean) => {
      // If tooltip was opened via touch on mobile, ignore premature auto-closes
      // from Radix (such as touch pointerleave, blur, or hover grace-loss)
      if (!value && isTouchOpen) {
        return;
      }

      if (!isControlled) {
        setUncontrolledOpen(value);
      }
      onOpenChange?.(value);
    },
    [isControlled, isTouchOpen, onOpenChange]
  );

  const toggleTouch = React.useCallback(() => {
    if (open) {
      closeTooltip();
    } else {
      setIsTouchOpen(true);
      if (!isControlled) {
        setUncontrolledOpen(true);
      }
      onOpenChange?.(true);
    }
  }, [open, closeTooltip, isControlled, onOpenChange]);

  // When opened via touch on mobile, listen for outside taps on document to dismiss
  React.useEffect(() => {
    if (!isTouchOpen) return;

    const handleDocumentPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      // If tapping trigger element, trigger onClick handles toggling
      if (triggerRef.current && (triggerRef.current === target || triggerRef.current.contains(target))) {
        return;
      }

      // Tapped outside -> dismiss
      closeTooltip();
    };

    const timer = setTimeout(() => {
      document.addEventListener('pointerdown', handleDocumentPointerDown);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', handleDocumentPointerDown);
    };
  }, [isTouchOpen, closeTooltip]);

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <TooltipContext.Provider
        value={{
          open: !!open,
          setOpen: (val) => {
            if (!val) setIsTouchOpen(false);
            if (!isControlled) setUncontrolledOpen(val);
            onOpenChange?.(val);
          },
          isTouchOpen,
          toggleTouch,
          closeTooltip,
          triggerRef,
        }}
      >
        <TooltipPrimitive.Root
          data-slot="tooltip"
          open={open}
          onOpenChange={handleOpenChange}
          delayDuration={delayDuration}
          disableHoverableContent={isTouchOpen}
          {...props}
        >
          {children}
        </TooltipPrimitive.Root>
      </TooltipContext.Provider>
    </TooltipProvider>
  );
}

const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(({ onClick, ...props }, ref) => {
  const { toggleTouch, triggerRef } = React.useContext(TooltipContext);

  return (
    <TooltipPrimitive.Trigger
      ref={(node) => {
        triggerRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      data-slot="tooltip-trigger"
      onClick={(e) => {
        const nativePointerType =
          'nativeEvent' in e &&
          typeof e.nativeEvent === 'object' &&
          e.nativeEvent !== null &&
          'pointerType' in e.nativeEvent
            ? (e.nativeEvent as { pointerType?: string }).pointerType
            : undefined;

        const isMobileDevice =
          (typeof window !== 'undefined' &&
            (window.matchMedia('(hover: none)').matches || window.innerWidth < 768)) ||
          nativePointerType === 'touch';

        if (isMobileDevice) {
          // On mobile, tap-to-toggle
          e.preventDefault();
          toggleTouch();
        } else {
          // On desktop, hover handles showing and hiding;
          // prevent click from prematurely closing or triggering parent actions
          e.preventDefault();
        }
        onClick?.(e);
      }}
      {...props}
    />
  );
});
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, collisionPadding = 12, children, onPointerDownOutside, ...props }, ref) => {
  const { closeTooltip, triggerRef } = React.useContext(TooltipContext);

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        onPointerDownOutside={(e) => {
          // If the pointer down happened on the trigger, prevent premature dismiss here
          // so the trigger's onClick handles the toggle cleanly
          if (
            triggerRef.current &&
            (triggerRef.current === e.target || triggerRef.current.contains(e.target as Node))
          ) {
            e.preventDefault();
            return;
          }
          // Otherwise, close tooltip when tapping outside
          closeTooltip();
          onPointerDownOutside?.(e);
        }}
        className={cn(
          'z-[999999] overflow-hidden rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-2xl p-0 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="fill-white dark:fill-slate-900 z-[999999] size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
});
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };



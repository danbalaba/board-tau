"use client";

import React, {
  FC,
  ReactElement,
  ReactNode,
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { createPortal } from "react-dom";

import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useIsClient } from "@/hooks/useIsClient";
import { fadeIn, modalSheet } from "@/utils/motion";
import { cn } from "@/utils/helper";

// Simple implementation of useKeyPress
const useKeyPress = ({ key, action, enable = true }: { key: string; action: (e: KeyboardEvent) => void; enable?: boolean }) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === key) action(e);
    };

    if (enable) {
      window.addEventListener("keydown", onKeyDown);
    } else {
      window.removeEventListener("keydown", onKeyDown);
    }

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [action, key, enable]);
};

interface ModalProps {
  children: ReactNode;
  isOpen?: boolean;
  initialOpen?: string;
  onClose?: () => void;
  title?: string;
  width?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  hasFixedFooter?: boolean;
  closeOnOutsideClick?: boolean;
  noPadding?: boolean;
  fullOnMobile?: boolean;
}

interface TriggerProps {
  name: string;
  children: ReactElement;
  onClick?: (e: React.MouseEvent) => void;
}

interface WindowProps extends TriggerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  hasFixedFooter?: boolean;
  closeOnOutsideClick?: boolean;
  noPadding?: boolean;
  fullOnMobile?: boolean;
}

interface WindowHeaderProps {
  title: string;
  onClose?: () => void;
}

export const ModalContext = createContext({
  open: (_val: string) => {},
  close: () => {},
  openName: "",
});

const Modal: FC<ModalProps> & {
  Trigger: typeof Trigger;
  Window: typeof Window;
  WindowHeader: typeof WindowHeader;
} = ({ children, isOpen, initialOpen = "", onClose, title, width = 'md', hasFixedFooter, closeOnOutsideClick = true, noPadding = false, fullOnMobile = false }) => {
  // Simplified API for direct control (no context)
  if (isOpen !== undefined) {
    const isClient = useIsClient();

    // Handle body scroll locking for standalone Modal
    useEffect(() => {
      if (!isClient) return;
      const body = document.body;
      const html = document.documentElement;

      if (isOpen) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        body.style.overflow = "hidden";
        html.style.overflow = "hidden";
        if (scrollbarWidth > 0) {
          body.style.paddingRight = `${scrollbarWidth}px`;
        }
      } else {
        body.style.overflow = "";
        html.style.overflow = "";
        body.style.paddingRight = "";
      }

      return () => {
        body.style.overflow = "";
        html.style.overflow = "";
        body.style.paddingRight = "";
      };
    }, [isClient, isOpen]);

    const isFullMobile = width === 'full' || fullOnMobile;

    const widthClasses = {
      xs: isFullMobile ? 'w-full sm:w-[90vw] max-w-[320px] md:w-[320px]' : 'w-[90vw] max-w-[320px] md:w-[320px]',
      sm: isFullMobile ? 'w-full sm:w-[92vw] max-w-[400px] md:w-[400px]' : 'w-[92vw] max-w-[400px] md:w-[400px]',
      md: isFullMobile ? 'w-full sm:w-[92vw] max-w-[500px] md:w-[500px]' : 'w-[92vw] max-w-[500px] md:w-[500px]',
      lg: isFullMobile ? 'w-full sm:w-[95vw] max-w-[800px] md:w-[800px]' : 'w-[95vw] max-w-[800px] md:w-[800px]',
      xl: isFullMobile ? 'w-full sm:w-[95vw] max-w-[1180px] md:w-[1180px]' : 'w-[95vw] max-w-[1180px] md:w-[1180px]',
      '2xl': isFullMobile ? 'w-full sm:w-[96vw] max-w-[1300px] md:w-[1300px]' : 'w-[96vw] max-w-[1300px] md:w-[1300px]',
      full: 'w-full h-full'
    };

    if (!isClient) return null;

    return createPortal(
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="show"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed inset-0 z-[10000] flex justify-center items-center overflow-hidden outline-none focus:outline-none bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-300",
              isFullMobile ? "p-0 sm:p-6" : "p-4 sm:p-6"
            )}
            onWheel={(e) => e.preventDefault()}
            onTouchMove={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation(); // prevent bubbling to parent modals
              // Close modal when clicking outside the inner box
              if (closeOnOutsideClick && e.target === e.currentTarget) {
                onClose?.();
              }
            }}
          >
            <motion.div
              variants={modalSheet}
              initial="hidden"
              animate="show"
              exit="exit"
              tabIndex={-1}
              ref={(node) => {
                if (node && isOpen) node.focus();
              }}
              className={cn(
                "outline-none focus:outline-none overscroll-contain w-full",
                widthClasses[width],
                isFullMobile 
                  ? (width === 'full' ? "h-full rounded-none sm:rounded-card" : "h-full sm:h-auto max-h-none sm:max-h-[90vh] rounded-none sm:rounded-card")
                  : "max-h-[90vh] rounded-2xl sm:rounded-card",
                hasFixedFooter ? "overflow-hidden" : "overflow-y-auto",
                noPadding ? "bg-transparent border-0 shadow-none" : (isFullMobile ? "shadow-none sm:shadow-glass bg-white dark:bg-gray-900 backdrop-blur-xl border-0 sm:border sm:border-white/20 dark:sm:border-white/10" : "shadow-glass bg-white dark:bg-gray-900 backdrop-blur-xl border border-white/20 dark:border-white/10")
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {title && (
                <header className="flex items-center px-6 py-4 rounded-t justify-center relative border-b border-border dark:border-gray-700 bg-transparent">
                  <h4 className="text-[18px] font-semibold text-text-primary dark:text-gray-100">
                    {title}
                  </h4>
                  <button
                    type="button"
                    className="p-2 border-0 hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors absolute right-4 rounded-full text-current"
                    onClick={onClose}
                    aria-label="Close"
                  >
                    <IoMdClose size={22} className="text-current" />
                  </button>
                </header>
              )}
              {hasFixedFooter || noPadding ? (
                children
              ) : (
                <div className="p-4 sm:p-6 h-full flex flex-col">{children}</div>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>,
      document.body
    );
  }

  // Existing context-based API
  const [openName, setOpenName] = useState(initialOpen);

  const close = useCallback(() => {
    setOpenName("");
  }, []);

  const open = useCallback((val: string) => {
    setOpenName(val);
  }, []);

  return (
    <ModalContext.Provider value={{ open, close, openName }}>
      {children}
    </ModalContext.Provider>
  );
};

const Trigger: FC<TriggerProps> = ({ children, name, onClick }) => {
  const { open } = useContext(ModalContext);
  const handleClick = (e: React.MouseEvent) => {
    // Call custom onClick if provided
    if (onClick) {
      onClick(e);
    }

    // Open the modal
    open(name);
  };
  return cloneElement(children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>, { onClick: handleClick });
};

const Window: FC<WindowProps> = ({ children, name, size = 'md', hasFixedFooter, closeOnOutsideClick = true, noPadding, fullOnMobile = false }) => {
  const isFullMobile = size === 'full' || fullOnMobile;

  const sizeClasses = {
    xs: isFullMobile ? 'w-full sm:w-[90vw] max-w-[320px] md:w-[320px]' : 'w-[90vw] max-w-[320px] md:w-[320px]',
    sm: isFullMobile ? 'w-full sm:w-[92vw] max-w-[400px] md:w-[400px]' : 'w-[92vw] max-w-[400px] md:w-[400px]',
    md: isFullMobile ? 'w-full sm:w-[92vw] max-w-[500px] md:w-[500px]' : 'w-[92vw] max-w-[500px] md:w-[500px]',
    lg: isFullMobile ? 'w-full sm:w-[95vw] max-w-[800px] md:w-[800px]' : 'w-[95vw] max-w-[800px] md:w-[800px]',
    xl: isFullMobile ? 'w-full sm:w-[95vw] max-w-[1100px] md:w-[1100px]' : 'w-[95vw] max-w-[1100px] md:w-[1100px]',
    '2xl': isFullMobile ? 'w-full sm:w-[96vw] max-w-[1300px] md:w-[1300px]' : 'w-[96vw] max-w-[1300px] md:w-[1300px]',
    full: 'w-full h-full'
  };
  const { openName, close } = useContext(ModalContext);
  const isWindowOpen = openName === name;
  const { ref } = useOutsideClick({
    action: close,
    enable: isWindowOpen && closeOnOutsideClick,
    listenCapturing: false,
  });

  useKeyPress({
    key: "Escape",
    action: close,
    enable: isWindowOpen,
  });

  const isClient = useIsClient();

  useEffect(() => {
    if (!isClient) return;
    const body = document.body;
    const html = document.documentElement;

    if (isWindowOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      body.style.overflow = "hidden";
      html.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      body.style.overflow = "";
      html.style.overflow = "";
      body.style.paddingRight = "";
    }

    return () => {
      body.style.overflow = "";
      html.style.overflow = "";
      body.style.paddingRight = "";
    };
  }, [isClient, isWindowOpen]);

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {isWindowOpen ? (
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="show"
          exit="hidden"
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed inset-0 z-[10000] flex justify-center items-center overflow-hidden outline-none focus:outline-none bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-300 overscroll-contain",
            isFullMobile ? "p-0 sm:p-6" : "p-4 sm:p-6"
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (closeOnOutsideClick && e.target === e.currentTarget) {
              close();
            }
          }}
        >
            <motion.div
              variants={modalSheet}
              initial="hidden"
              animate="show"
              exit="exit"
              tabIndex={-1}
              ref={(node) => {
                if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
                if (node && isWindowOpen) node.focus();
              }}
              className={cn(
                "outline-none focus:outline-none overscroll-contain w-full",
                sizeClasses[size],
                isFullMobile 
                  ? (size === 'full' ? "h-full rounded-none sm:rounded-card" : "h-full sm:h-auto max-h-none sm:max-h-[90vh] rounded-none sm:rounded-card")
                  : "max-h-[90vh] rounded-2xl sm:rounded-card",
                hasFixedFooter ? "overflow-hidden" : "overflow-y-auto",
                noPadding ? "bg-transparent border-0 shadow-none" : (isFullMobile ? "shadow-none sm:shadow-glass bg-white dark:bg-gray-900 backdrop-blur-xl border-0 sm:border sm:border-white/20 dark:sm:border-white/10" : "shadow-glass bg-white dark:bg-gray-900 backdrop-blur-xl border border-white/20 dark:border-white/10")
              )}
            >
            {React.isValidElement(children) && (typeof children.type === 'function' || typeof children.type === 'object')
              ? React.cloneElement(children as React.ReactElement<{ onCloseModal: () => void }>, {
                  onCloseModal: close,
                })
              : children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
};

const WindowHeader: FC<WindowHeaderProps> = ({ title, onClose }) => {
  const { close: contextClose } = useContext(ModalContext);
  
  const handleClose = () => {
    if (onClose) onClose();
    else contextClose();
  };

  return (
    <header className="flex items-center px-6 py-4 rounded-t justify-center relative border-b border-border dark:border-gray-700 bg-transparent">
      <h4 className="text-[18px] font-semibold text-text-primary dark:text-gray-100">
        {title}
      </h4>
      <button
        type="button"
        className="p-2 border-0 hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors absolute right-4 rounded-full text-current"
        onClick={handleClose}
        aria-label="Close"
      >
        <IoMdClose size={22} className="text-current" />
      </button>
    </header>
  );
};

Modal.Trigger = Trigger;
Modal.Window = Window;
Modal.WindowHeader = WindowHeader;

export default Modal;

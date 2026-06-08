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
  onClose?: () => void;
  title?: string;
  width?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  hasFixedFooter?: boolean;
  closeOnOutsideClick?: boolean;
}

interface TriggerProps {
  name: string;
  children: ReactElement;
  onClick?: (e: React.MouseEvent) => void;
}

interface WindowProps extends TriggerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  hasFixedFooter?: boolean;
  closeOnOutsideClick?: boolean;
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
} = ({ children, isOpen, onClose, title, width = 'md', hasFixedFooter, closeOnOutsideClick = true }) => {
  // Simplified API for direct control (no context)
  if (isOpen !== undefined) {
    const isClient = useIsClient();

    // Handle body scroll locking for standalone Modal
    useEffect(() => {
      if (!isClient) return;
      const body = document.body;
      const rootNode = document.documentElement;

      const restoreScroll = () => {
        const top = parseFloat(body.style.top) * -1;
        body.style.overflow = '';
        body.style.paddingRight = '';
        body.style.top = '';
        body.classList.remove("fixed", "w-full");
        if (top) {
          window.scrollTo(0, top);
        }
      };

      if (isOpen) {
        const scrollTop = window.pageYOffset || rootNode.scrollTop || body.scrollTop;
        body.style.overflow = 'hidden';
        body.style.paddingRight = '17px';
        body.style.top = `-${scrollTop}px`;
        body.classList.add("fixed", "w-full");
      } else {
        restoreScroll();
      }

      return () => {
        if (isOpen) {
          restoreScroll();
        }
      };
    }, [isClient, isOpen]);

    const widthClasses = {
      xs: 'md:w-[320px]',
      sm: 'md:w-[400px]',
      md: 'md:w-[500px]',
      lg: 'md:w-[800px]',
      xl: 'md:w-[1100px]'
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
            className="fixed inset-0 z-[10000] flex justify-center items-center overflow-hidden outline-none focus:outline-none bg-gray-900/40 dark:bg-gray-950/80 backdrop-blur-sm"
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
              className={`md:h-auto h-auto md:max-h-[90vh] ${hasFixedFooter ? 'overflow-hidden' : 'overflow-y-auto'} w-full ${widthClasses[width]} md:rounded-card rounded-card shadow-glass border border-white/20 dark:border-white/10 bg-white dark:bg-gray-900 backdrop-blur-xl`}
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
              <div className={hasFixedFooter ? "" : "p-6"}>
                {children}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>,
      document.body
    );
  }

  // Existing context-based API
  const [openName, setOpenName] = useState("");

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
    e.stopPropagation();
    e.preventDefault();

    // Call custom onClick if provided
    if (onClick) {
      onClick(e);
    }

    // Open the modal
    open(name);
  };
  return cloneElement(children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>, { onClick: handleClick });
};

const Window: FC<WindowProps> = ({ children, name, size = 'md', hasFixedFooter, closeOnOutsideClick = true }) => {
  const sizeClasses = {
    xs: 'md:w-[320px] lg:w-[320px]',
    sm: 'md:w-[400px] lg:w-[400px]',
    md: 'md:w-[500px] lg:w-[500px]',
    lg: 'md:w-[800px] lg:w-[800px]',
    xl: 'md:w-[1100px] lg:w-[1100px]'
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
    const rootNode = document.documentElement;

    const restoreScroll = () => {
      const top = parseFloat(body.style.top) * -1;
      body.style.overflow = '';
      body.style.paddingRight = '';
      body.style.top = '';
      body.classList.remove("fixed", "w-full");
      if (top) {
        window.scrollTo(0, top);
      }
    };

    if (isWindowOpen) {
      // Save current scroll position
      const scrollTop = window.pageYOffset || rootNode.scrollTop || body.scrollTop;
      // Add class to prevent scrolling
      body.style.overflow = 'hidden';
      body.style.paddingRight = '17px'; // Compensate for scrollbar
      body.style.top = `-${scrollTop}px`;
      body.classList.add("fixed", "w-full");
    } else {
      // Restore scroll position when logically closing
      restoreScroll();
    }

    // Cleanup: ALWAYS restore scroll on unmount if it was open. 
    // This catches router.push() unmounts that completely tear down the modal tree mid-flight.
    return () => {
      if (isWindowOpen) {
        restoreScroll();
      }
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
          className="fixed inset-0 z-[10000] flex justify-center items-end md:items-center overflow-hidden outline-none focus:outline-none bg-gray-900/40 dark:bg-gray-950/80 backdrop-blur-sm"
        >
            <motion.div
              variants={modalSheet}
              initial="hidden"
              animate="show"
              exit="exit"
              ref={ref}
              className={`md:h-auto h-[95vh] md:max-h-[90vh] ${hasFixedFooter ? 'overflow-hidden' : 'overflow-y-auto'} w-full ${sizeClasses[size]} md:rounded-card rounded-t-card shadow-glass border-t md:border border-white/20 dark:border-white/10 bg-white dark:bg-gray-900 backdrop-blur-xl`}
            >
            {React.isValidElement(children) && typeof children.type === 'function'
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

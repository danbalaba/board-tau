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
import { useKeyPress } from "@/hooks/useKeyPress";
import { fadeIn, modalSheet } from "@/utils/motion";

interface ModalProps {
  children: ReactNode;
}

interface TriggerProps {
  name: string;
  children: ReactElement;
}

interface WindowProps extends TriggerProps {}

interface WindowHeaderProps {
  title: string;
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
} = ({ children }) => {
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

const Trigger: FC<TriggerProps> = ({ children, name }) => {
  const { open } = useContext(ModalContext);
  const onClick = (e: unknown) => {
    (e as React.MouseEvent).stopPropagation();
    (e as React.MouseEvent).preventDefault();
    open(name);
  };
  return cloneElement(children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>, { onClick });
};

const Window: FC<WindowProps> = ({ children, name }) => {
  const { openName, close } = useContext(ModalContext);
  const isWindowOpen = openName === name;
  const { ref } = useOutsideClick({
    action: close,
    enable: isWindowOpen,
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
    if (isWindowOpen) {
      const scrollTop = rootNode.scrollTop;
      body.style.top = `-${scrollTop}px`;
      body.classList.add("no-scroll");
    } else {
      const top = parseFloat(body.style.top) * -1;
      body.classList.remove("no-scroll");
      if (top) {
        rootNode.scrollTop = top;
        body.style.top = "";
      }
    }
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
          className="fixed inset-0 z-50 flex justify-center items-end md:items-center overflow-hidden outline-none focus:outline-none bg-black/35 backdrop-blur-xl"
        >
            <motion.div
              variants={modalSheet}
              initial="hidden"
              animate="show"
              exit="exit"
              ref={ref}
              className="md:h-auto h-[90vh] md:max-h-[85vh] overflow-y-auto w-full md:w-[420px] md:rounded-card rounded-t-card shadow-glass border-t md:border border-white/20 dark:border-white/10 bg-white dark:bg-gray-900 backdrop-blur-xl"
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

const WindowHeader: FC<WindowHeaderProps> = ({ title }) => {
  const { close } = useContext(ModalContext);
  return (
    <header className="flex items-center px-6 py-4 rounded-t justify-center relative border-b border-border dark:border-gray-700 bg-transparent">
      <button
        type="button"
        className="p-2 border-0 hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors absolute left-4 rounded-full text-current"
        onClick={close}
        aria-label="Close"
      >
        <IoMdClose size={22} className="text-current" />
      </button>
      <h4 className="text-[18px] font-semibold text-text-primary dark:text-gray-100">
        {title}
      </h4>
    </header>
  );
};

Modal.Trigger = Trigger;
Modal.Window = Window;
Modal.WindowHeader = WindowHeader;

export default Modal;

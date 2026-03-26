import { useEffect, useRef } from "react";

interface IUseOutsideClick {
  action: (e: MouseEvent) => void;
  listenCapturing?: boolean;
  enable?: boolean;
}

export const useOutsideClick = ({
  action,
  listenCapturing = false,
  enable = true,
}: IUseOutsideClick) => {
  const ref = useRef<any>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // If the target is no longer in the document, do not trigger outside click.
      // This prevents the modal from closing if a clicked element causes itself
      // to be removed from the DOM (e.g. Next button, Remove Image button).
      if (!document.contains(e.target as Node)) {
        return;
      }

      if (ref.current && !ref.current.contains(e.target as Node)) {
        action(e);
      }
    };

    if (enable) {
      document.addEventListener("click", handleClick, listenCapturing);
    } else {
      document.removeEventListener("click", handleClick, listenCapturing);
    }

    return () =>
      document.removeEventListener("click", handleClick, listenCapturing);
  }, [action, listenCapturing, enable]);

  return { ref };
};

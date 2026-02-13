/** iOS 26 / visionOS-style motion variants for Framer Motion */

export const spring = { type: "spring" as const, stiffness: 300, damping: 30 };
export const springSoft = { type: "spring" as const, stiffness: 200, damping: 25 };
export const springBounce = { type: "spring" as const, stiffness: 400, damping: 25 };
export const tweenFast = { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as const };
export const tweenMedium = { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const };
export const tweenSlow = { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const };
export const tweenVerySlow = { duration: 0.8, ease: [0.22, 1, 0.36, 1] }; // Apple-style easing

// Hero headline animation with micro blur and stagger
export const headlineFadeIn = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { ...tweenVerySlow },
  },
};

export const subtitleFadeIn = {
  hidden: { opacity: 0, y: 15, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

// Search bar hero treatment
export const searchBarEntrance = {
  hidden: { opacity: 0, scale: 0.98, y: 10 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

// Floating animation for search bar
export const floatingAnimation = {
  rest: { y: 0, transition: { duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" } },
  hover: { y: -4, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

export const glassFadeIn = {
  hidden: { opacity: 0, scale: 0.98 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { ...tweenMedium },
  },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } },
};

export const floatIn = (direction: "up" | "down" = "up") => ({
  hidden: {
    opacity: 0,
    y: direction === "up" ? 24 : -24,
    transition: tweenMedium,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: { ...tweenMedium },
  },
  exit: {
    opacity: 0,
    y: direction === "up" ? 12 : -12,
    transition: { duration: 0.2 },
  },
});

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { ...tweenMedium },
  },
};

export const hoverLift = {
  rest: { y: 0, boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)" },
  hover: {
    y: -4,
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
    transition: springSoft,
  },
  tap: { scale: 0.99, transition: { duration: 0.1 } },
};

export const softScaleTap = {
  scale: 1,
  transition: spring,
};
export const softScaleTapTap = { scale: 0.98 };
export const softScaleTapHover = { scale: 1.02 };

export const zoomIn = (scale: number, duration: number) => ({
  hidden: { opacity: 0, scale },
  show: { opacity: 1, scale: 1, transition: { duration } },
});

export const fadeIn = {
  hidden: {
    opacity: 0,
    transition: { duration: 0.15, type: "tween" as const },
  },
  show: {
    opacity: 1,
    transition: { duration: 0.15, type: "tween" as const },
  },
};

export const slideIn = (
  direction: "up" | "down" | "left" | "right",
  type: "tween" | "spring",
  duration: number
) => ({
  hidden: {
    x: direction === "left" ? "-100%" : direction === "right" ? "100%" : 0,
    y: direction === "up" ? "100%" : direction === "down" ? "-100%" : 0,
    opacity: 0,
    transition: { duration, type },
  },
  show: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: { type, duration },
  },
});

/** Modal: float up from bottom with spring */
export const modalSheet = {
  hidden: { opacity: 0, y: "100%", transition: tweenMedium },
  show: {
    opacity: 1,
    y: 0,
    transition: { ...springSoft },
  },
  exit: {
    opacity: 0,
    y: "40%",
    transition: { duration: 0.25 },
  },
};

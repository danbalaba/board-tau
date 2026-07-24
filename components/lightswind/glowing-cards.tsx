"use client";

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface GlowingCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  hoverEffect?: boolean;
}

export interface GlowingCardsProps {
  children: React.ReactNode;
  className?: string;
  /** Enable the glowing overlay effect */
  enableGlow?: boolean;
  /** Size of the glow effect radius */
  glowRadius?: number;
  /** Opacity of the glow effect */
  glowOpacity?: number;
  /** Animation duration for glow transitions */
  animationDuration?: number;
  /** Enable hover effects on individual cards */
  enableHover?: boolean;
  /** Gap between cards */
  gap?: string;
  /** Maximum width of cards container */
  maxWidth?: string;
  /** Padding around the container */
  padding?: string;
  /** Background color for the container */
  backgroundColor?: string;
  /** Border radius for cards */
  borderRadius?: string;
  /** Enable responsive layout */
  responsive?: boolean;
  /** Layout mode for inner flex container (wrap or stack) */
  layout?: 'wrap' | 'stack';
  /** Custom CSS variables for theming */
  customTheme?: {
    cardBg?: string;
    cardBorder?: string;
    textColor?: string;
    hoverBg?: string;
  };
}

export const GlowingCard = React.forwardRef<HTMLDivElement, GlowingCardProps>(({
  children,
  className,
  glowColor = "#3b82f6",
  hoverEffect = true,
  ...props
}, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative flex-1 min-w-[14rem] p-6 rounded-2xl text-black dark:text-white",
        "bg-background border ",
        "transition-all duration-400 ease-out",
        className
      )}
      style={{
        '--glow-color': glowColor, // CSS variable definition
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </motion.div>
  );
});
GlowingCard.displayName = "GlowingCard";

export const GlowingCards: React.FC<GlowingCardsProps> = ({
  children,
  className,
  enableGlow = true,
  glowRadius = 25,
  glowOpacity = 1,
  animationDuration = 400,
  enableHover = true,
  gap = "2.5rem",
  maxWidth = "75rem",
  padding = "3rem 1.5rem",
  backgroundColor,
  borderRadius = "1rem",
  responsive = true,
  layout = 'wrap',
  customTheme,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showOverlay, setShowOverlay] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const overlay = overlayRef.current;

    if (!container || !overlay || !enableGlow) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setMousePosition({ x, y });
      setShowOverlay(true);

      // Using string concatenation for style properties
      overlay.style.setProperty('--x', x + 'px');
      overlay.style.setProperty('--y', y + 'px');
      overlay.style.setProperty('--opacity', glowOpacity.toString());
    };

    const handleTouchMove = (e: TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const touch = e.touches[0];
      if (!touch) return;
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      setMousePosition({ x, y });
      setShowOverlay(true);

      overlay.style.setProperty('--x', x + 'px');
      overlay.style.setProperty('--y', y + 'px');
      overlay.style.setProperty('--opacity', glowOpacity.toString());
    };

    const handleMouseLeave = () => {
      setShowOverlay(false);
      overlay.style.setProperty('--opacity', '0');
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchstart', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchstart', handleTouchMove);
      container.removeEventListener('touchend', handleMouseLeave);
    };
  }, [enableGlow, glowOpacity]);

  const flexClasses = layout === 'stack' 
    ? "flex flex-col items-stretch w-full gap-[var(--gap)]" 
    : cn("flex items-stretch justify-center flex-wrap gap-[var(--gap)]", responsive && "flex-col sm:flex-row");

  const containerStyle = {
    '--gap': gap,
    '--max-width': maxWidth,
    '--padding': padding,
    '--border-radius': borderRadius,
    '--animation-duration': animationDuration + 'ms', // Concatenation
    '--glow-radius': glowRadius + 'rem', // Concatenation
    '--glow-opacity': glowOpacity,
    backgroundColor: backgroundColor || undefined,
    ...customTheme,
  } as React.CSSProperties;

  return (
    <div
      className={cn("relative w-full", className)}
      style={containerStyle}
    >
      <div
        ref={containerRef}
        className={cn(
          "relative max-w-[var(--max-width)] mx-auto ",
          "px-6 py-2"
        )}
        style={{ padding: "var(--padding)" }} // String literal
      >
        <div className={flexClasses}>
          {children}
        </div>

        {enableGlow && (
          <div
            ref={overlayRef}
            className={cn(
              "absolute inset-0 pointer-events-none select-none",
              "opacity-0 transition-all duration-[&lsqb;var(--animation-duration)&rsqb;] ease-out"
            )}
            style={{
              // String concatenation for WebkitMask and mask
              WebkitMask: isTouchDevice 
                ? (showOverlay ? "radial-gradient(var(--glow-radius) var(--glow-radius) at var(--x, 0) var(--y, 0), #000 1%, transparent 70%)" : "radial-gradient(var(--glow-radius) var(--glow-radius) at 50% 50%, #000 1%, transparent 70%)")
                : "radial-gradient(var(--glow-radius) var(--glow-radius) at var(--x, 0) var(--y, 0), #000 1%, transparent 50%)",
              mask: isTouchDevice
                ? (showOverlay ? "radial-gradient(var(--glow-radius) var(--glow-radius) at var(--x, 0) var(--y, 0), #000 1%, transparent 70%)" : "radial-gradient(var(--glow-radius) var(--glow-radius) at 50% 50%, #000 1%, transparent 70%)")
                : "radial-gradient(var(--glow-radius) var(--glow-radius) at var(--x, 0) var(--y, 0), #000 1%, transparent 50%)",
              opacity: (showOverlay || isTouchDevice) ? (isTouchDevice ? (showOverlay ? '0.7' : '0.4') : 'var(--opacity)') : '0',
            }}
          >
            <div
              className={cn(flexClasses, "max-w-[var(--max-width)] center mx-auto")}
              style={{ padding: "var(--padding)" }} // String literal
            >
              {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child) && child.type === GlowingCard) {
                  const element = child as React.ReactElement<any>;
                  const cardGlowColor = element.props.glowColor || "#3b82f6";
                  return React.cloneElement(element, {
                    className: cn(
                      element.props.className,
                      "bg-opacity-15 dark:bg-opacity-15",
                      "border-opacity-100 dark:border-opacity-100"
                    ),
                    style: {
                      ...element.props.style,
                      // String concatenation for background, border, and boxShadow
                      backgroundColor: cardGlowColor + "15",
                      borderColor: cardGlowColor,
                      boxShadow: "0 0 0 1px inset " + cardGlowColor,
                    },
                  });
                }
                return child;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { GlowingCards as default };
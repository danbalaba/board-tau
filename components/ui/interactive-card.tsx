"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useMotionTemplate } from "framer-motion";

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

export const InteractiveCard = ({
  children,
  className,
  containerClassName,
  InteractiveColor = "#07eae6ff",
  borderRadius = "24px",
  rotationFactor = 0.2, // reduced rotation for large modals
  transitionDuration = 0.3,
  transitionEasing = "easeInOut",
  tailwindBgClass = "bg-transparent backdrop-blur-md",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  InteractiveColor?: string;
  borderRadius?: string;
  rotationFactor?: number;
  transitionDuration?: number;
  transitionEasing?: string;
  tailwindBgClass?: string;
} & React.ComponentProps<typeof motion.div>) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateXTrans = useTransform(y, [0, 1], [rotationFactor * 15, -rotationFactor * 15]);
  const rotateYTrans = useTransform(x, [0, 1], [-rotationFactor * 15, rotationFactor * 15]);

  const handlePointerMove = (e: React.PointerEvent) => {
    const bounds = cardRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const px = (e.clientX - bounds.left) / bounds.width;
    const py = (e.clientY - bounds.top) / bounds.height;

    x.set(px);
    y.set(py);
  };

  const xPercentage = useTransform(x, (val) => `${val * 100}%`);
  const yPercentage = useTransform(y, (val) => `${val * 100}%`);

  const interactiveBackground = useMotionTemplate`radial-gradient(circle at ${xPercentage} ${yPercentage}, ${InteractiveColor} 0%, transparent 80%)`;

  return (
    <motion.div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      style={{
        perspective: 1500,
        borderRadius,
      }}
      className={cn("relative isolate", containerClassName || "w-[320px] aspect-[17/21]")}
      {...props}
    >
      <motion.div
        style={{
          rotateX: rotateXTrans,
          rotateY: rotateYTrans,
          transformStyle: "preserve-3d",
          transition: `transform ${transitionDuration}s ${transitionEasing}`,
        }}
        className="w-full h-full rounded-xl overflow-hidden border border-white/10 shadow-2xl"
      >
        {/* Background Interactive Layer */}
        <motion.div
          className="absolute inset-0 rounded-xl z-0 pointer-events-none"
          style={{
            background: interactiveBackground,
            transition: `opacity ${transitionDuration}s ${transitionEasing}`,
            opacity: isHovered ? 0.6 : 0,
          }}
        />

        {/* Content */}
        <div
          className={cn(
            "relative z-10 w-full h-full",
            tailwindBgClass,
            className,
            "text-foreground"
          )}
          style={{
            borderRadius,
          }}
        >
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InteractiveCard;

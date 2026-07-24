import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, useMotionTemplate } from "framer-motion";
import { cn } from "@/lib/utils"; // Assuming cn is a utility for conditionally joining class names

const InteractiveCard = ({
  children,
  className,
  InteractiveColor = "#07eae6ff",
  borderRadius = "24px",
  rotationFactor = 0.4,
  transitionDuration = 0.3,
  transitionEasing = "easeInOut",
  tailwindBgClass = "bg-transparent backdrop-blur-md",
}: {
  children: React.ReactNode;
  className?: string;
  InteractiveColor?: string;
  borderRadius?: string;
  rotationFactor?: number;
  transitionDuration?: number;
  transitionEasing?: string;
  tailwindBgClass?: string;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

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
      onPointerLeave={() => {
        setIsHovered(false);
        x.set(0.5);
        y.set(0.5);
      }}
      style={{
        perspective: 1000,
        borderRadius,
      }}
      className={cn("relative isolate w-[320px] aspect-[17/21]", className)}
    >
      <motion.div
        style={{
          rotateX: isTouchDevice ? 0 : rotateXTrans,
          rotateY: isTouchDevice ? 0 : rotateYTrans,
          transformStyle: "preserve-3d",
          transition: `transform ${transitionDuration}s ${transitionEasing}`,
          borderRadius,
        }}
        className={cn("w-full h-full overflow-hidden border border-neutral-200/60 dark:border-slate-800 shadow-xl dark:shadow-2xl", tailwindBgClass)}
      >
        {/* Background Interactive Layer */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            background: interactiveBackground,
            transition: `opacity ${transitionDuration}s ${transitionEasing}`,
            opacity: isTouchDevice ? 0 : (isHovered ? 0.6 : 0),
            pointerEvents: "none",
            borderRadius,
          }}
        />

        {/* Content */}
        <div
          className={cn(
            "relative z-10 w-full h-full flex flex-col items-center justify-center text-foreground bg-transparent"
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

export { InteractiveCard };
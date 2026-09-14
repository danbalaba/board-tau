"use client";

import React, { useRef } from "react";
import { cn } from "@/utils/helper";

interface ConfettiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onConfettiEnd?: () => void;
  options?: {
    particleCount?: number;
    spread?: number;
    colors?: string[];
  };
}

export const triggerConfetti = (options: { particleCount?: number; colors?: string[] } = {}) => {
  if (typeof window === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "99999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const width = (canvas.width = window.innerWidth);
  const height = (canvas.height = window.innerHeight);

  const particleCount = options.particleCount || 120;
  const colors = options.colors || ["#10b981", "#2f7d6d", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6"];

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    decay: number;
  }

  const particles: Particle[] = [];
  const originX = width / 2;
  const originY = height / 3;

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 14 + 6;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - Math.random() * 5,
      size: Math.random() * 9 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      opacity: 1,
      decay: Math.random() * 0.012 + 0.006,
    });
  }

  let animationId: number;

  const animate = () => {
    ctx.clearRect(0, 0, width, height);

    let alive = false;
    particles.forEach((p) => {
      if (p.opacity > 0) {
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // gravity
        p.vx *= 0.98; // drag
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, p.opacity - p.decay);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.6);
        ctx.restore();
      }
    });

    if (alive) {
      animationId = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationId);
      canvas.remove();
    }
  };

  animate();
};

export const ConfettiButton: React.FC<ConfettiButtonProps> = ({
  children,
  className,
  onClick,
  onConfettiEnd,
  options = {},
  disabled,
  ...props
}) => {
  const fireConfetti = () => {
    triggerConfetti(options);
    onConfettiEnd?.();
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    fireConfetti();
    onClick?.(e);
  };

  return (
    <button
      className={cn("relative transition-all active:scale-95", className)}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default ConfettiButton;

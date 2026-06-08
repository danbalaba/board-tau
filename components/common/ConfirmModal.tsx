"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/utils/helper";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: "danger" | "primary" | "secondary";
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading = false,
  variant = "danger",
}) => {
  return (
    <div className="flex flex-col items-start gap-5 p-2">
      {/* Header Icon with Glow */}
      <div className="relative">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 ${
          variant === "danger" 
            ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
            : "bg-primary text-white shadow-lg shadow-primary/20"
        }`}>
          <AlertTriangle size={22} strokeWidth={2.5} />
        </div>
        <div className={`absolute inset-0 rounded-full blur-xl opacity-20 animate-pulse ${
          variant === "danger" ? "bg-red-500" : "bg-primary"
        }`} />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
          {title}
        </h3>
        <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
          {message}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 w-full pt-2">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all uppercase tracking-widest"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={cn(
            "flex-1 py-2.5 px-4 rounded-xl text-xs font-black text-white transition-all uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg",
            variant === "danger" 
              ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" 
              : "bg-primary hover:bg-primary/90 shadow-primary/20"
          )}
        >
          {isLoading ? (
             <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : null}
          {confirmLabel}
        </button>
      </div>
    </div>
  );
};

export default ConfirmModal;

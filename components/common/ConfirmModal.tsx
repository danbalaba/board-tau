"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";
import Button from "./Button";
import Modal from "../modals/Modal";

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
    <div className="flex flex-col gap-4">
      {/* Header Icon */}
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-full ${
          variant === "danger" 
            ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" 
            : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
        }`}>
          <AlertTriangle size={24} />
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {message}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Button
          outline
          onClick={onClose}
          disabled={isLoading}
          className="flex-1"
        >
          {cancelLabel}
        </Button>
        <Button
          variant={variant}
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2"
        >
          {isLoading ? (
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : null}
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
};

export default ConfirmModal;

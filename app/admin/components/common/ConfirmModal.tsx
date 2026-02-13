"use client";

import React from "react";
import Button from "@/components/common/Button";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  onConfirm,
  onCancel,
  loading = false,
}: Props) {
  if (!open) return null;

  const confirmButtonProps = {
    variant: variant === "danger" ? "danger" : "primary",
    disabled: loading,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />

      <div className="relative transform overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 px-6 py-6 shadow-xl transition-all sm:max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>

          <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {message}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button outline onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            {...confirmButtonProps}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

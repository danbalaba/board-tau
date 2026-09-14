"use client";

import React, { useState } from "react";
import { Trash2, Loader2, Hotel, AlertTriangle } from "lucide-react";
import { toast } from "@/app/admin/components/ui/sonner";
import axios from "axios";
import { Button } from "@/app/admin/components/ui/button";
import { motion } from "framer-motion";

interface DeleteRoomTypeModalProps {
  roomType: {
    id: string;
    name: string;
    icon?: string;
  };
  onCloseModal?: () => void;
  onSuccess?: (deletedId?: string) => void;
}

export function DeleteRoomTypeModal({
  roomType,
  onCloseModal,
  onSuccess,
}: DeleteRoomTypeModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await axios.delete(`/api/admin/room-types/${roomType.id}`);
      
      if (res.data?.success) {
        toast.success(`Room type '${roomType.name}' deleted successfully.`);
        if (onSuccess) onSuccess(roomType.id);
        onCloseModal?.();
      } else {
        toast.error(res.data?.error || "Failed to delete room type");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Failed to delete room type");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="p-6 sm:p-8 relative text-slate-800 dark:text-slate-200 w-full font-sans"
    >
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-red-600 rounded-t-2xl" />

      <div className="flex flex-col items-center text-center pt-2">
        {/* Warning / Loading Icon Container */}
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 flex items-center justify-center mb-5 shadow-sm transition-all duration-300">
          {loading ? (
            <Loader2 className="w-8 h-8 text-red-600 dark:text-red-400 animate-spin" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          )}
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1.5 tracking-tight">
          {loading ? "Deleting Room Type..." : "Delete Room Type?"}
        </h3>

        <div className="my-3 p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 w-full flex items-center justify-center gap-3">
          <Hotel className="w-5 h-5 text-red-500 shrink-0" />
          <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">
            {roomType.name}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          {loading ? (
            <span className="text-red-600 dark:text-red-400 font-bold">
              Deleting room type configuration... Please wait.
            </span>
          ) : (
            <>
              Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-slate-100">{roomType.name}</strong>? This action cannot be undone and will remove this room option from search filters.
            </>
          )}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onCloseModal}
            disabled={loading}
            className="flex-1 py-5 rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

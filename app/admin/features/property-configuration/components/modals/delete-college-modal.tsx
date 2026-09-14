"use client";

import React, { useState } from "react";
import { Trash2, Loader2, Landmark, MapPin } from "lucide-react";
import { toast } from "@/app/admin/components/ui/sonner";
import axios from "axios";
import { Button } from "@/app/admin/components/ui/button";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

interface DeleteCollegeModalProps {
  college: {
    id: string;
    name: string;
    code: string;
    latitude: number;
    longitude: number;
    logoUrl?: string;
  };
  onCloseModal?: () => void;
  onSuccess?: () => void;
}

export function DeleteCollegeModal({
  college,
  onCloseModal,
  onSuccess,
}: DeleteCollegeModalProps) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await axios.delete(`/api/colleges/${college.id}`);

      if (res.data?.success) {
        toast.success(`Campus landmark "${college.code || college.name}" deleted successfully.`);
        queryClient.invalidateQueries({ queryKey: ["colleges"] });
        if (onSuccess) onSuccess();
        onCloseModal?.();
      } else {
        toast.error(res.data?.message || "Failed to delete campus landmark");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Failed to delete campus landmark");
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
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 flex items-center justify-center mb-5 shadow-sm transition-all duration-300">
          {loading ? (
            <Loader2 className="w-8 h-8 text-rose-600 dark:text-rose-400 animate-spin" />
          ) : (
            <Trash2 className="w-8 h-8 text-rose-600 dark:text-rose-400" />
          )}
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1.5 tracking-tight">
          {loading ? "Deleting Campus Landmark..." : "Delete Campus Landmark?"}
        </h3>

        {/* Landmark Info Badge */}
        <div className="my-3 p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 w-full flex items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden shrink-0">
              {college.logoUrl ? (
                <img src={college.logoUrl} alt={college.code} className="w-full h-full object-cover" />
              ) : (
                <Landmark className="w-5 h-5 text-rose-500" />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate max-w-[200px]" title={college.name}>
                {college.name}
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                <MapPin size={12} className="text-rose-500 shrink-0" />
                <span className="truncate">{college.latitude}, {college.longitude}</span>
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black text-[11px] border border-rose-500/20 shrink-0">
            {college.code}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          {loading ? (
            <span className="text-rose-600 dark:text-rose-400 font-bold">
              Permanently removing campus landmark... Please wait.
            </span>
          ) : (
            <>
              Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-slate-100">{college.name} ({college.code})</strong>? This action cannot be undone and will remove the landmark from Leaflet proximity maps and student search filters.
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
            className="flex-1 py-5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs shadow-lg shadow-red-500/25 transition-all gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" /> Confirm Delete
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

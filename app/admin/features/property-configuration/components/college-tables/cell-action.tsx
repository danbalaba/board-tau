"use client";

import { useState } from "react";
import { Edit, Power, PowerOff, Trash2 } from "lucide-react";
import { toast } from "@/app/admin/components/ui/sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/app/admin/components/ui/dropdown-menu";
import { Button } from "@/app/admin/components/ui/button";
import Modal from "@/components/modals/Modal";
import { AddCollegeModal } from "../modals/add-college-modal";
import { DeleteCollegeModal } from "../modals/delete-college-modal";
import { IconDots } from "@tabler/icons-react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";

interface CellActionProps {
  data: any;
  onRefresh?: () => void;
}

export const CellAction: React.FC<CellActionProps> = ({ data, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const queryClient = useQueryClient();

  const toggleStatus = async () => {
    try {
      setLoading(true);
      const newStatus = !data.isActive;
      await axios.patch(`/api/colleges/${data.id}`, { isActive: newStatus });
      toast.success(`Landmark "${data.code || data.name}" ${newStatus ? "enabled" : "disabled"} successfully.`);
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
      if (onRefresh) onRefresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update landmark status");
    } finally {
      setLoading(false);
      setOpenDropdown(false);
    }
  };

  return (
    <Modal>
      <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 cursor-pointer" disabled={loading}>
            <span className="sr-only">Open menu</span>
            <IconDots className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-2xl p-2 shadow-2xl w-48">
          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 py-1.5">Actions</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800 my-1" />
          <Modal.Trigger name={`edit-college-${data.id}`}>
            <DropdownMenuItem onClick={() => setOpenDropdown(false)} className="cursor-pointer text-xs font-bold uppercase tracking-wider rounded-xl gap-2 py-2 text-gray-700 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-800 focus:text-slate-900 dark:focus:text-white">
              <Edit className="h-4 w-4 text-emerald-500" /> Edit Landmark
            </DropdownMenuItem>
          </Modal.Trigger>

          {data.isActive ? (
            <DropdownMenuItem onClick={toggleStatus} className="cursor-pointer text-xs font-bold uppercase tracking-wider rounded-xl gap-2 py-2 text-amber-600 dark:text-amber-400 focus:bg-amber-50 dark:focus:bg-amber-950/40 focus:text-amber-600 dark:focus:text-amber-400">
              <PowerOff className="h-4 w-4 text-amber-500" /> Disable Landmark
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={toggleStatus} className="cursor-pointer text-xs font-bold uppercase tracking-wider rounded-xl gap-2 py-2 text-emerald-600 dark:text-emerald-400 focus:bg-emerald-50 dark:focus:bg-emerald-950/40 focus:text-emerald-600 dark:focus:text-emerald-400">
              <Power className="h-4 w-4 text-emerald-500" /> Enable Landmark
            </DropdownMenuItem>
          )}

          {!data.isActive && (
            <>
              <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800 my-1" />
              <Modal.Trigger name={`delete-college-${data.id}`}>
                <DropdownMenuItem onClick={() => setOpenDropdown(false)} className="cursor-pointer text-xs font-bold uppercase tracking-wider rounded-xl gap-2 py-2 text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-950/40 focus:text-rose-600 dark:focus:text-rose-400">
                  <Trash2 className="h-4 w-4 text-rose-500" /> Delete Landmark
                </DropdownMenuItem>
              </Modal.Trigger>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Modal.Window name={`edit-college-${data.id}`} size="lg" closeOnOutsideClick={false}>
        <AddCollegeModal initialData={data} onSuccess={onRefresh || (() => {})} />
      </Modal.Window>

      <Modal.Window name={`delete-college-${data.id}`} size="sm" closeOnOutsideClick={false}>
        <DeleteCollegeModal college={data} onSuccess={onRefresh || (() => {})} />
      </Modal.Window>
    </Modal>
  );
};

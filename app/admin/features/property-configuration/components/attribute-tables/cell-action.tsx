"use client";

import { useState } from "react";
import axios from "axios";
import { Edit, MoreHorizontal, Power, PowerOff, Trash2 } from "lucide-react";
import { toast } from "@/app/admin/components/ui/sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/app/admin/components/ui/dropdown-menu";
import { Button } from "@/app/admin/components/ui/button";
import Modal from "@/components/modals/Modal";
import { AddAttributeModal } from "@/app/admin/features/property-configuration/components/modals/add-attribute-modal";
import { DeleteAttributeModal } from "@/app/admin/features/property-configuration/components/modals/delete-attribute-modal";
import { IconDots } from "@tabler/icons-react";

interface CellActionProps {
  data: any;
  subGroups?: any[];
  onSuccess?: (createdData?: any) => void;
}

export const CellAction: React.FC<CellActionProps> = ({ data, subGroups, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  const toggleStatus = async () => {
    try {
      setLoading(true);
      const targetId = data.id || data._id;
      if (!targetId) {
        toast.error("Attribute ID missing.");
        return;
      }
      const newStatus = !data.isActive;
      const res = await axios.put(`/api/admin/attributes/${targetId}`, {
        isActive: newStatus,
      });

      if (res.data?.success) {
        toast.success(`Attribute "${data.name}" ${newStatus ? "enabled" : "disabled"} successfully!`);
        if (onSuccess) onSuccess(res.data.data);
      } else {
        toast.error(res.data?.message || "Failed to update status");
      }
    } catch (error: any) {
      console.error("Error toggling attribute status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
      setOpenDropdown(false);
    }
  };

  const targetId = data.id || data._id;

  return (
    <Modal>
      <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 cursor-pointer" disabled={loading}>
            <span className="sr-only">Open menu</span>
            <IconDots className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-2xl p-2 shadow-2xl w-52">
          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 py-1.5">Actions</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800 my-1" />
          <Modal.Trigger name={`edit-attr-${targetId}`}>
            <DropdownMenuItem onClick={() => setOpenDropdown(false)} className="cursor-pointer text-xs font-bold uppercase tracking-wider rounded-xl gap-2 py-2 text-gray-700 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-800 focus:text-slate-900 dark:focus:text-white">
              <Edit className="h-4 w-4 text-emerald-500" /> Edit Attribute
            </DropdownMenuItem>
          </Modal.Trigger>

          {data.isActive ? (
            <DropdownMenuItem onClick={toggleStatus} className="cursor-pointer text-xs font-bold uppercase tracking-wider rounded-xl gap-2 py-2 text-amber-600 dark:text-amber-400 focus:bg-amber-50 dark:focus:bg-amber-950/40 focus:text-amber-600 dark:focus:text-amber-400">
              <PowerOff className="h-4 w-4 text-amber-500" /> Disable Attribute
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={toggleStatus} className="cursor-pointer text-xs font-bold uppercase tracking-wider rounded-xl gap-2 py-2 text-emerald-600 dark:text-emerald-400 focus:bg-emerald-50 dark:focus:bg-emerald-950/40 focus:text-emerald-600 dark:focus:text-emerald-400">
              <Power className="h-4 w-4 text-emerald-500" /> Enable Attribute
            </DropdownMenuItem>
          )}

          {!data.isActive && (
            <>
              <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800 my-1" />
              <Modal.Trigger name={`delete-attr-${targetId}`}>
                <DropdownMenuItem onClick={() => setOpenDropdown(false)} className="cursor-pointer text-xs font-bold uppercase tracking-wider rounded-xl gap-2 py-2 text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-950/40 focus:text-rose-600 dark:focus:text-rose-400">
                  <Trash2 className="h-4 w-4 text-rose-500" /> Delete Attribute
                </DropdownMenuItem>
              </Modal.Trigger>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Modal.Window name={`edit-attr-${targetId}`} size="lg" hasFixedFooter closeOnOutsideClick={false}>
        <AddAttributeModal initialData={data} subGroups={subGroups} onSuccess={onSuccess} />
      </Modal.Window>

      <Modal.Window name={`delete-attr-${targetId}`} size="sm" closeOnOutsideClick={false}>
        <DeleteAttributeModal attribute={data} onSuccess={onSuccess} />
      </Modal.Window>
    </Modal>
  );
};

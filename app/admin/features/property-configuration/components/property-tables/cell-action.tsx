"use client";

import { useState } from "react";
import { Edit, MoreHorizontal, Power, PowerOff, ListPlus, Trash2 } from "lucide-react";
import { toast } from "@/app/admin/components/ui/sonner";
import { useRouter } from "next/navigation";
import axios from "axios";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/app/admin/components/ui/dropdown-menu";
import { Button } from "@/app/admin/components/ui/button";
import Modal from "@/components/modals/Modal";
import { AddPropertyTypeModal } from "../modals/add-property-type-modal";
import { ManageRoomTypesModal } from "../modals/manage-room-types-modal";
import { DeletePropertyTypeModal } from "../modals/delete-property-type-modal";
import { IconDots } from "@tabler/icons-react";

interface CellActionProps {
  data: any;
  onRefresh?: (deletedId?: string) => void;
}

export const CellAction: React.FC<CellActionProps> = ({ data, onRefresh }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  const toggleStatus = async () => {
    try {
      setLoading(true);
      await axios.put(`/api/admin/property-types/${data.id}`, {
        isActive: !data.isActive
      });
      toast.success(
        `Property type ${data.isActive ? "disabled" : "enabled"}.` + 
        (data.isActive ? " Attached listings have been unpublished." : "")
      );
      if (onRefresh) onRefresh();
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal>
      <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
            disabled={loading}
          >
            <IconDots className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-xl"
        >
          <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2.5 py-1.5">
            Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />
          
          <Modal.Trigger name={`edit-property-type-${data.id}`}>
            <DropdownMenuItem
              onClick={() => setOpenDropdown(false)}
              className="cursor-pointer text-xs font-semibold rounded-xl gap-2.5 py-2 px-2.5 text-slate-700 dark:text-slate-200 focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-white transition-colors"
            >
              <Edit className="h-4 w-4 text-emerald-500" />
              Edit Property Type
            </DropdownMenuItem>
          </Modal.Trigger>

          <Modal.Trigger name={`manage-room-types-${data.id}`}>
            <DropdownMenuItem
              onClick={() => setOpenDropdown(false)}
              className="cursor-pointer text-xs font-semibold rounded-xl gap-2.5 py-2 px-2.5 text-slate-700 dark:text-slate-200 focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-white transition-colors"
            >
              <ListPlus className="h-4 w-4 text-blue-500" />
              Manage Room Types
            </DropdownMenuItem>
          </Modal.Trigger>

          <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />

          {data.isActive ? (
            <DropdownMenuItem
              onClick={toggleStatus}
              className="cursor-pointer text-xs font-semibold rounded-xl gap-2.5 py-2 px-2.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 focus:bg-amber-50 dark:focus:bg-amber-950/30 focus:text-amber-600 transition-colors"
            >
              <PowerOff className="h-4 w-4 text-amber-500" />
              Disable (Unpublish listings)
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={toggleStatus}
              className="cursor-pointer text-xs font-semibold rounded-xl gap-2.5 py-2 px-2.5 text-primary hover:bg-primary/10 focus:bg-primary/10 focus:text-primary transition-colors"
            >
              <Power className="h-4 w-4 text-primary" />
              Enable Property Type
            </DropdownMenuItem>
          )}

          {!data.isActive && (
            <>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />
              <Modal.Trigger name={`delete-property-type-${data.id}`}>
                <DropdownMenuItem
                  onClick={() => setOpenDropdown(false)}
                  className="cursor-pointer text-xs font-semibold rounded-xl gap-2.5 py-2 px-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 focus:bg-rose-50 dark:focus:bg-rose-950/30 focus:text-rose-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-rose-500" />
                  Delete Property Type
                </DropdownMenuItem>
              </Modal.Trigger>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Modal.Window name={`edit-property-type-${data.id}`} size="lg" closeOnOutsideClick={false}>
        <AddPropertyTypeModal initialData={data} onSuccess={onRefresh} />
      </Modal.Window>

      <Modal.Window name={`manage-room-types-${data.id}`} size="lg" closeOnOutsideClick={false}>
        <ManageRoomTypesModal propertyType={data} />
      </Modal.Window>

      <Modal.Window name={`delete-property-type-${data.id}`} size="sm" closeOnOutsideClick={false}>
        <DeletePropertyTypeModal propertyType={data} onSuccess={onRefresh} />
      </Modal.Window>
    </Modal>
  );
};

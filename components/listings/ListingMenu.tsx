"use client";
import React, { FC, useTransition } from "react";
import { BsThreeDots } from "react-icons/bs";
import { usePathname } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import Menu from "../common/Menu";
import Modal from "../modals/Modal";
import ConfirmDelete from "../common/ConfirmDelete";

import { deleteProperty } from "@/services/user/properties";
import { deleteReservation } from "@/services//user/reservations";

const pathNameDict: { [x: string]: string } = {
  "/properties": "Delete property",
  "/reservations": "Cancel reservation",
};

interface ListingMenuProps {
  id: string;
}

const ListingMenu: FC<ListingMenuProps> = ({ id }) => {
  const pathname = usePathname();
  const { mutate: deleteListing } = useMutation({
    mutationFn: deleteProperty,
  });
  const { mutate: cancelReservation } = useMutation({
    mutationFn: deleteReservation,
  });
  const [isLoading, startTransition] = useTransition();

  if (pathname === "/" || pathname === "/favorites") return null;

  const onConfirm = (onModalClose?: () => void) => {
    startTransition(() => {
      try {
        if (pathname === "/properties") {
          deleteListing(id, {
            onSuccess: () => {
              onModalClose?.();
              toast.success("Listing successfully deleted!");
            },
          });
        } else if (pathname === "/reservations") {
          cancelReservation(id, {
            onSuccess: () => {
              onModalClose?.();
              toast.success("Reservation successfully cancelled!");
            },
          });
        }
      } catch (error) {
        toast.error("Oops! Something went wrong. Please try again later.");
        onModalClose?.()
      }
    });
  };

  return (
    <Modal>
      <Menu>
        <Menu.Toggle
          id="lisiting-menu"
          className="w-10 h-10 flex items-center z-5 justify-center"
        >
          <button
            type="button"
            className="w-7 h-7 rounded-full bg-neutral-700/50 dark:bg-gray-600/50 flex items-center justify-center hover:bg-neutral-700/70 dark:hover:bg-gray-600/70 group transition duration-200 z-[5]"
          >
            <BsThreeDots className="h-[18px] w-[18px] text-gray-300 dark:text-gray-400 transition duration-100 group-hover:text-gray-100 dark:group-hover:text-gray-300" />
          </button>
        </Menu.Toggle>
        <Menu.List position="bottom-left" className="rounded-md dark:bg-gray-800 dark:border-gray-700">
          <Modal.Trigger name="confirm-delete">
            <Menu.Button className="text-[14px] rounded-md font-semibold py-[10px] hover:bg-neutral-100 dark:hover:bg-gray-700 dark:text-gray-200 transition">
              {pathNameDict[pathname]}
            </Menu.Button>
          </Modal.Trigger>
        </Menu.List>
      </Menu>
      <Modal.Window name="confirm-delete">
        <ConfirmDelete
          onConfirm={onConfirm}
          title={pathNameDict[pathname]}
          isLoading={isLoading}
        />
      </Modal.Window>
    </Modal>
  );
};

export default ListingMenu;

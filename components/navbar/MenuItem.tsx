"use client";
import React, { FC } from "react";
import Menu from "../common/Menu";

interface MenuItemProps {
  onClick?: () => void;
  label: string;
  hasNotification?: boolean;
}

export const MenuItemStyle =
  "hover:bg-neutral-100 dark:hover:bg-gray-700 transition font-semibold select-none text-text-primary dark:text-gray-100 w-full flex items-center justify-between px-4 py-3";

const MenuItem: FC<MenuItemProps> = ({ label, onClick, hasNotification }) => {

  return (
    <Menu.Button className={MenuItemStyle} onClick={onClick}>
      <div className="flex items-center gap-2">
        <span className="truncate">{label}</span>
        {hasNotification && (
          <span className="inline-block w-1.5 h-1.5 bg-rose-500 rounded-full shadow-sm shadow-rose-500/50 shrink-0" />
        )}
      </div>
    </Menu.Button>
  );
};

export default MenuItem;

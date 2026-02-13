"use client";
import React, { FC } from "react";
import Menu from "../common/Menu";

interface MenuItemProps {
  onClick?: () => void;
  label: string;
}

export const MenuItemStyle =
  "hover:bg-neutral-100 dark:hover:bg-gray-700 transition font-semibold select-none text-text-primary dark:text-gray-100";

const MenuItem: FC<MenuItemProps> = ({ label, onClick }) => {
  return (
    <Menu.Button className={MenuItemStyle} onClick={onClick}>
      {label}
    </Menu.Button>
  );
};

export default MenuItem;

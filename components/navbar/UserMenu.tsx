"use client";
import React, { useEffect, useState, useTransition, useRef } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { User } from "next-auth";

import Avatar from "../common/Avatar";
import MenuItem from "./MenuItem";
import Menu from "@/components/common/Menu";
import HostApplicationModal from "../modals/HostApplicationModal";
import Modal from "../modals/Modal";
import AuthModal from "../modals/AuthModal";
import ConfirmModal from "@/components/common/ConfirmModal";
import { menuItems } from "@/utils/constants";
import { useLoading } from "@/components/loading/LoadingContext";
import { useMenuPanel } from "@/hooks/use-menu-panel";
import { useLoadingStore } from "@/hooks/use-loading-store";
import { useNotification } from "@/context/NotificationContext";
import { useRecentStore } from "@/hooks/use-recent-store";
import { useAISearchStore } from "@/hooks/use-ai-search-store";

interface UserMenuProps {
  user?: User;
}

const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { startLoading } = useLoading();
  const { onOpen } = useMenuPanel();
  const { isLoggingOut, setIsLoggingOut } = useLoadingStore();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { unreadStats } = useNotification();

  const handleMenuOpen = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onOpen();
    }
  };

  const redirect = async (url: string, label: string) => {
    if (window.location.pathname !== url) {
      startLoading();
    }
    router.push(url);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setShowLogoutConfirm(false);
    
    // Strict clear-on-logout to prevent data leakage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('recent-listings-storage');
      localStorage.removeItem('ai-search-history');
      // Also clear Zustand store immediately
      useRecentStore.getState().clearRecents();
      useAISearchStore.getState().clearQueries();
    }
    
    // Allow the premium animation to play for 2.5 seconds before redirecting
    setTimeout(() => {
      signOut({ callbackUrl: "/" });
    }, 2500);
  };

  const getUnreadCountForPath = (path: string): number => {
    if (!unreadStats) return 0;
    const lowerPath = path.toLowerCase();

    let count = 0;
    if (lowerPath.includes("inquir")) count = unreadStats.byType["inquiry"] || 0;
    else if (lowerPath.includes("reservation")) count = unreadStats.byType["reservation"] || 0;
    else if (lowerPath.includes("review")) count = unreadStats.byType["review"] || 0;
    else if (lowerPath.includes("message")) count = unreadStats.byType["message"] || 0;

    return count;
  };

  return (
    <div className="relative">
      <div className="flex flex-row items-center gap-3">
        <Modal>
          {user ? (
            <Modal.Trigger name="host-application">
              <button
                type="button"
                className="hidden xl:block text-sm py-3 px-4 rounded-full hover:bg-neutral-100 dark:hover:bg-gray-800 transition cursor-pointer text-gray-600 dark:text-gray-300 font-medium"
              >
                Become a Host
              </button>
            </Modal.Trigger>
          ) : (
            <Modal.Trigger name="Login">
              <button
                type="button"
                className="hidden xl:block text-sm py-3 px-4 rounded-full hover:bg-neutral-100 dark:hover:bg-gray-800 transition cursor-pointer text-gray-600 dark:text-gray-300 font-medium"
              >
                Become a Host
              </button>
            </Modal.Trigger>
          )}
          <Menu>
            <Menu.Toggle id="user-menu">
              <button
                onClick={handleMenuOpen}
                type="button"
                className=" p-4 md:py-1 md:px-2 border-[1px] border-neutral-200 dark:border-gray-700 flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition duration-300 bg-white dark:bg-gray-800 relative group"
              >
                <div className="relative">
                  <AiOutlineMenu className="text-text-primary dark:text-gray-100" />
                </div>
                <div className="hidden md:block">
                  <Avatar src={user?.image} name={user?.name} className="w-8 h-8" />
                </div>
              </button>
            </Menu.Toggle>
            <Menu.List className="hidden md:block shadow-[0_0_36px_4px_rgba(0,0,0,0.075)] rounded-xl bg-white dark:bg-gray-800 text-sm overflow-hidden">
              {user ? (
                <>
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 invisible md:visible h-0 md:h-auto overflow-hidden">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Account</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{user.name || user.email}</p>
                  </div>
                  {menuItems
                    .filter((item) => {
                      const role = (user as { role?: string })?.role?.toLowerCase();
                      if (role === 'landlord' || role === 'admin') {
                        // Hide student-centric items for internal roles
                        const label = item.label.toLowerCase();
                        return !['my favorites', 'my inquiries', 'my reservations', 'my reviews'].includes(label);
                      }
                      return true;
                    })
                    .map((item) => {
                      const unreadCount = getUnreadCountForPath(item.path);
                      return (
                        <MenuItem
                          label={item.label}
                          hasNotification={unreadCount > 0}
                          onClick={() => redirect(item.path, item.label)}
                          key={item.label}
                        />
                      );
                    })}

                  <Modal.Trigger name="host-application">
                    <MenuItem label="Become a Host" />
                  </Modal.Trigger>
                  {(user as { role?: string })?.role === "admin" && (
                    <MenuItem label="Admin" onClick={() => redirect("/admin", "Admin")} />
                  )}
                  <hr className="border-gray-100 dark:border-gray-700" />
                  <MenuItem label="Log out" onClick={() => setShowLogoutConfirm(true)} />
                </>
              ) : (
                <>
                  <Modal.Trigger name="Login">
                    <MenuItem label="Log in" />
                  </Modal.Trigger>
                </>
              )}
            </Menu.List>
          </Menu>
          <Modal.Window name="Login" size="sm" closeOnOutsideClick={false}>
            <AuthModal name="Login" />
          </Modal.Window>
          <Modal.Window name="host-application" size="xl" closeOnOutsideClick={false}>
            <HostApplicationModal />
          </Modal.Window>
        </Modal>

        {/* Logout Confirmation Modal */}
        <Modal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          width="xs"
        >
          <ConfirmModal
            isOpen={showLogoutConfirm}
            onClose={() => setShowLogoutConfirm(false)}
            onConfirm={handleLogout}
            title="Sign Out?"
            message={`Are you sure you want to sign out of your account, ${user?.name || 'User'}? Any unsaved changes may be lost.`}
            confirmLabel="Logout"
            cancelLabel="Stay"
            isLoading={isLoggingOut}
            variant="danger"
          />
        </Modal>
      </div>
    </div>
  );
};

export default UserMenu;
